import env from '#start/env'
import Database from '@adonisjs/lucid/services/db'
import iconv from 'iconv-lite'
import { parse } from 'csv-parse'
import { Readable } from 'node:stream'
import DatagouvService from './datagouv_service.ts'

type SyncStats = { operatorsRows: number; rangesRows: number; version: string; majnumTitle?: string; operatorsTitle?: string }
type SyncOptions = { onProgress?: (message: string) => void }

function digitsOnly(s: any): string {
  return (s ?? '').toString().replace(/\D+/g, '')
}

function guessVersion(lastModified?: string): string {
  if (!lastModified) return new Date().toISOString().slice(0, 10)
  return String(lastModified).slice(0, 10)
}

export default class ArcepSyncService {
  private delimiter = env.get('ARCEP_CSV_DELIMITER')
  private encoding = env.get('ARCEP_CSV_ENCODING')

  private majnumStartHeaders = ['debut', 'Début', 'start', 'Start', 'NUM_DEB', 'num_deb', 'numero_debut', 'Numéro début', 'Tranche_Debut']
  private majnumEndHeaders = ['fin', 'Fin', 'end', 'End', 'NUM_FIN', 'num_fin', 'numero_fin', 'Numéro fin', 'Tranche_Fin']
  private majnumOperatorHeaders = ['Mnèmo', 'Mnemo', 'mnemo', 'Mnémo', 'code_operateur', 'Code opérateur', 'OPERATEUR', 'operateur']

  private operatorsCodeHeaders = ['Mnèmo', 'Mnemo', 'mnemo', 'Code', 'code', 'Identifiant', 'identifiant', 'CODE_OPERATEUR']
  private operatorsNameHeaders = ['Nom', 'nom', 'Raison sociale', 'raison_sociale', 'Operator', 'operateur', 'Opérateur', 'IDENTITE_OPERATEUR']
  private onProgress: (message: string) => void = () => {}

  async syncNow(options?: SyncOptions): Promise<SyncStats> {
    this.onProgress = options?.onProgress ?? (() => {})
    this.report('Resolving ARCEP resources from data.gouv.fr...')
    const datagouv = new DatagouvService()
    const { majnum, operators } = await datagouv.resolveArcepUrls()

    const version = guessVersion(majnum.lastModified || operators.lastModified)
    this.report(`Selected version=${version}`)
    this.report(`MAJNUM resource: ${majnum.title ?? majnum.url}`)
    this.report(`OPERATORS resource: ${operators.title ?? operators.url}`)

    this.report('Truncating staging tables...')
    await Database.rawQuery('TRUNCATE TABLE number_ranges_staging, operators_staging RESTART IDENTITY')

    this.report('Importing operators to staging...')
    const operatorsRows = await this.importOperatorsToStaging(operators.url, version)
    this.report(`Operators staged: ${operatorsRows}`)
    this.report('Importing MAJNUM ranges to staging...')
    const rangesRows = await this.importMajnumToStaging(majnum.url, version)
    this.report(`Ranges staged: ${rangesRows}`)

    if (operatorsRows < 10) throw new Error(`Operators import too small: ${operatorsRows}`)
    if (rangesRows < 1000) throw new Error(`MAJNUM import too small: ${rangesRows}`)

    this.report('Running atomic swap staging -> active tables...')
    await this.activateStaging(version)
    this.report('Swap completed')

    return { operatorsRows, rangesRows, version, majnumTitle: majnum.title, operatorsTitle: operators.title }
  }

  private report(message: string) {
    this.onProgress(message)
  }

  private async fetchStream(url: string): Promise<Readable> {
    const res = await fetch(url)
    if (!res.ok || !res.body) throw new Error(`Download failed (${res.status}) url=${url}`)
    // @ts-ignore
    return Readable.fromWeb(res.body)
  }

  private pickHeader(headers: string[], candidates: string[]): string | null {
    const lower = new Map(headers.map((h) => [h.toLowerCase(), h]))
    for (const c of candidates) {
      const hit = lower.get(c.toLowerCase())
      if (hit) return hit
    }
    return null
  }

  private async importOperatorsToStaging(url: string, version: string): Promise<number> {
    const input = await this.fetchStream(url)
    const decoded = input.pipe(iconv.decodeStream(this.encoding))

    let codeHeader: string | null = null
    let nameHeader: string | null = null

    const parser = parse({
      delimiter: this.delimiter,
      columns: true,
      relax_column_count: true,
      bom: true,
      trim: true,
      skip_empty_lines: true,
    })

    const batch: any[] = []
    let inserted = 0

    decoded.pipe(parser)

    for await (const record of parser) {
      if (!codeHeader || !nameHeader) {
        const headers = Object.keys(record as object)
        codeHeader = this.pickHeader(headers, this.operatorsCodeHeaders)
        nameHeader = this.pickHeader(headers, this.operatorsNameHeaders)
        if (!codeHeader || !nameHeader) {
          throw new Error(`Operators CSV headers not recognized. headers=${JSON.stringify(headers)}`)
        }
      }

      const code = (record[codeHeader] ?? '').toString().trim()
      const name = (record[nameHeader] ?? '').toString().trim()
      if (!code || !name) continue

      batch.push({ code, name, source_version: version })
      if (batch.length >= 5000) {
        await this.flushOperators(batch)
        inserted += batch.length
        this.report(`Operators imported: ${inserted}`)
        batch.length = 0
      }
    }

    if (batch.length) {
      await this.flushOperators(batch)
      inserted += batch.length
      this.report(`Operators imported: ${inserted}`)
    }

    return inserted
  }

  private async flushOperators(rows: any[]) {
    const dedup = new Map<string, any>()
    for (const r of rows) dedup.set(r.code, r)
    const values = [...dedup.values()]

    if (!values.length) return
    await Database.table('operators_staging').multiInsert(values)
  }

  private async importMajnumToStaging(url: string, version: string): Promise<number> {
    const input = await this.fetchStream(url)
    const decoded = input.pipe(iconv.decodeStream(this.encoding))

    let startHeader: string | null = null
    let endHeader: string | null = null
    let operatorHeader: string | null = null

    const parser = parse({
      delimiter: this.delimiter,
      columns: true,
      relax_column_count: true,
      bom: true,
      trim: true,
      skip_empty_lines: true,
    })

    const batch: any[] = []
    let inserted = 0

    decoded.pipe(parser)

    for await (const record of parser) {
      if (!startHeader || !endHeader || !operatorHeader) {
        const headers = Object.keys(record as object)
        startHeader = this.pickHeader(headers, this.majnumStartHeaders)
        endHeader = this.pickHeader(headers, this.majnumEndHeaders)
        operatorHeader = this.pickHeader(headers, this.majnumOperatorHeaders)
        if (!startHeader || !endHeader || !operatorHeader) {
          throw new Error(`MAJNUM CSV headers not recognized. headers=${JSON.stringify(headers)}`)
        }
      }

      const startStr = digitsOnly(record[startHeader] ?? '')
      const endStr = digitsOnly(record[endHeader] ?? '')
      const op = (record[operatorHeader] ?? '').toString().trim()
      if (!startStr || !endStr || !op) continue

      const startNum = BigInt(startStr)
      const endNum = BigInt(endStr)
      if (endNum < startNum) continue

      batch.push({
        start_num: startNum.toString(),
        end_num: endNum.toString(),
        operator_code: op,
        source_version: version,
      })

      if (batch.length >= 1000) {
        await this.flushRanges(batch)
        inserted += batch.length
        this.report(`Ranges imported: ${inserted}`)
        batch.length = 0
      }
    }

    if (batch.length) {
      await this.flushRanges(batch)
      inserted += batch.length
      this.report(`Ranges imported: ${inserted}`)
    }

    return inserted
  }

  private async flushRanges(rows: any[]) {
    if (!rows.length) return

    const chunkSize = 1000
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize)
      await Database.table('number_ranges_staging').multiInsert(chunk)
    }
  }

  private async activateStaging(version: string) {
    await Database.transaction(async (trx) => {
      await trx.rawQuery(`
        DELETE FROM number_ranges_staging r
        WHERE NOT EXISTS (SELECT 1 FROM operators_staging o WHERE o.code = r.operator_code)
      `)

      await trx.rawQuery(`ALTER TABLE number_ranges RENAME TO number_ranges_old`)
      await trx.rawQuery(`ALTER TABLE number_ranges_staging RENAME TO number_ranges`)
      await trx.rawQuery(`ALTER TABLE number_ranges_old RENAME TO number_ranges_staging`)

      await trx.rawQuery(`ALTER TABLE operators RENAME TO operators_old`)
      await trx.rawQuery(`ALTER TABLE operators_staging RENAME TO operators`)
      await trx.rawQuery(`ALTER TABLE operators_old RENAME TO operators_staging`)

      await trx.rawQuery(`ANALYZE operators`)
      await trx.rawQuery(`ANALYZE number_ranges`)

      const rc = await trx.from('number_ranges').count('* as c')
      await trx.table('dataset_versions').insert({
        source: 'ARCEP',
        source_version: version,
        status: 'ACTIVE',
        row_count: Number((rc[0] as any).c ?? 0),
      })
    })
  }
}
