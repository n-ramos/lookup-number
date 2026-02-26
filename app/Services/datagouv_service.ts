import env from '#start/env'

export type DatagouvResource = {
  id: string
  title?: string
  name?: string
  format?: string
  url?: string
  last_modified?: string
  created_at?: string
  updated_at?: string
}

export default class DatagouvService {
  private apiBase = 'https://www.data.gouv.fr/api/1'

  async getDatasetResources(slug: string): Promise<DatagouvResource[]> {
    const res = await fetch(`${this.apiBase}/datasets/${encodeURIComponent(slug)}/`)
    if (!res.ok) throw new Error(`data.gouv dataset fetch failed (${res.status}) for ${slug}`)
    const json: any = await res.json()
    return (json?.resources ?? []) as DatagouvResource[]
  }

  private pickHeaderMatchText(r: DatagouvResource): string {
    return [r.title, r.name, r.url].filter(Boolean).join(' ').toLowerCase()
  }

  async pickResourceUrlByTitleIncludes(slug: string, needle: string) {
    const resources = await this.getDatasetResources(slug)
    const n = needle.toLowerCase()
    const picked = resources.find((r) => this.pickHeaderMatchText(r).includes(n))
    if (!picked?.url) {
      const sample = resources.slice(0, 12).map((r) => ({ title: r.title, name: r.name, url: r.url }))
      throw new Error(`Could not find resource matching "${needle}" in dataset "${slug}". Sample: ${JSON.stringify(sample, null, 2)}`)
    }
    return { url: picked.url, lastModified: picked.last_modified, id: picked.id, title: picked.title ?? picked.name }
  }

  async resolveArcepUrls() {
    const numerotationDataset = env.get('DATAGOUV_NUMEROTATION_DATASET')
    const operatorsDataset = env.get('DATAGOUV_OPERATORS_DATASET')
    const majnumNeedle = env.get('DATAGOUV_MAJNUM_TITLE_INCLUDES')
    const operatorsNeedle = env.get('DATAGOUV_OPERATORS_TITLE_INCLUDES')

    const majnum = await this.pickResourceUrlByTitleIncludes(numerotationDataset, majnumNeedle)
    const operators = await this.pickResourceUrlByTitleIncludes(operatorsDataset, operatorsNeedle)

    return { majnum, operators }
  }
}
