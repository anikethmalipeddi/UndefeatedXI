import { mkdir, writeFile } from 'node:fs/promises'
import { modeConfigs } from '../src/data/modes'
import type { Position, TeamRollOption, TeamType } from '../src/types'

interface SearchResult {
  id: string
  label?: string
  description?: string
  concepturi?: string
}

interface TeamResolution {
  key: string
  label: string
  teamType: TeamType
  query: string
  qid?: string
  wikidataUrl?: string
  matchedLabel?: string
  description?: string
  status: 'resolved' | 'unresolved'
  candidates: Array<Pick<SearchResult, 'id' | 'label' | 'description'>>
}

interface SparqlBinding {
  team?: { value?: string }
  teamLabel?: { value?: string }
  player?: { value?: string }
  playerLabel?: { value?: string }
  positionLabel?: { value?: string }
  start?: { value?: string }
  end?: { value?: string }
  matches?: { value?: string }
  goals?: { value?: string }
  birthYear?: { value?: string }
  countryLabel?: { value?: string }
}

interface MembershipFact {
  factId: string
  playerQid: string
  playerUrl: string
  playerName: string
  teamQid: string
  teamUrl: string
  teamName: string
  requestedTeamName: string
  teamType: TeamType
  sourcePositionLabels: string[]
  normalizedPositions: Position[]
  positionSpecificity: 'specific' | 'broad' | 'missing'
  startYear?: number
  endYear?: number
  dateCompleteness: 'start-end' | 'start-only' | 'end-only' | 'missing'
  sourceAppearances?: number
  sourceGoals?: number
  birthYear?: number
  nationality?: string
  eraLabels: string[]
  sourceUrls: string[]
}

interface CoverageEntry {
  modeId: string
  modeName: string
  totalExactRolls: number
  populatedExactRolls: number
  emptyExactRolls: Array<{ team: string; era: string }>
  thinExactRolls: Array<{ team: string; era: string; facts: number }>
}

const generatedAt = new Date().toISOString()
const currentYear = new Date().getUTCFullYear()
const userAgent = 'UndefeatedXI source facts importer'

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

const manualQids: Record<string, string> = {
  'club:AC Milan': 'Q1543',
  'club:Ajax': 'Q81888',
  'club:Arsenal': 'Q9617',
  'club:Atletico Madrid': 'Q8701',
  'club:Barcelona': 'Q7156',
  'club:Bayer Leverkusen': 'Q104761',
  'club:Bayern Munich': 'Q15789',
  'club:Benfica': 'Q131499',
  'club:Blackburn': 'Q19446',
  'club:Boca Juniors': 'Q170703',
  'club:Bordeaux': 'Q172476',
  'club:Borussia Dortmund': 'Q41420',
  'club:Chelsea': 'Q9616',
  'club:Columbus Crew': 'Q457163',
  'club:DC United': 'Q238593',
  'club:Hamburg': 'Q51974',
  'club:Houston Dynamo': 'Q328313',
  'club:Inter': 'Q631',
  'club:Inter Miami': 'Q16844931',
  'club:Juventus': 'Q1422',
  'club:LA Galaxy': 'Q204357',
  'club:LAFC': 'Q18380286',
  'club:Liverpool': 'Q1130849',
  'club:Lyon': 'Q704',
  'club:Marseille': 'Q132885',
  'club:Manchester City': 'Q50602',
  'club:Manchester United': 'Q18656',
  'club:Monaco': 'Q180305',
  'club:Napoli': 'Q2641',
  'club:Nashville SC': 'Q24185298',
  'club:PSG': 'Q483020',
  'club:Porto': 'Q128446',
  'club:Real Madrid': 'Q8682',
  'club:River Plate': 'Q15799',
  'club:Roma': 'Q2739',
  'club:Saint-Etienne': 'Q19521',
  'club:Santos': 'Q80955',
  'club:Seattle Sounders': 'Q632511',
  'club:Tampa Bay Mutiny': 'Q421009',
  'club:Toronto FC': 'Q327238',
  'club:Tottenham': 'Q18741',
  'club:Vancouver Whitecaps': 'Q196107',
  'club:Werder Bremen': 'Q51976',
  'nation:Argentina': 'Q79800',
  'nation:Brazil': 'Q83459',
  'nation:England': 'Q47762',
  'nation:France': 'Q47774',
  'nation:Germany': 'Q43310',
  'nation:Italy': 'Q676899',
  'nation:Netherlands': 'Q47050',
  'nation:Portugal': 'Q267245',
  'nation:Spain': 'Q42267',
  'nation:Uruguay': 'Q134916',
}

const positionPatterns: Array<{ pattern: RegExp; positions: Position[]; specificity: 'specific' | 'broad' }> = [
  { pattern: /goalkeeper/i, positions: ['GK'], specificity: 'specific' },
  { pattern: /left[- ]back|left full[- ]back/i, positions: ['LB', 'LWB'], specificity: 'specific' },
  { pattern: /right[- ]back|right full[- ]back/i, positions: ['RB', 'RWB'], specificity: 'specific' },
  { pattern: /centre[- ]back|center[- ]back|central defender|sweeper/i, positions: ['CB'], specificity: 'specific' },
  { pattern: /wing[- ]back/i, positions: ['LWB', 'RWB'], specificity: 'broad' },
  { pattern: /defender|full[- ]back/i, positions: ['CB', 'LB', 'RB'], specificity: 'broad' },
  { pattern: /defensive midfielder|holding midfielder/i, positions: ['DM', 'CM'], specificity: 'specific' },
  { pattern: /attacking midfielder|playmaker/i, positions: ['AM', 'CM'], specificity: 'specific' },
  { pattern: /left midfielder|left winger/i, positions: ['LM', 'LW'], specificity: 'specific' },
  { pattern: /right midfielder|right winger/i, positions: ['RM', 'RW'], specificity: 'specific' },
  { pattern: /winger|wide midfielder/i, positions: ['LW', 'RW', 'LM', 'RM'], specificity: 'broad' },
  { pattern: /midfielder|wing half/i, positions: ['CM'], specificity: 'broad' },
  { pattern: /second striker|centre-forward|center-forward/i, positions: ['CF', 'ST'], specificity: 'specific' },
  { pattern: /striker|forward/i, positions: ['ST', 'CF'], specificity: 'broad' },
]

function keyFor(team: TeamRollOption): string {
  return `${team.teamType}:${team.label}`
}

function qidFromUri(uri?: string): string | undefined {
  return uri?.match(/Q\d+$/)?.[0]
}

function yearFromDate(value?: string): number | undefined {
  if (!value) return undefined
  const match = value.match(/^-?\d+/)
  if (!match) return undefined
  const year = Number(match[0])
  return Number.isFinite(year) ? year : undefined
}

function decadeForYear(year: number): string {
  return `${Math.floor(year / 10) * 10}s`
}

function eraLabelsFromDates(startYear?: number, endYear?: number): string[] {
  if (startYear === undefined && endYear === undefined) return []
  const start = startYear ?? endYear
  const end = endYear ?? startYear
  if (start === undefined || end === undefined) return []
  const normalizedEnd = Math.min(Math.max(start, end), currentYear)
  const labels = new Set<string>()
  for (let year = start; year <= normalizedEnd; year += 10) {
    labels.add(decadeForYear(year))
  }
  labels.add(decadeForYear(normalizedEnd))
  return [...labels].sort()
}

function numberFromValue(value?: string): number | undefined {
  if (!value) return undefined
  const number = Number(value)
  return Number.isFinite(number) ? number : undefined
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)]
}

function normalizePositions(labels: string[]): { positions: Position[]; specificity: MembershipFact['positionSpecificity'] } {
  const positions: Position[] = []
  let specificity: MembershipFact['positionSpecificity'] = labels.length > 0 ? 'missing' : 'missing'

  for (const label of labels) {
    for (const entry of positionPatterns) {
      if (!entry.pattern.test(label)) continue
      positions.push(...entry.positions)
      if (entry.specificity === 'specific') specificity = 'specific'
      if (entry.specificity === 'broad' && specificity !== 'specific') specificity = 'broad'
    }
  }

  return {
    positions: unique(positions),
    specificity: positions.length === 0 ? 'missing' : specificity,
  }
}

function allTeams(): TeamRollOption[] {
  const teams = new Map<string, TeamRollOption>()
  for (const mode of modeConfigs) {
    for (const team of mode.teamPool) teams.set(keyFor(team), team)
  }
  return [...teams.values()].sort((a, b) => keyFor(a).localeCompare(keyFor(b)))
}

async function fetchJson<T>(url: string, attempt = 0): Promise<T> {
  const response = await fetch(url, {
    headers: {
      accept: 'application/json',
      'user-agent': userAgent,
    },
  })

  if (!response.ok) {
    if ((response.status === 429 || response.status >= 500) && attempt < 5) {
      const retryAfter = Number(response.headers.get('retry-after'))
      const waitMs = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 1200 * (attempt + 1)
      await sleep(waitMs)
      return fetchJson<T>(url, attempt + 1)
    }

    throw new Error(`${response.status} ${response.statusText} for ${url}`)
  }

  const text = await response.text()
  try {
    return JSON.parse(text) as T
  } catch (error) {
    if (attempt < 5) {
      await sleep(1400 * (attempt + 1))
      return fetchJson<T>(url, attempt + 1)
    }

    const preview = text.slice(0, 240).replace(/\s+/g, ' ')
    throw new Error(`Could not parse JSON response for ${url}: ${preview}`, { cause: error })
  }
}

async function resolveTeam(team: TeamRollOption): Promise<TeamResolution> {
  const key = keyFor(team)
  const manualQid = manualQids[key]
  if (manualQid) {
    return {
      key,
      label: team.label,
      teamType: team.teamType,
      query: 'manual-qid',
      qid: manualQid,
      wikidataUrl: `https://www.wikidata.org/wiki/${manualQid}`,
      status: 'resolved',
      candidates: [],
    }
  }

  const query = team.teamType === 'nation' ? `${team.label} national football team` : `${team.label} football club`
  const url = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(query)}&language=en&format=json&limit=8`
  const data = await fetchJson<{ search?: SearchResult[] }>(url)
  const candidates = data.search ?? []
  const candidate = candidates.find((item) => {
    const description = item.description?.toLowerCase() ?? ''
    if (team.teamType === 'nation') return description.includes('national') && description.includes('football')
    return description.includes('football') || description.includes('association football')
  }) ?? candidates[0]

  return {
    key,
    label: team.label,
    teamType: team.teamType,
    query,
    qid: candidate?.id,
    wikidataUrl: candidate?.id ? `https://www.wikidata.org/wiki/${candidate.id}` : undefined,
    matchedLabel: candidate?.label,
    description: candidate?.description,
    status: candidate?.id ? 'resolved' : 'unresolved',
    candidates: candidates.map(({ id, label, description }) => ({ id, label, description })),
  }
}

async function queryMembershipFacts(resolutions: TeamResolution[]): Promise<SparqlBinding[]> {
  const resolved = resolutions.filter((resolution) => resolution.qid)
  const bindings: SparqlBinding[] = []
  const chunkSize = 8

  for (let index = 0; index < resolved.length; index += chunkSize) {
    const chunk = resolved.slice(index, index + chunkSize)
    const values = chunk.map((resolution) => `wd:${resolution.qid}`).join(' ')
    const query = `
SELECT ?team ?teamLabel ?player ?playerLabel ?positionLabel ?start ?end ?matches ?goals ?birthYear ?countryLabel WHERE {
  VALUES ?team { ${values} }
  ?player p:P54 ?membership.
  ?membership ps:P54 ?team.
  OPTIONAL { ?membership pq:P580 ?start. }
  OPTIONAL { ?membership pq:P582 ?end. }
  OPTIONAL { ?membership pq:P1350 ?matches. }
  OPTIONAL { ?membership pq:P1351 ?goals. }
  OPTIONAL { ?player wdt:P413 ?position. }
  OPTIONAL { ?player wdt:P569 ?dob. BIND(YEAR(?dob) AS ?birthYear) }
  OPTIONAL { ?player wdt:P27 ?country. }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}`
    const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}&format=json`
    const data = await fetchJson<{ results?: { bindings?: SparqlBinding[] } }>(url)
    bindings.push(...(data.results?.bindings ?? []))
    await sleep(700)
  }

  return bindings
}

function buildFacts(bindings: SparqlBinding[], resolutions: TeamResolution[]): MembershipFact[] {
  const resolutionByQid = new Map(resolutions.filter((resolution) => resolution.qid).map((resolution) => [resolution.qid, resolution]))
  const groups = new Map<string, { binding: SparqlBinding; positions: Set<string> }>()

  for (const binding of bindings) {
    const teamQid = qidFromUri(binding.team?.value)
    const playerQid = qidFromUri(binding.player?.value)
    if (!teamQid || !playerQid || !binding.playerLabel?.value) continue
    const start = binding.start?.value ?? ''
    const end = binding.end?.value ?? ''
    const matches = binding.matches?.value ?? ''
    const goals = binding.goals?.value ?? ''
    const key = `${teamQid}:${playerQid}:${start}:${end}:${matches}:${goals}`
    const group = groups.get(key) ?? { binding, positions: new Set<string>() }
    if (binding.positionLabel?.value) group.positions.add(binding.positionLabel.value)
    groups.set(key, group)
  }

  return [...groups.values()].map(({ binding, positions }) => {
    const teamQid = qidFromUri(binding.team?.value) ?? ''
    const playerQid = qidFromUri(binding.player?.value) ?? ''
    const resolution = resolutionByQid.get(teamQid)
    const startYear = yearFromDate(binding.start?.value)
    const endYear = yearFromDate(binding.end?.value)
    const sourcePositionLabels = [...positions].sort()
    const normalized = normalizePositions(sourcePositionLabels)
    const dateCompleteness =
      startYear !== undefined && endYear !== undefined
        ? 'start-end'
        : startYear !== undefined
          ? 'start-only'
          : endYear !== undefined
            ? 'end-only'
            : 'missing'

    return {
      factId: `${teamQid}_${playerQid}_${startYear ?? 'na'}_${endYear ?? 'na'}`,
      playerQid,
      playerUrl: `https://www.wikidata.org/wiki/${playerQid}`,
      playerName: binding.playerLabel?.value ?? playerQid,
      teamQid,
      teamUrl: `https://www.wikidata.org/wiki/${teamQid}`,
      teamName: binding.teamLabel?.value ?? resolution?.label ?? teamQid,
      requestedTeamName: resolution?.label ?? binding.teamLabel?.value ?? teamQid,
      teamType: resolution?.teamType ?? 'club',
      sourcePositionLabels,
      normalizedPositions: normalized.positions,
      positionSpecificity: normalized.specificity,
      startYear,
      endYear,
      dateCompleteness,
      sourceAppearances: numberFromValue(binding.matches?.value),
      sourceGoals: numberFromValue(binding.goals?.value),
      birthYear: numberFromValue(binding.birthYear?.value),
      nationality: binding.countryLabel?.value,
      eraLabels: eraLabelsFromDates(startYear, endYear),
      sourceUrls: [`https://www.wikidata.org/wiki/${playerQid}`, `https://www.wikidata.org/wiki/${teamQid}`],
    } satisfies MembershipFact
  }).sort((a, b) => a.requestedTeamName.localeCompare(b.requestedTeamName) || a.playerName.localeCompare(b.playerName))
}

function coverageForModes(facts: MembershipFact[], resolutions: TeamResolution[]): CoverageEntry[] {
  const qidByKey = new Map(resolutions.filter((resolution) => resolution.qid).map((resolution) => [resolution.key, resolution.qid]))
  const factsByTeamEra = new Map<string, Set<string>>()

  for (const fact of facts) {
    for (const era of fact.eraLabels) {
      const key = `${fact.teamType}:${fact.requestedTeamName}:${era}`
      const set = factsByTeamEra.get(key) ?? new Set<string>()
      set.add(fact.playerQid)
      factsByTeamEra.set(key, set)
    }
  }

  return modeConfigs.map((mode) => {
    const emptyExactRolls: CoverageEntry['emptyExactRolls'] = []
    const thinExactRolls: CoverageEntry['thinExactRolls'] = []
    let populatedExactRolls = 0

    for (const team of mode.teamPool) {
      const qid = qidByKey.get(keyFor(team))
      for (const eraLabel of mode.eraPool) {
        const era = eraLabel.match(/^\d{4}s/)?.[0] ?? eraLabel
        const count = qid
          ? facts.filter((fact) => fact.teamQid === qid && fact.eraLabels.includes(era)).reduce((players, fact) => players.add(fact.playerQid), new Set<string>()).size
          : (factsByTeamEra.get(`${team.teamType}:${team.label}:${era}`)?.size ?? 0)
        if (count > 0) populatedExactRolls += 1
        if (count === 0) emptyExactRolls.push({ team: team.label, era: eraLabel })
        if (count > 0 && count < 11) thinExactRolls.push({ team: team.label, era: eraLabel, facts: count })
      }
    }

    return {
      modeId: mode.modeId,
      modeName: mode.modeName,
      totalExactRolls: mode.teamPool.length * mode.eraPool.length,
      populatedExactRolls,
      emptyExactRolls,
      thinExactRolls,
    }
  })
}

const teams = allTeams()
const resolutions: TeamResolution[] = []
for (const team of teams) {
  resolutions.push(await resolveTeam(team))
  await sleep(150)
}

const bindings = await queryMembershipFacts(resolutions)
const facts = buildFacts(bindings, resolutions)
const coverage = coverageForModes(facts, resolutions)

const output = {
  generatedAt,
  source: {
    label: 'Wikidata SPARQL',
    url: 'https://www.wikidata.org/wiki/Wikidata:SPARQL_query_service/en-gb',
    licenseNote: 'Wikidata facts are available under CC0; see Wikidata terms and individual entity histories.',
    fields: ['P54 member of sports team', 'P413 position played on team / speciality', 'P580 start time', 'P582 end time', 'P1350 appearances', 'P1351 goals'],
  },
  note: 'Source-fact import only. These rows are not converted into playable ratings because that would require performance estimates for many historical players.',
  teamResolutions: resolutions,
  unresolvedTeams: resolutions.filter((resolution) => resolution.status === 'unresolved'),
  totalFacts: facts.length,
  facts,
  coverage,
}

await mkdir('src/data/generated', { recursive: true })
await writeFile('src/data/generated/wikidataMembershipFacts.json', `${JSON.stringify(output, null, 2)}\n`)

const unresolved = output.unresolvedTeams.length
const populatedRolls = coverage.reduce((total, mode) => total + mode.populatedExactRolls, 0)
const totalRolls = coverage.reduce((total, mode) => total + mode.totalExactRolls, 0)
console.log(`Imported ${facts.length} Wikidata membership facts for ${resolutions.length - unresolved}/${resolutions.length} resolved teams.`)
console.log(`Source-fact exact roll coverage: ${populatedRolls}/${totalRolls} populated rolls.`)
if (unresolved > 0) console.log(`Unresolved teams: ${output.unresolvedTeams.map((team) => team.key).join(', ')}`)
