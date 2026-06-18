import { mkdirSync, writeFileSync } from 'node:fs'
import { availableParallelism } from 'node:os'
import { dirname } from 'node:path'
import { Worker } from 'node:worker_threads'
import { defaultFormationId } from '../src/data/formations'
import coverageReport from '../src/data/generated/coverageReport.json'
import { loadModePlayerContexts } from '../src/data/modeContextLoader'
import { getModeConfig, publicModeConfigs } from '../src/data/modes'
import { calculateChemistry } from '../src/engine/chemistry'
import { configureDraftPlayerContexts, createDraftState } from '../src/engine/draft'
import { eraMatches, modeMatchesPlayer, playerOptionScore, slotMatchesPlayer, teamMatches } from '../src/engine/eligibility'
import { createRng } from '../src/engine/random'
import { simulateRun } from '../src/engine/simulation'
import type { DraftPick, FormationSlot, ModeConfig, PlayerContext, RollResult, RunResult, SpecialSelection, TeamRollOption } from '../src/types'
import { auditSeeds, defaultSimulationAuditConfig } from './simulationAuditConfig'

type DraftBaseline = 'random' | 'greedy_raw' | 'smart'
type BaselineSelector = DraftBaseline | 'greedy' | 'best' | 'all'
type ModeGroup = 'all' | 'leagues' | 'tournaments'

interface AuditRoll {
  roll: RollResult
  pool: PlayerContext[]
}

interface AuditDraftContext {
  mode: ModeConfig
  formationId: string
  specialSelection: SpecialSelection
  draftSlots: FormationSlot[]
  rolls: AuditRoll[]
}

interface AuditDraftState {
  picks: DraftPick[]
  rerolls: {
    team: number
    era: number
    full: number
  }
  roundIndex: number
  currentRoll?: RollResult
  currentRollPool: PlayerContext[]
}

interface TeamAudit {
  picks: DraftPick[]
  formationId: string
  baseline: DraftBaseline
  quality: number
  sampleResult: RunResult
}

interface RunCounters {
  runs: number
  perfect: number
  undefeated: number
  invincible: number
  nearPerfect: number
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  longestWinStreak: number
  longestUnbeatenStreak: number
  score: number
  quality: number
}

interface SmartDraftCache {
  slotByPlayer: Map<string, FormationSlot | undefined>
  chemistryByPlayerSlot: Map<string, number>
  valueByPlayer: Map<string, number>
  currentChemistry: number
  openSlots: FormationSlot[]
  hasBallWinner: boolean
  hasCreator: boolean
  hasFinisher: boolean
  slotCoverage: Map<string, number>
}

interface AuditOptions {
  config: typeof defaultSimulationAuditConfig
  modeIds?: string[]
  group: ModeGroup
  baseline: BaselineSelector
  outFile?: string
  workers: number
}

interface WorkerJob {
  modeId: string
  baseline: DraftBaseline
  picks: DraftPick[]
  startIndex: number
  count: number
}

const modeValidations = coverageReport.modes as Array<{ modeId: string; playableTeams?: TeamRollOption[] }>

function parseNumber(value: string | undefined, fallback: number): number {
  if (!value) return fallback
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback
}

function readArg(args: string[], name: string): string | undefined {
  const inline = args.find((arg) => arg.startsWith(`${name}=`))
  if (inline) return inline.slice(name.length + 1)
  const index = args.indexOf(name)
  return index >= 0 ? args[index + 1] : undefined
}

function parseOptions(): AuditOptions {
  const args = process.argv.slice(2)
  const smoke = args.includes('--smoke') || process.env.AUDIT_SMOKE === '1'
  const full = args.includes('--full') || process.env.AUDIT_FULL === '1'
  const smokeConfig = {
    smartDraftTeamsPerMode: 3,
    smartDraftRerunsPerTeam: 2,
    bestObservedRerunsPerMode: 50,
    randomDraftsPerMode: 10,
    greedyDraftsPerMode: 10,
  }
  const baseConfig = smoke && !full ? smokeConfig : defaultSimulationAuditConfig
  const outFile = readArg(args, '--out') ?? process.env.OUT
  const modeValue = readArg(args, '--mode') ?? process.env.MODE_IDS
  const groupValue = (readArg(args, '--group') ?? process.env.AUDIT_GROUP ?? 'all') as ModeGroup
  const baselineValue = (readArg(args, '--baseline') ?? process.env.AUDIT_BASELINE ?? 'all') as BaselineSelector
  const workerFallback = Math.max(1, Math.min(6, availableParallelism() - 1))
  const workers = parseNumber(readArg(args, '--workers') ?? process.env.AUDIT_WORKERS, workerFallback)

  return {
    config: {
      smartDraftTeamsPerMode: parseNumber(process.env.SMART_TEAMS, baseConfig.smartDraftTeamsPerMode),
      smartDraftRerunsPerTeam: parseNumber(process.env.SMART_REPS, baseConfig.smartDraftRerunsPerTeam),
      bestObservedRerunsPerMode: parseNumber(process.env.BEST_REPS, baseConfig.bestObservedRerunsPerMode),
      randomDraftsPerMode: parseNumber(process.env.RANDOM_DRAFTS, baseConfig.randomDraftsPerMode),
      greedyDraftsPerMode: parseNumber(process.env.GREEDY_DRAFTS, baseConfig.greedyDraftsPerMode),
    },
    modeIds: modeValue ? modeValue.split(',').map((id) => id.trim()).filter(Boolean) : undefined,
    group: groupValue === 'leagues' || groupValue === 'tournaments' ? groupValue : 'all',
    baseline: normalizeBaseline(baselineValue),
    outFile,
    workers: Math.max(1, Math.floor(workers)),
  }
}

function normalizeBaseline(value: BaselineSelector): BaselineSelector {
  if (value === 'greedy') return 'greedy_raw'
  if (['random', 'greedy_raw', 'smart', 'best', 'all'].includes(value)) return value
  return 'all'
}

function selectedModes(options: AuditOptions): ModeConfig[] {
  const modes = options.modeIds ? options.modeIds.map((id) => getModeConfig(id)) : publicModeConfigs
  if (options.group === 'leagues') return modes.filter((mode) => mode.matchCount >= 30 && !mode.usesGroupStage)
  if (options.group === 'tournaments') return modes.filter((mode) => mode.usesKnockouts || mode.usesGroupStage || mode.matchCount < 30)
  return modes
}

function baselineEnabled(options: AuditOptions, baseline: DraftBaseline | 'best'): boolean {
  return options.baseline === 'all' || options.baseline === baseline || (baseline === 'smart' && options.baseline === 'best')
}

function cycleSeed(index: number): number {
  return auditSeeds[index % auditSeeds.length]
}

function playerKey(player: PlayerContext): string {
  return player.personId || player.contextId
}

function normalizedPlayerName(player: PlayerContext): string {
  return player.displayName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/gi, '')
    .toLowerCase()
}

function playerIdentityKeys(player: PlayerContext): string[] {
  return [
    player.contextId,
    player.personId,
    `${player.teamType}:${player.teamName}:${player.eraLabel}:${normalizedPlayerName(player)}`,
  ]
}

function takenPlayerKeys(picks: DraftPick[]): Set<string> {
  const keys = new Set<string>()
  for (const pick of picks) {
    for (const key of playerIdentityKeys(pick.player)) keys.add(key)
  }
  return keys
}

function hasTakenPlayer(taken: Set<string>, player: PlayerContext): boolean {
  return playerIdentityKeys(player).some((key) => taken.has(key))
}

function playerRollScore(player: PlayerContext): number {
  const ratings = player.ratings
  return Math.max(
    ratings.goalkeeping,
    ratings.attack * 0.62 + ratings.creation * 0.24 + ratings.physical * 0.14,
    ratings.defense * 0.7 + ratings.physical * 0.2 + ratings.control * 0.1,
    ratings.control * 0.45 + ratings.creation * 0.35 + ratings.press * 0.2,
  ) + ratings.bigGame * 0.04
}

function uniquePlayers(players: PlayerContext[]): PlayerContext[] {
  const unique: PlayerContext[] = []
  const identityIndex = new Map<string, number>()

  for (const player of players) {
    const matchingIndex = playerIdentityKeys(player)
      .map((key) => identityIndex.get(key))
      .find((index) => index !== undefined)

    if (matchingIndex === undefined) {
      const index = unique.length
      unique.push(player)
      for (const key of playerIdentityKeys(player)) identityIndex.set(key, index)
      continue
    }

    const current = unique[matchingIndex]
    if (
      playerRollScore(player) > playerRollScore(current) ||
      (playerRollScore(player) === playerRollScore(current) && player.ratings.bigGame > current.ratings.bigGame)
    ) {
      unique[matchingIndex] = player
      for (const key of playerIdentityKeys(player)) identityIndex.set(key, matchingIndex)
    }
  }

  return unique
}

function liveTeamsForMode(mode: ModeConfig): TeamRollOption[] {
  const validation = modeValidations.find((item) => item.modeId === mode.modeId)
  return validation?.playableTeams?.length ? validation.playableTeams : mode.teamPool
}

function defaultSpecialSelection(mode: ModeConfig, teams = liveTeamsForMode(mode), index = 0): SpecialSelection {
  if (mode.specialSetup === 'fixed_club' || mode.specialSetup === 'fixed_nation') return { fixedTeam: teams[index % Math.max(1, teams.length)] ?? mode.teamPool[0] }
  if (mode.specialSetup === 'fixed_era') return { fixedEra: mode.eraPool[index % Math.max(1, mode.eraPool.length)] ?? mode.eraPool[0] }
  return {}
}

function rollKey(roll: RollResult): string {
  return `${roll.team.teamType}:${roll.team.label}:${roll.era}`
}

function teamRollKey(roll: RollResult): string {
  return `${roll.team.teamType}:${roll.team.label}`
}

function specialKey(selection: SpecialSelection): string {
  return `${selection.fixedTeam?.teamType ?? 'any'}:${selection.fixedTeam?.label ?? 'any'}:${selection.fixedEra ?? 'any'}`
}

function buildAuditDraftContext(mode: ModeConfig, players: PlayerContext[], formationId: string, specialSelection: SpecialSelection): AuditDraftContext {
  const draftSlots = createDraftState(mode, formationId, specialSelection).draftSlots
  const teams = specialSelection.fixedTeam ? [specialSelection.fixedTeam] : liveTeamsForMode(mode)
  const eras = specialSelection.fixedEra ? [specialSelection.fixedEra] : mode.eraPool
  const rolls: AuditRoll[] = []

  for (const team of teams) {
    for (const era of eras) {
      const roll = { team, era }
      const pool = uniquePlayers(players.filter((player) => (
        modeMatchesPlayer(mode, player) &&
        teamMatches(mode, roll, player) &&
        eraMatches(mode, roll, player) &&
        draftSlots.some((slot) => slotMatchesPlayer(slot, player))
      ))).sort((left, right) => playerRollScore(right) - playerRollScore(left) || right.ratings.bigGame - left.ratings.bigGame || left.displayName.localeCompare(right.displayName))

      if (pool.length >= 4) rolls.push({ roll, pool })
    }
  }

  return {
    mode,
    formationId,
    specialSelection,
    draftSlots,
    rolls,
  }
}

function openSlots(context: AuditDraftContext, state: AuditDraftState): FormationSlot[] {
  const filled = new Set(state.picks.map((pick) => pick.slot.slotId))
  return context.draftSlots.filter((slot) => !filled.has(slot.slotId))
}

function selectablePlayersForRoll(context: AuditDraftContext, state: AuditDraftState, auditRoll: AuditRoll): PlayerContext[] {
  const slots = openSlots(context, state)
  const taken = takenPlayerKeys(state.picks)
  const byPerson = new Map<string, PlayerContext>()
  for (const player of auditRoll.pool) {
    if (hasTakenPlayer(taken, player)) continue
    if (!slots.some((slot) => slotMatchesPlayer(slot, player))) continue
    byPerson.set(playerKey(player), player)
  }
  return Array.from(byPerson.values())
}

function rollMatchesPreserve(roll: RollResult, preserve?: Partial<RollResult>): boolean {
  if (preserve?.team && teamRollKey(roll) !== teamRollKey({ team: preserve.team, era: roll.era })) return false
  if (preserve?.era && roll.era !== preserve.era) return false
  return true
}

function selectAuditRoll(context: AuditDraftContext, state: AuditDraftState, seed: string, preserve?: Partial<RollResult>, previousRoll?: RollResult): { roll: RollResult; players: PlayerContext[] } | undefined {
  const candidates = context.rolls
    .filter((auditRoll) => rollMatchesPreserve(auditRoll.roll, preserve))
    .filter((auditRoll) => !previousRoll || rollKey(auditRoll.roll) !== rollKey(previousRoll))
    .map((auditRoll) => ({ roll: auditRoll.roll, players: selectablePlayersForRoll(context, state, auditRoll) }))
    .filter((candidate) => candidate.players.length > 0)

  if (!candidates.length) return undefined

  const rng = createRng(seed)
  const byTeam = candidates.reduce((groups, candidate) => {
    const key = teamRollKey(candidate.roll)
    const group = groups.get(key) ?? []
    group.push(candidate)
    groups.set(key, group)
    return groups
  }, new Map<string, Array<{ roll: RollResult; players: PlayerContext[] }>>())
  const teamGroups = Array.from(byTeam.values())
  return rng.pick(rng.pick(teamGroups))
}

function withRoll(state: AuditDraftState, roll: RollResult, players: PlayerContext[]): AuditDraftState {
  return {
    ...state,
    currentRoll: roll,
    currentRollPool: players,
  }
}

function bestSlotForPlayer(context: AuditDraftContext, state: AuditDraftState, player: PlayerContext): FormationSlot | undefined {
  return openSlots(context, state)
    .filter((slot) => slotMatchesPlayer(slot, player))
    .sort((left, right) => playerOptionScore(right, player) - playerOptionScore(left, player))[0]
}

function createSmartDraftCache(context: AuditDraftContext, state: AuditDraftState): SmartDraftCache {
  const open = openSlots(context, state)
  const roleTags = state.picks.map((pick) => pick.player.roleTags.join(' ').toLowerCase())
  const slotCoverage = new Map(open.map((slot) => [
    slot.slotId,
    state.currentRollPool.filter((player) => slotMatchesPlayer(slot, player)).length,
  ]))

  return {
    slotByPlayer: new Map(),
    chemistryByPlayerSlot: new Map(),
    valueByPlayer: new Map(),
    currentChemistry: state.picks.length ? calculateChemistry(state.picks).score : 50,
    openSlots: open,
    hasBallWinner: roleTags.some((tags) => /ball-winner|screen|destroyer|duel/.test(tags)),
    hasCreator: roleTags.some((tags) => /creator|controller|passing|tempo/.test(tags)),
    hasFinisher: roleTags.some((tags) => /scorer|finisher|striker|killer/.test(tags)),
    slotCoverage,
  }
}

function bestSlotForPlayerCached(context: AuditDraftContext, state: AuditDraftState, player: PlayerContext, cache?: SmartDraftCache): FormationSlot | undefined {
  if (!cache) return bestSlotForPlayer(context, state, player)
  const key = player.contextId
  if (!cache.slotByPlayer.has(key)) cache.slotByPlayer.set(key, bestSlotForPlayer(context, state, player))
  return cache.slotByPlayer.get(key)
}

function rawPlayerRating(player: PlayerContext): number {
  return Math.max(
    player.ratings.goalkeeping,
    player.ratings.attack,
    player.ratings.creation,
    player.ratings.control,
    player.ratings.defense,
    player.ratings.physical,
    player.ratings.press,
  )
}

function playerPressResistance(player: PlayerContext): number {
  return player.ratings.control * 0.58 + player.ratings.physical * 0.18 + player.ratings.creation * 0.14 + player.ratings.bigGame * 0.1
}

function chemistryContributionCached(state: AuditDraftState, player: PlayerContext, slot: FormationSlot, cache?: SmartDraftCache): number {
  if (!cache) {
    if (state.picks.length === 0) return 0
    const current = calculateChemistry(state.picks).score
    const next = calculateChemistry([...state.picks, { round: state.roundIndex + 1, slot, roll: state.currentRoll!, player }]).score
    return next - current
  }
  const key = `${player.contextId}:${slot.slotId}`
  if (!cache.chemistryByPlayerSlot.has(key)) {
    const next = calculateChemistry([...state.picks, { round: state.roundIndex + 1, slot, roll: state.currentRoll!, player }]).score
    cache.chemistryByPlayerSlot.set(key, next - cache.currentChemistry)
  }
  return cache.chemistryByPlayerSlot.get(key) ?? 0
}

function roleNeedValue(state: AuditDraftState, player: PlayerContext, cache: SmartDraftCache): number {
  const tags = player.roleTags.join(' ').toLowerCase()
  let bonus = 0
  if (!cache.hasBallWinner && /ball-winner|screen|destroyer|duel/.test(tags)) bonus += 9
  if (!cache.hasCreator && /creator|controller|passing|tempo/.test(tags)) bonus += 7
  if (!cache.hasFinisher && /scorer|finisher|striker|killer/.test(tags)) bonus += 7
  if (!state.picks.some((pick) => pick.slot.accepts.includes('GK')) && player.positions.includes('GK')) bonus += 10
  return bonus
}

function slotScarcityValue(slot: FormationSlot, cache: SmartDraftCache): number {
  const coverage = cache.slotCoverage.get(slot.slotId) ?? 10
  if (coverage <= 2) return 9
  if (coverage <= 4) return 6
  if (coverage <= 7) return 3
  return 0
}

function bestRoleScoreForPlayer(context: AuditDraftContext, state: AuditDraftState, player: PlayerContext): number {
  const slot = bestSlotForPlayer(context, state, player)
  return slot ? playerOptionScore(slot, player) : 0
}

function smartPlayerValue(context: AuditDraftContext, state: AuditDraftState, player: PlayerContext, cache?: SmartDraftCache): number {
  if (cache?.valueByPlayer.has(player.contextId)) return cache.valueByPlayer.get(player.contextId) ?? Number.NEGATIVE_INFINITY
  const slot = bestSlotForPlayerCached(context, state, player, cache)
  if (!slot) return Number.NEGATIVE_INFINITY
  const smartCache = cache ?? createSmartDraftCache(context, state)
  const naturalFit = player.primaryPositions.some((position) => slot.accepts.includes(position)) ? 6 : 0
  const fit = playerOptionScore(slot, player) + naturalFit
  const chemistry = chemistryContributionCached(state, player, slot, smartCache) * 1.5
  const value =
    fit * 0.82 +
    rawPlayerRating(player) * 0.12 +
    roleNeedValue(state, player, smartCache) +
    slotScarcityValue(slot, smartCache) +
    chemistry +
    playerPressResistance(player) * 0.1 +
    player.ratings.bigGame * 0.1
  cache?.valueByPlayer.set(player.contextId, value)
  return value
}

function choosePlayer(context: AuditDraftContext, state: AuditDraftState, baseline: DraftBaseline, rngSeed: string): { player: PlayerContext; slot: FormationSlot } | undefined {
  const players = state.currentRollPool.filter((player) => openSlots(context, state).some((slot) => slotMatchesPlayer(slot, player)))
  if (!players.length) return undefined
  const rng = createRng(rngSeed)
  const smartCache = baseline === 'smart' ? createSmartDraftCache(context, state) : undefined
  const player =
    baseline === 'random'
      ? rng.pick(players)
      : [...players].sort((left, right) => {
          if (baseline === 'greedy_raw') return rawPlayerRating(right) - rawPlayerRating(left) || right.ratings.bigGame - left.ratings.bigGame
          const smartDelta = smartPlayerValue(context, state, right, smartCache) - smartPlayerValue(context, state, left, smartCache)
          if (Math.abs(smartDelta) > 0.5) return smartDelta
          const rightSlot = bestSlotForPlayerCached(context, state, right, smartCache)
          const leftSlot = bestSlotForPlayerCached(context, state, left, smartCache)
          return (
            playerPressResistance(right) - playerPressResistance(left) ||
            right.ratings.bigGame - left.ratings.bigGame ||
            (rightSlot ? chemistryContributionCached(state, right, rightSlot, smartCache) : 0) -
              (leftSlot ? chemistryContributionCached(state, left, leftSlot, smartCache) : 0) ||
            rawPlayerRating(right) - rawPlayerRating(left)
          )
        })[0]
  const slot = bestSlotForPlayerCached(context, state, player, smartCache)
  return slot ? { player, slot } : undefined
}

function bestAvailableSmartValue(context: AuditDraftContext, state: AuditDraftState): number {
  const players = state.currentRollPool.filter((player) => openSlots(context, state).some((slot) => slotMatchesPlayer(slot, player)))
  const cache = createSmartDraftCache(context, state)
  return players.length ? Math.max(...players.map((player) => smartPlayerValue(context, state, player, cache))) : 0
}

function bestAvailableRoleScore(context: AuditDraftContext, state: AuditDraftState): number {
  const players = state.currentRollPool.filter((player) => openSlots(context, state).some((slot) => slotMatchesPlayer(slot, player)))
  return players.length ? Math.max(...players.map((player) => bestRoleScoreForPlayer(context, state, player))) : 0
}

function hasPlayableSmartRoll(context: AuditDraftContext, state: AuditDraftState): boolean {
  const roleThreshold = state.roundIndex < 3 ? 82 : state.roundIndex < 8 ? 84 : 86
  return bestAvailableSmartValue(context, state) >= roleThreshold && bestAvailableRoleScore(context, state) >= roleThreshold
}

function maybeUseSmartReroll(context: AuditDraftContext, state: AuditDraftState, seed: string): AuditDraftState {
  let next = state
  if (hasPlayableSmartRoll(context, next)) return next
  if (next.rerolls.team > 0 && !context.specialSelection.fixedTeam && next.currentRoll) {
    const rerolled = selectAuditRoll(context, next, `${seed}:team`, { era: next.currentRoll.era }, next.currentRoll)
    if (rerolled) next = withRoll({ ...next, rerolls: { ...next.rerolls, team: next.rerolls.team - 1 } }, rerolled.roll, rerolled.players)
  }
  if (hasPlayableSmartRoll(context, next)) return next
  if (next.rerolls.era > 0 && !context.specialSelection.fixedEra && next.currentRoll) {
    const rerolled = selectAuditRoll(context, next, `${seed}:era`, { team: next.currentRoll.team }, next.currentRoll)
    if (rerolled) next = withRoll({ ...next, rerolls: { ...next.rerolls, era: next.rerolls.era - 1 } }, rerolled.roll, rerolled.players)
  }
  return next
}

function draftTeam(context: AuditDraftContext, baseline: DraftBaseline, index: number): DraftPick[] | null {
  let state: AuditDraftState = {
    picks: [],
    rerolls: { ...context.mode.rerollRules },
    roundIndex: 0,
    currentRollPool: [],
  }
  let guard = 0

  while (state.picks.length < context.draftSlots.length && guard < context.draftSlots.length + 6) {
    guard += 1
    const roll = selectAuditRoll(context, state, `roll:${cycleSeed(index)}:${context.mode.modeId}:${baseline}:${index}:${state.roundIndex}`)
    if (!roll) return null
    state = withRoll(state, roll.roll, roll.players)
    if (baseline === 'smart') state = maybeUseSmartReroll(context, state, `reroll:${cycleSeed(index)}:${context.mode.modeId}:${baseline}:${index}:${state.roundIndex}`)
    const chosen = choosePlayer(context, state, baseline, `choose:${cycleSeed(index)}:${context.mode.modeId}:${baseline}:${index}:${state.roundIndex}`)
    if (!chosen || !state.currentRoll) return null
    state = {
      ...state,
      picks: [
        ...state.picks,
        {
          round: state.roundIndex + 1,
          slot: chosen.slot,
          roll: state.currentRoll,
          player: chosen.player,
        },
      ],
      roundIndex: state.roundIndex + 1,
      currentRoll: undefined,
      currentRollPool: [],
    }
  }

  return state.picks.length >= context.draftSlots.length ? state.picks : null
}

function resultTier(result: RunResult): string {
  return result.resultTier?.id ?? result.perfectionResult
}

function isPerfect(result: RunResult): boolean {
  return resultTier(result) === 'perfect' || result.perfectionResult === 'Perfect'
}

function isUndefeated(result: RunResult): boolean {
  return result.record.losses === 0
}

function isInvincible(result: RunResult): boolean {
  const tier = resultTier(result)
  return tier === 'invincible' || result.perfectionResult.includes('Invincible')
}

function isNearPerfect(result: RunResult): boolean {
  const tier = resultTier(result)
  if (tier.includes('near')) return true
  return (result.record.losses === 0 && result.record.draws === 1) || (result.record.losses === 1 && result.record.draws === 0)
}

function runScore(result: RunResult): number {
  return result.record.wins * 3 + result.record.draws - result.record.losses * 3 + (result.goalsFor - result.goalsAgainst) * 0.08
}

function emptyCounters(): RunCounters {
  return {
    runs: 0,
    perfect: 0,
    undefeated: 0,
    invincible: 0,
    nearPerfect: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    longestWinStreak: 0,
    longestUnbeatenStreak: 0,
    score: 0,
    quality: 0,
  }
}

function addResult(counters: RunCounters, result: RunResult): void {
  counters.runs += 1
  counters.perfect += isPerfect(result) ? 1 : 0
  counters.undefeated += isUndefeated(result) ? 1 : 0
  counters.invincible += isInvincible(result) ? 1 : 0
  counters.nearPerfect += isNearPerfect(result) ? 1 : 0
  counters.wins += result.record.wins
  counters.draws += result.record.draws
  counters.losses += result.record.losses
  counters.goalsFor += result.goalsFor
  counters.goalsAgainst += result.goalsAgainst
  counters.longestWinStreak += result.streaks?.longestWinStreak ?? longestStreak(result.matchTrace, 'W')
  counters.longestUnbeatenStreak += result.streaks?.longestUnbeatenStreak ?? longestUnbeatenStreak(result.matchTrace)
  counters.score += runScore(result)
  counters.quality += teamQuality(result)
}

function mergeCounters(left: RunCounters, right: RunCounters): RunCounters {
  return Object.fromEntries(
    Object.keys(left).map((key) => [key, left[key as keyof RunCounters] + right[key as keyof RunCounters]]),
  ) as unknown as RunCounters
}

function summarizeCounters(counters: RunCounters) {
  const matches = counters.wins + counters.draws + counters.losses || 1
  return {
    runs: counters.runs,
    perfectRate: counters.runs ? counters.perfect / counters.runs : 0,
    undefeatedRate: counters.runs ? counters.undefeated / counters.runs : 0,
    invincibleRate: counters.runs ? counters.invincible / counters.runs : 0,
    nearPerfectRate: counters.runs ? counters.nearPerfect / counters.runs : 0,
    averageRecord: {
      wins: counters.runs ? counters.wins / counters.runs : 0,
      draws: counters.runs ? counters.draws / counters.runs : 0,
      losses: counters.runs ? counters.losses / counters.runs : 0,
    },
    perMatchWinRate: counters.wins / matches,
    averageGoalDifferential: counters.runs ? (counters.goalsFor - counters.goalsAgainst) / counters.runs : 0,
    averageLongestWinStreak: counters.runs ? counters.longestWinStreak / counters.runs : 0,
    averageLongestUnbeatenStreak: counters.runs ? counters.longestUnbeatenStreak / counters.runs : 0,
    averageScore: counters.runs ? counters.score / counters.runs : 0,
    averageTeamQuality: counters.runs ? counters.quality / counters.runs : 0,
  }
}

function longestStreak(matches: RunResult['matchTrace'], outcome: 'W'): number {
  let current = 0
  let longest = 0
  for (const match of matches) {
    if (match.outcome === outcome) current += 1
    else current = 0
    longest = Math.max(longest, current)
  }
  return longest
}

function longestUnbeatenStreak(matches: RunResult['matchTrace']): number {
  let current = 0
  let longest = 0
  for (const match of matches) {
    if (match.outcome !== 'L') current += 1
    else current = 0
    longest = Math.max(longest, current)
  }
  return longest
}

function teamQuality(result: RunResult): number {
  return result.effectiveTeamQuality?.score ?? result.teamRatings.overall
}

function auditTeam(context: AuditDraftContext, baseline: DraftBaseline, index: number): TeamAudit | null {
  const picks = draftTeam(context, baseline, index)
  if (!picks) return null
  const sampleResult = simulateRun(picks, context.mode.modeId, `AUDIT-SAMPLE-${cycleSeed(index)}-${context.mode.modeId}-${baseline}-${index}`)
  return {
    picks,
    formationId: context.formationId,
    baseline,
    quality: teamQuality(sampleResult) + runScore(sampleResult) * 0.01,
    sampleResult,
  }
}

function logProgress(mode: ModeConfig, label: string, index: number, total: number): void {
  if (total <= 0) return
  const step = Math.max(1, Math.floor(total / 5))
  if (index === 0 || index + 1 === total || (index + 1) % step === 0) {
    console.error(`[${mode.modeId}] ${label} ${index + 1}/${total}`)
  }
}

function simulateTeamSequential(team: TeamAudit, reruns: number, startIndex = 0): RunCounters {
  const counters = emptyCounters()
  for (let index = 0; index < reruns; index += 1) {
    const runIndex = startIndex + index
    addResult(counters, simulateRun(team.picks, team.sampleResult.modeId, `AUDIT-RUN-${cycleSeed(runIndex)}-${team.sampleResult.modeId}-${team.baseline}-${runIndex}`))
  }
  return counters
}

async function simulateTeam(team: TeamAudit, reruns: number, workers: number): Promise<ReturnType<typeof summarizeCounters>> {
  if (workers <= 1 || reruns < 1000) return summarizeCounters(simulateTeamSequential(team, reruns))

  const chunkCount = Math.min(workers, reruns)
  const chunkSize = Math.ceil(reruns / chunkCount)
  const jobs: WorkerJob[] = Array.from({ length: chunkCount }, (_, chunkIndex) => {
    const startIndex = chunkIndex * chunkSize
    return {
      modeId: team.sampleResult.modeId,
      baseline: team.baseline,
      picks: team.picks,
      startIndex,
      count: Math.max(0, Math.min(chunkSize, reruns - startIndex)),
    }
  }).filter((job) => job.count > 0)

  try {
    const chunks = await Promise.all(jobs.map((job) => runWorker(job)))
    return summarizeCounters(chunks.reduce(mergeCounters, emptyCounters()))
  } catch (error) {
    console.error(`[${team.sampleResult.modeId}] worker audit failed; falling back to sequential (${error instanceof Error ? error.message : String(error)})`)
    return summarizeCounters(simulateTeamSequential(team, reruns))
  }
}

function runWorker(job: WorkerJob): Promise<RunCounters> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./audit-simulation-worker.mjs', import.meta.url), {
      workerData: job,
    })
    worker.once('message', (message: RunCounters) => resolve(message))
    worker.once('error', reject)
    worker.once('exit', (code) => {
      if (code !== 0) reject(new Error(`worker exited with code ${code}`))
    })
  })
}

function quantile<T>(values: T[], value: number, score: (item: T) => number): T | undefined {
  if (!values.length) return undefined
  const sorted = [...values].sort((left, right) => score(left) - score(right))
  return sorted[Math.min(sorted.length - 1, Math.max(0, Math.floor((sorted.length - 1) * value)))]
}

function probabilityExamples(mode: ModeConfig, team: TeamAudit | null) {
  if (!team?.sampleResult.probabilityExamples) return []
  return team.sampleResult.probabilityExamples.map((example) => ({
    modeId: mode.modeId,
    ...example,
  }))
}

function averageSummaries(summaries: Array<ReturnType<typeof summarizeCounters> & { quality: number }>) {
  const divide = Math.max(1, summaries.length)
  return {
    perfectRate: summaries.reduce((sum, item) => sum + item.perfectRate, 0) / divide,
    undefeatedRate: summaries.reduce((sum, item) => sum + item.undefeatedRate, 0) / divide,
    invincibleRate: summaries.reduce((sum, item) => sum + item.invincibleRate, 0) / divide,
    nearPerfectRate: summaries.reduce((sum, item) => sum + item.nearPerfectRate, 0) / divide,
    perMatchWinRate: summaries.reduce((sum, item) => sum + item.perMatchWinRate, 0) / divide,
    averageGoalDifferential: summaries.reduce((sum, item) => sum + item.averageGoalDifferential, 0) / divide,
    averageLongestWinStreak: summaries.reduce((sum, item) => sum + item.averageLongestWinStreak, 0) / divide,
    averageLongestUnbeatenStreak: summaries.reduce((sum, item) => sum + item.averageLongestUnbeatenStreak, 0) / divide,
    averageScore: summaries.reduce((sum, item) => sum + item.averageScore, 0) / divide,
    averageTeamQuality: summaries.reduce((sum, item) => sum + item.averageTeamQuality, 0) / divide,
  }
}

function summarizeTopSample(summary: (ReturnType<typeof summarizeCounters> & { quality: number }) | undefined) {
  if (!summary) return undefined
  return {
    perfectRate: summary.perfectRate,
    undefeatedRate: summary.undefeatedRate,
    invincibleRate: summary.invincibleRate,
    nearPerfectRate: summary.nearPerfectRate,
    perMatchWinRate: summary.perMatchWinRate,
    averageGoalDifferential: summary.averageGoalDifferential,
    averageScore: summary.averageScore,
    averageTeamQuality: summary.averageTeamQuality,
    quality: summary.quality,
  }
}

async function auditMode(mode: ModeConfig, options: AuditOptions) {
  const modeStarted = Date.now()
  console.error(`[${mode.modeId}] loading player contexts`)
  const players = await loadModePlayerContexts(mode.modeId)
  configureDraftPlayerContexts(players)
  const contexts = new Map<string, AuditDraftContext>()
  const contextForIndex = (index: number) => {
    const formationId = mode.allowedFormations.length ? mode.allowedFormations[index % mode.allowedFormations.length] : defaultFormationId
    const specialSelection = defaultSpecialSelection(mode, liveTeamsForMode(mode), index)
    const contextKey = `${formationId}:${specialKey(specialSelection)}`
    const cached = contexts.get(contextKey)
    if (cached) return cached
    const context = buildAuditDraftContext(mode, players, formationId, specialSelection)
    contexts.set(contextKey, context)
    return context
  }

  const randomCounters = emptyCounters()
  const randomTeams: TeamAudit[] = []
  if (baselineEnabled(options, 'random')) {
    for (let index = 0; index < options.config.randomDraftsPerMode; index += 1) {
      logProgress(mode, 'random drafts', index, options.config.randomDraftsPerMode)
      const team = auditTeam(contextForIndex(index), 'random', index)
      if (team) {
        randomTeams.push(team)
        addResult(randomCounters, team.sampleResult)
      }
    }
  }

  const greedyCounters = emptyCounters()
  const greedyTeams: TeamAudit[] = []
  if (baselineEnabled(options, 'greedy_raw')) {
    for (let index = 0; index < options.config.greedyDraftsPerMode; index += 1) {
      logProgress(mode, 'greedy drafts', index, options.config.greedyDraftsPerMode)
      const team = auditTeam(contextForIndex(index), 'greedy_raw', index)
      if (team) {
        greedyTeams.push(team)
        addResult(greedyCounters, team.sampleResult)
      }
    }
  }

  const smartTeams: TeamAudit[] = []
  const smartCounters = emptyCounters()
  const smartTeamSummaries: Array<ReturnType<typeof summarizeCounters> & { quality: number }> = []
  if (baselineEnabled(options, 'smart') || baselineEnabled(options, 'best')) {
    for (let index = 0; index < options.config.smartDraftTeamsPerMode; index += 1) {
      logProgress(mode, 'smart teams', index, options.config.smartDraftTeamsPerMode)
      const team = auditTeam(contextForIndex(index), 'smart', index)
      if (!team) continue
      smartTeams.push(team)
      if (baselineEnabled(options, 'smart')) {
        const summary = await simulateTeam(team, options.config.smartDraftRerunsPerTeam, options.workers)
        smartTeamSummaries.push({ ...summary, quality: team.quality })
        addResult(smartCounters, team.sampleResult)
      } else {
        smartTeamSummaries.push({ ...summarizeCounters(emptyCounters()), quality: team.quality })
      }
    }
  }

  const bestObservedPool = [...randomTeams, ...greedyTeams, ...smartTeams]
  const bestObserved = bestObservedPool.sort((left, right) => right.quality - left.quality)[0] ?? null
  let bestObservedSummary = summarizeCounters(emptyCounters())
  if (baselineEnabled(options, 'best') && bestObserved) {
    console.error(`[${mode.modeId}] best observed reruns ${options.config.bestObservedRerunsPerMode}`)
    bestObservedSummary = await simulateTeam(bestObserved, options.config.bestObservedRerunsPerMode, options.workers)
  }

  const topOnePercent = quantile(smartTeamSummaries, 0.99, (item) => item.perfectRate || item.quality)
  const topTenthPercent = quantile(smartTeamSummaries, 0.999, (item) => item.perfectRate || item.quality)

  return {
    modeId: mode.modeId,
    modeName: mode.modeName,
    format: mode.simulationFormat,
    targetRecord: mode.targetRecord,
    matchCount: mode.matchCount,
    durationMs: Date.now() - modeStarted,
    randomDraft: summarizeCounters(randomCounters),
    greedyRawDraft: summarizeCounters(greedyCounters),
    smartDraftOneRun: summarizeCounters(smartCounters),
    smartDraftRerunAverage: averageSummaries(smartTeamSummaries),
    bestObserved: {
      summary: bestObservedSummary,
      formationId: bestObserved?.formationId,
      effectiveTeamQuality: bestObserved?.sampleResult.effectiveTeamQuality,
      teamRatings: bestObserved?.sampleResult.teamRatings,
      xi: bestObserved?.picks.map((pick) => `${pick.slot.label}: ${pick.player.displayName}`),
      probabilityExamples: probabilityExamples(mode, bestObserved),
    },
    topOnePercent: summarizeTopSample(topOnePercent),
    topTenthPercent: summarizeTopSample(topTenthPercent),
  }
}

async function main() {
  const options = parseOptions()
  const started = Date.now()
  const startedAt = new Date().toISOString()
  const modes = selectedModes(options)

  console.error(`audit config ${JSON.stringify({ ...options, modeIds: modes.map((mode) => mode.modeId), outFile: options.outFile ?? null })}`)
  const modesOutput = []
  for (const mode of modes) {
    const output = await auditMode(mode, options)
    modesOutput.push(output)
    console.error(`audited ${mode.modeId} in ${Math.round(output.durationMs / 1000)}s`)
  }

  const output = {
    startedAt,
    finishedAt: new Date().toISOString(),
    durationMs: Date.now() - started,
    seeds: [...auditSeeds],
    config: options.config,
    filters: {
      group: options.group,
      baseline: options.baseline,
      modeIds: modes.map((mode) => mode.modeId),
      workers: options.workers,
    },
    modes: modesOutput,
  }

  if (options.outFile) {
    mkdirSync(dirname(options.outFile), { recursive: true })
    writeFileSync(options.outFile, `${JSON.stringify(output, null, 2)}\n`)
  } else {
    console.log(JSON.stringify(output, null, 2))
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
