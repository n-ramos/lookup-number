import test from 'node:test'
import assert from 'node:assert/strict'
import RiskScoringService from '../../app/Services/risk_scoring_service.ts'

test('scores KAV operator at 100 with flag', () => {
  const service = new RiskScoringService()
  const risk = service.scoreFromOperatorCode('bjtp')
  assert.equal(risk.score, 100)
  assert.deepEqual(risk.flags, ['KAV_OPERATOR'])
})

test('scores non-KAV operator at 0 with no flags', () => {
  const service = new RiskScoringService()
  const risk = service.scoreFromOperatorCode('FRTE')
  assert.equal(risk.score, 0)
  assert.deepEqual(risk.flags, [])
})
