import type { ChemistryReport, DraftPick, FormationSlot, ModeConfig, PlayerContext, ResultTier, ResultTierId, TeamRatings } from '../types'
import { clamp, round } from './random'

export interface PositionFitReport {
  average: number
  minimum: number
  weakFits: string[]
}

export interface EffectiveTeamQualityInput {
  picks: DraftPick[]
  ratings: TeamRatings
  chemistryReport: ChemistryReport
}

export interface ConversionContext {
  ratings: TeamRatings
  effectiveScore: number
  positionFit: number
  chemistry: number
  roleBalance: number
  weakLinkPenalty: number
  opponentDifficulty: number
  dominanceDelta: number
  matchImportance: number
}

export interface FixtureDifficulty {
  difficulty: number
  bucket: 'weak' | 'average' | 'strong' | 'elite'
}

export interface MatchProbabilitySet {
  win: number
  draw: number
  loss: number
}

export const scoringVersion = 2

function sigmoid(value: number): number {
  return 1 / (1 + Math.exp(-value))
}

function average(values: number[]): number {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0
}

function slotRoleScore(slot: FormationSlot, player: PlayerContext): number {
  if (slot.accepts.includes('GK')) return player.ratings.goalkeeping
  if (slot.accepts.some((position) => ['CB', 'LB', 'RB', 'LWB', 'RWB', 'DM'].includes(position))) {
    return player.ratings.defense * 0.62 + player.ratings.physical * 0.22 + player.ratings.press * 0.16
  }
  if (slot.accepts.some((position) => ['CM', 'AM', 'LM', 'RM'].includes(position))) {
    return player.ratings.control * 0.44 + player.ratings.creation * 0.32 + player.ratings.press * 0.24
  }
  return player.ratings.attack * 0.62 + player.ratings.creation * 0.22 + player.ratings.physical * 0.16
}

export function positionFitScore(slot: FormationSlot, player: PlayerContext): number {
  if (player.primaryPositions.some((position) => slot.accepts.includes(position))) return 100
  if (player.secondaryPositions.some((position) => slot.accepts.includes(position))) return 88
  if (player.positions.some((position) => slot.accepts.includes(position))) return 76
  if (slot.accepts.includes('GK') || player.positions.includes('GK')) return 28
  return 58
}

export function positionFitLabel(score: number): string {
  if (score >= 96) return 'Natural fit'
  if (score >= 86) return 'Good fit'
  if (score >= 76) return 'Weak fit'
  return 'Wrong position'
}

export function positionFitImpact(score: number): string {
  if (score >= 96) return 'No penalty'
  if (score >= 86) return 'Small penalty'
  if (score >= 76) return 'Meaningful penalty'
  return 'Severe penalty'
}

export function calculatePositionFitReport(picks: DraftPick[]): PositionFitReport {
  const scores = picks.map((pick) => positionFitScore(pick.slot, pick.player))
  const weakFits = picks
    .map((pick) => ({ pick, fit: positionFitScore(pick.slot, pick.player) }))
    .filter((item) => item.fit < 86)
    .map((item) => `${item.pick.slot.label}: ${item.pick.player.displayName} (${positionFitLabel(item.fit)})`)

  return {
    average: Math.round(average(scores) || 50),
    minimum: Math.round(scores.length ? Math.min(...scores) : 50),
    weakFits,
  }
}

export function calculateEffectiveTeamQuality({ picks, ratings, chemistryReport }: EffectiveTeamQualityInput) {
  const positionFit = calculatePositionFitReport(picks)
  const slotScores = picks.map((pick) => slotRoleScore(pick.slot, pick.player) * (positionFitScore(pick.slot, pick.player) / 100))
  const teamAverage = average(slotScores)
  const lowestSlotScore = slotScores.length ? Math.min(...slotScores) : 45
  const weakLinks: string[] = [...positionFit.weakFits]
  let weakLinkCap = 100

  if (positionFit.minimum < 70) weakLinkCap = Math.min(weakLinkCap, 66)
  else if (positionFit.minimum < 80) weakLinkCap = Math.min(weakLinkCap, 72)

  if (teamAverage - lowestSlotScore > 25) {
    weakLinkCap = Math.min(weakLinkCap, 72)
    const weakPick = picks[slotScores.indexOf(lowestSlotScore)]
    if (weakPick) weakLinks.push(`${weakPick.slot.label}: low role score`)
  }

  const keeper = picks.find((pick) => pick.slot.accepts.includes('GK'))
  if (!keeper || keeper.player.ratings.goalkeeping < 70 || !keeper.player.positions.includes('GK')) {
    weakLinkCap = Math.min(weakLinkCap, 68)
    weakLinks.push('Emergency goalkeeper')
  } else if (keeper.player.ratings.goalkeeping < 82) {
    weakLinkCap = Math.min(weakLinkCap, 74)
    weakLinks.push('Goalkeeper can be targeted')
  }

  const compositeScore =
    ratings.overall * 0.5 +
    positionFit.average * 0.2 +
    chemistryReport.score * 0.18 +
    ((ratings.balance + chemistryReport.roleBalance) / 2) * 0.12
  const eliteSeparationBonus = 30 * sigmoid((compositeScore - 90) * 1.15)
  const separatedScore = 46 + (compositeScore - 78) * 1.55 + eliteSeparationBonus
  const cappedScore = Math.min(separatedScore, weakLinkCap)
  const weakLinkPenalty = Math.max(0, separatedScore - cappedScore)

  return {
    score: Math.round(clamp(cappedScore, 35, 96)),
    rawScore: round(compositeScore, 1),
    rawTeamRating: ratings.overall,
    positionFit: positionFit.average,
    minimumPositionFit: positionFit.minimum,
    chemistry: chemistryReport.score,
    roleBalance: Math.round((ratings.balance + chemistryReport.roleBalance) / 2),
    weakLinkCap,
    weakLinkPenalty: round(weakLinkPenalty, 1),
    weakLinks: [...new Set(weakLinks)].slice(0, 4),
  }
}

function weightedBucket(value: number): FixtureDifficulty['bucket'] {
  if (value < 0.32) return 'weak'
  if (value < 0.86) return 'average'
  if (value < 0.97) return 'strong'
  return 'elite'
}

function rangeForBucket(bucket: FixtureDifficulty['bucket'], distribution: ModeConfig['opponentDistribution'], modeId: string): [number, number] {
  const eliteShift = distribution === 'elite' ? (modeId === 'one_club' ? 6 : 5) : distribution === 'continental' || distribution === 'international' ? 2 : 0
  const leagueShift = distribution === 'league' ? (modeId === 'mls' ? -6 : 7) : 0
  const chaosShift = 0
  if (bucket === 'weak') return [32 + eliteShift + leagueShift, 45 + eliteShift + leagueShift + chaosShift]
  if (bucket === 'average') return [45 + eliteShift + leagueShift, 62 + eliteShift + leagueShift + chaosShift]
  if (bucket === 'strong') return [62 + eliteShift + leagueShift, 72 + eliteShift + leagueShift + chaosShift]
  return [72 + eliteShift + leagueShift, 80 + eliteShift + leagueShift + chaosShift]
}

function knockoutRange(phase: string, mode: ModeConfig): [number, number] {
  const lower = phase.toLowerCase()
  const shift = mode.opponentDistribution === 'elite' || mode.opponentDistribution === 'continental' ? 3 : mode.opponentDistribution === 'international' ? 1 : 0
  const modeAdjustment = mode.modeId === 'afcon' ? -5 : mode.modeId === 'mls' ? -10 : 0
  if (lower.includes('final')) return [78 + shift + modeAdjustment, 90 + shift + modeAdjustment]
  if (lower.includes('semi')) return [72 + shift + modeAdjustment, 84 + shift + modeAdjustment]
  if (lower.includes('quarter')) return [67 + shift + modeAdjustment, 79 + shift + modeAdjustment]
  if (lower.includes('round of 16') || lower.includes('round one') || lower.includes('first round')) return [62 + shift + modeAdjustment, 74 + shift + modeAdjustment]
  if (lower.includes('league phase')) return [56 + shift + modeAdjustment, 72 + shift + modeAdjustment]
  if (lower.includes('group')) return [48 + shift + modeAdjustment, 66 + shift + modeAdjustment]
  return [60 + shift + modeAdjustment, 76 + shift + modeAdjustment]
}

export function fixtureDifficulty(mode: ModeConfig, phase: string, rng: { next: () => number; between: (min: number, max: number) => number }): FixtureDifficulty {
  if (mode.usesKnockouts || mode.usesGroupStage || mode.usesLeaguePhase || mode.simulationFormat !== 'domestic') {
    const [min, max] = knockoutRange(phase, mode)
    const difficulty = round(rng.between(min, max), 1)
    return {
      difficulty,
      bucket: difficulty >= 72 ? 'elite' : difficulty >= 62 ? 'strong' : difficulty >= 45 ? 'average' : 'weak',
    }
  }

  const bucket = mode.opponentDistribution === 'chaos'
    ? (rng.next() < 0.12 ? 'elite' : rng.next() < 0.34 ? 'strong' : weightedBucket(rng.next()))
    : weightedBucket(rng.next())
  const [min, max] = rangeForBucket(bucket, mode.opponentDistribution, mode.modeId)
  return { bucket, difficulty: round(rng.between(min, max), 1) }
}

export function matchImportance({
  mode,
  matchNumber,
  phase,
  opponentDifficulty,
  perfectActive,
  unbeatenActive,
}: {
  mode: ModeConfig
  matchNumber: number
  phase: string
  opponentDifficulty: number
  perfectActive: boolean
  unbeatenActive: boolean
}): number {
  const phaseText = phase.toLowerCase()
  let importance = 1
  if (opponentDifficulty >= 70) importance += 0.25
  if (mode.simulationFormat === 'domestic' && matchNumber > Math.max(1, mode.matchCount - 8) && (perfectActive || unbeatenActive)) importance += perfectActive ? 0.55 : 0.35
  if (phaseText.includes('quarter')) importance += 0.25
  if (phaseText.includes('semi')) importance += 0.4
  if (phaseText.includes('final')) importance += 0.65
  if (phaseText.includes('group') || phaseText.includes('league phase')) importance -= 0.1
  return round(clamp(importance, 0.85, 2), 2)
}

export function baseDominanceProbabilities(dominanceDelta: number): MatchProbabilitySet {
  let win = clamp(sigmoid(0.052 * dominanceDelta - 0.06), 0.08, 0.91)
  let draw = clamp(0.025 + 0.22 * sigmoid(-0.065 * (dominanceDelta - 20)), 0.025, 0.235)
  const lossFloor = dominanceDelta >= 35 ? 0.025 : 0.035
  if (win + draw > 1 - lossFloor) {
    draw = Math.max(0.025, 1 - lossFloor - win)
    if (win + draw > 1 - lossFloor) win = 1 - lossFloor - draw
  }
  const loss = Math.max(lossFloor, 1 - win - draw)
  const total = win + draw + loss
  return {
    win: round(win / total, 4),
    draw: round(draw / total, 4),
    loss: round(loss / total, 4),
  }
}

export function drawConversionProbability(context: ConversionContext): number {
  const traitScore =
    context.ratings.pressResistance * 0.22 +
    context.ratings.bigGame * 0.2 +
    context.ratings.consistency * 0.2 +
    context.ratings.midfieldControl * 0.14 +
    context.ratings.attack * 0.1 +
    context.chemistry * 0.1 +
    context.ratings.goalkeeping * 0.04
  const qualityGate = clamp((context.effectiveScore - 70) / 24, 0, 1)
  const fitGate = clamp((context.positionFit - 78) / 20, 0, 1)
  const chemistryGate = clamp((context.chemistry - 68) / 26, 0, 1)
  const balanceGate = clamp((context.roleBalance - 72) / 24, 0, 1)
  const weakGate = clamp(1 - context.weakLinkPenalty / 18, 0.05, 1)
  const traitBase = clamp((traitScore - 70) / 30, 0, 1) * 0.24
  const dominanceBonus = clamp((context.dominanceDelta + 2) / 48, 0, 1) * 0.14
  const difficultyDrag = context.opponentDifficulty >= 72 ? 0.04 : context.opponentDifficulty >= 64 ? 0.02 : 0
  const pressureDrag = Math.max(0, context.matchImportance - 1) * clamp((86 - (context.ratings.pressResistance + context.ratings.bigGame + context.ratings.consistency) / 3) / 30, 0, 1) * 0.08
  return round(clamp((traitBase + dominanceBonus - difficultyDrag - pressureDrag) * qualityGate * fitGate * chemistryGate * balanceGate * weakGate, 0, 0.4), 4)
}

export function finalProbabilities(base: MatchProbabilitySet, conversionProbability: number): MatchProbabilitySet {
  const converted = base.draw * conversionProbability
  return {
    win: round(base.win + converted, 4),
    draw: round(base.draw - converted, 4),
    loss: base.loss,
  }
}

export function leagueInvincibleDrawLimit(matchCount: number): number {
  return Math.max(1, Math.round(matchCount * (3 / 38)))
}

export function classifyResultTier({
  mode,
  wins,
  draws,
  losses,
  stage,
  hadExtraTimeWin,
  hadPenaltyAdvance,
}: {
  mode: ModeConfig
  wins: number
  draws: number
  losses: number
  stage: string
  hadExtraTimeWin: boolean
  hadPenaltyAdvance: boolean
}): ResultTier {
  const champion = stage.toLowerCase().includes('champion')
  const matchCount = wins + draws + losses
  const winRate = matchCount ? wins / matchCount : 0
  let id: ResultTierId
  let label: string
  let description: string
  let rank: number

  if (mode.usesKnockouts || mode.simulationFormat !== 'domestic') {
    if (champion && losses === 0 && draws === 0 && !hadExtraTimeWin && !hadPenaltyAdvance) {
      id = 'perfect'
      label = 'Perfect'
      description = 'Every match was won in regulation.'
      rank = 800
    } else if (champion && losses === 0 && draws === 0 && hadExtraTimeWin && !hadPenaltyAdvance) {
      id = 'invincible'
      label = 'Invincible'
      description = 'The trophy was won, but at least one match needed extra time.'
      rank = 700
    } else if (champion && losses === 0) {
      id = 'undefeated'
      label = 'Undefeated'
      description = 'No match was lost, but penalties or draws kept it from perfection.'
      rank = 640
    } else if (losses === 0 && draws === 1) {
      id = 'perfect_near_miss'
      label = 'Perfect near-miss'
      description = 'One draw kept the tournament from being perfect.'
      rank = 590
    } else if (losses === 1 && draws === 0) {
      id = 'undefeated_near_miss'
      label = 'Undefeated near-miss'
      description = 'One loss broke an otherwise ruthless run.'
      rank = 560
    } else if (winRate >= 0.7 || stage.toLowerCase().includes('finalist')) {
      id = 'strong'
      label = 'Strong run'
      description = 'A serious run, but not clean enough for the top tier.'
      rank = 470
    } else if (winRate >= 0.45) {
      id = 'respectable'
      label = 'Respectable'
      description = 'Good moments, real flaws.'
      rank = 320
    } else {
      id = 'exposed'
      label = 'Exposed'
      description = 'The simulation found the cracks.'
      rank = 120
    }
  } else if (losses === 0 && draws === 0 && wins === mode.matchCount) {
    id = 'perfect'
    label = 'Perfect'
    description = 'Every league match was won.'
    rank = 800
  } else if (losses === 0 && draws === 1) {
    id = 'perfect_near_miss'
    label = 'Perfect near-miss'
    description = 'One draw kept the league from perfection.'
    rank = 690
  } else if (losses === 1 && draws === 0) {
    id = 'undefeated_near_miss'
    label = 'Undefeated near-miss'
    description = 'One loss broke a perfect-win chase.'
    rank = 560
  } else if (losses === 0 && draws <= leagueInvincibleDrawLimit(mode.matchCount)) {
    id = 'invincible'
    label = 'Invincible'
    description = `Zero losses with ${draws} draw${draws === 1 ? '' : 's'}.`
    rank = 700
  } else if (losses === 0) {
    id = 'undefeated'
    label = 'Undefeated'
    description = 'No losses, but too many draws for invincible perfection.'
    rank = 640
  } else if (winRate >= 0.74) {
    id = 'strong'
    label = 'Strong season'
    description = 'A title-level season with visible flaws.'
    rank = 470
  } else if (winRate >= 0.55) {
    id = 'respectable'
    label = 'Respectable'
    description = 'Decent, but not close to legendary.'
    rank = 320
  } else {
    id = 'exposed'
    label = 'Exposed'
    description = 'The balance was not strong enough.'
    rank = 120
  }

  return { id, label, description, rank }
}

export function modeDifficultyScore(modeId: string): number {
  if (['world_xi', 'ball_knowledge'].includes(modeId)) return 90
  if (['english_top_flight', 'premier_league', 'laliga', 'serie_a', 'bundesliga', 'ligue_1', 'chaos', 'manager', 'era_lock', 'one_club'].includes(modeId)) return 78
  if (['champions_league', 'classic_european_cup'].includes(modeId)) return 66
  if (['world_cup', 'euros', 'copa_america', 'afcon'].includes(modeId)) return 58
  if (['club_world_cup', 'nation_xi'].includes(modeId)) return 48
  return 50
}
