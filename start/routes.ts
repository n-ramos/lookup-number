import router from '@adonisjs/core/services/router'
import { readFileSync } from 'node:fs'

const openApiYaml = readFileSync(new URL('../openapi.yaml', import.meta.url), 'utf-8')

const swaggerHtml = `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>ARCEP API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: '/openapi.yaml',
        dom_id: '#swagger-ui',
      })
    </script>
  </body>
</html>`

const lookupUiHtml = `<!doctype html>
<html lang="__INITIAL_LANG__">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>__SEO_TITLE__</title>
    <meta name="description" content="__SEO_DESCRIPTION__" />
    <meta name="keywords" content="ARCEP, lookup, operateur telecom, numero telephone, risque KAV, VoIP" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <meta name="theme-color" content="#020617" />
    <link rel="canonical" href="__SEO_CANONICAL__" />
    <link rel="alternate" hreflang="fr" href="__SEO_FR_URL__" />
    <link rel="alternate" hreflang="en" href="__SEO_EN_URL__" />
    <link rel="alternate" hreflang="x-default" href="__SEO_FR_URL__" />

    <meta property="og:type" content="website" />
    <meta property="og:locale" content="__SEO_OG_LOCALE__" />
    <meta property="og:title" content="__SEO_TITLE__" />
    <meta property="og:description" content="__SEO_DESCRIPTION__" />
    <meta property="og:url" content="__SEO_CANONICAL__" />
    <meta property="og:site_name" content="ARCEP Lookup" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="__SEO_TITLE__" />
    <meta name="twitter:description" content="__SEO_DESCRIPTION__" />

    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "ARCEP Lookup",
        "url": "__SEO_CANONICAL__",
        "inLanguage": "__INITIAL_LANG__",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "__SEO_API_BASE__/v1/lookup?number={number}",
          "query-input": "required name=number"
        }
      }
    </script>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Sora:wght@600;700&display=swap" rel="stylesheet">
    <style>
      body { font-family: 'Space Grotesk', sans-serif; }
      h1, h2, h3 { font-family: 'Sora', sans-serif; }
      .glass { backdrop-filter: blur(14px); }
    </style>
  </head>
  <body class="min-h-screen bg-slate-950 text-slate-100">
    <div class="relative overflow-hidden">
      <div class="pointer-events-none absolute -left-16 top-16 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl"></div>
      <div class="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-emerald-400/15 blur-3xl"></div>
      <div class="pointer-events-none absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl"></div>

      <main class="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10">
        <section class="glass w-full rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-cyan-900/30 sm:p-8">
          <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p class="mb-2 inline-flex rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-200" data-i18n="liveLabel">Live lookup</p>
              <h1 class="text-3xl font-bold leading-tight sm:text-4xl" data-i18n="title">Lookup operateur et score risque</h1>
              <p class="mt-2 text-sm text-slate-300 sm:text-base" data-i18n="subtitle">Saisis un numero pour interroger les plages ARCEP.</p>
            </div>
            <div class="flex items-center gap-2">
              <select id="lang" class="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white outline-none">
                <option value="fr">FR</option>
                <option value="en">EN</option>
              </select>
              <a href="/docs" class="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/20" data-i18n="swaggerBtn">Voir Swagger</a>
            </div>
          </div>

          <form id="lookup-form" class="grid gap-3 sm:grid-cols-[190px_1fr_auto]">
            <select
              id="country"
              class="w-full rounded-2xl border border-white/15 bg-slate-900/70 px-4 py-4 text-base outline-none ring-cyan-400/40 transition focus:ring"
            >
              <option value="FR" selected>France (+33)</option>
              <option value="BE">Belgique (+32)</option>
              <option value="CH">Suisse (+41)</option>
              <option value="LU">Luxembourg (+352)</option>
              <option value="CA">Canada (+1)</option>
              <option value="US">United States (+1)</option>
            </select>
            <input
              id="number"
              name="number"
              type="tel"
              placeholder="+33 6 12 34 56 78"
              class="w-full rounded-2xl border border-white/15 bg-slate-900/70 px-4 py-4 text-lg outline-none ring-cyan-400/40 transition focus:ring"
              required
            />
            <button
              id="submit-btn"
              type="submit"
              class="rounded-2xl bg-cyan-400 px-6 py-4 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
              data-i18n="analyzeBtn"
            >Analyser</button>
          </form>

          <p class="mt-2 text-xs text-slate-400" data-i18n="hint">Le numero est reformate automatiquement avec indicatif et separateurs.</p>

          <div id="status" class="mt-4 hidden rounded-xl border border-cyan-400/25 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-200"></div>

          <section id="result-card" class="mt-6 hidden rounded-2xl border border-white/15 bg-slate-900/70 p-5">
            <div class="mb-4 flex items-start justify-between gap-4">
              <div>
                <p class="text-xs uppercase tracking-[0.18em] text-slate-400" data-i18n="resultLabel">Resultat</p>
                <h2 id="result-title" class="mt-1 text-2xl font-bold">-</h2>
                <p id="normalized-phone" class="mt-1 text-sm text-slate-300">-</p>
              </div>
              <span id="risk-badge" class="rounded-full px-3 py-1 text-xs font-semibold">-</span>
            </div>

            <dl class="grid gap-3 text-sm sm:grid-cols-2">
              <div class="rounded-xl border border-white/10 bg-white/5 p-3">
                <dt class="text-slate-400" data-i18n="operatorCodeLabel">Operator code</dt>
                <dd id="operator-code" class="mt-1 text-base font-semibold text-white">-</dd>
              </div>
              <div class="rounded-xl border border-white/10 bg-white/5 p-3">
                <dt class="text-slate-400" data-i18n="operatorNameLabel">Operator name</dt>
                <dd id="operator-name" class="mt-1 text-base font-semibold text-white">-</dd>
              </div>
              <div class="rounded-xl border border-white/10 bg-white/5 p-3">
                <dt class="text-slate-400" data-i18n="rangeLabel">Plage</dt>
                <dd id="range" class="mt-1 text-base font-semibold text-white">-</dd>
              </div>
              <div class="rounded-xl border border-white/10 bg-white/5 p-3">
                <dt class="text-slate-400" data-i18n="sourceVersionLabel">Source version</dt>
                <dd id="source-version" class="mt-1 text-base font-semibold text-white">-</dd>
              </div>
              <div class="rounded-xl border border-white/10 bg-white/5 p-3 sm:col-span-2">
                <dt class="text-slate-400" data-i18n="requestCountLabel">Nombre de requetes sur ce numero</dt>
                <dd id="request-count" class="mt-1 text-base font-semibold text-white">-</dd>
              </div>
            </dl>

            <div class="mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
              <p class="text-slate-400" data-i18n="flagsLabel">Flags risque</p>
              <p id="risk-flags" class="mt-1 text-base font-semibold text-white">-</p>
            </div>
          </section>
        </section>
      </main>
    </div>

    <script>
      window.__INITIAL_LANG__ = '__INITIAL_LANG__'
    </script>
    <script type="module">
      import { parsePhoneNumberFromString, AsYouType } from 'https://cdn.jsdelivr.net/npm/libphonenumber-js@1.11.15/+esm'

      const I18N = {
        fr: {
          liveLabel: 'Live lookup',
          title: 'Lookup operateur et score risque',
          subtitle: 'Saisis un numero pour interroger les plages ARCEP.',
          swaggerBtn: 'Voir Swagger',
          analyzeBtn: 'Analyser',
          hint: 'Le numero est reformate automatiquement avec indicatif et separateurs.',
          resultLabel: 'Resultat',
          operatorCodeLabel: 'Code operateur',
          operatorNameLabel: 'Nom operateur',
          rangeLabel: 'Plage',
          sourceVersionLabel: 'Version source',
          requestCountLabel: 'Nombre de requetes sur ce numero',
          flagsLabel: 'Flags risque',
          loading: 'Analyse en cours...',
          notFoundTitle: 'Numero non trouve',
          notFoundStatus: 'Aucune plage active trouvee pour ce numero.',
          foundTitle: 'Numero trouve',
          noFlags: 'Aucun flag',
          riskNa: 'N/A',
          riskLabel: 'Risque',
          fetchError: 'Erreur pendant le lookup. Verifie que l API tourne.',
          normalizedLabel: 'Numero normalise',
          invalidPhone: 'Numero invalide. Exemple accepte: +33 6 12 34 56 78',
        },
        en: {
          liveLabel: 'Live lookup',
          title: 'Operator lookup and risk score',
          subtitle: 'Enter a number to query ARCEP ranges.',
          swaggerBtn: 'Open Swagger',
          analyzeBtn: 'Analyze',
          hint: 'The number is auto-formatted with country code and separators.',
          resultLabel: 'Result',
          operatorCodeLabel: 'Operator code',
          operatorNameLabel: 'Operator name',
          rangeLabel: 'Range',
          sourceVersionLabel: 'Source version',
          requestCountLabel: 'Request count for this number',
          flagsLabel: 'Risk flags',
          loading: 'Analyzing...',
          notFoundTitle: 'Number not found',
          notFoundStatus: 'No active range found for this number.',
          foundTitle: 'Number found',
          noFlags: 'No flags',
          riskNa: 'N/A',
          riskLabel: 'Risk',
          fetchError: 'Lookup failed. Make sure the API is running.',
          normalizedLabel: 'Normalized number',
          invalidPhone: 'Invalid number. Accepted example: +33 6 12 34 56 78',
        },
      }

      const DIAL_BY_COUNTRY = {
        FR: '33',
        BE: '32',
        CH: '41',
        LU: '352',
        CA: '1',
        US: '1',
      }

      const initialLang = window.__INITIAL_LANG__ === 'en' ? 'en' : 'fr'
      const state = { lang: initialLang }

      const form = document.getElementById('lookup-form')
      const langSel = document.getElementById('lang')
      const countrySel = document.getElementById('country')
      const input = document.getElementById('number')
      const submitBtn = document.getElementById('submit-btn')
      const statusBox = document.getElementById('status')
      const resultCard = document.getElementById('result-card')
      const resultTitle = document.getElementById('result-title')
      const normalizedPhone = document.getElementById('normalized-phone')
      const riskBadge = document.getElementById('risk-badge')
      const operatorCode = document.getElementById('operator-code')
      const operatorName = document.getElementById('operator-name')
      const rangeEl = document.getElementById('range')
      const sourceVersion = document.getElementById('source-version')
      const requestCountEl = document.getElementById('request-count')
      const riskFlags = document.getElementById('risk-flags')

      function t(key) {
        return I18N[state.lang][key] || key
      }

      function applyTranslations() {
        document.querySelectorAll('[data-i18n]').forEach((el) => {
          const key = el.getAttribute('data-i18n')
          if (!key) return
          el.textContent = t(key)
        })
      }

      function showStatus(message) {
        statusBox.textContent = message
        statusBox.classList.remove('hidden')
      }

      function hideStatus() {
        statusBox.classList.add('hidden')
      }

      function digitsOnly(raw) {
        return String(raw || '').replace(/\D+/g, '')
      }

      function normalizeRawPhone(raw) {
        const text = String(raw || '').trim()
        if (!text) return ''

        if (text.startsWith('+')) {
          const d = digitsOnly(text)
          return d ? '+' + d : ''
        }

        if (text.startsWith('00')) {
          const d = digitsOnly(text).replace(/^00/, '')
          return d ? '+' + d : ''
        }

        return digitsOnly(text)
      }

      function isValidInputPhone(rawInput) {
        const inputText = String(rawInput || '').trim()
        if (!inputText) return false

        // Allowed chars only: digits, spaces, +, parentheses, dots and dashes.
        if (!/^[0-9+().\\s-]+$/.test(inputText)) return false

        // At most one "+" and only at the beginning.
        const plusCount = (inputText.match(/\\+/g) || []).length
        if (plusCount > 1) return false
        if (plusCount === 1 && !inputText.startsWith('+')) return false

        const normalized = normalizeRawPhone(inputText)
        if (!normalized) return false

        // Reasonable international length bound.
        const d = digitsOnly(normalized)
        return d.length >= 6 && d.length <= 15
      }

      function stripNationalTrunk(digits, country) {
        if (!digits) return ''
        const usesTrunk = ['FR', 'BE', 'CH', 'LU'].includes(country)
        if (usesTrunk && digits.startsWith('0') && digits.length > 1) {
          return digits.slice(1)
        }
        return digits
      }

      function formatAsYouType(raw) {
        if (!raw) return ''
        try {
          if (raw.startsWith('+')) {
            const parsedIntl = parsePhoneNumberFromString(raw)
            if (parsedIntl && parsedIntl.isValid()) {
              return parsedIntl.formatInternational()
            }
            const fIntl = new AsYouType()
            return fIntl.input(raw)
          }

          const parsedLocal = parsePhoneNumberFromString(raw, countrySel.value)
          if (parsedLocal && parsedLocal.isValid()) {
            return parsedLocal.formatNational()
          }
          const fLocal = new AsYouType(countrySel.value)
          return fLocal.input(raw)
        } catch (e) {
          return raw
        }
      }

      function toE164(raw) {
        if (!raw) return ''
        let parsed
        if (raw.startsWith('+')) {
          parsed = parsePhoneNumberFromString(raw)
        } else {
          const localDigits = stripNationalTrunk(digitsOnly(raw), countrySel.value)
          parsed = parsePhoneNumberFromString(localDigits, countrySel.value)
        }

        if (parsed && parsed.isValid()) {
          return parsed.number
        }

        if (raw.startsWith('+')) {
          const intlDigits = digitsOnly(raw)
          return intlDigits ? '+' + intlDigits : ''
        } else {
          const localDigits = stripNationalTrunk(digitsOnly(raw), countrySel.value)
          const dial = DIAL_BY_COUNTRY[countrySel.value] || '33'
          return localDigits ? '+' + dial + localDigits : ''
        }
      }

      function toIntl(raw) {
        if (!raw) return '-'
        let parsed
        if (raw.startsWith('+')) {
          parsed = parsePhoneNumberFromString(raw)
        } else {
          parsed = parsePhoneNumberFromString(raw, countrySel.value)
        }
        if (parsed && parsed.isValid()) {
          return parsed.formatInternational()
        }
        return raw
      }

      function setRiskStyle(score) {
        if (score >= 100) {
          riskBadge.className = 'rounded-full px-3 py-1 text-xs font-semibold bg-red-500/20 text-red-300 border border-red-400/40'
          return
        }
        if (score > 0) {
          riskBadge.className = 'rounded-full px-3 py-1 text-xs font-semibold bg-amber-400/20 text-amber-300 border border-amber-300/40'
          return
        }
        riskBadge.className = 'rounded-full px-3 py-1 text-xs font-semibold bg-emerald-400/20 text-emerald-300 border border-emerald-300/40'
      }

      function setNumberStyle(found, score) {
        normalizedPhone.className = 'mt-1 text-sm'
        if (!found) {
          normalizedPhone.classList.add('text-slate-300')
          return
        }
        if (score > 0) {
          normalizedPhone.classList.add('font-semibold', 'text-red-300')
          return
        }
        normalizedPhone.classList.add('font-semibold', 'text-emerald-300')
      }

      input.addEventListener('input', () => {
        const normalized = normalizeRawPhone(input.value)
        input.value = formatAsYouType(normalized)
      })

      langSel.addEventListener('change', () => {
        state.lang = langSel.value
        applyTranslations()
      })

      countrySel.addEventListener('change', () => {
        const normalized = normalizeRawPhone(input.value)
        input.value = formatAsYouType(normalized)
      })

      form.addEventListener('submit', async (e) => {
        e.preventDefault()
        if (!isValidInputPhone(input.value)) {
          showStatus(t('invalidPhone'))
          resultCard.classList.add('hidden')
          return
        }

        const raw = normalizeRawPhone(input.value)
        if (!raw) return

        const numberForApi = toE164(raw)
        if (!numberForApi) {
          showStatus(t('invalidPhone'))
          resultCard.classList.add('hidden')
          return
        }
        const prettyNumber = toIntl(numberForApi || raw)

        submitBtn.disabled = true
        showStatus(t('loading'))
        resultCard.classList.add('hidden')

        try {
          const res = await fetch('/v1/lookup?number=' + encodeURIComponent(numberForApi))
          if (!res.ok) throw new Error('HTTP ' + res.status)
          const data = await res.json()

          if (!data.found) {
            resultTitle.textContent = t('notFoundTitle')
            normalizedPhone.textContent = t('normalizedLabel') + ': ' + prettyNumber
            setNumberStyle(false, 0)
            riskBadge.textContent = t('riskNa')
            setRiskStyle(0)
            operatorCode.textContent = '-'
            operatorName.textContent = '-'
            rangeEl.textContent = '-'
            sourceVersion.textContent = '-'
            requestCountEl.textContent = String(data.requestCount || 0)
            riskFlags.textContent = t('noFlags')
            resultCard.classList.remove('hidden')
            showStatus(t('notFoundStatus'))
            return
          }

          const score = Number(data && data.risk && data.risk.score ? data.risk.score : 0)
          const flags = data && data.risk && Array.isArray(data.risk.flags) ? data.risk.flags : []

          resultTitle.textContent = t('foundTitle')
          normalizedPhone.textContent = t('normalizedLabel') + ': ' + prettyNumber
          setNumberStyle(true, score)
          riskBadge.textContent = t('riskLabel') + ' ' + score + '%'
          setRiskStyle(score)
          operatorCode.textContent = data.operatorCode || '-'
          operatorName.textContent = data.operatorName || '-'
          rangeEl.textContent = String(data.rangeStart || '-') + ' -> ' + String(data.rangeEnd || '-')
          sourceVersion.textContent = data.sourceVersion || '-'
          requestCountEl.textContent = String(data.requestCount || 0)
          riskFlags.textContent = flags.length ? flags.join(', ') : t('noFlags')
          resultCard.classList.remove('hidden')
          hideStatus()
        } catch (err) {
          showStatus(t('fetchError'))
        } finally {
          submitBtn.disabled = false
        }
      })

      langSel.value = state.lang
      applyTranslations()
      input.value = '+33 6 12 34 56 78'
    </script>
  </body>
</html>`

function renderLookupUi(locale: 'fr' | 'en', canonicalUrl: string, frUrl: string, enUrl: string, apiBase: string) {
  const seoTitle =
    locale === 'fr'
      ? 'Lookup Numero ARCEP - Operateur et Score Risque KAV'
      : 'ARCEP Number Lookup - Operator and KAV Risk Score'
  const seoDescription =
    locale === 'fr'
      ? 'Recherche operateur telecom ARCEP et score de risque KAV pour un numero de telephone.'
      : 'Find ARCEP telecom operator and KAV risk score for a phone number.'
  const ogLocale = locale === 'fr' ? 'fr_FR' : 'en_US'

  return lookupUiHtml
    .replaceAll('__INITIAL_LANG__', locale)
    .replaceAll('__SEO_TITLE__', seoTitle)
    .replaceAll('__SEO_DESCRIPTION__', seoDescription)
    .replaceAll('__SEO_CANONICAL__', canonicalUrl)
    .replaceAll('__SEO_FR_URL__', frUrl)
    .replaceAll('__SEO_EN_URL__', enUrl)
    .replaceAll('__SEO_OG_LOCALE__', ogLocale)
    .replaceAll('__SEO_API_BASE__', apiBase)
}

router.get('/health', async () => ({ ok: true }))

router.get('/v1/lookup', '#controllers/http/lookup_controller.lookup')

// ⚠️ À protéger avec auth plus tard
router.post('/admin/sync/arcep', '#controllers/http/admin_sync_controller.sync')
router.get('/admin/lookup/stats', '#controllers/http/admin_lookup_stats_controller.index')

router.get('/openapi.yaml', async ({ response }) => {
  response.header('content-type', 'application/yaml; charset=utf-8')
  return openApiYaml
})

router.get('/docs', async ({ response }) => {
  response.header('content-type', 'text/html; charset=utf-8')
  return swaggerHtml
})

router.get('/fr', async ({ request, response }) => {
  response.header('content-type', 'text/html; charset=utf-8')
  const canonicalUrl = request.completeUrl()
  const enUrl = canonicalUrl.replace(/\/fr(\?.*)?$/, '/en$1')
  const apiBase = new URL(canonicalUrl).origin
  return renderLookupUi('fr', canonicalUrl, canonicalUrl, enUrl, apiBase)
})

router.get('/en', async ({ request, response }) => {
  response.header('content-type', 'text/html; charset=utf-8')
  const canonicalUrl = request.completeUrl()
  const frUrl = canonicalUrl.replace(/\/en(\?.*)?$/, '/fr$1')
  const apiBase = new URL(canonicalUrl).origin
  return renderLookupUi('en', canonicalUrl, frUrl, canonicalUrl, apiBase)
})

router.get('/', async ({ response }) => {
  return response.redirect('/fr')
})
