import test from 'node:test'
import assert from 'node:assert/strict'
import NumberNormalizeService from '../../app/Services/number_normalize_service.ts'

test('toDigits returns only digits', () => {
  assert.equal(NumberNormalizeService.toDigits('+33 6 12-34.56.78'), '33612345678')
})

test('toDigits returns null on empty input', () => {
  assert.equal(NumberNormalizeService.toDigits(''), null)
  assert.equal(NumberNormalizeService.toDigits(undefined), null)
})

test('toLookupCandidates includes FR fallbacks', () => {
  const candidates = NumberNormalizeService.toLookupCandidates('+33 6 12 34 56 78')
  assert.deepEqual(candidates, ['33612345678', '612345678'])
})

test('toLookupCandidates handles national 0-prefix', () => {
  const candidates = NumberNormalizeService.toLookupCandidates('06 12 34 56 78')
  assert.deepEqual(candidates, ['0612345678', '612345678'])
})
