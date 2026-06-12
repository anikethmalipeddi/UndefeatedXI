import type { FormationSlot, ModeConfig, PlayerContext, RollResult } from '../types'

const derivedAllTimeModes = new Set(['one_club', 'nation_xi', 'era_lock', 'chaos', 'manager'])

function hasSourceBackedRating(player: PlayerContext): boolean {
  return Boolean(player.ratingSourceConfidence && player.ratingSourceConfidence !== 'unrated-hidden')
}

export function slotMatchesPlayer(slot: FormationSlot, player: PlayerContext): boolean {
  return slot.accepts.some((position) => player.positions.includes(position))
}

export function modeMatchesPlayer(mode: ModeConfig, player: PlayerContext, strictMode = false): boolean {
  if (!hasSourceBackedRating(player)) return false

  if (mode.modeId === 'ball_knowledge') {
    return player.eligibleModes.includes('world_xi') || player.eligibleModes.includes('ball_knowledge')
  }

  if (derivedAllTimeModes.has(mode.modeId)) {
    return player.eligibleModes.includes('world_xi') || player.eligibleModes.includes('ball_knowledge') || player.eligibleModes.includes(mode.modeId)
  }

  if (strictMode) {
    return player.eligibleModes.includes(mode.modeId) || (mode.modeId === 'world_xi' && player.eligibleModes.includes('ball_knowledge'))
  }

  if (mode.status === 'preview' && !player.eligibleModes.includes(mode.modeId)) {
    return player.eligibleModes.includes('world_xi')
  }

  return player.eligibleModes.includes(mode.modeId) || (mode.modeId === 'world_xi' && player.eligibleModes.includes('ball_knowledge'))
}

export function eraMatches(mode: ModeConfig, roll: RollResult, player: PlayerContext): boolean {
  if (mode.rollDimensions.includes('european_era')) {
    const decade = roll.era.slice(0, 5)
    return player.decade === decade || player.eraLabel === roll.era
  }

  return player.decade === roll.era || player.eraLabel === roll.era
}

export function teamMatches(mode: ModeConfig, roll: RollResult, player: PlayerContext): boolean {
  if (mode.rollDimensions.includes('club_or_nation')) {
    return player.teamName === roll.team.label
  }

  if (mode.rollDimensions.includes('nation')) {
    return player.teamType === 'nation' && player.teamName === roll.team.label
  }

  if (mode.rollDimensions.includes('club')) {
    return player.teamType === 'club' && player.teamName === roll.team.label
  }

  return player.teamName === roll.team.label
}

export function filterEligiblePlayers({
  mode,
  slot,
  roll,
  players,
  takenContextIds,
  loosenEra = false,
  loosenTeam = false,
  strictMode = false,
}: {
  mode: ModeConfig
  slot: FormationSlot
  roll: RollResult
  players: PlayerContext[]
  takenContextIds: Set<string>
  loosenEra?: boolean
  loosenTeam?: boolean
  strictMode?: boolean
}): PlayerContext[] {
  return players.filter((player) => {
    if (takenContextIds.has(player.contextId) || takenContextIds.has(player.personId)) return false
    if (!slotMatchesPlayer(slot, player)) return false
    if (!modeMatchesPlayer(mode, player, strictMode)) return false
    if (!loosenTeam && !teamMatches(mode, roll, player)) return false
    if (!loosenEra && !eraMatches(mode, roll, player)) return false
    return true
  })
}

export function playerOptionScore(slot: FormationSlot, player: PlayerContext): number {
  const exactPrimary = player.primaryPositions.some((position) => slot.accepts.includes(position)) ? 1.12 : 1
  const roleNeed =
    slot.accepts.includes('GK')
      ? player.ratings.goalkeeping
      : slot.accepts.some((position) => ['CB', 'LB', 'RB', 'LWB', 'RWB', 'DM'].includes(position))
        ? player.ratings.defense * 0.65 + player.ratings.physical * 0.2 + player.ratings.control * 0.15
        : slot.accepts.some((position) => ['CM', 'AM'].includes(position))
          ? player.ratings.control * 0.45 + player.ratings.creation * 0.35 + player.ratings.press * 0.2
          : player.ratings.attack * 0.62 + player.ratings.creation * 0.24 + player.ratings.physical * 0.14

  return roleNeed * exactPrimary + player.ratings.bigGame * 0.08
}
