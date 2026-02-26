import test from 'node:test'
import assert from 'node:assert/strict'
import AdminLookupStatsController from '../../app/Controllers/Http/admin_lookup_stats_controller.ts'

type AnyObj = Record<string, any>

type Capture = {
  limit?: number
  whereArgs?: any[]
}

function buildThenableQuery(rows: any[], capture: Capture) {
  const query: AnyObj = {
    leftJoin: () => query,
    select: () => query,
    orderBy: () => query,
    limit: (value: number) => {
      capture.limit = value
      return query
    },
    where: (...args: any[]) => {
      capture.whereArgs = args
      return query
    },
    then: (onFulfilled?: any, onRejected?: any) => Promise.resolve(rows).then(onFulfilled, onRejected),
  }

  return query
}

function makeRequest(values: Record<string, any>) {
  return {
    input: (key: string, fallback?: any) => (key in values ? values[key] : fallback),
  }
}

test('admin stats maps numeric fields and enforces max limit', async () => {
  const capture: Capture = {}
  const dbMock: AnyObj = {
    from: (table: string) => {
      assert.equal(table, 'lookup_stats as s')
      return buildThenableQuery(
        [
          {
            numberDigits: '612345678',
            requestCount: '7',
            found: true,
            operatorCode: 'TEST',
            operatorName: 'Test Operator',
            riskScore: '100',
            riskFlags: ['KAV_OPERATOR'],
            firstSeenAt: '2026-01-01T00:00:00.000Z',
            lastSeenAt: '2026-01-02T00:00:00.000Z',
          },
        ],
        capture
      )
    },
  }

  const controller = new AdminLookupStatsController(async () => dbMock)

  const response = await controller.index({
    request: makeRequest({ limit: '5000', flagged: 'false' }),
  })

  assert.equal(capture.limit, 1000)
  assert.equal(response.count, 1)
  assert.equal(typeof response.rows[0].requestCount, 'number')
  assert.equal(typeof response.rows[0].riskScore, 'number')
  assert.equal(response.rows[0].requestCount, 7)
  assert.equal(response.rows[0].riskScore, 100)
})

test('admin stats applies flagged filter when requested', async () => {
  const capture: Capture = {}
  const dbMock: AnyObj = {
    from: () => buildThenableQuery([], capture),
  }

  const controller = new AdminLookupStatsController(async () => dbMock)

  const response = await controller.index({
    request: makeRequest({ flagged: 'true', limit: 10 }),
  })

  assert.equal(response.count, 0)
  assert.deepEqual(capture.whereArgs, ['s.risk_score', '>', 0])
  assert.equal(capture.limit, 10)
})
