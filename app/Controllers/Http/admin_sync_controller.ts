type SyncService = {
  syncNow: () => Promise<any>
}

async function defaultSyncServiceFactory(): Promise<SyncService> {
  const mod = await import('#services/arcep_sync_service')
  const ArcepSyncService = mod.default
  return new ArcepSyncService()
}

export default class AdminSyncController {
  private readonly syncServiceFactory: () => Promise<SyncService>

  constructor(syncServiceFactory: () => Promise<SyncService> = defaultSyncServiceFactory) {
    this.syncServiceFactory = syncServiceFactory
  }

  async sync() {
    const service = await this.syncServiceFactory()
    const result = await service.syncNow()
    return { ok: true, ...result }
  }
}
