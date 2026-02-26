import NumberNormalizeService from '#services/number_normalize_service'
import RiskScoringService from '#services/risk_scoring_service'

type DatabaseClient = {
  rawQuery: (sql: string, bindings?: any[]) => Promise<any>
  from: (table: string) => any
}

async function defaultDbResolver(): Promise<DatabaseClient> {
  const mod = await import('@adonisjs/lucid/services/db')
  return mod.default as unknown as DatabaseClient
}

export default class LookupController {
  private scoring = new RiskScoringService()
  private readonly dbResolver: () => Promise<DatabaseClient>

  constructor(dbResolver: () => Promise<DatabaseClient> = defaultDbResolver) {
    this.dbResolver = dbResolver
  }

  private async recordLookup(params: {
    db: DatabaseClient
    numberDigits: string
    found: boolean
    operatorCode: string | null
    riskScore: number
    riskFlags: string[]
  }): Promise<number> {
    const riskFlagsJson = JSON.stringify(params.riskFlags)
    let safeOperatorCode: string | null = null

    if (params.operatorCode) {
      const operator = await params.db.from('operators').select('code').where('code', params.operatorCode).first()
      safeOperatorCode = operator?.code ?? null
    }

    const runUpsert = async (operatorCode: string | null) => {
      await params.db.rawQuery(
        `
        INSERT INTO lookup_stats
          (number_digits, request_count, found, operator_code, risk_score, risk_flags, first_seen_at, last_seen_at)
        VALUES
          (?, 1, ?, ?, ?, ?::jsonb, NOW(), NOW())
        ON CONFLICT (number_digits)
        DO UPDATE SET
          request_count = lookup_stats.request_count + 1,
          found = EXCLUDED.found,
          operator_code = EXCLUDED.operator_code,
          risk_score = EXCLUDED.risk_score,
          risk_flags = EXCLUDED.risk_flags,
          last_seen_at = NOW()
        `,
        [params.numberDigits, params.found, operatorCode, params.riskScore, riskFlagsJson]
      )
    }

    try {
      await runUpsert(safeOperatorCode)
    } catch (error: any) {
      const code = error?.code ?? error?.cause?.code
      const constraint = error?.constraint ?? error?.cause?.constraint
      const isOperatorFkViolation =
        code === '23503' && String(constraint ?? '').includes('lookup_stats_operator_code_foreign')

      if (!isOperatorFkViolation) {
        throw error
      }

      // Race condition safe fallback: store the stat without operator FK reference.
      await runUpsert(null)
    }

    const current = await params.db
      .from('lookup_stats')
      .select('request_count')
      .where('number_digits', params.numberDigits)
      .first()

    return Number(current?.request_count ?? 0)
  }

  async lookup({ request }: any) {
    const Database = await this.dbResolver()
    const input = request.input('number')
    const digits = NumberNormalizeService.toDigits(input)
    const candidates = NumberNormalizeService.toLookupCandidates(input)
    if (!digits || !candidates.length) return { found: false, input }

    let row: any = null
    let matchedDigits = ''
    for (const candidate of candidates) {
      const n = BigInt(candidate)
      const current = await Database.from('number_ranges')
        .where('start_num', '<=', n.toString())
        .orderBy('start_num', 'desc')
        .first()
      if (current && BigInt(String(current.end_num)) >= n) {
        row = current
        matchedDigits = candidate
        break
      }
    }

    if (!row) {
      const requestCount = await this.recordLookup({
        db: Database,
        numberDigits: digits,
        found: false,
        operatorCode: null,
        riskScore: 0,
        riskFlags: [],
      })
      return { found: false, input, digits, requestCount }
    }

    const operator = await Database.from('operators').where('code', row.operator_code).first()
    const risk = this.scoring.scoreFromOperatorCode(row.operator_code)
    const persistedDigits = matchedDigits || digits
    const persistedOperatorCode = operator?.code ?? null
    const requestCount = await this.recordLookup({
      db: Database,
      numberDigits: persistedDigits,
      found: true,
      operatorCode: persistedOperatorCode,
      riskScore: risk.score,
      riskFlags: risk.flags,
    })

    return {
      found: true,
      input,
      digits: persistedDigits,
      operatorCode: row.operator_code,
      operatorName: operator?.name ?? null,
      risk,
      requestCount,
      rangeStart: row.start_num,
      rangeEnd: row.end_num,
      sourceVersion: row.source_version,
    }
  }
}
