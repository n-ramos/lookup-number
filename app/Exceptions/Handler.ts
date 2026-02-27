import app from '@adonisjs/core/services/app'
import { ExceptionHandler } from '@adonisjs/core/http'
import type { HttpContext } from '@adonisjs/core/http'

export default class Handler extends ExceptionHandler {
  protected debug = app.inDev
  protected renderStatusPages = false

  async handle(error: unknown, ctx: HttpContext) {
    const httpError: any = this.toHttpError(error)
    const status = Number(httpError?.status ?? 500)
    const path = String(ctx.request.url() || '/').split('?')[0]

    const isApiLike =
      path.startsWith('/v1/') ||
      path.startsWith('/admin/') ||
      path.startsWith('/openapi.yaml') ||
      path.startsWith('/sitemap') ||
      path.startsWith('/robots.txt')

    if (isApiLike) {
      if (status === 404) {
        return ctx.response.status(404).json({ ok: false, error: 'Not found' })
      }
      return ctx.response.status(status >= 400 ? status : 500).json({ ok: false, error: 'Internal server error' })
    }

    if (status === 404 && path !== '/404') {
      return ctx.response.redirect('/404')
    }

    if (status >= 500 && path !== '/500') {
      return ctx.response.redirect('/500')
    }

    return super.handle(error, ctx)
  }
}
