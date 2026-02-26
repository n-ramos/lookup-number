export default class NumberNormalizeService {
  static toDigits(input: string | null | undefined): string | null {
    if (!input) return null
    const digits = String(input).replace(/\D+/g, '')
    return digits.length ? digits : null
  }

  static toLookupCandidates(input: string | null | undefined): string[] {
    const digits = this.toDigits(input)
    if (!digits) return []

    const candidates = new Set<string>()
    candidates.add(digits)

    // FR E.164 -> national significant number
    if (digits.startsWith('33') && digits.length >= 11) {
      candidates.add(digits.slice(2))
    }

    // FR national (0X...) -> significant number
    if (digits.startsWith('0') && digits.length >= 10) {
      candidates.add(digits.slice(1))
    }

    return [...candidates].filter((value) => value.length > 0)
  }
}
