import 'reflect-metadata'
import { Ignitor } from '@adonisjs/core'

new Ignitor(new URL('./', import.meta.url), { importer: (id) => import(id) }).ace().handle(process.argv.splice(2))
