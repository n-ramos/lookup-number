import router from '@adonisjs/core/services/router'

router.get('/health', '#controllers/Http/pages_controller.health')

router.get('/v1/lookup', '#controllers/Http/lookup_controller.lookup')

// ⚠️ À protéger avec auth plus tard
router.post('/admin/sync/arcep', '#controllers/Http/admin_sync_controller.sync')
router.get('/admin/lookup/stats', '#controllers/Http/admin_lookup_stats_controller.index')

router.get('/openapi.yaml', '#controllers/Http/pages_controller.openapi')
router.get('/robots.txt', '#controllers/Http/pages_controller.robots')
router.get('/sitemap-index.xml', '#controllers/Http/pages_controller.sitemapIndex')
router.get('/sitemap-core.xml', '#controllers/Http/pages_controller.sitemapCore')
router.get('/sitemap-numbers.xml', '#controllers/Http/pages_controller.sitemapNumbers')
router.get('/sitemap.xml', '#controllers/Http/pages_controller.sitemapLegacy')

router.get('/docs', '#controllers/Http/pages_controller.docs')
router.get('/fr', '#controllers/Http/pages_controller.fr')
router.get('/en', '#controllers/Http/pages_controller.en')
router.get('/fr/numero/:number', '#controllers/Http/pages_controller.frNumber')
router.get('/en/number/:number', '#controllers/Http/pages_controller.enNumber')
router.get('/numero/:number', '#controllers/Http/pages_controller.numeroRedirect')

router.get('/404', '#controllers/Http/pages_controller.notFound')
router.get('/500', '#controllers/Http/pages_controller.serverError')

router.get('/', '#controllers/Http/pages_controller.root')
router.any('*', '#controllers/Http/pages_controller.fallback')
