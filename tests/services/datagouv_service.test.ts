import test from 'node:test'
import assert from 'node:assert/strict'
import DatagouvService from '../../app/Services/datagouv_service.ts'

type AnyObj = Record<string, any>

test('pickResourceUrlByTitleIncludes finds matching resource', async () => {
  const service = new DatagouvService()
  const originalFetch = globalThis.fetch

  globalThis.fetch = (async () => ({
    ok: true,
    json: async () => ({
      resources: [
        { id: '1', title: 'Some file', url: 'https://example.test/a.csv' },
        { id: '2', title: 'Export MAJNUM Officiel', url: 'https://example.test/majnum.csv', last_modified: '2026-02-20T00:00:00Z' },
      ],
    }),
  })) as AnyObj

  try {
    const picked = await service.pickResourceUrlByTitleIncludes('dataset-slug', 'MAJNUM')
    assert.equal(picked.url, 'https://example.test/majnum.csv')
    assert.equal(picked.id, '2')
    assert.equal(picked.lastModified, '2026-02-20T00:00:00Z')
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('pickResourceUrlByTitleIncludes throws when no match exists', async () => {
  const service = new DatagouvService()
  const originalFetch = globalThis.fetch

  globalThis.fetch = (async () => ({
    ok: true,
    json: async () => ({
      resources: [{ id: '1', title: 'Other', url: 'https://example.test/a.csv' }],
    }),
  })) as AnyObj

  try {
    await assert.rejects(
      () => service.pickResourceUrlByTitleIncludes('dataset-slug', 'MAJNUM'),
      /Could not find resource matching/
    )
  } finally {
    globalThis.fetch = originalFetch
  }
})
