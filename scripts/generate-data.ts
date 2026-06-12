import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { ratingFor, ratingMethodology } from '../src/data/ratingModel'
import type { DataConfidence, ModeConfig, Person, PlayerContext, Position, Ratings, SourceNote, TeamType } from '../src/types'

interface SourceDefinition {
  label: string
  url: string
  apiUrl?: string
  role: string
}

interface StatusLike {
  status: number | string
  statusText?: string
}

interface GithubRepoSummary {
  stargazers_count?: number
  forks_count?: number
  default_branch?: string
  updated_at?: string
}

interface GithubTreeResponse {
  tree?: Array<{ path?: string; type?: string }>
}

interface WikidataResponse {
  results?: {
    bindings?: Array<{
      player?: { value?: string }
      playerLabel?: { value?: string }
      birthYear?: { value?: string }
    }>
  }
}

interface StatsBombCompetition {
  competition_name?: string
  season_name?: string
  competition_gender?: string
}

const eaRatingLabels = ['OVR', 'PAC', 'SHO', 'PAS', 'DRI', 'DEF', 'PHY'] as const
const checkedAt = new Date().toISOString()
const checkedDate = checkedAt.slice(0, 10)

interface ImportedContextSeed {
  id: string
  name: string
  nationality: string
  teamType: TeamType
  team: string
  league?: string
  country?: string
  start: number
  end: number
  decade: string
  era: string
  modes: string[]
  positions: Position[]
  primary: Position[]
  roles: string[]
  overall: number
  overrides?: Partial<Ratings>
  confidence?: DataConfidence
  notes: string
  competitions?: string[]
  sourceLabels?: string[]
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
}

async function loadImportedSeeds(): Promise<ImportedContextSeed[]> {
  const raw = await readFile('scripts/sourced-context-seeds.json', 'utf8')
  return JSON.parse(raw) as ImportedContextSeed[]
}

function importedPeopleFor(seeds: ImportedContextSeed[]): Person[] {
  return Array.from(
    new Map(
      seeds.map((seed) => [
        slug(seed.name),
        {
          personId: slug(seed.name),
          displayName: seed.name,
          fullName: seed.name,
          aliases: [],
          nationality: seed.nationality,
          primaryRoles: seed.roles,
          notes: seed.notes,
        } satisfies Person,
      ]),
    ).values(),
  )
}

function importedContextsFor(seeds: ImportedContextSeed[]): PlayerContext[] {
  return seeds.map((seed) => ({
    contextId: seed.id,
    personId: slug(seed.name),
    displayName: seed.name,
    teamType: seed.teamType,
    teamName: seed.team,
    league: seed.league,
    country: seed.country,
    competitionContexts: (seed.competitions ?? []).map((competition) => ({
      competition,
      team: seed.team,
      eraLabel: seed.era,
      role: 'impact',
    })),
    startYear: seed.start,
    endYear: seed.end,
    decade: seed.decade,
    eraLabel: seed.era,
    eligibleModes: seed.modes,
    positions: seed.positions,
    primaryPositions: seed.primary,
    secondaryPositions: seed.positions.filter((position) => !seed.primary.includes(position)),
    roleTags: seed.roles,
    ratings: ratingFor(seed.primary[0], seed.overall, seed.overrides),
    peakWindow: `${seed.start}-${seed.end}`,
    dataConfidence: seed.confidence ?? 'Medium',
    ratingSourceConfidence: 'legacy-proxy',
    sourceNotes: ['Legacy proxy: manual sourced context', ...(seed.sourceLabels ?? ['Wikidata SPARQL', 'OpenFootball players', 'Manual legend curation'])],
    historicalNotes: seed.notes,
  }))
}

async function writeImportedContextModule(seeds: ImportedContextSeed[]): Promise<void> {
  const importedPeople = importedPeopleFor(seeds)
  const importedPlayerContexts = importedContextsFor(seeds)
  const body = [
    "import type { Person, PlayerContext } from '../../types'",
    '',
    `export const importedPeople: Person[] = ${JSON.stringify(importedPeople, null, 2)}`,
    '',
    `export const importedPlayerContexts: PlayerContext[] = ${JSON.stringify(importedPlayerContexts, null, 2)}`,
    '',
  ].join('\n')

  await mkdir('src/data/generated', { recursive: true })
  await writeFile('src/data/generated/importedContexts.ts', body)
  await writeFile('src/data/generated/importedContextSeeds.json', `${JSON.stringify({ generatedAt: checkedAt, totalSeeds: seeds.length, seeds }, null, 2)}\n`)
}

const wikidataSampleQuery = [
  'SELECT ?player ?playerLabel ?birthYear WHERE {',
  '  VALUES ?player { wd:Q615 wd:Q11571 wd:Q39444 }',
  '  OPTIONAL { ?player wdt:P569 ?dob. BIND(YEAR(?dob) AS ?birthYear) }',
  '  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }',
  '}',
].join('\n')

const sources: SourceDefinition[] = [
  {
    label: 'OpenFootball players',
    url: 'https://github.com/openfootball/players',
    apiUrl: 'https://api.github.com/repos/openfootball/players',
    role: 'identity and public-domain player reference',
  },
  {
    label: 'OpenFootball football.json',
    url: 'https://github.com/openfootball/football.json',
    apiUrl: 'https://api.github.com/repos/openfootball/football.json',
    role: 'competition and match-data reference',
  },
  {
    label: 'Wikidata SPARQL',
    url: 'https://www.wikidata.org/wiki/Wikidata:SPARQL_query_service/en-gb',
    apiUrl: `https://query.wikidata.org/sparql?query=${encodeURIComponent(wikidataSampleQuery)}&format=json`,
    role: 'clubs, nations, dates, aliases, and membership facts',
  },
  {
    label: 'Football-Data.co.uk',
    url: 'https://www.football-data.co.uk/data',
    apiUrl: 'https://www.football-data.co.uk/mmz4281/2526/E0.csv',
    role: 'league result calibration reference',
  },
  {
    label: 'StatsBomb open data',
    url: 'https://github.com/statsbomb/open-data',
    apiUrl: 'https://raw.githubusercontent.com/statsbomb/open-data/master/data/competitions.json',
    role: 'modern event-data calibration reference where attribution is acceptable',
  },
  {
    label: 'EA SPORTS FC ratings',
    url: 'https://www.ea.com/en/games/ea-sports-fc/ratings',
    apiUrl: 'https://www.ea.com/en/games/ea-sports-fc/ratings/leagues-ratings/premier-league/13',
    role: 'official current-player rating calibration reference',
  },
]

function sourceByLabel(label: string): SourceNote {
  return sourceNotes.find((source) => source.label === label) ?? {
    label,
    url: 'https://www.wikidata.org/',
    sourceType: 'manual-curation',
    licenseNote: 'Manual provenance label carried from curated context data.',
    lastChecked: checkedDate,
  }
}

async function headStatus(url: string): Promise<StatusLike> {
  const response = await fetch(url, { method: 'HEAD' }).catch((error) => ({
    status: 'unreachable',
    statusText: error instanceof Error ? error.message : 'unknown error',
  }))

  return {
    status: response.status,
    statusText: response.statusText,
  }
}

async function getJson<T>(url: string, accept = 'application/json'): Promise<{ status: StatusLike; json?: T }> {
  const response = await fetch(url, {
    headers: {
      accept,
      'user-agent': 'UndefeatedXI data generator',
    },
  }).catch((error) => ({
    ok: false,
    status: 'unreachable',
    statusText: error instanceof Error ? error.message : 'unknown error',
    json: async () => undefined,
  }))
  const json = await response.json().catch(() => undefined)

  return {
    status: {
      status: response.status,
      statusText: response.statusText,
    },
    json: json as T | undefined,
  }
}

async function getText(url: string): Promise<{ status: StatusLike; text?: string }> {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'UndefeatedXI data generator',
    },
  }).catch((error) => ({
    ok: false,
    status: 'unreachable',
    statusText: error instanceof Error ? error.message : 'unknown error',
    text: async () => undefined,
  }))
  const text = await response.text().catch(() => undefined)

  return {
    status: {
      status: response.status,
      statusText: response.statusText,
    },
    text,
  }
}

function summarizeApi(label: string, json: GithubRepoSummary | WikidataResponse | StatsBombCompetition[] | undefined) {
  if (!json) return undefined
  if (label.includes('Wikidata')) {
    const bindings = (json as WikidataResponse).results?.bindings ?? []
    return {
      sampleBindings: bindings.map((binding) => binding.playerLabel?.value).filter(Boolean),
    }
  }
  if (Array.isArray(json)) {
    return {
      records: json.length,
      sampleCompetitions: json.slice(0, 5).map((competition) => `${competition.competition_name ?? 'Unknown'} ${competition.season_name ?? ''}`.trim()),
    }
  }

  const repo = json as GithubRepoSummary
  return {
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    defaultBranch: repo.default_branch,
    updatedAt: repo.updated_at,
  }
}

function eaRatingsFromPageText(text: string) {
  const players = ['Mohamed Salah', 'Rodri', 'Virgil van Dijk', 'Erling Haaland', 'Alisson']

  return players.flatMap((player) => {
    const index = text.indexOf(`<span class="Table_profileLabel__QjIyD">${player}`)
    if (index < 0) return []
    const rowStart = text.lastIndexOf('<tr', index)
    const rowEnd = text.indexOf('</tr>', index)
    const window = rowStart >= 0 && rowEnd > rowStart ? text.slice(rowStart, rowEnd) : text.slice(index, index + 12000)
    const ratings = Object.fromEntries(
      eaRatingLabels.map((label) => [
        label,
        Number(window.match(new RegExp(`>${label}<\\/span><span class="Table_statCellValue[^>]*>(\\d{1,3})<\\/span>`))?.[1]) || undefined,
      ]),
    )

    return [{ player, ratings }]
  })
}

function summarizeText(label: string, text: string | undefined) {
  if (!text) return undefined
  if (label === 'EA SPORTS FC ratings') {
    return {
      sampledPage: 'Premier League ratings',
      players: eaRatingsFromPageText(text),
    }
  }

  if (label === 'Football-Data.co.uk') {
    const rows = text.split(/\r?\n/).filter(Boolean)
    return {
      rows: rows.length,
      columns: rows[0]?.split(',').slice(0, 12) ?? [],
    }
  }

  return { chars: text.length }
}

async function githubTreeSample(repo: 'players' | 'football.json') {
  const treeUrl = `https://api.github.com/repos/openfootball/${repo}/git/trees/master?recursive=1`
  const { status, json } = await getJson<GithubTreeResponse>(treeUrl, 'application/vnd.github+json')
  const filePaths = json?.tree?.filter((item) => item.type === 'blob' && item.path).map((item) => item.path as string) ?? []

  return {
    source: repo === 'players' ? 'OpenFootball players' : 'OpenFootball football.json',
    status: status.status,
    checkedAt,
    fileCount: filePaths.length,
    samplePaths: filePaths.slice(0, 12),
  }
}

async function wikidataSample() {
  const source = sources.find((item) => item.label === 'Wikidata SPARQL')
  const { status, json } = await getJson<WikidataResponse>(source?.apiUrl ?? '', 'application/sparql-results+json')
  const bindings = json?.results?.bindings ?? []

  return {
    source: 'Wikidata SPARQL',
    status: status.status,
    checkedAt,
    samplePeople: bindings.map((binding) => ({
      qid: binding.player?.value?.split('/').at(-1) ?? 'unknown',
      name: binding.playerLabel?.value ?? 'Unknown',
      birthYear: binding.birthYear?.value ? Number(binding.birthYear.value) : undefined,
    })),
  }
}

async function footballDataSample() {
  const source = sources.find((item) => item.label === 'Football-Data.co.uk')
  const { status, text } = await getText(source?.apiUrl ?? '')
  const rows = text?.split(/\r?\n/).filter(Boolean) ?? []
  const header = rows[0]?.split(',') ?? []

  return {
    source: 'Football-Data.co.uk',
    status: status.status,
    checkedAt,
    sampleCompetition: 'Premier League E0 2025-26 CSV',
    columns: header.slice(0, 18),
    sampleRows: rows.slice(1, 4).map((row) => row.split(',').slice(0, 8)),
  }
}

async function statsBombSample() {
  const source = sources.find((item) => item.label === 'StatsBomb open data')
  const { status, json } = await getJson<StatsBombCompetition[]>(source?.apiUrl ?? '')
  const competitions = Array.isArray(json) ? json : []

  return {
    source: 'StatsBomb open data',
    status: status.status,
    checkedAt,
    competitionCount: competitions.length,
    sampleCompetitions: competitions.slice(0, 8).map((competition) => ({
      competition: competition.competition_name ?? 'Unknown',
      season: competition.season_name ?? 'Unknown',
      gender: competition.competition_gender ?? 'unknown',
    })),
  }
}

async function eaRatingsSample() {
  const source = sources.find((item) => item.label === 'EA SPORTS FC ratings')
  const { status, text } = await getText(source?.apiUrl ?? '')

  return {
    source: 'EA SPORTS FC ratings',
    status: status.status,
    checkedAt,
    note: 'Official current-player page sampled as a calibration reference only; no bulk player database is copied into the app.',
    players: text ? eaRatingsFromPageText(text) : [],
  }
}

function contextProvenanceFor(player: PlayerContext) {
  return {
    contextId: player.contextId,
    displayName: player.displayName,
    teamName: player.teamName,
    teamType: player.teamType,
    peakWindow: player.peakWindow,
    positions: player.positions,
    eligibleModes: player.eligibleModes,
    dataConfidence: player.dataConfidence,
    estimateNote: player.dataConfidence === 'Legend estimate' ? player.historicalNotes : undefined,
    sources: player.sourceNotes.map((label) => {
      const source = sourceByLabel(label)
      return {
        label: source.label,
        url: source.url,
        sourceType: source.sourceType,
        licenseNote: source.licenseNote,
        lastChecked: source.lastChecked,
      }
    }),
  }
}

function playableContextFor(player: PlayerContext) {
  return {
    ...contextProvenanceFor(player),
    ratings: player.ratings,
    roleTags: player.roleTags,
    historicalNotes: player.historicalNotes,
  }
}

async function writeModeContextModules(
  modes: ModeConfig[],
  contexts: PlayerContext[],
  modeMatchesPlayer: (mode: ModeConfig, player: PlayerContext, strictMode?: boolean) => boolean,
): Promise<void> {
  const modeContextDir = 'src/data/generated/modeContexts'
  await rm(modeContextDir, { recursive: true, force: true })
  await mkdir(modeContextDir, { recursive: true })

  const loaders: string[] = []
  const moduleBySignature = new Map<string, string>()
  for (const mode of modes) {
    const teamKeys = new Set(mode.teamPool.map((team) => `${team.teamType}:${team.label}`))
    const modeContexts = contexts.filter((player) => modeMatchesPlayer(mode, player, false) && teamKeys.has(`${player.teamType}:${player.teamName}`))
    const signature = JSON.stringify(modeContexts.map((context) => context.contextId))
    const moduleName = moduleBySignature.get(signature) ?? mode.modeId
    if (!moduleBySignature.has(signature)) {
      moduleBySignature.set(signature, moduleName)
      await writeFile(
        `${modeContextDir}/${moduleName}.ts`,
        [
          "import type { PlayerContext } from '../../../types'",
          '',
          `const modePlayerContextsJson = ${JSON.stringify(JSON.stringify(modeContexts))}`,
          '',
          'export const modePlayerContexts = JSON.parse(modePlayerContextsJson) as PlayerContext[]',
          '',
        ].join('\n'),
      )
    }
    loaders.push(`  ${JSON.stringify(mode.modeId)}: () => import('./${moduleName}'),`)
  }

  await writeFile(
    `${modeContextDir}/index.ts`,
    [
      "import type { PlayerContext } from '../../../types'",
      '',
      'const modeLoaders = {',
      ...loaders,
      '} satisfies Record<string, () => Promise<{ modePlayerContexts: PlayerContext[] }>>',
      '',
      'export async function loadGeneratedModePlayerContexts(modeId: string): Promise<PlayerContext[]> {',
      "  const loader = modeLoaders[modeId as keyof typeof modeLoaders] ?? modeLoaders['world_xi']",
      '  const module = await loader()',
      '  return module.modePlayerContexts',
      '}',
      '',
    ].join('\n'),
  )
}

const importedSeeds = await loadImportedSeeds()
await writeImportedContextModule(importedSeeds)

const [{ modeConfigs }, { playerContexts }, { sourceNotes }, { modeValidations }, { modeMatchesPlayer }] = await Promise.all([
  import('../src/data/modes'),
  import('../src/data/playerContexts'),
  import('../src/data/sourceNotes'),
  import('../src/engine/validation'),
  import('../src/engine/eligibility'),
])

await writeModeContextModules(modeConfigs, playerContexts, modeMatchesPlayer)

const sourceStatus = await Promise.all(
  sources.map(async (source) => {
    const pageStatus = await headStatus(source.url)
    const apiResult = source.apiUrl
      ? source.label === 'Football-Data.co.uk' || source.label === 'EA SPORTS FC ratings'
        ? await getText(source.apiUrl)
        : await getJson<GithubRepoSummary | WikidataResponse | StatsBombCompetition[]>(
            source.apiUrl,
            source.apiUrl.includes('sparql')
              ? 'application/sparql-results+json'
              : source.apiUrl.includes('github')
                ? 'application/vnd.github+json'
                : 'application/json',
          )
      : undefined

    return {
      ...source,
      status: pageStatus.status,
      statusText: pageStatus.statusText,
      apiStatus: apiResult?.status.status,
      apiStatusText: apiResult?.status.statusText,
      apiSummary: 'json' in (apiResult ?? {}) ? summarizeApi(source.label, apiResult?.json) : summarizeText(source.label, apiResult?.text),
      checkedAt,
    }
  }),
)

const normalizedSources = {
  generatedBy: 'scripts/generate-data.ts',
  generatedAt: checkedAt,
  note: 'Small normalized public-source snapshots used as reproducible reference inputs; playable contexts remain curated in src/data/playerContexts.ts with per-context provenance expanded in contextProvenance.json.',
  samples: [
    await githubTreeSample('players'),
    await githubTreeSample('football.json'),
    await wikidataSample(),
    await footballDataSample(),
    await statsBombSample(),
    await eaRatingsSample(),
  ],
}

const contextProvenance = {
  generatedBy: 'scripts/generate-data.ts',
  generatedAt: checkedAt,
  ratingMethodology,
  totalContexts: playerContexts.length,
  confidenceCounts: playerContexts.reduce<Record<string, number>>((counts, player) => {
    counts[player.dataConfidence] = (counts[player.dataConfidence] ?? 0) + 1
    return counts
  }, {}),
  modeContextCounts: modeConfigs.map((mode) => ({
    modeId: mode.modeId,
    modeName: mode.modeName,
    status: mode.status,
    rosterSlots: mode.rosterSlots,
    strictContexts: modeValidations.find((validation) => validation.modeId === mode.modeId)?.contextCount ?? 0,
    playable: modeValidations.find((validation) => validation.modeId === mode.modeId)?.playable ?? false,
    demoPlayable: modeValidations.find((validation) => validation.modeId === mode.modeId)?.demoPlayable ?? false,
    readiness: modeValidations.find((validation) => validation.modeId === mode.modeId)?.readiness ?? 'thin',
    playableTeams: modeValidations.find((validation) => validation.modeId === mode.modeId)?.playableTeams ?? [],
    playableRolls: modeValidations.find((validation) => validation.modeId === mode.modeId)?.playableRolls ?? [],
    incompleteTeams: modeValidations.find((validation) => validation.modeId === mode.modeId)?.incompleteTeams ?? [],
  })),
  contexts: playerContexts.map(contextProvenanceFor),
}

const playableContexts = {
  generatedBy: 'scripts/generate-data.ts',
  generatedAt: checkedAt,
  ratingMethodology,
  note: 'Generated playable context export with ratings, football-role tags, confidence labels, and expanded public-source provenance. The app imports the typed source module; this JSON is the reproducible data artifact for audits and static hosting.',
  totalContexts: playerContexts.length,
  contexts: playerContexts.map(playableContextFor),
}

await mkdir('src/data/generated', { recursive: true })
await writeFile(
  'src/data/generated/sourceAudit.json',
  `${JSON.stringify(
    {
      generatedBy: 'scripts/generate-data.ts',
      generatedAt: checkedAt,
      note: 'Online source reachability and API summaries for UndefeatedXI data inputs.',
      sourceStatus,
    },
    null,
    2,
  )}\n`,
)
await writeFile('src/data/generated/normalizedSources.json', `${JSON.stringify(normalizedSources, null, 2)}\n`)
await writeFile('src/data/generated/contextProvenance.json', `${JSON.stringify(contextProvenance, null, 2)}\n`)
await writeFile('src/data/generated/playableContexts.json', `${JSON.stringify(playableContexts, null, 2)}\n`)

console.log(`Generated source audit, normalized source snapshots, provenance, and playable export for ${playerContexts.length} contexts.`)
