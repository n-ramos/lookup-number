import { BaseCommand } from '@adonisjs/core/ace'
import ArcepSyncService from '#services/arcep_sync_service'

export default class SyncArcep extends BaseCommand {
  static commandName = 'sync:arcep'
  static description = 'Download official ARCEP CSV (via data.gouv), import to staging, and atomically activate.'
  static options = { startApp: true }

  async run() {
    const service = new ArcepSyncService()
    const result = await service.syncNow({
      onProgress: (message) => this.logger.info(message),
    })
    this.logger.success(`ARCEP sync OK: version=${result.version} operators=${result.operatorsRows} ranges=${result.rangesRows}`)
  }
}
