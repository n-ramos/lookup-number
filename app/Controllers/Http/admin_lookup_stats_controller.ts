type DatabaseClient = {
  from: (table: string) => any
}

async function defaultDbResolver(): Promise<DatabaseClient> {
  const mod = await import('@adonisjs/lucid/services/db')
  return mod.default as unknown as DatabaseClient
}

export default class AdminLookupStatsController {
  private readonly dbResolver: () => Promise<DatabaseClient>

  constructor(dbResolver: () => Promise<DatabaseClient> = defaultDbResolver) {
    this.dbResolver = dbResolver
  }

  async index({ request }: any) {
    const Database = await this.dbResolver()
    const limitRaw = Number(request.input('limit', 100))
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 1000) : 100
    const onlyFlagged = String(request.input('flagged', 'false')).toLowerCase() === 'true'

    let query = Database.from('lookup_stats as s')
      .leftJoin('operators as o', 'o.code', 's.operator_code')
      .select(
        's.number_digits as numberDigits',
        's.request_count as requestCount',
        's.found',
        's.operator_code as operatorCode',
        'o.name as operatorName',
        's.risk_score as riskScore',
        's.risk_flags as riskFlags',
        's.first_seen_at as firstSeenAt',
        's.last_seen_at as lastSeenAt'
      )
      .orderBy('s.request_count', 'desc')
      .orderBy('s.last_seen_at', 'desc')
      .limit(limit)

    if (onlyFlagged) {
      query = query.where('s.risk_score', '>', 0)
    }

    const rows = await query
    const normalizedRows = rows.map((row) => ({
      ...row,
      requestCount: Number(row.requestCount ?? 0),
      riskScore: Number(row.riskScore ?? 0),
    }))

    return { count: normalizedRows.length, rows: normalizedRows }
  }
}
