import test from 'node:test'
import assert from 'node:assert/strict'
import LookupController from '../../app/Controllers/Http/lookup_controller.ts'

type AnyObj = Record<string, any>

function mockRequest(inputValue: string) {
  return { input: () => inputValue }
}

test('lookup falls back from +33 to national and increments request count', async () => {
  const requestCounts = new Map<string, number>()

  const dbMock: AnyObj = {
    rawQuery: async (_sql: string, params: any[]) => {
      const key = String(params[0])
      requestCounts.set(key, (requestCounts.get(key) ?? 0) + 1)
      return { rows: [] }
    },
    from: (table: string) => {
      if (table === 'number_ranges') {
        const state: AnyObj = { candidate: '' }
        const query = {
          where: (_col: string, _op: string, value: string) => {
            state.candidate = value
            return query
          },
          orderBy: () => query,
          first: async () => {
            if (state.candidate === '33612345678') return null
            if (state.candidate === '612345678') {
              return {
                operator_code: 'SFR0',
                start_num: '612000000',
                end_num: '612999999',
                source_version: '2026-02-10',
              }
            }
            return null
          },
        }
        return query
      }

      if (table === 'operators') {
        return {
          where: () => ({
            first: async () => ({ code: 'SFR0', name: 'SFR Test' }),
          }),
        }
      }

      if (table === 'lookup_stats') {
        return {
          select: () => ({
            where: () => ({
              first: async () => ({ request_count: requestCounts.get('612345678') ?? 0 }),
            }),
          }),
        }
      }

      throw new Error(`Unexpected table: ${table}`)
    },
  }

  const controller = new LookupController(async () => dbMock)
  const result = await controller.lookup({ request: mockRequest('+33 6 12 34 56 78') })

  assert.equal(result.found, true)
  assert.equal(result.digits, '612345678')
  assert.equal(result.operatorCode, 'SFR0')
  assert.equal(result.operatorName, 'SFR Test')
  assert.equal(result.requestCount, 1)
})
