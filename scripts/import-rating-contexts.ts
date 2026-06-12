import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { modeConfigs } from '../src/data/modes'
import { ratingsFromEaStyle, type EaStyleAttributes } from '../src/data/ratingModel'
import type { ModeConfig, Person, PlayerContext, Position, RatingSourceConfidence, RollResult, TeamType } from '../src/types'

const ratingsRoot = 'data/external/ratings'
const generatedDir = 'src/data/generated'
const checkedAt = new Date().toISOString()
const currentYear = 2026
const minimumReportCoverage = 50

const ratingSources = [
  {
    match: '/fc26/',
    label: 'EA FC 26 CSV snapshot',
    url: 'https://www.kaggle.com/datasets/justdhia/ea-sports-fc-26-player-ratings',
    sourceType: 'ea-current-csv',
  },
  {
    match: '/fc25/',
    label: 'EA FC 25 CSV snapshot',
    url: 'https://www.kaggle.com/datasets/nyagami/ea-sports-fc-25-database-ratings-and-stats',
    sourceType: 'ea-current-csv',
  },
  {
    match: '/official_ea/',
    label: 'EA SPORTS FC official ratings export',
    url: 'https://www.ea.com/en/games/ea-sports-fc/ratings',
    sourceType: 'ea-official-current',
  },
  {
    match: '/fc24/',
    label: 'EA/SoFIFA CSV snapshot',
    url: 'https://www.kaggle.com/datasets/stefanoleone992/ea-sports-fc-24-complete-player-dataset',
    sourceType: 'ea-sofifa-career',
  },
  {
    match: '/fut10_20/',
    label: 'FIFA 10-20 FUT CSV snapshot',
    url: 'https://www.kaggle.com/datasets/mohammedessam97/fifa-1020-fut-players-dataset',
    sourceType: 'fut-card',
  },
  {
    match: '/legacy_proxy/',
    label: 'Approved public historical numeric rating proxy',
    url: 'local CSV with per-row source_url provenance',
    sourceType: 'legacy-proxy',
  },
]

type CsvRow = Record<string, string>

const fcColumns = new Set([
  'fifa_version',
  'fifa_update',
  'update_as_of',
  'short_name',
  'long_name',
  'player_positions',
  'overall',
  'dob',
  'club_name',
  'league_name',
  'club_position',
  'nationality_name',
  'nation_position',
  'international_reputation',
  'player_tags',
  'player_traits',
  'pace',
  'shooting',
  'passing',
  'dribbling',
  'defending',
  'physic',
  'goalkeeping_diving',
  'goalkeeping_handling',
  'goalkeeping_kicking',
  'goalkeeping_positioning',
  'goalkeeping_reflexes',
])

const futColumns = new Set([
  'name',
  'ratings',
  'position',
  'version',
  'pac',
  'sho',
  'pas',
  'dri',
  'def',
  'phy',
  'club',
  'league',
  'country',
])

const genericEaColumns = new Set([
  'name',
  'player',
  'player_name',
  'short_name',
  'long_name',
  'full_name',
  'known_as',
  'overall',
  'ovr',
  'rating',
  'position',
  'positions',
  'player_positions',
  'pos',
  'club',
  'club_name',
  'team',
  'team_name',
  'nation',
  'nationality',
  'nationality_name',
  'country',
  'league',
  'league_name',
  'age',
  'birth_year',
  'dob',
  'fifa_version',
  'game',
  'game_version',
  'version',
  'card_type',
  'rarity',
  'player_tags',
  'player_traits',
  'pace',
  'pac',
  'shooting',
  'sho',
  'passing',
  'pas',
  'dribbling',
  'dri',
  'defending',
  'def',
  'physical',
  'physic',
  'phy',
  'goalkeeping',
  'gk',
  'year',
  'game_year',
  'rating_year',
  'era',
  'decade',
  'big_game',
  'source_url',
  'source_label',
  'source_game',
  'source_notes',
])

interface WikidataFact {
  factId: string
  playerQid: string
  playerUrl: string
  playerName: string
  teamName: string
  requestedTeamName: string
  teamType: TeamType
  normalizedPositions?: Position[]
  sourcePositionLabels?: string[]
  startYear: number
  endYear?: number
  sourceAppearances?: number
  sourceGoals?: number
  birthYear?: number
  nationality?: string
  eraLabels?: string[]
  sourceUrls?: string[]
}

interface WikidataFactsFile {
  facts: WikidataFact[]
}

interface RatingRow {
  sourceFile: string
  sourceLabel: string
  sourceUrl: string
  sourceSchema: 'ea-sofifa-career' | 'fut-card' | 'ea-current-csv' | 'ea-official-current' | 'legacy-proxy'
  sourceGame: string
  gameVersion: number
  gameYear: number
  gameDecade: string
  name: string
  longName?: string
  normalizedNames: string[]
  birthYear?: number
  nationality?: string
  teamName?: string
  leagueName?: string
  positions: Position[]
  primaryPosition: Position
  overall: number
  ea: EaStyleAttributes
  versionLabel?: string
  isIconHero: boolean
}

interface CandidateMatch {
  fact: WikidataFact
  row: RatingRow
  sourceConfidence: RatingSourceConfidence
}

interface ContextCandidate {
  player: PlayerContext
  row: RatingRow
  fact: WikidataFact
  sourceConfidence: RatingSourceConfidence
  sourceRank: number
}

type GeneratedProxyTier = 'fringe' | 'regular' | 'important' | 'star' | 'legend-candidate'

function clampRating(value: number): number {
  return Math.round(Math.max(1, Math.min(100, value)))
}

function clampBetween(value: number, min: number, max: number): number {
  return Math.round(Math.max(min, Math.min(max, value)))
}

function slug(value: string): string {
  return normalizeText(value).replace(/\s+/g, '_').replace(/^_|_$/g, '')
}

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/['’]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .toLowerCase()
    .trim()
}

function nameTokens(value: string): string[] {
  return normalizeText(value)
    .split(/\s+/)
    .filter((token) => token.length > 1 && !['jr', 'sr', 'ii', 'iii'].includes(token))
}

function normalizeTeam(value: string): string {
  return normalizeText(value)
    .replace(/\bfootball club\b/g, '')
    .replace(/\bfutbol club\b/g, '')
    .replace(/\bfutebol clube\b/g, '')
    .replace(/\bassociazione calcio\b/g, '')
    .replace(/\bclub de futbol\b/g, '')
    .replace(/\bclub atletico\b/g, '')
    .replace(/\b(f c|fc|cf|c f|afc|a f c|sc|s c|cfc|ss|ac)\b/g, '')
    .replace(/\b(the|club)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const teamAliases: Record<string, string[]> = {
  'AC Milan': ['AC Milan', 'Milan', 'A.C. Milan'],
  Ajax: ['Ajax', 'AFC Ajax'],
  'Atlanta United': ['Atlanta United', 'Atlanta United FC'],
  'Atletico Madrid': ['Atletico Madrid', 'Atlético Madrid', 'Atlético de Madrid'],
  Arsenal: ['Arsenal', 'Arsenal FC'],
  Barcelona: ['Barcelona', 'FC Barcelona', 'F.C. Barcelona', 'Fc Barcelona'],
  Benfica: ['Benfica', 'SL Benfica'],
  Blackburn: ['Blackburn', 'Blackburn Rovers'],
  'Bayern Munich': ['Bayern Munich', 'FC Bayern Munich', 'FC Bayern München', 'Bayern München'],
  'Bayer Leverkusen': ['Bayer Leverkusen', 'Bayer 04 Leverkusen'],
  'Boca Juniors': ['Boca Juniors'],
  Bordeaux: ['Bordeaux', 'Girondins de Bordeaux'],
  'Borussia Dortmund': ['Borussia Dortmund', 'Dortmund'],
  'Borussia Monchengladbach': ['Borussia Monchengladbach', 'Borussia Mönchengladbach', "Bor. M'gladbach"],
  Chelsea: ['Chelsea', 'Chelsea FC'],
  'Colorado Rapids': ['Colorado Rapids'],
  'Columbus Crew': ['Columbus Crew'],
  'DC United': ['DC United', 'D.C. United', 'D.C. Utd'],
  Everton: ['Everton', 'Everton FC'],
  Hamburg: ['Hamburg', 'Hamburger SV'],
  'Houston Dynamo': ['Houston Dynamo', 'Houston Dynamo FC'],
  Inter: ['Inter', 'Inter Milan', 'Internazionale', 'Inter Milano', 'FC Internazionale Milano'],
  'Inter Miami': ['Inter Miami', 'Inter Miami CF'],
  Juventus: ['Juventus', 'Juventus FC'],
  LAFC: ['LAFC', 'Los Angeles FC'],
  'LA Galaxy': ['LA Galaxy', 'Los Angeles Galaxy'],
  Liverpool: ['Liverpool', 'Liverpool FC'],
  Lyon: ['Lyon', 'Olympique Lyonnais'],
  Marseille: ['Marseille', 'Olympique de Marseille'],
  'Manchester City': ['Manchester City', 'Man City', 'Manchester City FC'],
  'Manchester United': ['Manchester United', 'Manchester Utd', 'Man United', 'Man Utd', 'Manchester United FC'],
  Monaco: ['Monaco', 'AS Monaco'],
  Napoli: ['Napoli', 'SSC Napoli', 'Naples'],
  Nashville: ['Nashville', 'Nashville SC'],
  'Nashville SC': ['Nashville', 'Nashville SC'],
  'New York Red Bulls': ['New York Red Bulls', 'NY Red Bulls'],
  'Nottingham Forest': ['Nottingham Forest', 'Nottingham Forest FC'],
  PSG: ['PSG', 'Paris Saint-Germain', 'Paris Saint Germain', 'Paris Saint-Germain FC'],
  Porto: ['Porto', 'FC Porto'],
  'Portland Timbers': ['Portland Timbers'],
  'Real Madrid': ['Real Madrid', 'Real Madrid CF', 'Real Madrid C.F.'],
  'River Plate': ['River Plate', 'CA River Plate'],
  Roma: ['Roma', 'AS Roma', 'Rome'],
  Santos: ['Santos', 'Santos FC'],
  Seattle: ['Seattle Sounders', 'Seattle Sounders FC'],
  'Seattle Sounders': ['Seattle Sounders', 'Seattle Sounders FC'],
  Sevilla: ['Sevilla', 'Sevilla FC'],
  'Sporting KC': ['Sporting KC', 'Sporting Kansas City'],
  'Saint-Etienne': ['Saint-Etienne', 'Saint Etienne', 'AS Saint-Étienne', 'AS Saint-Etienne'],
  Tottenham: ['Tottenham', 'Tottenham Hotspur', 'Spurs'],
  'Toronto FC': ['Toronto FC'],
  Valencia: ['Valencia', 'Valencia CF'],
  'Vancouver Whitecaps': ['Vancouver Whitecaps', 'Vancouver Whitecaps FC'],
  'Werder Bremen': ['Werder Bremen', 'SV Werder Bremen'],
}

const countryAliases: Record<string, string[]> = {
  USA: ['United States', 'USA', 'United States of America'],
  'United States': ['United States', 'USA', 'United States of America'],
  England: ['England', 'United Kingdom'],
  Scotland: ['Scotland', 'United Kingdom'],
  Wales: ['Wales', 'United Kingdom'],
  Germany: ['Germany', 'West Germany'],
  'Ivory Coast': ['Ivory Coast', "Cote d'Ivoire", 'Côte d’Ivoire'],
  Netherlands: ['Netherlands', 'Holland'],
  Ireland: ['Ireland', 'Republic of Ireland'],
}

function aliasesForTeam(label: string): Set<string> {
  return new Set([label, ...(teamAliases[label] ?? [])].map(normalizeTeam).filter(Boolean))
}

function aliasesForCountry(label: string | undefined): Set<string> {
  if (!label) return new Set()
  return new Set([label, ...(countryAliases[label] ?? [])].map(normalizeText).filter(Boolean))
}

function labelsMatch(left: string | undefined, right: string | undefined, aliases: Set<string>, normalizer: (value: string) => string): boolean {
  if (!left || !right) return false
  const normalizedLeft = normalizer(left)
  const normalizedRight = normalizer(right)
  if (normalizedLeft === normalizedRight) return true
  if (aliases.has(normalizedLeft)) return true
  return false
}

function teamMatchesLabel(teamName: string | undefined, label: string): boolean {
  return labelsMatch(teamName, label, aliasesForTeam(label), normalizeTeam)
}

function countryMatchesLabel(country: string | undefined, label: string): boolean {
  return labelsMatch(country, label, aliasesForCountry(label), normalizeText)
}

function eraDecade(era: string): string {
  return era.match(/\d{4}s/)?.[0] ?? era
}

function decadeForYear(year: number): string {
  return `${Math.floor(year / 10) * 10}s`
}

function decadeStart(decade: string): number {
  const year = Number(decade.slice(0, 4))
  return Number.isFinite(year) ? year : 0
}

function factOverlapsDecade(fact: WikidataFact, decade: string): boolean {
  const start = decadeStart(decade)
  const end = start + 9
  return fact.startYear <= end && (fact.endYear ?? currentYear) >= start
}

function factMatchesRoll(mode: ModeConfig, fact: WikidataFact, roll: RollResult): boolean {
  if (!teamMatchesLabel(fact.requestedTeamName, roll.team.label)) return false
  if (mode.rollDimensions.includes('nation') && fact.teamType !== 'nation') return false
  if (mode.rollDimensions.includes('club') && fact.teamType !== 'club') return false
  if (!mode.rollDimensions.includes('club_or_nation') && fact.teamType !== roll.team.teamType) return false
  return factOverlapsDecade(fact, eraDecade(roll.era))
}

function csvLineToCells(line: string): string[] {
  const cells: string[] = []
  let cell = ''
  let quoted = false

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    const next = line[index + 1]
    if (char === '"' && quoted && next === '"') {
      cell += '"'
      index += 1
    } else if (char === '"') {
      quoted = !quoted
    } else if (char === ',' && !quoted) {
      cells.push(cell)
      cell = ''
    } else {
      cell += char
    }
  }

  cells.push(cell)
  return cells
}

function parseCsv(text: string, wantedHeaders?: Set<string>): CsvRow[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0)
  if (lines.length < 2) return []
  const headers = csvLineToCells(lines[0]).map((header) => normalizeText(header.replace(/^\uFEFF/, '')).replace(/\s+/g, '_'))
  const selected = headers
    .map((header, index) => ({ header, index }))
    .filter(({ header }) => !wantedHeaders || wantedHeaders.has(header))

  return lines.slice(1).map((line) => {
    const cells = csvLineToCells(line)
    const row: CsvRow = {}
    selected.forEach(({ header, index }) => {
      row[header] = cells[index] ?? ''
    })
    return row
  })
}

async function csvFilesIn(folder: string): Promise<string[]> {
  const entries = await readdir(folder, { withFileTypes: true }).catch(() => [])
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(folder, entry.name)
      if (entry.isDirectory()) {
        if (entry.name === '.archives') return []
        return csvFilesIn(path)
      }
      return entry.name.toLowerCase().endsWith('.csv') ? [path] : []
    }),
  )
  return files.flat()
}

function numeric(value: string | undefined): number | undefined {
  if (!value) return undefined
  const parsed = Number(String(value).replace(/,/g, '').trim())
  return Number.isFinite(parsed) ? parsed : undefined
}

function requiredRating(value: string | undefined): number | undefined {
  const parsed = numeric(value)
  if (parsed === undefined || parsed <= 0) return undefined
  return clampRating(parsed)
}

function splitPositions(value: string | undefined): Position[] {
  const positions = (value ?? '')
    .split(/[,\s/]+/)
    .map((position) => position.trim().toUpperCase())
    .flatMap(mapPosition)
  return Array.from(new Set(positions))
}

function mapPosition(position: string): Position[] {
  const map: Record<string, Position[]> = {
    GK: ['GK'],
    LB: ['LB'],
    LWB: ['LWB'],
    RB: ['RB'],
    RWB: ['RWB'],
    CB: ['CB'],
    LCB: ['CB'],
    RCB: ['CB'],
    CDM: ['DM'],
    DM: ['DM'],
    LDM: ['DM'],
    RDM: ['DM'],
    CM: ['CM'],
    LCM: ['CM'],
    RCM: ['CM'],
    CAM: ['AM'],
    AM: ['AM'],
    LAM: ['AM'],
    RAM: ['AM'],
    LM: ['LM'],
    RM: ['RM'],
    LW: ['LW'],
    RW: ['RW'],
    LF: ['CF'],
    RF: ['CF'],
    CF: ['CF'],
    ST: ['ST'],
    LS: ['ST'],
    RS: ['ST'],
  }
  return map[position] ?? []
}

function sourceForFile(filePath: string) {
  const normalized = `/${relative(process.cwd(), filePath).replaceAll('\\', '/')}`
  return ratingSources.find((source) => normalized.includes(source.match)) ?? ratingSources[0]
}

function gameYearFromFifaVersion(version: number, updateAsOf?: string): number {
  const updateYear = Number(updateAsOf?.slice(0, 4))
  if (Number.isFinite(updateYear) && updateYear > 1990) return updateYear
  if (version >= 10 && version <= 20) return 2000 + version - 1
  if (version >= 21 && version <= 40) return 2000 + version - 1
  return currentYear
}

function goalkeepingAverage(row: CsvRow): number | undefined {
  const values = ['goalkeeping_diving', 'goalkeeping_handling', 'goalkeeping_kicking', 'goalkeeping_positioning', 'goalkeeping_reflexes']
    .map((field) => numeric(row[field]))
    .filter((value): value is number => value !== undefined && value > 0)
  if (values.length === 0) return undefined
  return clampRating(values.reduce((sum, value) => sum + value, 0) / values.length)
}

function textValue(row: CsvRow, fields: string[]): string | undefined {
  for (const field of fields) {
    const value = row[field]?.trim()
    if (value) return value
  }
  return undefined
}

function ratingValue(row: CsvRow, fields: string[]): number | undefined {
  for (const field of fields) {
    const value = requiredRating(row[field])
    if (value !== undefined) return value
  }
  return undefined
}

function inferVersionFromFile(sourceFile: string): number | undefined {
  const normalized = sourceFile.toLowerCase()
  const fcMatch = normalized.match(/(?:fc|fifa)[_\s-]*(\d{2})/)
  if (fcMatch) return Number(fcMatch[1])
  return undefined
}

function inferYearFromGenericRow(row: CsvRow, sourceFile: string, gameVersion?: number): number {
  const explicitYear = numeric(textValue(row, ['game_year', 'rating_year', 'year']))
  if (explicitYear && explicitYear >= 1900) return explicitYear

  const era = textValue(row, ['era', 'decade'])
  if (era?.match(/\d{4}s/)) return decadeStart(era) + 5

  if (gameVersion) return gameYearFromFifaVersion(gameVersion)
  const inferredVersion = inferVersionFromFile(sourceFile)
  if (inferredVersion) return gameYearFromFifaVersion(inferredVersion)
  return currentYear
}

function sourceGameFromGenericRow(row: CsvRow, sourceFile: string, gameVersion?: number): string {
  const explicit = textValue(row, ['source_game', 'game', 'game_version', 'version'])
  if (explicit) return explicit
  const normalized = sourceFile.toLowerCase()
  if (normalized.includes('/legacy_proxy/')) return 'Legacy proxy rating'
  const version = gameVersion ?? inferVersionFromFile(sourceFile)
  if (version) return version >= 24 ? `EA FC ${version}` : `FIFA ${version}`
  return 'EA-style rating CSV'
}

function genericSchemaForSource(sourceFile: string): RatingRow['sourceSchema'] {
  return sourceForFile(sourceFile).sourceType as RatingRow['sourceSchema']
}

function normalizeGenericRow(row: CsvRow, sourceFile: string): RatingRow | undefined {
  const source = sourceForFile(sourceFile)
  const sourceSchema = genericSchemaForSource(sourceFile)
  const overall = ratingValue(row, ['overall', 'ovr', 'rating'])
  const displayName = textValue(row, ['name', 'player_name', 'player', 'short_name', 'known_as'])
  const longName = textValue(row, ['long_name', 'full_name'])
  const positions = splitPositions(textValue(row, ['positions', 'player_positions', 'position', 'pos']))
  if (!overall || !displayName || positions.length === 0) return undefined

  const gameVersion = numeric(textValue(row, ['fifa_version', 'game_version', 'version'])) ?? inferVersionFromFile(sourceFile) ?? 0
  const gameYear = inferYearFromGenericRow(row, sourceFile, gameVersion || undefined)
  const primaryPosition = positions[0]
  const sourceGame = sourceGameFromGenericRow(row, sourceFile, gameVersion || undefined)
  const explicitBigGame = ratingValue(row, ['big_game'])
  const gk = primaryPosition === 'GK' ? (ratingValue(row, ['goalkeeping', 'gk']) ?? overall) : undefined
  const typeText = normalizeText(`${textValue(row, ['card_type', 'rarity', 'player_tags', 'player_traits']) ?? ''} ${sourceGame}`)

  return {
    sourceFile,
    sourceLabel: textValue(row, ['source_label']) ?? source.label,
    sourceUrl: textValue(row, ['source_url']) ?? source.url,
    sourceSchema,
    sourceGame,
    gameVersion,
    gameYear,
    gameDecade: eraDecade(textValue(row, ['era', 'decade']) ?? decadeForYear(gameYear)),
    name: displayName,
    longName,
    normalizedNames: Array.from(new Set([displayName, longName].filter(Boolean).map(normalizeText))),
    birthYear: (numeric(textValue(row, ['birth_year'])) ?? Number(textValue(row, ['dob'])?.slice(0, 4))) || undefined,
    nationality: textValue(row, ['nationality', 'nationality_name', 'nation', 'country']),
    teamName: textValue(row, ['team', 'team_name', 'club', 'club_name']),
    leagueName: textValue(row, ['league', 'league_name']),
    positions,
    primaryPosition,
    overall,
    ea: {
      overall,
      pace: ratingValue(row, ['pace', 'pac']),
      shooting: ratingValue(row, ['shooting', 'sho']),
      passing: ratingValue(row, ['passing', 'pas']),
      dribbling: ratingValue(row, ['dribbling', 'dri']),
      defending: ratingValue(row, ['defending', 'def']),
      physical: ratingValue(row, ['physical', 'physic', 'phy']),
      goalkeeping: gk,
      bigGame: explicitBigGame ?? overall,
    },
    versionLabel: textValue(row, ['version', 'card_type', 'rarity']),
    isIconHero: /icon|hero|legend/.test(typeText),
  }
}

function normalizeFcRow(row: CsvRow, sourceFile: string): RatingRow | undefined {
  const overall = requiredRating(row.overall)
  const version = numeric(row.fifa_version)
  const positions = splitPositions(row.player_positions || row.club_position || row.nation_position)
  if (!overall || !version || positions.length === 0 || !row.short_name) return undefined
  const gameYear = gameYearFromFifaVersion(version, row.update_as_of)
  const primaryPosition = positions[0]
  const source = sourceForFile(sourceFile)
  const reputation = numeric(row.international_reputation)
  const bigGame = reputation ? clampRating(overall + Math.max(0, reputation - 3) * 2) : overall
  const gk = primaryPosition === 'GK' ? (goalkeepingAverage(row) ?? overall) : undefined

  return {
    sourceFile,
    sourceLabel: source.label,
    sourceUrl: source.url,
    sourceSchema: 'ea-sofifa-career',
    sourceGame: version >= 24 ? `EA FC ${version}` : `FIFA ${version}`,
    gameVersion: version,
    gameYear,
    gameDecade: decadeForYear(gameYear),
    name: row.short_name,
    longName: row.long_name || undefined,
    normalizedNames: Array.from(new Set([row.short_name, row.long_name].filter(Boolean).map(normalizeText))),
    birthYear: Number(row.dob?.slice(0, 4)) || undefined,
    nationality: row.nationality_name || undefined,
    teamName: row.club_name || undefined,
    leagueName: row.league_name || undefined,
    positions,
    primaryPosition,
    overall,
    ea: {
      overall,
      pace: requiredRating(row.pace),
      shooting: requiredRating(row.shooting),
      passing: requiredRating(row.passing),
      dribbling: requiredRating(row.dribbling),
      defending: requiredRating(row.defending),
      physical: requiredRating(row.physic),
      goalkeeping: gk,
      bigGame,
    },
    versionLabel: row.fifa_update ? `update ${row.fifa_update}` : undefined,
    isIconHero: /icon|hero|legend/i.test(`${row.player_tags} ${row.player_traits} ${row.club_name} ${row.league_name}`),
  }
}

function normalizeFutRow(row: CsvRow, sourceFile: string): RatingRow | undefined {
  const overall = requiredRating(row.ratings)
  const gameVersion = Number(sourceFile.match(/Fifa\s+(\d+)/i)?.[1])
  const positions = splitPositions(row.position)
  if (!overall || !Number.isFinite(gameVersion) || positions.length === 0 || !row.name) return undefined
  const gameYear = gameYearFromFifaVersion(gameVersion)
  const source = sourceForFile(sourceFile)
  const versionLabel = row.version || 'Normal'
  const isIconHero = /icon|hero|legend/i.test(`${versionLabel} ${row.club} ${row.league}`)
  const primaryPosition = positions[0]

  return {
    sourceFile,
    sourceLabel: source.label,
    sourceUrl: source.url,
    sourceSchema: 'fut-card',
    sourceGame: `FIFA ${gameVersion} FUT`,
    gameVersion,
    gameYear,
    gameDecade: decadeForYear(gameYear),
    name: row.name,
    normalizedNames: [normalizeText(row.name)],
    nationality: row.country || undefined,
    teamName: row.club || undefined,
    leagueName: row.league || undefined,
    positions,
    primaryPosition,
    overall,
    ea: {
      overall,
      pace: requiredRating(row.pac),
      shooting: requiredRating(row.sho),
      passing: requiredRating(row.pas),
      dribbling: requiredRating(row.dri),
      defending: requiredRating(row.def),
      physical: requiredRating(row.phy),
      goalkeeping: primaryPosition === 'GK' ? overall : undefined,
      bigGame: overall,
    },
    versionLabel,
    isIconHero,
  }
}

function normalizeRatingRow(row: CsvRow, sourceFile: string): RatingRow | undefined {
  if ('fifa_version' in row && 'player_positions' in row) return normalizeFcRow(row, sourceFile)
  if ('ratings' in row && 'position' in row && 'pac' in row) return normalizeFutRow(row, sourceFile)
  return normalizeGenericRow(row, sourceFile)
}

function sourceRank(confidence: RatingSourceConfidence): number {
  if (confidence === 'exact-team-era') return 3
  if (confidence === 'player-era') return 2.5
  if (confidence === 'legacy-proxy') return 2
  if (confidence === 'icon-hero') return 1
  return 0
}

function teamStrengthBonus(teamLabel: string): number {
  const elite = new Set([
    'Brazil',
    'Argentina',
    'France',
    'Germany',
    'Spain',
    'Italy',
    'Netherlands',
    'England',
    'Portugal',
    'Uruguay',
    'Real Madrid',
    'Barcelona',
    'AC Milan',
    'Bayern Munich',
    'Liverpool',
    'Manchester United',
    'Juventus',
    'Inter',
    'Ajax',
  ])
  const strong = new Set([
    'Belgium',
    'Croatia',
    'Chile',
    'Colombia',
    'Paraguay',
    'Egypt',
    'Cameroon',
    'Senegal',
    'Ivory Coast',
    'Ghana',
    'Nigeria',
    'Algeria',
    'Morocco',
    'Arsenal',
    'Chelsea',
    'Manchester City',
    'Borussia Dortmund',
    'Napoli',
    'Roma',
    'PSG',
    'Benfica',
    'Porto',
    'Atletico Madrid',
    'Santos',
    'Boca Juniors',
    'River Plate',
  ])
  if (elite.has(teamLabel)) return 3
  if (strong.has(teamLabel)) return 2
  return 0
}

function appearancesScore(fact: WikidataFact): number {
  const appearances = fact.sourceAppearances ?? 0
  if (appearances <= 0) return 0
  return Math.min(9, Math.log1p(appearances) * 1.75)
}

function goalContributionScore(fact: WikidataFact, positions: Position[]): number {
  const goals = fact.sourceGoals ?? 0
  const appearances = fact.sourceAppearances ?? 0
  if (goals <= 0 || appearances <= 0) return 0
  const rate = goals / Math.max(1, appearances)
  const attacking = positions.some((position) => ['ST', 'CF', 'LW', 'RW', 'AM', 'LM', 'RM'].includes(position))
  return Math.min(attacking ? 5 : 2.5, rate * (attacking ? 5 : 2.5) + Math.log1p(goals) * 0.45)
}

function generatedProxyTier(fact: WikidataFact, roll: RollResult, positions: Position[]): GeneratedProxyTier {
  const appearances = fact.sourceAppearances ?? 0
  const goals = fact.sourceGoals ?? 0
  const attacking = positions.some((position) => ['ST', 'CF', 'LW', 'RW', 'AM', 'LM', 'RM'].includes(position))
  const eliteTeam = teamStrengthBonus(roll.team.label) === 3
  const goalRate = appearances > 0 ? goals / appearances : 0

  if (appearances >= 220 || (attacking && goals >= 90) || (eliteTeam && appearances >= 160 && (goals >= 40 || goalRate >= 0.25))) return 'legend-candidate'
  if (appearances >= 140 || (attacking && goals >= 45) || (eliteTeam && appearances >= 100)) return 'star'
  if (appearances >= 75 || (attacking && goals >= 20)) return 'important'
  if (appearances >= 25) return 'regular'
  return 'fringe'
}

function generatedProxyOverallCap(tier: GeneratedProxyTier): number {
  if (tier === 'legend-candidate') return 89
  if (tier === 'star') return 86
  if (tier === 'important') return 83
  if (tier === 'regular') return 78
  return 72
}

function generatedProxyMetricCap(tier: GeneratedProxyTier): number {
  if (tier === 'legend-candidate') return 92
  if (tier === 'star') return 89
  if (tier === 'important') return 86
  if (tier === 'regular') return 81
  return 75
}

function generatedProxyBigGameCap(tier: GeneratedProxyTier): number {
  if (tier === 'legend-candidate') return 91
  if (tier === 'star') return 88
  if (tier === 'important') return 85
  if (tier === 'regular') return 80
  return 74
}

function proxyOverallForFact(fact: WikidataFact, roll: RollResult, positions: Position[], tier: GeneratedProxyTier): number {
  const decade = decadeStart(eraDecade(roll.era))
  const eraFloor = decade < 1980 ? 61 : decade < 2000 ? 63 : 65
  const base = eraFloor + teamStrengthBonus(roll.team.label)
  const experience = appearancesScore(fact)
  const scoring = goalContributionScore(fact, positions)
  const captainLike = (fact.sourceAppearances ?? 0) >= 120 ? 1.5 : (fact.sourceAppearances ?? 0) >= 75 ? 0.75 : 0
  return clampBetween(base + experience + scoring + captainLike, 55, generatedProxyOverallCap(tier))
}

function capGeneratedProxyAttributes(primary: Position, ea: EaStyleAttributes, tier: GeneratedProxyTier): EaStyleAttributes {
  const metricCap = generatedProxyMetricCap(tier)
  const bigGameCap = generatedProxyBigGameCap(tier)
  const cap = (value: number | undefined, max = metricCap) => value === undefined ? undefined : clampBetween(value, 1, max)

  if (primary === 'GK') {
    return {
      ...ea,
      pace: cap(ea.pace, 48),
      shooting: cap(ea.shooting, 28),
      passing: cap(ea.passing, 74),
      dribbling: cap(ea.dribbling, 66),
      defending: cap(ea.defending, 72),
      physical: cap(ea.physical, 82),
      goalkeeping: cap(ea.goalkeeping, metricCap),
      bigGame: cap(ea.bigGame, bigGameCap),
    }
  }

  if (['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(primary)) {
    return {
      ...ea,
      pace: cap(ea.pace),
      shooting: cap(ea.shooting, ['LB', 'RB', 'LWB', 'RWB'].includes(primary) ? 66 : 48),
      passing: cap(ea.passing),
      dribbling: cap(ea.dribbling),
      defending: cap(ea.defending),
      physical: cap(ea.physical),
      goalkeeping: cap(ea.goalkeeping, 8),
      bigGame: cap(ea.bigGame, bigGameCap),
    }
  }

  if (['DM', 'CM'].includes(primary)) {
    return {
      ...ea,
      pace: cap(ea.pace),
      shooting: cap(ea.shooting, primary === 'DM' ? 72 : metricCap),
      passing: cap(ea.passing),
      dribbling: cap(ea.dribbling),
      defending: cap(ea.defending),
      physical: cap(ea.physical),
      goalkeeping: cap(ea.goalkeeping, 8),
      bigGame: cap(ea.bigGame, bigGameCap),
    }
  }

  if (['AM', 'LM', 'RM'].includes(primary)) {
    return {
      ...ea,
      pace: cap(ea.pace),
      shooting: cap(ea.shooting),
      passing: cap(ea.passing),
      dribbling: cap(ea.dribbling),
      defending: cap(ea.defending, 68),
      physical: cap(ea.physical, metricCap - 2),
      goalkeeping: cap(ea.goalkeeping, 8),
      bigGame: cap(ea.bigGame, bigGameCap),
    }
  }

  return {
    ...ea,
    pace: cap(ea.pace),
    shooting: cap(ea.shooting),
    passing: cap(ea.passing),
    dribbling: cap(ea.dribbling),
    defending: cap(ea.defending, 58),
    physical: cap(ea.physical),
    goalkeeping: cap(ea.goalkeeping, 8),
    bigGame: cap(ea.bigGame, bigGameCap),
  }
}

function legacyProxyAttributes(primary: Position, overall: number, fact: WikidataFact, tier: GeneratedProxyTier): EaStyleAttributes {
  const goals = fact.sourceGoals ?? 0
  const appearances = Math.max(1, fact.sourceAppearances ?? 1)
  const scoringBoost = Math.min(4, (goals / appearances) * 5)
  const make = (offset: number) => clampRating(overall + offset)
  const bigGameOffset = tier === 'legend-candidate' ? 2 : tier === 'star' ? 1 : 0
  const finalize = (ea: EaStyleAttributes) => capGeneratedProxyAttributes(primary, ea, tier)

  if (primary === 'GK') {
    return finalize({ overall, pace: make(-35), shooting: make(-55), passing: make(-25), dribbling: make(-32), defending: make(-22), physical: make(-12), goalkeeping: overall, bigGame: make(bigGameOffset) })
  }
  if (['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(primary)) {
    const fullback = ['LB', 'RB', 'LWB', 'RWB'].includes(primary)
    return finalize({
      overall,
      pace: make(fullback ? 0 : -8),
      shooting: make(-28 + scoringBoost),
      passing: make(fullback ? -7 : -13),
      dribbling: make(fullback ? -5 : -16),
      defending: make(5),
      physical: make(2),
      bigGame: make(bigGameOffset),
    })
  }
  if (['DM', 'CM'].includes(primary)) {
    return finalize({ overall, pace: make(-8), shooting: make(-10 + scoringBoost), passing: make(4), dribbling: make(-1), defending: make(primary === 'DM' ? 6 : -3), physical: make(0), bigGame: make(bigGameOffset) })
  }
  if (['AM', 'LM', 'RM'].includes(primary)) {
    return finalize({ overall, pace: make(-2), shooting: make(-2 + scoringBoost), passing: make(5), dribbling: make(4), defending: make(-24), physical: make(-8), bigGame: make(bigGameOffset) })
  }
  if (['LW', 'RW', 'CF', 'ST'].includes(primary)) {
    return finalize({ overall, pace: make(primary === 'ST' ? -3 : 3), shooting: make(5), passing: make(primary === 'ST' ? -12 : -2), dribbling: make(primary === 'ST' ? -4 : 4), defending: make(-36), physical: make(primary === 'ST' ? 0 : -8), bigGame: make(bigGameOffset) })
  }
  return finalize({ overall, pace: make(-4), shooting: make(-8 + scoringBoost), passing: make(0), dribbling: make(0), defending: make(-6), physical: make(-4), bigGame: make(bigGameOffset) })
}

function generatedLegacyProxyRowForFact(fact: WikidataFact, roll: RollResult): RatingRow | undefined {
  const positions = fact.normalizedPositions?.length ? fact.normalizedPositions : []
  if (positions.length === 0) return undefined
  const primaryPosition = positions[0]
  const decade = eraDecade(roll.era)
  const tier = generatedProxyTier(fact, roll, positions)
  const overall = proxyOverallForFact(fact, roll, positions, tier)

  return {
    sourceFile: 'generated:wikidata-membership-legacy-proxy',
    sourceLabel: 'Legacy proxy: Wikidata facts + appearance model',
    sourceUrl: fact.playerUrl,
    sourceSchema: 'legacy-proxy',
    sourceGame: 'Wikidata membership proxy',
    gameVersion: 0,
    gameYear: decadeStart(decade) + 5,
    gameDecade: decade,
    name: fact.playerName,
    normalizedNames: [normalizeText(fact.playerName)],
    birthYear: fact.birthYear,
    nationality: fact.nationality,
    teamName: roll.team.label,
    positions,
    primaryPosition,
    overall,
    ea: legacyProxyAttributes(primaryPosition, overall, fact, tier),
    versionLabel: `wikidata-appearance-proxy:${tier}`,
    isIconHero: false,
  }
}

function isBaseRatingRow(row: RatingRow): boolean {
  if (row.sourceSchema === 'ea-sofifa-career' || row.sourceSchema === 'ea-current-csv' || row.sourceSchema === 'ea-official-current') return true
  const version = normalizeText(row.versionLabel ?? '')
  return version.length === 0 || version === 'normal' || version === 'transfer'
}

function sourceConfidenceFor(row: RatingRow, fact: WikidataFact, roll: RollResult): RatingSourceConfidence | undefined {
  const decade = eraDecade(roll.era)
  const rowInsideMembership = row.gameYear >= fact.startYear && row.gameYear <= (fact.endYear ?? currentYear)
  const sameEra = row.gameDecade === decade
  const exactTeam = teamMatchesLabel(row.teamName, fact.requestedTeamName) || teamMatchesLabel(row.teamName, roll.team.label)

  if (row.sourceSchema === 'legacy-proxy' && sameEra && factOverlapsDecade(fact, decade) && exactTeam) return 'legacy-proxy'
  if (fact.teamType === 'nation' && sameEra && rowInsideMembership && isBaseRatingRow(row)) return 'player-era'
  if (fact.teamType === 'club' && exactTeam && sameEra && rowInsideMembership && isBaseRatingRow(row)) return 'exact-team-era'
  if (row.isIconHero) return 'icon-hero'
  return undefined
}

function ratingRowsFromCsv(files: string[]): Promise<RatingRow[]> {
  return files.reduce<Promise<RatingRow[]>>(async (previous, file) => {
    const rows = await previous
    const text = await readFile(file, 'utf8')
    const header = csvLineToCells(text.slice(0, text.indexOf('\n'))).map((item) => normalizeText(item.replace(/^\uFEFF/, '')).replace(/\s+/g, '_'))
    const wantedHeaders = header.includes('fifa_version') && header.includes('player_positions')
      ? fcColumns
      : header.includes('ratings') && header.includes('pac')
        ? futColumns
        : genericEaColumns
    const normalized = parseCsv(text, wantedHeaders)
      .map((row) => normalizeRatingRow(row, file))
      .filter((row): row is RatingRow => row !== undefined)
    return [...rows, ...normalized]
  }, Promise.resolve([]))
}

function tokenOverlap(left: string[], right: string[]): number {
  const rightSet = new Set(right)
  return left.filter((token) => rightSet.has(token)).length
}

function rowCountryCanMatchFact(row: RatingRow, fact: WikidataFact): boolean {
  if (!row.nationality) return true
  if (fact.teamType === 'nation' && countryMatchesLabel(row.nationality, fact.requestedTeamName)) return true
  if (countryMatchesLabel(row.nationality, fact.nationality)) return true
  return !fact.nationality || normalizeText(fact.nationality) === 'united kingdom'
}

function namesMatch(row: RatingRow, fact: WikidataFact): boolean {
  const factName = normalizeText(fact.playerName)
  const factTokens = nameTokens(fact.playerName)
  const rowTokenSets = row.normalizedNames.map(nameTokens)
  if (row.normalizedNames.includes(factName)) {
    if (factTokens.length === 1 && !row.birthYear) return rowCountryCanMatchFact(row, fact)
    return true
  }
  if (row.birthYear && fact.birthYear && row.birthYear === fact.birthYear) {
    return rowTokenSets.some((tokens) => tokenOverlap(factTokens, tokens) >= Math.min(2, factTokens.length))
  }
  return rowTokenSets.some((tokens) => factTokens.length >= 2 && tokenOverlap(factTokens, tokens) >= 2 && rowCountryCanMatchFact(row, fact))
}

function buildRatingRowIndexes(rows: RatingRow[]) {
  const byExactName = new Map<string, RatingRow[]>()
  const byBirthToken = new Map<string, RatingRow[]>()

  for (const row of rows) {
    for (const name of row.normalizedNames) {
      const values = byExactName.get(name) ?? []
      values.push(row)
      byExactName.set(name, values)
    }
    if (row.birthYear) {
      for (const token of new Set(row.normalizedNames.flatMap(nameTokens).filter((value) => value.length >= 3))) {
        const key = `${row.birthYear}:${token}`
        const values = byBirthToken.get(key) ?? []
        values.push(row)
        byBirthToken.set(key, values)
      }
    }
  }

  return { byExactName, byBirthToken }
}

function rowsForFact(fact: WikidataFact, indexes: ReturnType<typeof buildRatingRowIndexes>, cache: Map<string, RatingRow[]>): RatingRow[] {
  const cached = cache.get(fact.playerQid)
  if (cached) return cached

  const candidates = new Map<string, RatingRow>()
  for (const row of indexes.byExactName.get(normalizeText(fact.playerName)) ?? []) {
    candidates.set(`${row.sourceFile}:${row.sourceGame}:${row.name}:${row.teamName}:${row.versionLabel}:${row.overall}`, row)
  }
  if (fact.birthYear) {
    for (const token of new Set(nameTokens(fact.playerName).filter((value) => value.length >= 3))) {
      for (const row of indexes.byBirthToken.get(`${fact.birthYear}:${token}`) ?? []) {
        candidates.set(`${row.sourceFile}:${row.sourceGame}:${row.name}:${row.teamName}:${row.versionLabel}:${row.overall}`, row)
      }
    }
  }

  const matchedRows = Array.from(candidates.values()).filter((row) => namesMatch(row, fact))
  cache.set(fact.playerQid, matchedRows)
  return matchedRows
}

function roleTagsFor(row: RatingRow): string[] {
  const tags = new Set<string>()
  const positions = row.positions

  if (positions.includes('GK')) tags.add('Shot-stopper')
  if (positions.some((position) => ['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(position))) tags.add('Defender')
  if (positions.some((position) => ['DM', 'CM'].includes(position))) tags.add('Midfielder')
  if (positions.some((position) => ['AM', 'LW', 'RW', 'LM', 'RM'].includes(position))) tags.add('Creator')
  if (positions.some((position) => ['CF', 'ST', 'LW', 'RW'].includes(position))) tags.add('Finisher')
  if ((row.ea.defending ?? 0) >= 82) tags.add('Ball-winner')
  if ((row.ea.passing ?? 0) >= 82 || (row.ea.dribbling ?? 0) >= 88) tags.add('Creator')
  if ((row.ea.pace ?? 0) >= 88) tags.add('Runner')
  if ((row.ea.physical ?? 0) >= 84) tags.add('Duel winner')
  if ((row.ea.shooting ?? 0) >= 86) tags.add('Elite scorer')
  if (row.isIconHero || row.overall >= 90) tags.add('Big-game player')

  return Array.from(tags).slice(0, 5)
}

function mergePositions(row: RatingRow, fact: WikidataFact): Position[] {
  return Array.from(new Set([...row.positions, ...(fact.normalizedPositions ?? [])])).slice(0, 4)
}

function competitionForMode(mode: ModeConfig): string | undefined {
  if (mode.modeId === 'champions_league') return 'UCL'
  if (mode.modeId === 'classic_european_cup') return 'European Cup'
  if (mode.modeId === 'world_cup') return 'World Cup'
  if (mode.modeId === 'premier_league') return 'Premier League'
  if (mode.modeId === 'laliga') return 'LaLiga'
  if (mode.modeId === 'serie_a') return 'Serie A'
  if (mode.modeId === 'bundesliga') return 'Bundesliga'
  if (mode.modeId === 'ligue_1') return 'Ligue 1'
  if (mode.modeId === 'mls') return 'MLS'
  return undefined
}

function candidateToContext(candidate: CandidateMatch, mode: ModeConfig, roll: RollResult): ContextCandidate {
  const { fact, row, sourceConfidence } = candidate
  const decade = eraDecade(roll.era)
  const positions = mergePositions(row, fact)
  const primaryPositions = row.positions.length > 0 ? row.positions.slice(0, 1) : positions.slice(0, 1)
  const endYear = fact.endYear ?? currentYear
  const ratingSourceText = sourceConfidence === 'exact-team-era'
    ? 'exact club/team and era'
    : sourceConfidence === 'player-era'
      ? 'national-team membership with same-era sourced player rating'
      : sourceConfidence === 'legacy-proxy'
        ? 'approved historical numeric proxy row with public source provenance'
        : 'explicit Icon/Legend/Hero rating row'
  const competition = competitionForMode(mode)
  const eligibleModes = new Set([mode.modeId])
  if (mode.modeId === 'world_xi') eligibleModes.add('ball_knowledge')

  const player: PlayerContext = {
    contextId: `rated_${slug(fact.playerQid)}_${slug(roll.team.label)}_${slug(decade)}`,
    personId: `rated_${slug(fact.playerQid)}`,
    displayName: fact.playerName,
    teamType: roll.team.teamType,
    teamName: roll.team.label,
    league: row.leagueName,
    country: row.nationality ?? fact.nationality,
    competitionContexts: competition
      ? [
          {
            competition,
            team: roll.team.label,
            eraLabel: decade,
            role: 'starter',
          },
        ]
      : [],
    startYear: fact.startYear,
    endYear,
    decade,
    eraLabel: decade,
    eligibleModes: Array.from(eligibleModes),
    positions,
    primaryPositions,
    secondaryPositions: positions.filter((position) => !primaryPositions.includes(position)),
    roleTags: roleTagsFor(row),
    ratings: ratingsFromEaStyle(primaryPositions[0], row.ea),
    peakWindow: `${fact.startYear}-${endYear}`,
    dataConfidence: sourceConfidence === 'icon-hero' || sourceConfidence === 'legacy-proxy' ? 'Medium' : 'High',
    ratingSourceConfidence: sourceConfidence,
    sourceNotes: ['Wikidata SPARQL', row.sourceLabel],
    historicalNotes: `${row.sourceGame}${row.versionLabel ? ` ${row.versionLabel}` : ''} overall ${row.overall}; matched to Wikidata ${roll.team.label} ${decade} membership via ${ratingSourceText}.`,
  }

  return {
    player,
    row,
    fact,
    sourceConfidence,
    sourceRank: sourceRank(sourceConfidence),
  }
}

function betterCandidate(left: ContextCandidate, right: ContextCandidate): ContextCandidate {
  if (right.sourceRank !== left.sourceRank) return right.sourceRank > left.sourceRank ? right : left
  if (right.row.overall !== left.row.overall) return right.row.overall > left.row.overall ? right : left
  if (right.row.gameYear !== left.row.gameYear) return right.row.gameYear > left.row.gameYear ? right : left
  return left
}

function mergeContext(left: PlayerContext, right: PlayerContext): PlayerContext {
  const sourceRankByConfidence: Record<RatingSourceConfidence, number> = {
    'exact-team-era': 3,
    'player-era': 2.5,
    'legacy-proxy': 2,
    'icon-hero': 1,
    'unrated-hidden': 0,
  }
  const leftRank = sourceRankByConfidence[left.ratingSourceConfidence ?? 'unrated-hidden']
  const rightRank = sourceRankByConfidence[right.ratingSourceConfidence ?? 'unrated-hidden']
  const base = rightRank > leftRank ? right : left
  const other = base === right ? left : right

  return {
    ...base,
    eligibleModes: Array.from(new Set([...left.eligibleModes, ...right.eligibleModes])),
    positions: Array.from(new Set([...left.positions, ...right.positions])),
    primaryPositions: Array.from(new Set([...left.primaryPositions, ...right.primaryPositions])),
    secondaryPositions: Array.from(new Set([...left.secondaryPositions, ...right.secondaryPositions])),
    roleTags: Array.from(new Set([...left.roleTags, ...right.roleTags])),
    sourceNotes: Array.from(new Set([...left.sourceNotes, ...right.sourceNotes])),
    competitionContexts: [...left.competitionContexts, ...right.competitionContexts],
    historicalNotes: Array.from(new Set([base.historicalNotes, other.historicalNotes])).join(' '),
  }
}

function uniqueCandidatesForRoll(candidates: ContextCandidate[]): ContextCandidate[] {
  const byContext = new Map<string, ContextCandidate>()
  for (const candidate of candidates) {
    const existing = byContext.get(candidate.player.contextId)
    byContext.set(candidate.player.contextId, existing ? betterCandidate(existing, candidate) : candidate)
  }

  return Array.from(byContext.values())
    .sort((left, right) => right.row.overall - left.row.overall || right.sourceRank - left.sourceRank || right.row.gameYear - left.row.gameYear)
    .slice(0, 50)
}

function positionGroupFor(positions: Position[]): 'GK' | 'DEF' | 'MID' | 'ATT' | 'UNK' {
  if (positions.includes('GK')) return 'GK'
  if (positions.some((position) => ['LB', 'CB', 'RB', 'LWB', 'RWB'].includes(position))) return 'DEF'
  if (positions.some((position) => ['DM', 'CM', 'AM', 'LM', 'RM'].includes(position))) return 'MID'
  if (positions.some((position) => ['LW', 'RW', 'CF', 'ST'].includes(position))) return 'ATT'
  return 'UNK'
}

function highProfileKey(team: string, era: string): boolean {
  return [
    'England|2000s',
    'Manchester United|2000s',
    'Barcelona|2010s',
    'Brazil|2000s',
    'Inter Miami|2020s',
    'LA Galaxy|2010s',
  ].includes(`${team}|${era}`)
}

function rollIndexKey(teamType: TeamType, teamLabel: string, decade: string): string {
  return `${teamType}:${normalizeTeam(teamLabel)}:${decade}`
}

function buildFactsByRoll(facts: WikidataFact[]): Map<string, WikidataFact[]> {
  const decades = Array.from(new Set(modeConfigs.flatMap((mode) => mode.eraPool.map(eraDecade))))
  const index = new Map<string, WikidataFact[]>()

  for (const fact of facts) {
    for (const decade of decades) {
      if (!factOverlapsDecade(fact, decade)) continue
      const key = rollIndexKey(fact.teamType, fact.requestedTeamName, decade)
      const values = index.get(key) ?? []
      values.push(fact)
      index.set(key, values)
    }
  }

  return index
}

const wikidataRaw = await readFile(`${generatedDir}/wikidataMembershipFacts.json`, 'utf8')
const wikidata = JSON.parse(wikidataRaw) as WikidataFactsFile
const facts = wikidata.facts.filter((fact) => fact.startYear && fact.playerQid && fact.playerName && fact.requestedTeamName && (fact.sourceAppearances ?? 0) > 0)
const factsByRoll = buildFactsByRoll(facts)
const csvFiles = await csvFilesIn(ratingsRoot)
const ratingRows = await ratingRowsFromCsv(csvFiles)
const ratingIndexes = buildRatingRowIndexes(ratingRows)
const matchedRowsCache = new Map<string, RatingRow[]>()
const contextMap = new Map<string, PlayerContext>()
const rollReports: Array<Record<string, unknown>> = []
const highProfileRolls: Array<Record<string, unknown>> = []

for (const mode of modeConfigs) {
  for (const team of mode.teamPool) {
    for (const era of mode.eraPool) {
      const roll = { team, era }
      const rollFacts = (factsByRoll.get(rollIndexKey(team.teamType, team.label, eraDecade(era))) ?? []).filter((fact) => factMatchesRoll(mode, fact, roll))
      const candidates: ContextCandidate[] = []
      const missingExamples: string[] = []

      for (const fact of rollFacts) {
        const matchedRows = rowsForFact(fact, ratingIndexes, matchedRowsCache)
        const factCandidates = matchedRows
          .map((row) => {
            const sourceConfidence = sourceConfidenceFor(row, fact, roll)
            return sourceConfidence ? candidateToContext({ fact, row, sourceConfidence }, mode, roll) : undefined
          })
          .filter((candidate): candidate is ContextCandidate => candidate !== undefined)

        if (factCandidates.length === 0) {
          const generatedProxy = generatedLegacyProxyRowForFact(fact, roll)
          if (generatedProxy) {
            factCandidates.push(candidateToContext({ fact, row: generatedProxy, sourceConfidence: 'legacy-proxy' }, mode, roll))
          }
        }

        if (factCandidates.length === 0 && missingExamples.length < 12) {
          missingExamples.push(`${fact.playerName}${fact.normalizedPositions?.length ? ` (${fact.normalizedPositions.join('/')})` : ''}`)
        }

        candidates.push(...factCandidates)
      }

      const top = uniqueCandidatesForRoll(candidates)
      for (const candidate of top) {
        const existing = contextMap.get(candidate.player.contextId)
        contextMap.set(candidate.player.contextId, existing ? mergeContext(existing, candidate.player) : candidate.player)
      }

      const positionGroups = top.reduce<Record<string, number>>((counts, candidate) => {
        const group = positionGroupFor(candidate.player.positions)
        counts[group] = (counts[group] ?? 0) + 1
        return counts
      }, {})
      const confidenceCounts = top.reduce<Record<string, number>>((counts, candidate) => {
        counts[candidate.sourceConfidence] = (counts[candidate.sourceConfidence] ?? 0) + 1
        return counts
      }, {})

      const report = {
        modeId: mode.modeId,
        team: team.label,
        teamType: team.teamType,
        era,
        facts: rollFacts.length,
        matchedCandidates: candidates.length,
        generatedContexts: top.length,
        positionGroups,
        confidenceCounts,
        missingExamples,
      }
      rollReports.push(report)
      if (highProfileKey(team.label, eraDecade(era))) highProfileRolls.push(report)
    }
  }
}

const ratedPlayerContexts = Array.from(contextMap.values()).sort((left, right) => {
  if (left.teamName !== right.teamName) return left.teamName.localeCompare(right.teamName)
  if (left.decade !== right.decade) return left.decade.localeCompare(right.decade)
  return right.ratings.bigGame - left.ratings.bigGame || left.displayName.localeCompare(right.displayName)
})

const ratedPeople: Person[] = Array.from(
  new Map(
    ratedPlayerContexts.map((context) => [
      context.personId,
      {
        personId: context.personId,
        displayName: context.displayName,
        fullName: context.displayName,
        aliases: [],
        nationality: context.country ?? 'Unknown',
        primaryRoles: context.roleTags,
        notes: context.historicalNotes,
      } satisfies Person,
    ]),
  ).values(),
)

const ratingFields = ['attack', 'creation', 'control', 'defense', 'goalkeeping', 'physical', 'press', 'bigGame'] as const
const generatedProxyContexts = ratedPlayerContexts.filter((context) => context.sourceNotes.includes('Legacy proxy: Wikidata facts + appearance model'))
const generatedProxyMetricMax = 92
const generatedProxyBigGameMax = 91

function generatedProxyTierFromContext(context: PlayerContext): GeneratedProxyTier | 'unknown' {
  const match = context.historicalNotes.match(/wikidata-appearance-proxy:([a-z-]+)/)
  const tier = match?.[1]
  if (tier === 'fringe' || tier === 'regular' || tier === 'important' || tier === 'star' || tier === 'legend-candidate') return tier
  return 'unknown'
}

function percentile(values: number[], percentilePoint: number): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((left, right) => left - right)
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * percentilePoint))]
}

const ratingSanityReport = {
  generatedBy: 'scripts/import-rating-contexts.ts',
  generatedAt: checkedAt,
  policy: {
    generatedProxyMetricMax,
    generatedProxyBigGameMax,
    note: 'Caps apply only to Wikidata appearance-model proxy rows. EA/FUT/Icon/Hero and manually reviewed legacy proxy rows may exceed them.',
  },
  summary: {
    totalContexts: ratedPlayerContexts.length,
    generatedProxyContexts: generatedProxyContexts.length,
    tierCounts: generatedProxyContexts.reduce<Record<string, number>>((counts, context) => {
      const tier = generatedProxyTierFromContext(context)
      counts[tier] = (counts[tier] ?? 0) + 1
      return counts
    }, {}),
    metricDistribution: Object.fromEntries(ratingFields.map((field) => {
      const values = generatedProxyContexts.map((context) => context.ratings[field])
      return [field, {
        p50: percentile(values, 0.5),
        p75: percentile(values, 0.75),
        p90: percentile(values, 0.9),
        p95: percentile(values, 0.95),
        p99: percentile(values, 0.99),
        max: values.length ? Math.max(...values) : 0,
      }]
    })),
  },
  violations: generatedProxyContexts
    .flatMap((context) => ratingFields.flatMap((field) => {
      const limit = field === 'bigGame' ? generatedProxyBigGameMax : generatedProxyMetricMax
      const rating = context.ratings[field]
      return rating > limit
        ? [{
            contextId: context.contextId,
            player: context.displayName,
            team: context.teamName,
            era: context.eraLabel,
            position: context.primaryPositions[0],
            tier: generatedProxyTierFromContext(context),
            field,
            rating,
            limit,
          }]
        : []
    }))
    .sort((left, right) => right.rating - left.rating || left.player.localeCompare(right.player))
    .slice(0, 200),
  topGeneratedProxyRatings: Object.fromEntries(ratingFields.map((field) => [
    field,
    [...generatedProxyContexts]
      .sort((left, right) => right.ratings[field] - left.ratings[field] || left.displayName.localeCompare(right.displayName))
      .slice(0, 25)
      .map((context) => ({
        player: context.displayName,
        team: context.teamName,
        era: context.eraLabel,
        position: context.primaryPositions[0],
        tier: generatedProxyTierFromContext(context),
        rating: context.ratings[field],
      })),
  ])),
  sampleRolls: ['Egypt|1950s', 'Brazil|1950s', 'AC Milan|1950s', 'Real Madrid|1950s', 'England|1960s', 'Cameroon|1990s', 'Algeria|1980s'].map((key) => {
    const [team, era] = key.split('|')
    const contexts = generatedProxyContexts
      .filter((context) => context.teamName === team && context.eraLabel === era)
      .sort((left, right) => right.ratings.bigGame - left.ratings.bigGame || left.displayName.localeCompare(right.displayName))
      .slice(0, 20)

    return {
      team,
      era,
      generatedProxyContexts: contexts.length,
      players: contexts.map((context) => ({
        player: context.displayName,
        position: context.primaryPositions[0],
        tier: generatedProxyTierFromContext(context),
        ratings: context.ratings,
      })),
    }
  }),
}

const sourceFiles = csvFiles.map((file) => {
  const source = sourceForFile(file)
  return {
    file: relative(process.cwd(), file),
    sourceLabel: source.label,
    sourceUrl: source.url,
    schemaDetected: source.sourceType,
  }
})

const importReport = {
  generatedBy: 'scripts/import-rating-contexts.ts',
  generatedAt: checkedAt,
  inputFolder: ratingsRoot,
  targetPerExactRoll: 'top-50-source-backed-or-legacy-proxy',
  minimumReportCoverage,
  sourceFiles,
  wikidataFacts: facts.length,
  ratingRows: ratingRows.length,
  generatedLegacyProxyRows: ratedPlayerContexts.filter((context) => context.sourceNotes.includes('Legacy proxy: Wikidata facts + appearance model')).length,
  matchedPlayers: Array.from(matchedRowsCache.values()).filter((rows) => rows.length > 0).length,
  generatedPeople: ratedPeople.length,
  generatedContexts: ratedPlayerContexts.length,
  confidenceCounts: ratedPlayerContexts.reduce<Record<string, number>>((counts, context) => {
    const confidence = context.ratingSourceConfidence ?? 'unrated-hidden'
    counts[confidence] = (counts[confidence] ?? 0) + 1
    return counts
  }, {}),
  highProfileRolls,
}

const ratingCoverageLedger = {
  generatedBy: 'scripts/import-rating-contexts.ts',
  generatedAt: checkedAt,
  policy: 'EA/FC rows first, explicit Icon/Hero rows second, approved legacy-proxy historical numeric rows third, and conservative Wikidata appearance-model proxy rows for otherwise unrated historical facts. No anonymous or unsourced players are generated.',
  rollDepthGate: {
    minVisiblePlayers: 4,
    minSelectablePlayers: 2,
  },
  sourceFiles,
  summary: {
    wikidataFacts: facts.length,
    ratingRows: ratingRows.length,
    generatedLegacyProxyRows: ratedPlayerContexts.filter((context) => context.sourceNotes.includes('Legacy proxy: Wikidata facts + appearance model')).length,
    generatedPeople: ratedPeople.length,
    generatedContexts: ratedPlayerContexts.length,
    confidenceCounts: importReport.confidenceCounts,
  },
  rollStatuses: rollReports.map((roll) => {
    const generatedContexts = Number(roll.generatedContexts)
    const status = generatedContexts >= 11
      ? 'rated'
      : generatedContexts >= 4
        ? 'limited-rated'
        : generatedContexts > 0
          ? 'hidden-by-gate'
          : Number(roll.facts) > 0
            ? 'no-source-rating-found'
            : 'unmatched'
    return {
      ...roll,
      status,
    }
  }),
}

const missingReport = {
  generatedBy: 'scripts/import-rating-contexts.ts',
  generatedAt: checkedAt,
  note: 'Rolls with sparse generatedContexts are missing EA/FC, Icon/Hero, or approved legacy-proxy rating rows. Thin rolls are reported here and gated from public gameplay when below the draft-depth threshold.',
  targetPerExactRoll: 'top-50-source-backed-or-legacy-proxy',
  minimumReportCoverage,
  rolls: rollReports
    .filter((roll) => Number(roll.generatedContexts) < minimumReportCoverage)
    .sort((left, right) => Number(left.generatedContexts) - Number(right.generatedContexts) || String(left.modeId).localeCompare(String(right.modeId))),
}

await mkdir(generatedDir, { recursive: true })
await writeFile(
  `${generatedDir}/ratedContexts.ts`,
  [
    "import type { Person, PlayerContext } from '../../types'",
    '',
    `const ratedPeopleJson = ${JSON.stringify(JSON.stringify(ratedPeople))}`,
    `const ratedPlayerContextsJson = ${JSON.stringify(JSON.stringify(ratedPlayerContexts))}`,
    '',
    'export const ratedPeople = JSON.parse(ratedPeopleJson) as Person[]',
    'export const ratedPlayerContexts = JSON.parse(ratedPlayerContextsJson) as PlayerContext[]',
    '',
  ].join('\n'),
)
await writeFile(`${generatedDir}/ratingImportReport.json`, `${JSON.stringify(importReport, null, 2)}\n`)
await writeFile(`${generatedDir}/ratingCoverageLedger.json`, `${JSON.stringify(ratingCoverageLedger, null, 2)}\n`)
await writeFile(`${generatedDir}/missingRatingsReport.json`, `${JSON.stringify(missingReport, null, 2)}\n`)
await writeFile(`${generatedDir}/ratingSanityReport.json`, `${JSON.stringify(ratingSanityReport, null, 2)}\n`)

console.log(`Imported ${ratingRows.length} rating rows from ${csvFiles.length} CSVs.`)
console.log(`Generated ${ratedPlayerContexts.length} source-backed player contexts for ${ratedPeople.length} people.`)
