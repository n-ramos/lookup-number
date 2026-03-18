import test from 'node:test'
import assert from 'node:assert/strict'
import RecentLookupsController from '../../app/Controllers/Http/recent_lookups_controller.ts'

type AnyObj = Record<string, any>

type Capture = {
  limit?: number
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
    then: (onFulfilled?: any, onRejected?: any) => Promise.resolve(rows).then(onFulfilled, onRejected),
  }

  return query
}

function makeRequest(values: Record<string, any>) {
  return {
    input: (key: string, fallback?: any) => (key in values ? values[key] : fallback),
  }
}

test('recent lookups returns masked numbers and paginates within the 50 latest rows', async () => {
  const capture: Capture = {}
  const rows = Array.from({ length: 12 }, (_, index) => ({
    numberDigits: `33612345${String(index).padStart(3, '0')}`,
    found: index % 2 === 0,
    operatorName: index % 2 === 0 ? `Operator ${index}` : null,
    riskScore: String(index * 10),
    lastSeenAt: `2026-03-${String(18 - Math.min(index, 9)).padStart(2, '0')}T12:00:00.000Z`,
  }))

  const dbMock: AnyObj = {
    from: (table: string) => {
      assert.equal(table, 'lookup_stats as s')
      return buildThenableQuery(rows, capture)
    },
  }

  const controller = new RecentLookupsController(async () => dbMock)
  const response = await controller.index({
    request: makeRequest({ page: '2', perPage: '5' }),
  })

  assert.equal(capture.limit, 50)
  assert.equal(response.total, 12)
  assert.equal(response.page, 2)
  assert.equal(response.perPage, 5)
  assert.equal(response.totalPages, 3)
  assert.equal(response.entries.length, 5)
  assert.deepEqual(response.entries[0], {
    numberMasked: '3361234XXXX',
    found: false,
    operatorName: '-',
    riskScore: 50,
    lastSeenAt: '2026-03-13T12:00:00.000Z',
  })
})
