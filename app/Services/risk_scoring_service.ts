export type RiskScore = {
  score: number
  flags: string[]
}

export default class RiskScoringService {
  private static readonly FR_KAV_OPERATORS = new Set<string>([
    'LEGO',
    'VOXB',
    'ONOF',
    'LGC',
    'KAVE',
    'IPTB',
    'SPCV',
    'VAST',
    'UBIX',
    'COCR',
    'INOX',
    'PHGS',
    'TWIL',
    'OXIL',
    'EONE',
    'CLTE',
    'IPDI',
    'BJTP',
    'LNCT',
    'ANEL',
  ])

  scoreFromOperatorCode(operatorCode: string | null | undefined): RiskScore {
    const flags: string[] = []
    let score = 0

    const normalized = (operatorCode ?? '').trim().toUpperCase()

    if (normalized && RiskScoringService.FR_KAV_OPERATORS.has(normalized)) {
      score = 100
      flags.push('KAV_OPERATOR')
    }

    return { score, flags }
  }
}
