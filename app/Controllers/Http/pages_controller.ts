import NumberNormalizeService from '#services/number_normalize_service'

function maskLast4(digits: string): string {
  if (digits.length <= 4) return 'X'.repeat(digits.length)
  return digits.slice(0, -4) + 'XXXX'
}

function stripXxxSuffix(s: string): string {
  return s.replace(/X+$/i, '').trim()
}

import {
  openApiYaml,
  swaggerHtml,
  renderLookupUi,
  lookupForSeoPage,
  renderNumberSeoPage,
  renderErrorPage,
  xmlEscape,
  xmlSitemapUrlset,
  xmlSitemapIndex,
} from '#services/web_pages_service'

export default class PagesController {
  health() {
    return { ok: true }
  }

  openapi({ response }: any) {
    response.header('content-type', 'application/yaml; charset=utf-8')
    return openApiYaml
  }

  robots({ request, response }: any) {
    const origin = new URL(request.completeUrl()).origin
    response.header('content-type', 'text/plain; charset=utf-8')
    return ['User-agent: *', 'Allow: /', `Sitemap: ${origin}/sitemap-index.xml`].join('\n')
  }

  sitemapIndex({ request, response }: any) {
    const origin = new URL(request.completeUrl()).origin
    const xml = xmlSitemapIndex([`${origin}/sitemap-core.xml`, `${origin}/sitemap-numbers.xml`])
    response.header('content-type', 'application/xml; charset=utf-8')
    return xml
  }

  sitemapCore({ request, response }: any) {
    const origin = new URL(request.completeUrl()).origin
    const nowIso = new Date().toISOString()
    const entries = [`${origin}/fr`, `${origin}/en`, `${origin}/docs`]
    const nodes = entries.map((url) => {
      return [
        '  <url>',
        `    <loc>${xmlEscape(url)}</loc>`,
        `    <lastmod>${nowIso}</lastmod>`,
        '    <changefreq>daily</changefreq>',
        '    <priority>0.90</priority>',
        '  </url>',
      ].join('\n')
    })
    response.header('content-type', 'application/xml; charset=utf-8')
    return xmlSitemapUrlset(nodes)
  }

  async sitemapNumbers({ request, response }: any) {
    const origin = new URL(request.completeUrl()).origin
    const nowIso = new Date().toISOString()

    const numberDigitsSet = new Set<string>()

    try {
      const { default: Database } = await import('@adonisjs/lucid/services/db')
      const topRows = await Database.from('lookup_stats')
        .select('number_digits')
        .where('found', true)
        .orderBy('request_count', 'desc')
        .limit(500)

      for (const row of topRows) {
        const digits = NumberNormalizeService.toDigits(String(row.number_digits ?? '').trim())
        if (!digits) continue
        numberDigitsSet.add(digits)
      }
    } catch {
      // Keep sitemap available even if DB is temporarily unavailable.
    }

    if (numberDigitsSet.size === 0) {
      numberDigitsSet.add('33612345678')
    }

    const entries = [...numberDigitsSet].map((digits) => `${origin}/fr/numero/${encodeURIComponent(maskLast4(digits))}`)
    const nodes = entries.map((url) => {
      return [
        '  <url>',
        `    <loc>${xmlEscape(url)}</loc>`,
        `    <lastmod>${nowIso}</lastmod>`,
        '    <changefreq>daily</changefreq>',
        '    <priority>0.70</priority>',
        '  </url>',
      ].join('\n')
    })

    response.header('content-type', 'application/xml; charset=utf-8')
    return xmlSitemapUrlset(nodes)
  }

  sitemapLegacy({ response }: any) {
    return response.redirect('/sitemap-index.xml')
  }

  docs({ response }: any) {
    response.header('content-type', 'text/html; charset=utf-8')
    return swaggerHtml
  }

  fr({ request, response }: any) {
    response.header('content-type', 'text/html; charset=utf-8')
    const canonicalUrl = request.completeUrl()
    const enUrl = canonicalUrl.replace(/\/fr(\?.*)?$/, '/en$1')
    const apiBase = new URL(canonicalUrl).origin
    return renderLookupUi('fr', canonicalUrl, canonicalUrl, enUrl, apiBase)
  }

  en({ request, response }: any) {
    response.header('content-type', 'text/html; charset=utf-8')
    const canonicalUrl = request.completeUrl()
    const frUrl = canonicalUrl.replace(/\/en(\?.*)?$/, '/fr$1')
    const apiBase = new URL(canonicalUrl).origin
    return renderLookupUi('en', canonicalUrl, frUrl, canonicalUrl, apiBase)
  }

  async frNumber({ request, response, params }: any) {
    response.header('content-type', 'text/html; charset=utf-8')
    const number = String(params.number ?? '')
    const lookupNumber = stripXxxSuffix(number) || number
    const result = await lookupForSeoPage(lookupNumber)
    const canonicalUrl = request.completeUrl()
    const enUrl = canonicalUrl.replace('/fr/numero/', '/en/number/')
    return renderNumberSeoPage({
      locale: 'fr',
      number,
      canonicalUrl,
      frUrl: canonicalUrl,
      enUrl,
      found: result.found,
      operatorCode: result.operatorCode,
      operatorName: result.operatorName,
      score: result.risk.score,
    })
  }

  async enNumber({ request, response, params }: any) {
    response.header('content-type', 'text/html; charset=utf-8')
    const number = String(params.number ?? '')
    const lookupNumber = stripXxxSuffix(number) || number
    const result = await lookupForSeoPage(lookupNumber)
    const canonicalUrl = request.completeUrl()
    const frUrl = canonicalUrl.replace('/en/number/', '/fr/numero/')
    return renderNumberSeoPage({
      locale: 'en',
      number,
      canonicalUrl,
      frUrl,
      enUrl: canonicalUrl,
      found: result.found,
      operatorCode: result.operatorCode,
      operatorName: result.operatorName,
      score: result.risk.score,
    })
  }

  numeroRedirect({ params, response }: any) {
    return response.redirect(`/fr/numero/${encodeURIComponent(String(params.number ?? ''))}`)
  }

  notFound({ response }: any) {
    response.status(404)
    response.header('content-type', 'text/html; charset=utf-8')
    return renderErrorPage({
      status: 404,
      title: 'Page introuvable',
      message: "L'URL demandee n'existe pas ou a ete deplacee.",
    })
  }

  serverError({ response }: any) {
    response.status(500)
    response.header('content-type', 'text/html; charset=utf-8')
    return renderErrorPage({
      status: 500,
      title: 'Erreur interne',
      message: 'Une erreur est survenue. Merci de reessayer dans quelques instants.',
    })
  }

  root({ response }: any) {
    return response.redirect('/fr')
  }

  fallback({ request, response }: any) {
    const path = String(request.url() || '/').split('?')[0]
    const isApiLike = path.startsWith('/v1/') || path.startsWith('/admin/') || path === '/openapi.yaml'
    if (isApiLike) {
      return response.status(404).json({ ok: false, error: 'Not found' })
    }

    response.status(404)
    response.header('content-type', 'text/html; charset=utf-8')
    return renderErrorPage({
      status: 404,
      title: 'Page introuvable',
      message: "L'URL demandee n'existe pas ou a ete deplacee.",
    })
  }
}
