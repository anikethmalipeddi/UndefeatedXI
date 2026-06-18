export type TeamType = 'club' | 'nation'

export type Position =
  | 'GK'
  | 'LB'
  | 'CB'
  | 'RB'
  | 'LWB'
  | 'RWB'
  | 'DM'
  | 'CM'
  | 'AM'
  | 'LM'
  | 'RM'
  | 'LW'
  | 'RW'
  | 'CF'
  | 'ST'

export type ModeType =
  | 'domestic_super_league'
  | 'domestic_league'
  | 'continental_club'
  | 'international_tournament'
  | 'club_history'
  | 'nation_history'
  | 'era_lock'
  | 'knowledge'
  | 'chaos'
  | 'manager'

export type ModeStatus = 'public' | 'preview' | 'hidden'

export type CompetitionFormat = 'domestic' | 'ucl' | 'classic_european_cup' | 'world_cup' | 'mls' | 'generic_tournament'

export type RollDimension = 'club' | 'nation' | 'club_or_nation' | 'era' | 'european_era' | 'tournament_era'

export type SpecialSetup = 'fixed_club' | 'fixed_nation' | 'fixed_era'

export type DataConfidence = 'High' | 'Medium' | 'Legend estimate'

export type SourceType = 'open-data' | 'wikidata' | 'public-page' | 'manual-curation' | 'rating-estimate' | 'rating-snapshot' | 'historical-rating-proxy'

export type RatingSourceConfidence = 'exact-team-era' | 'player-era' | 'icon-hero' | 'legacy-proxy' | 'unrated-hidden'

export interface SourceNote {
  label: string
  url: string
  sourceType: SourceType
  licenseNote: string
  lastChecked: string
}

export interface Person {
  personId: string
  displayName: string
  fullName: string
  aliases: string[]
  nationality: string
  birthYear?: number
  dominantFoot?: 'Left' | 'Right' | 'Both'
  primaryRoles: string[]
  notes?: string
}

export interface Ratings {
  attack: number
  creation: number
  control: number
  defense: number
  goalkeeping: number
  physical: number
  press: number
  bigGame: number
}

export interface CompetitionAppearance {
  competition: string
  team: string
  eraLabel: string
  role: 'starter' | 'squad' | 'impact'
}

export interface PlayerSeason {
  seasonId: string
  personId: string
  contextId: string
  team: string
  season: string
  league?: string
  competition?: string
  appearances?: number
  minutes?: number
  goals?: number
  assists?: number
  nonPenaltyGoals?: number
  expectedGoals?: number
  expectedAssists?: number
  shots?: number
  keyPasses?: number
  progressivePasses?: number
  progressiveCarries?: number
  tackles?: number
  interceptions?: number
  blocks?: number
  aerialsWon?: number
  keeperStats?: Record<string, number>
  sourceConfidence: DataConfidence
}

export interface RoleRating {
  contextId: string
  position: Position
  roleTags: string[]
  ratings: Ratings
  sourceConfidence: DataConfidence
  estimateNote?: string
}

export interface PlayerContext {
  contextId: string
  personId: string
  displayName: string
  teamType: TeamType
  teamName: string
  league?: string
  country?: string
  competitionContexts: CompetitionAppearance[]
  startYear: number
  endYear: number
  decade: string
  eraLabel: string
  eligibleModes: string[]
  positions: Position[]
  primaryPositions: Position[]
  secondaryPositions: Position[]
  roleTags: string[]
  ratings: Ratings
  peakWindow: string
  dataConfidence: DataConfidence
  ratingSourceConfidence?: RatingSourceConfidence
  sourceNotes: string[]
  historicalNotes: string
}

export interface TeamRollOption {
  label: string
  teamType: TeamType
  weight?: number
}

export interface RosterSlots {
  starters: number
  bench: number
  total: number
}

export interface ModeConfig {
  modeId: string
  modeName: string
  shortDescription: string
  modeType: ModeType
  status: ModeStatus
  targetRecord: string
  matchCount: number
  usesDraws: boolean
  usesKnockouts: boolean
  usesGroupStage: boolean
  usesLeaguePhase: boolean
  usesPlayoffs: boolean
  eligiblePoolType: string
  rollDimensions: RollDimension[]
  allowedFormations: string[]
  rosterSlots: RosterSlots
  simulationFormat: CompetitionFormat
  trophyCondition: string
  perfectionCondition: string
  invincibleCondition?: string
  rerollRules: RerollCounts
  opponentDistribution: 'elite' | 'league' | 'continental' | 'international' | 'chaos'
  resultGradeScale: string
  shareTextTemplate: string
  teamPool: TeamRollOption[]
  eraPool: string[]
  hidesRatings?: boolean
  specialSetup?: SpecialSetup
}

export interface FormationSlot {
  slotId: string
  label: string
  accepts: Position[]
  need: string
  x: number
  y: number
  squadRole?: 'starter' | 'bench'
}

export interface Formation {
  formationId: string
  name: string
  slots: FormationSlot[]
}

export interface RerollCounts {
  team: number
  era: number
  full: number
}

export interface SpecialSelection {
  fixedTeam?: TeamRollOption
  fixedEra?: string
}

export interface RollResult {
  team: TeamRollOption
  era: string
  freeRerollReason?: string
}

export interface DraftPick {
  round: number
  slot: FormationSlot
  roll: RollResult
  player: PlayerContext
}

export interface DraftState {
  modeId: string
  formationId: string
  draftSlots: FormationSlot[]
  seed: string
  roundIndex: number
  picks: DraftPick[]
  rerolls: RerollCounts
  specialSelection?: SpecialSelection
  currentRoll?: RollResult
  currentOptions: PlayerContext[]
  currentRollPool?: PlayerContext[]
  freeRerollNotice?: string
}

export interface TeamRatings {
  attack: number
  finishing: number
  chanceCreation: number
  ballProgression: number
  midfield: number
  midfieldControl: number
  pressResistance: number
  defense: number
  defensiveSolidity: number
  defensiveTransitions: number
  pressing: number
  aerialSetPiece: number
  goalkeeping: number
  physicality: number
  consistency: number
  chemistry: number
  bigGame: number
  tacticalCoherence: number
  eraBalance: number
  dataConfidence: number
  balance: number
  overall: number
}

export interface TacticReport {
  identity: string
  summary: string
  strengths: string[]
  weaknesses: string[]
}

export interface ChemistryReport {
  score: number
  sameTeamLinks: number
  sameNationLinks: number
  eraLinks?: number
  roleConflictPenalty?: number
  roleBalance: number
  warnings: string[]
  bonuses: string[]
}

export interface KeyMatch {
  label: string
  result: string
  note: string
}

export type ResultTierId =
  | 'perfect'
  | 'invincible'
  | 'undefeated'
  | 'perfect_near_miss'
  | 'undefeated_near_miss'
  | 'strong'
  | 'respectable'
  | 'exposed'

export interface ResultTier {
  id: ResultTierId
  label: string
  description: string
  rank: number
}

export interface MatchProbabilitySet {
  win: number
  draw: number
  loss: number
}

export interface EffectiveTeamQuality {
  score: number
  rawScore: number
  rawTeamRating: number
  positionFit: number
  minimumPositionFit: number
  chemistry: number
  roleBalance: number
  weakLinkCap: number
  weakLinkPenalty: number
  weakLinks: string[]
}

export interface StreakReport {
  currentWinStreak: number
  longestWinStreak: number
  currentUnbeatenStreak: number
  longestUnbeatenStreak: number
  perfectEndedMatch?: number
  unbeatenEndedMatch?: number
}

export interface SeasonTurningPoint {
  match: number
  phase: string
  outcome: 'W' | 'D' | 'L'
  result: string
  opponentDifficulty?: number
  note: string
}

export type TacticalReasonCategory = 'attack' | 'midfield' | 'defense' | 'goalkeeper' | 'chemistry' | 'position_fit' | 'pressure' | 'consistency' | 'variance'

export interface TacticalReason {
  category: TacticalReasonCategory
  summary: string
}

export interface ProbabilityExample {
  dominanceDelta: number
  base: MatchProbabilitySet
  conversionProbability: number
  final: MatchProbabilitySet
}

export interface MatchTrace {
  match: number
  phase: string
  outcome: 'W' | 'D' | 'L'
  result: string
  goalsFor: number
  goalsAgainst: number
  xgFor: number
  xgAgainst: number
  pressure: number
  opponentDifficulty?: number
  dominanceDelta?: number
  matchImportance?: number
  baseOutcome?: 'W' | 'D' | 'L'
  convertedDrawToWin?: boolean
  conversionProbability?: number
  baseProbabilities?: MatchProbabilitySet
  finalProbabilities?: MatchProbabilitySet
  resolution?: 'regulation' | 'late_winner' | 'extra_time_win' | 'extra_time_loss' | 'penalties_win' | 'penalties_loss'
  advanced?: boolean
  note: string
}

export interface CompetitionPhase {
  phase: string
  record: {
    wins: number
    draws: number
    losses: number
  }
  goalsFor: number
  goalsAgainst: number
  xgFor: number
  xgAgainst: number
  outcome: string
  matches: MatchTrace[]
}

export interface ChaosEvent {
  match: number
  phase: string
  title: string
  impact: 'positive' | 'negative' | 'volatile'
  modifier: number
  note: string
}

export interface SquadReport {
  depthScore: number
  rotationCoverage: number
  benchImpact: number
  warnings: string[]
  bonuses: string[]
}

export interface SimulationDetails {
  averageWinProbability: number
  averageDrawProbability: number
  averageLossProbability: number
  trophyProbability: number
  teamStrength: number
  defensiveBase: number
  matchPressure: number
  expectedGoalsForPerMatch: number
  expectedGoalsAgainstPerMatch: number
  averageOpponentDifficulty?: number
  averageDominanceDelta?: number
  averageConversionProbability?: number
  probabilityExamples?: ProbabilityExample[]
}

export interface RunResult {
  modeId: string
  modeName: string
  targetRecord: string
  record: {
    wins: number
    draws: number
    losses: number
  }
  points?: number
  goalsFor: number
  goalsAgainst: number
  xgFor: number
  xgAgainst: number
  grade: string
  gradeLabel: string
  trophyResult: string
  perfectionResult: string
  resultTier?: ResultTier
  scoringVersion?: number
  stage?: string
  bestPlayer: string
  weakLink: string
  strongestUnit: string
  weakestUnit: string
  dominanceReason: string
  failureReason: string
  tacticalReason?: TacticalReason
  why: string
  effectiveTeamQuality?: EffectiveTeamQuality
  streaks?: StreakReport
  matchThatChangedSeason?: SeasonTurningPoint
  probabilityExamples?: ProbabilityExample[]
  teamRatings: TeamRatings
  tacticReport: TacticReport
  chemistryReport: ChemistryReport
  keyMatches: KeyMatch[]
  competitionPath: CompetitionPhase[]
  matchTrace: MatchTrace[]
  chaosEvents: ChaosEvent[]
  squadReport?: SquadReport
  simulationDetails: SimulationDetails
  shareText: string
  runId: string
}

export interface SharedPickSnapshot {
  round: number
  slotId: string
  slotLabel: string
  playerName: string
  initials: string
  team: string
  era: string
  positions: Position[]
  ratings: Ratings
}

export interface SharedRunSnapshot {
  brandVersion: string
  createdAt: string
  runId: string
  modeId: string
  modeName: string
  formationId: string
  targetRecord: string
  record: RunResult['record']
  points?: number
  goalsFor: number
  goalsAgainst: number
  xgFor: number
  xgAgainst: number
  grade: string
  gradeLabel: string
  trophyResult: string
  perfectionResult: string
  resultTier?: ResultTier
  scoringVersion?: number
  stage?: string
  bestPlayer: string
  weakLink: string
  strongestUnit: string
  weakestUnit: string
  why: string
  effectiveTeamQuality?: EffectiveTeamQuality
  streaks?: StreakReport
  matchThatChangedSeason?: SeasonTurningPoint
  tacticalReason?: TacticalReason
  teamRatings: TeamRatings
  tacticReport: TacticReport
  chemistryReport: ChemistryReport
  keyMatches: KeyMatch[]
  competitionPath: CompetitionPhase[]
  matchTrace: MatchTrace[]
  picks: SharedPickSnapshot[]
}

export interface ShareResult {
  url?: string
  text: string
  source: 'supabase' | 'local-url' | 'text-fallback'
}

export interface RollCoverageSummary {
  team: TeamRollOption
  era: string
  total: number
  gk: number
  def: number
  mid: number
  att: number
  playable: boolean
  issues: string[]
}

export interface PlayableRollSummary {
  team: TeamRollOption
  era: string
}

export interface IncompleteTeamSummary {
  team: TeamRollOption
  reasons: string[]
}

export interface ModeValidation {
  modeId: string
  contextCount: number
  playable: boolean
  demoPlayable: boolean
  readiness: 'ready' | 'thin' | 'demo'
  playableTeams: TeamRollOption[]
  playableRolls: PlayableRollSummary[]
  incompleteTeams: IncompleteTeamSummary[]
  rollCoverage: RollCoverageSummary[]
  slotCoverage: Record<string, number>
  demoSlotCoverage: Record<string, number>
  formationCoverage: Record<string, Record<string, number>>
  demoFormationCoverage: Record<string, Record<string, number>>
  issues: string[]
}
