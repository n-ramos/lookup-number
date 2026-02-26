import 'reflect-metadata'
import { Ignitor } from '@adonisjs/core'

new Ignitor(new URL('../', import.meta.url), { importer: (id) => import(id) })
  .tap((app) => {
    app.listen('SIGTERM', () => app.terminate())
  })
  .httpServer()
  .start()
