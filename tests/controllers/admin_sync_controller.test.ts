import test from 'node:test'
import assert from 'node:assert/strict'
import AdminSyncController from '../../app/Controllers/Http/admin_sync_controller.ts'

test('admin sync delegates to sync service and returns ok payload', async () => {
  const controller = new AdminSyncController(async () => ({
    syncNow: async () => ({
      operatorsRows: 123,
      rangesRows: 4567,
      version: '2026-02-26',
    }),
  }))

  const response = await controller.sync()

  assert.deepEqual(response, {
    ok: true,
    operatorsRows: 123,
    rangesRows: 4567,
    version: '2026-02-26',
  })
})
