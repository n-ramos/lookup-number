type DatabaseClient = {
  from: (table: string) => any
}

function maskLast4(digits: string): string {
  if (digits.length <= 4) return 'X'.repeat(digits.length)
  return digits.slice(0, -4) + 'XXXX'
}

async function defaultDbResolver(): Promise<DatabaseClient> {
  const mod = await import('@adonisjs/lucid/services/db')
  return mod.default as unknown as DatabaseClient
}

export default class RecentLookupsController {
  private readonly dbResolver: () => Promise<DatabaseClient>

  constructor(dbResolver: () => Promise<DatabaseClient> = defaultDbResolver) {
    this.dbResolver = dbResolver
  }

  async index({ request }: any) {
    const Database = await this.dbResolver()
    const pageRaw = Number(request.input('page', 1))
    const perPageRaw = Number(request.input('perPage', 10))
    const page = Number.isFinite(pageRaw) ? Math.max(Math.trunc(pageRaw), 1) : 1
    const perPage = Number.isFinite(perPageRaw) ? Math.min(Math.max(Math.trunc(perPageRaw), 1), 50) : 10

    const rows = await Database.from('lookup_stats as s')
      .leftJoin('operators as o', 'o.code', 's.operator_code')
      .select(
        's.number_digits as numberDigits',
        's.found',
        'o.name as operatorName',
        's.risk_score as riskScore',
        's.last_seen_at as lastSeenAt'
      )
      .orderBy('s.last_seen_at', 'desc')
      .limit(50)

    const normalizedRows = rows.map((row: any) => ({
      numberMasked: maskLast4(String(row.numberDigits ?? '').replace(/\D+/g, '')),
      found: Boolean(row.found),
      operatorName: row.operatorName || '-',
      riskScore: Number(row.riskScore ?? 0),
      lastSeenAt: row.lastSeenAt ?? null,
    }))

    const total = normalizedRows.length
    const totalPages = total > 0 ? Math.ceil(total / perPage) : 1
    const currentPage = Math.min(page, totalPages)
    const start = (currentPage - 1) * perPage
    const entries = normalizedRows.slice(start, start + perPage)

    return {
      total,
      page: currentPage,
      perPage,
      totalPages,
      entries,
    }
  }
}
