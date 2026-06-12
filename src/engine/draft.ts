import { getFormation } from '../data/formations'
import { getModeConfig } from '../data/modes'
import { getDraftSlots } from '../data/squad'
import { createRng, makeRunId, randomPick, weightedShuffle } from './random'
import { eraMatches, filterEligiblePlayers, modeMatchesPlayer, playerOptionScore, slotMatchesPlayer, teamMatches } from './eligibility'
import { rollCoverageMeetsDepth, summarizeRollPool } from './rollCoverage'
import type { DraftState, FormationSlot, ModeConfig, PlayerContext, RerollCounts, RollResult, SpecialSelection } from '../types'

const minimumRollPoolSize = 4
const minimumSelectableOptions = 2

let draftPlayerContexts: PlayerContext[] = []
let playersByTeamEra = new Map<string, PlayerContext[]>()

function buildPlayersByTeamEra(players: PlayerContext[]): Map<string, PlayerContext[]> {
  return players.reduce((index, player) => {
    for (const era of indexErasForPlayer(player)) {
      const key = rollIndexKey(player.teamType, player.teamName, era)
      const values = index.get(key) ?? []
      values.push(player)
      index.set(key, values)
    }
    return index
  }, new Map<string, PlayerContext[]>())
}

export function configureDraftPlayerContexts(players: PlayerContext[]): void {
  draftPlayerContexts = players
  playersByTeamEra = buildPlayersByTeamEra(players)
}

function getDraftPlayerContexts(): PlayerContext[] {
  if (draftPlayerContexts.length === 0) {
    throw new Error('Draft player contexts have not been loaded.')
  }
  return draftPlayerContexts
}

export function createDraftState(mode: ModeConfig, formationId: string, specialSelection?: SpecialSelection): DraftState {
  const rerolls = { ...mode.rerollRules }
  const formation = getFormation(formationId)
  if (specialSelection?.fixedTeam) rerolls.team = 0
  if (specialSelection?.fixedEra) rerolls.era = 0

  return {
    modeId: mode.modeId,
    formationId,
    draftSlots: prioritizeDraftSlots(mode, getDraftSlots(mode, formation)),
    seed: makeRunId(),
    roundIndex: 0,
    picks: [],
    rerolls,
    specialSelection,
    currentOptions: [],
    currentRollPool: [],
  }
}

function prioritizeDraftSlots(mode: ModeConfig, slots: FormationSlot[]): FormationSlot[] {
  const starters = slots.filter((slot) => slot.squadRole !== 'bench')
  const bench = slots.filter((slot) => slot.squadRole === 'bench')
  const players = getDraftPlayerContexts()
  const coverage = new Map(starters.map((slot) => [
    slot.slotId,
    players.filter((player) => {
      if (!slotMatchesPlayer(slot, player)) return false
      if (!modeMatchesPlayer(mode, player)) return false
      return true
    }).length,
  ]))

  return [
    ...starters.sort((a, b) => (coverage.get(a.slotId) ?? 0) - (coverage.get(b.slotId) ?? 0) || a.y - b.y || a.x - b.x),
    ...bench,
  ]
}

export function getCurrentSlot(state: DraftState): FormationSlot | undefined {
  return state.draftSlots[state.roundIndex]
}

export function isDraftComplete(state: DraftState): boolean {
  return state.picks.length >= state.draftSlots.length
}

function rollKey(roll: RollResult): string {
  return `${roll.team.teamType}:${roll.team.label}:${roll.era}`
}

function teamRollKey(roll: RollResult): string {
  return `${roll.team.teamType}:${roll.team.label}`
}

function rollIndexKey(teamType: string, teamName: string, era: string): string {
  return `${teamType}:${teamName}:${era}`
}

function indexErasForPlayer(player: PlayerContext): string[] {
  return Array.from(new Set([player.decade, player.eraLabel].filter(Boolean)))
}

function indexedRollPlayers(mode: ModeConfig, state: DraftState, roll: RollResult): PlayerContext[] {
  const eraKey = mode.rollDimensions.includes('european_era') ? roll.era.slice(0, 5) : roll.era
  const taken = takenPlayerIds(state)
  return uniquePlayers((playersByTeamEra.get(rollIndexKey(roll.team.teamType, roll.team.label, eraKey)) ?? []).filter((player) => {
    if (taken.has(player.contextId) || taken.has(player.personId)) return false
    if (!modeMatchesPlayer(mode, player)) return false
    if (!teamMatches(mode, roll, player)) return false
    if (!eraMatches(mode, roll, player)) return false
    return true
  }))
}

function initialIndexedRollPlayers(mode: ModeConfig, roll: RollResult): PlayerContext[] {
  const eraKey = mode.rollDimensions.includes('european_era') ? roll.era.slice(0, 5) : roll.era
  return uniquePlayers((playersByTeamEra.get(rollIndexKey(roll.team.teamType, roll.team.label, eraKey)) ?? []).filter((player) => {
    if (!modeMatchesPlayer(mode, player)) return false
    if (!teamMatches(mode, roll, player)) return false
    if (!eraMatches(mode, roll, player)) return false
    return true
  }))
}

function takenPlayerIds(state: DraftState, extraPlayer?: PlayerContext): Set<string> {
  const ids = new Set<string>()
  for (const pick of state.picks) {
    ids.add(pick.player.contextId)
    ids.add(pick.player.personId)
  }
  if (extraPlayer) {
    ids.add(extraPlayer.contextId)
    ids.add(extraPlayer.personId)
  }
  return ids
}

function lockedRollDimensions(state: DraftState, preserve?: Partial<RollResult>): Partial<RollResult> {
  return {
    team: state.specialSelection?.fixedTeam ?? preserve?.team,
    era: state.specialSelection?.fixedEra ?? preserve?.era,
  }
}

function getOpenSlots(state: DraftState): FormationSlot[] {
  const filledSlotIds = new Set(state.picks.map((pick) => pick.slot.slotId))
  return state.draftSlots.filter((slot) => !filledSlotIds.has(slot.slotId))
}

function slotsForPlayer(slots: FormationSlot[], player: PlayerContext): FormationSlot[] {
  return slots.filter((slot) => slotMatchesPlayer(slot, player))
}

function bestOpenSlotScore(slots: FormationSlot[], player: PlayerContext): number {
  const compatibleSlots = slotsForPlayer(slots, player)
  return compatibleSlots.length > 0 ? Math.max(...compatibleSlots.map((slot) => playerOptionScore(slot, player))) : 0
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
  const seen = new Set<string>()
  return players.filter((player) => {
    if (seen.has(player.personId)) return false
    seen.add(player.personId)
    return true
  })
}

function poolForRoll(mode: ModeConfig, state: DraftState, roll: RollResult): PlayerContext[] {
  return indexedRollPlayers(mode, state, roll)
    .sort((left, right) => playerRollScore(right) - playerRollScore(left) || right.ratings.bigGame - left.ratings.bigGame || left.displayName.localeCompare(right.displayName))
}

interface PlayableRollCandidate {
  roll: RollResult
  options: PlayerContext[]
  pool: PlayerContext[]
}

function rollHasEnoughDepth(candidate: Pick<PlayableRollCandidate, 'options' | 'pool'>): boolean {
  return candidate.pool.length >= minimumRollPoolSize && candidate.options.length >= minimumSelectableOptions
}

function optionWeightForMode(mode: ModeConfig, slots: FormationSlot[], player: PlayerContext): number {
  return mode.hidesRatings ? 1 : bestOpenSlotScore(slots, player)
}

function playableRolls(mode: ModeConfig, state: DraftState, slots: FormationSlot[], preserve?: Partial<RollResult>): PlayableRollCandidate[] {
  const locked = lockedRollDimensions(state, preserve)
  const teams = locked.team ? [locked.team] : mode.teamPool
  const eras = locked.era ? [locked.era] : mode.eraPool
  const rollByKey = new Map<string, RollResult>()
  for (const team of teams) {
    for (const era of eras) {
      const roll = { team, era }
      rollByKey.set(rollKey(roll), roll)
    }
  }
  return Array.from(rollByKey.values())
    .map((roll) => {
      const initialPool = initialIndexedRollPlayers(mode, roll)
      if (!rollCoverageMeetsDepth(summarizeRollPool(roll.team, roll.era, initialPool))) return undefined
      const pool = indexedRollPlayers(mode, state, roll)
      const candidates = pool.filter((player) => slots.some((slot) => slotMatchesPlayer(slot, player)))
      if (candidates.length === 0) return undefined
      const rng = createRng(`${state.seed}:${state.roundIndex}:${roll.team.label}:${roll.era}`)
      const options = weightedShuffle(
        uniquePlayers(candidates),
        rng,
        (player) => optionWeightForMode(mode, slots, player),
      )
      const sortedPool = uniquePlayers(pool)
        .sort((left, right) => playerRollScore(right) - playerRollScore(left) || right.ratings.bigGame - left.ratings.bigGame || left.displayName.localeCompare(right.displayName))
      return { roll, options, pool: sortedPool }
    })
    .filter((item): item is PlayableRollCandidate => Boolean(item))
    .filter(rollHasEnoughDepth)
}

function randomPlayableCandidate(candidates: PlayableRollCandidate[]): PlayableRollCandidate | undefined {
  if (candidates.length === 0) return undefined
  const byTeam = candidates.reduce((groups, candidate) => {
    const key = teamRollKey(candidate.roll)
    const group = groups.get(key) ?? []
    group.push(candidate)
    groups.set(key, group)
    return groups
  }, new Map<string, PlayableRollCandidate[]>())
  const teamGroups = Array.from(byTeam.values())
  const teamGroup = randomPick(teamGroups)
  return randomPick(teamGroup)
}

function randomPlayableRoll(mode: ModeConfig, state: DraftState, slots: FormationSlot[], preserve?: Partial<RollResult>, previousRoll?: RollResult): PlayableRollCandidate | undefined {
  const playable = playableRolls(mode, state, slots, preserve)
  if (playable.length === 0) return undefined
  if (!previousRoll) return randomPlayableCandidate(playable)

  const alternatives = playable.filter((item) => rollKey(item.roll) !== rollKey(previousRoll))
  return randomPlayableCandidate(alternatives)
}

function rollForPlayerContext(player: PlayerContext): RollResult {
  return {
    team: { label: player.teamName, teamType: player.teamType },
    era: player.eraLabel,
  }
}

function optionsForPlayerContextRoll(mode: ModeConfig, state: DraftState, slots: FormationSlot[], roll: RollResult): PlayerContext[] {
  const rng = createRng(`${state.seed}:${state.roundIndex}:${roll.team.teamType}:${roll.team.label}:${roll.era}:context-options`)
  const taken = takenPlayerIds(state)
  const candidates = getDraftPlayerContexts().filter((player) => {
    if (taken.has(player.contextId) || taken.has(player.personId)) return false
    if (slotsForPlayer(slots, player).length === 0) return false
    if (!modeMatchesPlayer(mode, player)) return false
    if (player.teamType !== roll.team.teamType) return false
    if (player.teamName !== roll.team.label) return false
    if (player.decade !== roll.era && player.eraLabel !== roll.era) return false
    return true
  })

  return weightedShuffle(candidates, rng, (player) => optionWeightForMode(mode, slots, player))
}

function contextRollFallback(
  mode: ModeConfig,
  state: DraftState,
  slots: FormationSlot[],
  seedPart: string,
  preserve?: Partial<RollResult>,
): PlayableRollCandidate | undefined {
  const taken = takenPlayerIds(state)
  const candidates = uniquePlayers(slots.flatMap((slot) => filterEligiblePlayers({
    mode,
    slot,
    roll: {
      team: state.specialSelection?.fixedTeam ?? preserve?.team ?? mode.teamPool[0],
      era: state.specialSelection?.fixedEra ?? preserve?.era ?? mode.eraPool[0],
    },
    players: getDraftPlayerContexts(),
    takenContextIds: taken,
    loosenTeam: !state.specialSelection?.fixedTeam && !preserve?.team,
    loosenEra: !state.specialSelection?.fixedEra && !preserve?.era,
  })))
  const rng = createRng(`${state.seed}:${state.roundIndex}:${seedPart}:context-fallback`)
  const shuffledCandidates = weightedShuffle(candidates, rng, (player) => optionWeightForMode(mode, slots, player))

  for (const player of shuffledCandidates) {
    const playerRoll = rollForPlayerContext(player)
    const roll = {
      team: preserve?.team ?? playerRoll.team,
      era: preserve?.era ?? playerRoll.era,
    }
    const options = optionsForPlayerContextRoll(mode, state, slots, roll)
    const pool = poolForRoll(mode, state, roll)
    if (rollHasEnoughDepth({ options, pool })) return { roll, options, pool }
  }

  return undefined
}

export function spinForSlot(mode: ModeConfig, state: DraftState): DraftState {
  const slots = getOpenSlots(state)
  if (slots.length === 0 || state.currentRoll) return state

  const playable = randomPlayableRoll(mode, state, slots)
  if (playable) {
    return {
      ...state,
      currentRoll: playable.roll,
      currentOptions: playable.options,
      currentRollPool: playable.pool,
      freeRerollNotice: undefined,
    }
  }

  const contextFallback = contextRollFallback(mode, state, slots, 'spin')
  if (contextFallback) {
    return {
      ...state,
      currentRoll: { ...contextFallback.roll, freeRerollReason: 'The listed pool was exhausted for this slot.' },
      currentOptions: contextFallback.options,
      currentRollPool: contextFallback.pool,
      freeRerollNotice: 'The listed pool was exhausted for this slot. Showing an exact player-context roll.',
    }
  }

  return {
    ...state,
    currentRoll: undefined,
    currentOptions: [],
    currentRollPool: [],
    freeRerollNotice: 'No exact player data is available for this slot. Try changing mode or formation.',
  }
}

export function reroll(mode: ModeConfig, state: DraftState, type: keyof RerollCounts): DraftState {
  const slots = getOpenSlots(state)
  if (slots.length === 0 || !state.currentRoll || state.rerolls[type] <= 0) return state
  if (type === 'team' && state.specialSelection?.fixedTeam) return state
  if (type === 'era' && state.specialSelection?.fixedEra) return state

  const nextRerolls = { ...state.rerolls, [type]: state.rerolls[type] - 1 }
  const preserve =
    type === 'team'
      ? { era: state.currentRoll.era }
      : type === 'era'
        ? { team: state.currentRoll.team }
        : undefined

  const playable = randomPlayableRoll(mode, { ...state, rerolls: nextRerolls }, slots, preserve, state.currentRoll)
  if (playable) {
    return {
      ...state,
      rerolls: nextRerolls,
      currentRoll: playable.roll,
      currentOptions: playable.options,
      currentRollPool: playable.pool,
      freeRerollNotice: undefined,
    }
  }

  const contextFallback = contextRollFallback(mode, { ...state, rerolls: nextRerolls }, slots, `reroll:${type}`, preserve)
  if (contextFallback) {
    return {
      ...state,
      rerolls: nextRerolls,
      currentRoll: contextFallback.roll,
      currentOptions: contextFallback.options,
      currentRollPool: contextFallback.pool,
      freeRerollNotice: 'The listed pool was exhausted for this slot. Showing an exact player-context roll.',
    }
  }

  return {
    ...state,
    rerolls: nextRerolls,
    freeRerollNotice: 'Reroll could not find another exact matching data pocket.',
  }
}

export function selectPlayer(state: DraftState, player: PlayerContext): DraftState {
  return selectPlayerForSlot(state, player, bestAutomaticSlotForPlayer(state, player)?.slotId)
}

function bestAutomaticSlotForPlayer(state: DraftState, player: PlayerContext): FormationSlot | undefined {
  const mode = getModeConfig(state.modeId)
  const openSlots = getOpenSlots(state)
  const compatibleSlots = openSlots.filter((slot) => slotMatchesPlayer(slot, player))
  const taken = takenPlayerIds(state, player)

  return compatibleSlots.sort((a, b) => {
    const aRemaining = minimumRemainingCoverage(mode, openSlots, a.slotId, taken)
    const bRemaining = minimumRemainingCoverage(mode, openSlots, b.slotId, taken)
    const aPrimary = player.primaryPositions.some((position) => a.accepts.includes(position)) ? 1 : 0
    const bPrimary = player.primaryPositions.some((position) => b.accepts.includes(position)) ? 1 : 0

    return bRemaining - aRemaining || bPrimary - aPrimary || playerOptionScore(b, player) - playerOptionScore(a, player)
  })[0]
}

function minimumRemainingCoverage(mode: ModeConfig, openSlots: FormationSlot[], filledSlotId: string, takenContextIds: Set<string>): number {
  const remainingSlots = openSlots.filter((slot) => slot.slotId !== filledSlotId)
  if (remainingSlots.length === 0) return Number.POSITIVE_INFINITY

  return Math.min(
    ...remainingSlots.map((slot) =>
      getDraftPlayerContexts().filter((candidate) => {
        if (takenContextIds.has(candidate.contextId) || takenContextIds.has(candidate.personId)) return false
        if (!slotMatchesPlayer(slot, candidate)) return false
        if (!modeMatchesPlayer(mode, candidate)) return false
        return true
      }).length,
    ),
  )
}

export function selectPlayerForSlot(state: DraftState, player: PlayerContext, slotId?: string): DraftState {
  const mode = getModeConfig(state.modeId)
  const roll = state.currentRoll
  const targetIndex = state.draftSlots.findIndex((slot) => slot.slotId === slotId)
  const slot = targetIndex >= 0 ? state.draftSlots[targetIndex] : undefined
  if (!slot || !roll) return state
  const isVisibleRollPlayer = state.currentRollPool?.some((option) => option.contextId === player.contextId || option.personId === player.personId) ?? false
  const isSelectableOption = state.currentOptions.some((option) => option.contextId === player.contextId || option.personId === player.personId)
  const isCurrentRollPlayer = modeMatchesPlayer(mode, player) && teamMatches(mode, roll, player) && eraMatches(mode, roll, player)
  if (!isVisibleRollPlayer && !isSelectableOption && !isCurrentRollPlayer) return state
  if (state.picks.some((pick) => pick.player.personId === player.personId)) return state
  if (state.picks.some((pick) => pick.slot.slotId === slot.slotId)) return state
  if (!slotMatchesPlayer(slot, player)) return state

  return {
    ...state,
    roundIndex: state.roundIndex + 1,
    picks: [
      ...state.picks,
      {
        round: state.roundIndex + 1,
        slot,
        roll,
        player,
      },
    ],
    currentRoll: undefined,
    currentOptions: [],
    currentRollPool: [],
    freeRerollNotice: undefined,
  }
}
