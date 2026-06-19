import { getModeConfig } from '../data/modes'
import { isBenchSlot } from '../data/squad'
import { calculateChemistry } from './chemistry'
import { clamp, createRng, round } from './random'
import { createShareText } from './share'
import {
  baseDominanceProbabilities,
  calculateEffectiveTeamQuality,
  classifyResultTier,
  drawConversionProbability,
  finalProbabilities,
  fixtureDifficulty,
  matchImportance,
  positionFitLabel,
  positionFitScore,
  scoringVersion,
} from './simulationModel'
import { calculateTeamRatings, inferTactic } from './tactics'
import type { ChaosEvent, CompetitionPhase, DraftPick, EffectiveTeamQuality, KeyMatch, MatchProbabilitySet, MatchTrace, ModeConfig, ReportPlayerDetail, RunResult, SimulationDetails, SquadReport, StreakReport, TacticalReason, TeamRatings, UnitScoreDetail } from '../types'

interface MatchOutcome {
  match: number
  phase: string
  outcome: 'W' | 'D' | 'L'
  baseOutcome: 'W' | 'D' | 'L'
  gf: number
  ga: number
  xgf: number
  xga: number
  pressure: number
  opponentDifficulty: number
  dominanceDelta: number
  matchImportance: number
  conversionProbability: number
  convertedDrawToWin: boolean
  baseProbabilities: MatchProbabilitySet
  finalProbabilities: MatchProbabilitySet
  resolution: NonNullable<MatchTrace['resolution']>
  advanced?: boolean
  note: string
}

interface RunProgress {
  currentWinStreak: number
  longestWinStreak: number
  currentUnbeatenStreak: number
  longestUnbeatenStreak: number
  perfectActive: boolean
  unbeatenActive: boolean
  perfectEndedMatch?: number
  unbeatenEndedMatch?: number
  hadExtraTimeWin: boolean
  hadPenaltyAdvance: boolean
}

type KnockoutRound = readonly [phase: string, matchCount: number, exitStage: string]

interface ChaosEventTemplate {
  title: string
  impact: ChaosEvent['impact']
  baseModifier: number
  variance: number
  note: string
}

const chaosEventTemplates: ChaosEventTemplate[] = [
  {
    title: 'Away trap',
    impact: 'negative',
    baseModifier: 2.7,
    variance: 1.4,
    note: 'A hostile away day dragged the XI into second balls and ugly clearances.',
  },
  {
    title: 'Red-card scare',
    impact: 'negative',
    baseModifier: 3.8,
    variance: 1.6,
    note: 'A reckless challenge forced the shape to survive on thinner margins.',
  },
  {
    title: 'Fixture congestion',
    impact: 'negative',
    baseModifier: 2.2,
    variance: 1.5,
    note: 'Heavy legs made the press late and the second half uncomfortable.',
  },
  {
    title: 'Tactical ambush',
    impact: 'negative',
    baseModifier: 3.1,
    variance: 1.8,
    note: 'The opponent overloaded the weak side and made the system solve problems fast.',
  },
  {
    title: 'Keeper masterclass',
    impact: 'positive',
    baseModifier: 3.2,
    variance: 1.4,
    note: 'The keeper turned two dangerous looks into nothing and steadied the run.',
  },
  {
    title: 'Early goal settles it',
    impact: 'positive',
    baseModifier: 2.4,
    variance: 1.2,
    note: 'A fast start tilted the match script before the opponent could breathe.',
  },
  {
    title: 'Bench call lands',
    impact: 'positive',
    baseModifier: 2.6,
    variance: 1.3,
    note: 'A late adjustment gave the XI cleaner passing lanes and calmer territory.',
  },
  {
    title: 'Derby temperature',
    impact: 'volatile',
    baseModifier: 2.6,
    variance: 1.7,
    note: 'The match turned emotional, physical, and hard to control.',
  },
  {
    title: 'Penalty swing',
    impact: 'volatile',
    baseModifier: 3.0,
    variance: 1.9,
    note: 'One box decision changed the rhythm and made the record feel fragile.',
  },
]

function average(values: number[]): number {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0
}

function logistic(value: number): number {
  return 1 / (1 + Math.exp(-value))
}

function sampleOutcome(probabilities: MatchProbabilitySet, rng: ReturnType<typeof createRng>): 'W' | 'D' | 'L' {
  const roll = rng.next()
  if (roll < probabilities.win) return 'W'
  if (roll < probabilities.win + probabilities.draw) return 'D'
  return 'L'
}

function normalish(rng: ReturnType<typeof createRng>): number {
  return rng.next() + rng.next() + rng.next() - 1.5
}

function scorelineForOutcome({
  outcome,
  dominanceDelta,
  rng,
  resolution,
  ratings,
  opponentDifficulty,
  pressure,
  matchImportance: importance,
  conversionProbability,
}: {
  outcome: 'W' | 'D' | 'L'
  dominanceDelta: number
  rng: ReturnType<typeof createRng>
  resolution: NonNullable<MatchTrace['resolution']>
  ratings: TeamRatings
  opponentDifficulty: number
  pressure: number
  matchImportance: number
  conversionProbability: number
}) {
  const attackEngine = (
    ratings.attack * 0.22 +
    ratings.finishing * 0.2 +
    ratings.chanceCreation * 0.18 +
    ratings.midfieldControl * 0.14 +
    ratings.ballProgression * 0.1 +
    ratings.pressResistance * 0.08 +
    ratings.chemistry * 0.08
  )
  const defensiveSecurity = (
    ratings.defense * 0.24 +
    ratings.defensiveSolidity * 0.22 +
    ratings.goalkeeping * 0.2 +
    ratings.defensiveTransitions * 0.14 +
    ratings.pressResistance * 0.1 +
    ratings.chemistry * 0.1
  )
  const pressureLoad = clamp((pressure * importance) / 18, 0, 1.15)
  const pressureComposure = clamp((ratings.bigGame * 0.36 + ratings.consistency * 0.34 + ratings.pressResistance * 0.3) / 100, 0.35, 1)
  const expectedGoalsFor = clamp(
    1.16 +
      dominanceDelta * 0.016 +
      (attackEngine - 78) * 0.025 -
      Math.max(0, opponentDifficulty - 58) * 0.006 -
      pressureLoad * (1 - pressureComposure) * 0.74 +
      conversionProbability * 0.82 +
      normalish(rng) * 0.18,
    0.25,
    4.4,
  )
  const expectedGoalsAgainst = clamp(
    1.08 -
      dominanceDelta * 0.012 +
      (opponentDifficulty - 55) * 0.017 -
      (defensiveSecurity - 78) * 0.022 +
      pressureLoad * (1 - defensiveSecurity / 105) * 0.68 +
      normalish(rng) * 0.17,
    0.2,
    4,
  )
  if (outcome === 'D') {
    const drawGoals = rng.next() < 0.34 ? 0 : rng.next() < 0.78 ? 1 : 2
    return {
      gf: drawGoals,
      ga: drawGoals,
      xgf: round(expectedGoalsFor, 1),
      xga: round(expectedGoalsAgainst, 1),
    }
  }

  const expectedMargin = expectedGoalsFor - expectedGoalsAgainst
  const margin = clamp(Math.round(Math.abs(expectedMargin) * 0.72 + Math.abs(dominanceDelta) * 0.035 + normalish(rng) * 1.25 + 1), 1, 6)
  const losingXg = outcome === 'W' ? expectedGoalsAgainst : expectedGoalsFor
  const loserGoals = clamp(Math.floor(Math.max(0, losingXg + normalish(rng) * 0.9)), 0, 3)
  const winnerGoals = clamp(loserGoals + margin + (resolution === 'extra_time_win' || resolution === 'extra_time_loss' ? 1 : 0), 1, 8)
  return outcome === 'W'
    ? { gf: winnerGoals, ga: loserGoals, xgf: round(expectedGoalsFor, 1), xga: round(expectedGoalsAgainst, 1) }
    : { gf: loserGoals, ga: winnerGoals, xgf: round(expectedGoalsFor, 1), xga: round(expectedGoalsAgainst, 1) }
}

function tieBreakEdge(ratings: TeamRatings, effectiveTeamQuality: EffectiveTeamQuality, opponentDifficulty: number): number {
  const mentality = ratings.goalkeeping * 0.22 + ratings.bigGame * 0.22 + ratings.consistency * 0.18 + ratings.pressResistance * 0.16 + ratings.chemistry * 0.12 + effectiveTeamQuality.score * 0.1
  return clamp(0.5 + (mentality - opponentDifficulty - 18) / 95, 0.28, 0.78)
}

function matchNote(outcome: 'W' | 'D' | 'L', gf: number, ga: number, xgf: number, xga: number, pressure: number, resolution: NonNullable<MatchTrace['resolution']>): string {
  const margin = gf - ga
  if (resolution === 'extra_time_win') return `Won after extra time, ${gf}-${ga}; the XI found one more gear under pressure.`
  if (resolution === 'extra_time_loss') return `Lost after extra time, ${gf}-${ga}; pressure exposed the margin.`
  if (resolution === 'penalties_win') return `Advanced on penalties after a ${gf}-${ga} draw.`
  if (resolution === 'penalties_loss') return `Lost on penalties after a ${gf}-${ga} draw.`
  if (resolution === 'late_winner') return `Turned a draw into a late ${gf}-${ga} win through control and nerve.`
  if (outcome === 'W' && margin >= 3) return `The XI controlled the game state and turned ${xgf.toFixed(1)} xG into a statement win.`
  if (outcome === 'W' && pressure >= 12) return `Won through pressure: ${gf}-${ga}, with the defensive base holding ${xga.toFixed(1)} xGA.`
  if (outcome === 'W') return `Professional win, ${gf}-${ga}, with the stronger unit protecting the margin.`
  if (outcome === 'D') return `Perfection slipped in a ${gf}-${ga} draw after ${xga.toFixed(1)} xGA kept the opponent alive.`
  return `The run cracked ${gf}-${ga}; pressure ${round(pressure, 1)} exposed the weakest unit.`
}

function simulateMatch({
  mode,
  ratings,
  effectiveTeamQuality,
  rngSeed,
  pressure = 0,
  match = 1,
  phase = 'Match',
  progress,
  knockout = false,
}: {
  mode: ModeConfig
  ratings: TeamRatings
  effectiveTeamQuality: EffectiveTeamQuality
  rngSeed: string
  pressure?: number
  match?: number
  phase?: string
  progress: RunProgress
  knockout?: boolean
}): MatchOutcome {
  const rng = createRng(rngSeed)
  const fixture = fixtureDifficulty(mode, phase, rng)
  const importance = matchImportance({
    mode,
    matchNumber: match,
    phase,
    opponentDifficulty: fixture.difficulty,
    perfectActive: progress.perfectActive,
    unbeatenActive: progress.unbeatenActive,
  })
  const pressureAdjustment = clamp((pressure * importance) / 4.5, 0, 9)
  const dominanceDelta = round(effectiveTeamQuality.score - fixture.difficulty - pressureAdjustment, 1)
  const baseProbabilities = baseDominanceProbabilities(dominanceDelta)
  const conversionProbability = drawConversionProbability({
    ratings,
    effectiveScore: effectiveTeamQuality.score,
    positionFit: effectiveTeamQuality.positionFit,
    chemistry: effectiveTeamQuality.chemistry,
    roleBalance: effectiveTeamQuality.roleBalance,
    weakLinkPenalty: effectiveTeamQuality.weakLinkPenalty,
    opponentDifficulty: fixture.difficulty,
    dominanceDelta,
    matchImportance: importance,
  })
  const adjustedProbabilities = finalProbabilities(baseProbabilities, conversionProbability)
  const baseOutcome = sampleOutcome(baseProbabilities, rng)
  const convertedDrawToWin = baseOutcome === 'D' && rng.next() < conversionProbability
  let outcome: 'W' | 'D' | 'L' = convertedDrawToWin ? 'W' : baseOutcome
  let resolution: NonNullable<MatchTrace['resolution']> = convertedDrawToWin ? 'late_winner' : 'regulation'
  let advanced: boolean | undefined

  if (knockout && outcome === 'D') {
    const edge = tieBreakEdge(ratings, effectiveTeamQuality, fixture.difficulty)
    const extraTimeDecisive = rng.next() < clamp(0.28 + Math.abs(dominanceDelta) / 140, 0.22, 0.52)
    if (extraTimeDecisive) {
      outcome = rng.next() < edge ? 'W' : 'L'
      resolution = outcome === 'W' ? 'extra_time_win' : 'extra_time_loss'
      advanced = outcome === 'W'
    } else {
      resolution = rng.next() < edge ? 'penalties_win' : 'penalties_loss'
      advanced = resolution === 'penalties_win'
    }
  }

  const { gf, ga, xgf: roundedXgf, xga: roundedXga } = scorelineForOutcome({
    outcome,
    dominanceDelta,
    rng,
    resolution,
    ratings,
    opponentDifficulty: fixture.difficulty,
    pressure,
    matchImportance: importance,
    conversionProbability,
  })

  return {
    match,
    phase,
    outcome,
    baseOutcome,
    gf,
    ga,
    xgf: roundedXgf,
    xga: roundedXga,
    pressure: round(pressure, 1),
    opponentDifficulty: fixture.difficulty,
    dominanceDelta,
    matchImportance: importance,
    conversionProbability,
    convertedDrawToWin,
    baseProbabilities,
    finalProbabilities: adjustedProbabilities,
    resolution,
    advanced,
    note: matchNote(outcome, gf, ga, roundedXgf, roundedXga, pressure, resolution),
  }
}

function createChaosEvent(seed: string, matchNumber: number, phase: string): ChaosEvent | undefined {
  const rng = createRng(`${seed}:chaos:${phase}:${matchNumber}`)
  const scheduledEvent = matchNumber === 3 || matchNumber % 6 === 0 || matchNumber % 11 === 0
  if (!scheduledEvent && rng.next() > 0.22) return undefined

  const template = rng.pick(chaosEventTemplates)
  let modifier = template.baseModifier + rng.between(0, template.variance)

  if (template.impact === 'positive') {
    modifier *= -1
  }

  if (template.impact === 'volatile' && rng.next() < 0.5) {
    modifier *= -1
  }

  return {
    match: matchNumber,
    phase,
    title: template.title,
    impact: template.impact,
    modifier: round(modifier, 1),
    note: template.note,
  }
}

function getDomesticStage(mode: ModeConfig, wins: number, draws: number, losses: number): string {
  const points = wins * 3 + draws
  if (losses === 0 && wins === mode.matchCount) return 'Perfect league champion'
  if (losses === 0) return 'Invincible league champion'
  if (points >= mode.matchCount * 2.45) return 'League champion'
  if (points >= mode.matchCount * 2.1) return 'Title race'
  return 'Top-four fight'
}

function pickUnit(pick: DraftPick): 'goalkeeper' | 'defense' | 'midfield' | 'attack' {
  if (pick.slot.accepts.includes('GK')) return 'goalkeeper'
  if (pick.slot.accepts.some((position) => ['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(position))) return 'defense'
  if (pick.slot.accepts.some((position) => ['DM', 'CM', 'AM', 'LM', 'RM'].includes(position))) return 'midfield'
  return 'attack'
}

function chemistryContributionForPick(pick: DraftPick, picks: DraftPick[]): number {
  return picks.reduce((score, teammate) => {
    if (teammate.player.contextId === pick.player.contextId) return score
    let nextScore = score
    if (teammate.player.teamName === pick.player.teamName) nextScore += 2
    if (teammate.player.country === pick.player.country) nextScore += 1.5
    if (teammate.player.eraLabel === pick.player.eraLabel) nextScore += 1
    return nextScore
  }, 0)
}

function playerContributionDetail(picks: DraftPick[], type: 'best' | 'weak', excludePlayerName?: string): ReportPlayerDetail {
  if (picks.length === 0) {
    return { playerName: 'No standout', slotLabel: 'XI', score: 0, reason: 'No completed XI was available to evaluate.' }
  }

  const teamAverage = average(picks.map(scorePickForSlot))
  const details = picks.map((pick) => {
    const fit = positionFitScore(pick.slot, pick.player)
    const roleScore = scorePickForSlot(pick)
    const chemistryBoost = chemistryContributionForPick(pick, picks)
    const clutch = pick.player.ratings.bigGame * 0.42 + pick.player.ratings.press * 0.34 + pick.player.ratings.physical * 0.24
    const unit = pickUnit(pick)
    const spineWeight = unit === 'goalkeeper' ? 1.18 : pick.slot.accepts.some((position) => ['CB', 'DM', 'CM', 'ST'].includes(position)) ? 1.08 : 1
    const contribution = round((roleScore * 0.5 + fit * 0.18 + clutch * 0.14 + Math.min(chemistryBoost, 18) * 0.7 + teamAverage * 0.08) * spineWeight, 1)
    const weakCost = round(
      Math.max(0, 100 - fit) * 0.38 +
        Math.max(0, teamAverage - roleScore) * 0.5 +
        Math.max(0, 78 - clutch) * 0.15 +
        (unit === 'goalkeeper' ? Math.max(0, 86 - pick.player.ratings.goalkeeping) * 0.28 : 0) -
        Math.min(chemistryBoost, 14) * 0.25,
      1,
    )
    return { pick, fit, roleScore, chemistryBoost, clutch, contribution, weakCost, unit }
  })

  if (type === 'best') {
    const best = [...details].sort((left, right) => (
      right.contribution - left.contribution ||
      right.chemistryBoost - left.chemistryBoost ||
      right.pick.player.ratings.bigGame - left.pick.player.ratings.bigGame ||
      right.roleScore - left.roleScore
    ))[0]
    const fitLine = positionFitLabel(best.fit).toLowerCase()
    const chemistryLine = best.chemistryBoost >= 8 ? ` and ${round(best.chemistryBoost, 1)} chemistry-link points` : ''
    return {
      playerName: best.pick.player.displayName,
      slotLabel: best.pick.slot.label,
      score: best.contribution,
      reason: `${best.pick.slot.label} was a ${fitLine}; role score ${round(best.roleScore, 1)}, clutch profile ${round(best.clutch, 1)}${chemistryLine}.`,
    }
  }

  const weakPool = excludePlayerName && details.length > 1 ? details.filter((detail) => detail.pick.player.displayName !== excludePlayerName) : details
  const weak = [...weakPool].sort((left, right) => (
    right.weakCost - left.weakCost ||
    left.fit - right.fit ||
    left.roleScore - right.roleScore
  ))[0]
  const fitPenalty = 100 - weak.fit
  let reason = `${weak.pick.slot.label} carried the lowest support cost: role score ${round(weak.roleScore, 1)} vs XI average ${round(teamAverage, 1)}.`
  if (weak.weakCost < 6) reason = `No major single weak link; ${weak.pick.slot.label} was just the smallest edge in a balanced XI.`
  else if (fitPenalty >= 14) reason = `${weak.pick.slot.label} was a ${positionFitLabel(weak.fit).toLowerCase()} with a ${round(fitPenalty, 1)}-point position-fit drag.`
  else if (weak.unit === 'goalkeeper' && weak.pick.player.ratings.goalkeeping < 82) reason = `Goalkeeper security was light at ${weak.pick.player.ratings.goalkeeping}, so high-difficulty fixtures had less safety net.`
  else if (weak.chemistryBoost < 2) reason = `${weak.pick.slot.label} was isolated chemically and did not add enough links to the XI.`

  return {
    playerName: weak.pick.player.displayName,
    slotLabel: weak.pick.slot.label,
    score: weak.weakCost,
    reason,
  }
}

function unitScores(ratings: TeamRatings): Array<{ label: string; score: number }> {
  return [
    { label: 'Attack', score: ratings.attack },
    { label: 'Midfield', score: ratings.midfield },
    { label: 'Defense', score: ratings.defense },
    { label: 'Goalkeeping', score: ratings.goalkeeping },
    { label: 'Chemistry', score: ratings.chemistry },
    { label: 'Big-game mentality', score: ratings.bigGame },
  ]
}

function unitScoreDetails(ratings: TeamRatings, matches: MatchTrace[]): UnitScoreDetail[] {
  const xgFor = round(average(matches.map((match) => match.xgFor)), 2)
  const xgAgainst = round(average(matches.map((match) => match.xgAgainst)), 2)
  const drawShare = matches.length ? matches.filter((match) => match.outcome === 'D').length / matches.length : 0
  const lossShare = matches.length ? matches.filter((match) => match.outcome === 'L').length / matches.length : 0
  return [
    {
      label: 'Attack',
      score: ratings.attack,
      reason: `Finishing ${ratings.finishing} and chance creation ${ratings.chanceCreation} produced ${xgFor} xG per match.`,
    },
    {
      label: 'Midfield',
      score: ratings.midfield,
      reason: `Control ${ratings.midfieldControl}, progression ${ratings.ballProgression}, and press resistance ${ratings.pressResistance} shaped the dominance delta.`,
    },
    {
      label: 'Defense',
      score: ratings.defense,
      reason: `Solidity ${ratings.defensiveSolidity} and transition defense ${ratings.defensiveTransitions} held xGA to ${xgAgainst} per match.`,
    },
    {
      label: 'Goalkeeping',
      score: ratings.goalkeeping,
      reason: `Keeper quality ${ratings.goalkeeping} influenced loss risk and knockout tie-break edges.`,
    },
    {
      label: 'Chemistry',
      score: ratings.chemistry,
      reason: `Chemistry ${ratings.chemistry} fed team quality and draw-to-win conversion gates.`,
    },
    {
      label: 'Big-game mentality',
      score: ratings.bigGame,
      reason: `Big-game rating ${ratings.bigGame} and consistency ${ratings.consistency} mattered most in high-pressure matches.`,
    },
    {
      label: 'Balance',
      score: ratings.balance,
      reason: `Balance ${ratings.balance} kept role overloads in check; draws ${Math.round(drawShare * 100)}%, losses ${Math.round(lossShare * 100)}%.`,
    },
  ]
}

function strongestUnit(ratings: TeamRatings): string {
  return [...unitScores(ratings)].sort((left, right) => right.score - left.score)[0]?.label ?? 'No clear strength'
}

function weakestUnit(ratings: TeamRatings): string {
  return [...unitScores(ratings)].sort((left, right) => left.score - right.score)[0]?.label ?? 'No clear weakness'
}

function dominanceReason(unit: string, ratings: TeamRatings): string {
  if (unit === 'Attack') return `The attack carried real edge: finishing ${ratings.finishing}, chance creation ${ratings.chanceCreation}.`
  if (unit === 'Midfield') return `The midfield gave the XI control: progression ${ratings.ballProgression}, press resistance ${ratings.pressResistance}.`
  if (unit === 'Defense') return `The defensive base traveled well: solidity ${ratings.defensiveSolidity}, transitions ${ratings.defensiveTransitions}.`
  if (unit === 'Goalkeeping') return `The keeper profile gave the run a safety net at ${ratings.goalkeeping}.`
  if (unit === 'Chemistry') return `The XI made football sense, with chemistry at ${ratings.chemistry}.`
  if (unit === 'Balance') return `The role balance kept every unit connected at ${ratings.balance}.`
  return `The big-game profile gave the run nerve at ${ratings.bigGame}.`
}

function failureReason(unit: string, chemistryWarnings: string[], tacticWeaknesses: string[], details: SimulationDetails): string {
  if (chemistryWarnings.length) return chemistryWarnings[0]
  if (tacticWeaknesses.length) return `The ${tacticWeaknesses[0]} kept the margins thin.`
  if (unit === 'Goalkeeping') return `The goalkeeper unit looked vulnerable, with an average loss probability around ${details.averageLossProbability}%.`
  if (unit === 'Defense') return `Defensive pressure built up: xGA sat near ${details.expectedGoalsAgainstPerMatch} per match.`
  if (unit === 'Midfield') return 'The midfield could not always turn territory into control.'
  if (unit === 'Attack') return `The attack left too many matches alive: xG settled near ${details.expectedGoalsForPerMatch} per match.`
  if (unit === 'Balance') return 'The XI had talent, but the unit balance did not keep every phase connected.'
  return 'The run lacked one dominant phase when the schedule got mean.'
}

function scorePickForSlot(pick: DraftPick): number {
  if (pick.slot.accepts.includes('GK')) return pick.player.ratings.goalkeeping
  if (pick.slot.accepts.some((position) => ['CB', 'LB', 'RB', 'LWB', 'RWB', 'DM'].includes(position))) {
    return pick.player.ratings.defense * 0.6 + pick.player.ratings.physical * 0.24 + pick.player.ratings.press * 0.16
  }
  if (pick.slot.accepts.some((position) => ['CM', 'AM', 'LM', 'RM'].includes(position))) {
    return pick.player.ratings.control * 0.42 + pick.player.ratings.creation * 0.34 + pick.player.ratings.press * 0.24
  }
  return pick.player.ratings.attack * 0.62 + pick.player.ratings.creation * 0.2 + pick.player.ratings.physical * 0.18
}

function benchCovers(benchPicks: DraftPick[], positions: string[]): boolean {
  return benchPicks.some((pick) => pick.player.positions.some((position) => positions.includes(position)))
}

function createSquadReport(starterPicks: DraftPick[], benchPicks: DraftPick[]): SquadReport {
  const coverageChecks = [
    benchCovers(benchPicks, ['GK']),
    benchCovers(benchPicks, ['CB', 'LB', 'RB', 'LWB', 'RWB']),
    benchCovers(benchPicks, ['DM', 'CM']),
    benchCovers(benchPicks, ['AM', 'CM', 'LM', 'RM']),
    benchCovers(benchPicks, ['LW', 'RW', 'LM', 'RM']),
    benchCovers(benchPicks, ['ST', 'CF']),
  ]
  const rotationCoverage = coverageChecks.filter(Boolean).length
  const depthAverage = average(benchPicks.map(scorePickForSlot))
  const starterAverage = average(starterPicks.map(scorePickForSlot))
  const depthScore = Math.round(clamp(depthAverage * 0.72 + rotationCoverage * 4.6 + Math.min(benchPicks.length, 7) * 1.2, 35, 100))
  const benchImpact = round(clamp((depthScore - 72) / 8 + (depthAverage - starterAverage) / 22, -4, 4), 1)
  const warnings: string[] = []
  const bonuses: string[] = []

  if (!coverageChecks[0]) warnings.push('No backup keeper. One bad draw can turn into emergency football.')
  if (!coverageChecks[1]) warnings.push('Defensive cover is thin for a long season.')
  if (!coverageChecks[2]) warnings.push('No real midfield rotation. Legs may go late in the run.')
  if (!coverageChecks[5]) warnings.push('No bench finisher if the starter goes cold.')
  if (rotationCoverage >= 5) bonuses.push('The bench covers most rotation problems.')
  if (benchImpact > 1.5) bonuses.push('The depth actually lowers season pressure.')
  if (benchPicks.length >= 7 && depthScore >= 82) bonuses.push('This looks like a proper matchday squad, not just eleven names.')

  return {
    depthScore,
    rotationCoverage,
    benchImpact,
    warnings,
    bonuses,
  }
}

function explain(result: {
  losses: number
  draws: number
  chemistryWarnings: string[]
  tacticWeaknesses: string[]
  ratingsBalance: number
  weakestUnit: string
  firstDamage?: MatchTrace
}): string {
  if (result.losses === 0 && result.draws === 0) return 'Everything clicked. Elite spine, enough control, and the big names showed up when the season tried to bite.'
  if (result.losses === 0) return result.chemistryWarnings[0] ?? `The XI never lost, but ${result.firstDamage ? `${result.firstDamage.phase} match ${result.firstDamage.match}` : 'a tight game'} turned perfection into a near miss.`
  if (result.chemistryWarnings.length) return result.chemistryWarnings[0]
  if (result.tacticWeaknesses.length) return `The ${result.tacticWeaknesses[0]} showed up at the worst time.`
  if (result.ratingsBalance < 76) return `Star names, but broken balance. The ${result.weakestUnit.toLowerCase()} kept dragging the XI into awkward matches.`
  return result.firstDamage ? `${result.firstDamage.phase} match ${result.firstDamage.match} decided the story: ${result.firstDamage.note}` : 'The margins were brutal. A bad bounce, a cold finisher, and the perfect run disappeared.'
}

function toMatchTrace(outcome: MatchOutcome): MatchTrace {
  return {
    match: outcome.match,
    phase: outcome.phase,
    outcome: outcome.outcome,
    result: `${outcome.gf}-${outcome.ga}`,
    goalsFor: outcome.gf,
    goalsAgainst: outcome.ga,
    xgFor: outcome.xgf,
    xgAgainst: outcome.xga,
    pressure: outcome.pressure,
    opponentDifficulty: outcome.opponentDifficulty,
    dominanceDelta: outcome.dominanceDelta,
    matchImportance: outcome.matchImportance,
    baseOutcome: outcome.baseOutcome,
    convertedDrawToWin: outcome.convertedDrawToWin,
    conversionProbability: outcome.conversionProbability,
    baseProbabilities: outcome.baseProbabilities,
    finalProbabilities: outcome.finalProbabilities,
    resolution: outcome.resolution,
    advanced: outcome.advanced,
    note: outcome.note,
  }
}

function matchTraceFromPhases(phases: CompetitionPhase[]): MatchTrace[] {
  return phases.flatMap((phase) => phase.matches)
}

function keyMatches(mode: ModeConfig, matches: MatchTrace[]): KeyMatch[] {
  if (matches.length === 0) return []
  const keyMatches: KeyMatch[] = []
  const seen = new Set<string>()
  const wins = matches.filter((match) => match.outcome === 'W')
  const nonWins = matches.filter((match) => match.outcome !== 'W')
  const losses = matches.filter((match) => match.outcome === 'L')
  const addMatch = (label: string, match?: MatchTrace, extra = '') => {
    if (!match || seen.has(label)) return
    seen.add(label)
    keyMatches.push({
      label,
      result: match.result,
      note: `${match.phase} match ${match.match}. ${extra}${match.note}`,
    })
  }
  const statement = [...wins].sort((left, right) => (
    (right.goalsFor - right.goalsAgainst) - (left.goalsFor - left.goalsAgainst)
    || right.xgFor - left.xgFor
  ))[0]
  const closestEscape = [...wins].sort((left, right) => (
    (left.goalsFor - left.goalsAgainst) - (right.goalsFor - right.goalsAgainst)
    || (right.xgAgainst - right.xgFor) - (left.xgAgainst - left.xgFor)
    || (right.pressure * (right.matchImportance ?? 1)) - (left.pressure * (left.matchImportance ?? 1))
  ))[0]
  const worstResult = [...matches].sort((left, right) => (
    (left.outcome === 'L' ? -20 : left.outcome === 'D' ? -8 : 0) - (right.outcome === 'L' ? -20 : right.outcome === 'D' ? -8 : 0)
    || (left.goalsFor - left.goalsAgainst) - (right.goalsFor - right.goalsAgainst)
    || (right.opponentDifficulty ?? 0) - (left.opponentDifficulty ?? 0)
  ))[0]
  const highestPressure = [...matches].sort((left, right) => (
    (right.pressure * (right.matchImportance ?? 1)) - (left.pressure * (left.matchImportance ?? 1))
    || (right.opponentDifficulty ?? 0) - (left.opponentDifficulty ?? 0)
  ))[0]
  const finalMatch = matches.at(-1)

  addMatch('Perfect run ended', nonWins[0])
  addMatch('Undefeated run ended', losses[0])
  addMatch('Biggest win', statement)
  addMatch(losses.length || nonWins.length ? 'Worst result' : 'Closest escape', losses.length || nonWins.length ? worstResult : closestEscape)
  addMatch('Highest pressure', highestPressure, `Pressure ${round(highestPressure?.pressure ?? 0, 1)}, opponent ${round(highestPressure?.opponentDifficulty ?? 0, 1)}. `)
  addMatch(mode.usesKnockouts ? finalMatch?.phase ?? 'Final match' : 'Run-in', finalMatch)

  return keyMatches.slice(0, 6)
}

function summarizePhase(phase: string, outcomes: MatchOutcome[], outcome: string): CompetitionPhase {
  return {
    phase,
    record: {
      wins: outcomes.filter((match) => match.outcome === 'W').length,
      draws: outcomes.filter((match) => match.outcome === 'D').length,
      losses: outcomes.filter((match) => match.outcome === 'L').length,
    },
    goalsFor: outcomes.reduce((sum, match) => sum + match.gf, 0),
    goalsAgainst: outcomes.reduce((sum, match) => sum + match.ga, 0),
    xgFor: round(outcomes.reduce((sum, match) => sum + match.xgf, 0), 1),
    xgAgainst: round(outcomes.reduce((sum, match) => sum + match.xga, 0), 1),
    outcome,
    matches: outcomes.map(toMatchTrace),
  }
}

function recordFromPhases(phases: CompetitionPhase[]) {
  return phases.reduce(
    (record, phase) => ({
      wins: record.wins + phase.record.wins,
      draws: record.draws + phase.record.draws,
      losses: record.losses + phase.record.losses,
    }),
    { wins: 0, draws: 0, losses: 0 },
  )
}

function totalsFromPhases(phases: CompetitionPhase[]) {
  return phases.reduce(
    (totals, phase) => ({
      goalsFor: totals.goalsFor + phase.goalsFor,
      goalsAgainst: totals.goalsAgainst + phase.goalsAgainst,
      xgFor: round(totals.xgFor + phase.xgFor, 1),
      xgAgainst: round(totals.xgAgainst + phase.xgAgainst, 1),
    }),
    { goalsFor: 0, goalsAgainst: 0, xgFor: 0, xgAgainst: 0 },
  )
}

function createRunProgress(): RunProgress {
  return {
    currentWinStreak: 0,
    longestWinStreak: 0,
    currentUnbeatenStreak: 0,
    longestUnbeatenStreak: 0,
    perfectActive: true,
    unbeatenActive: true,
    hadExtraTimeWin: false,
    hadPenaltyAdvance: false,
  }
}

function updateRunProgress(progress: RunProgress, outcome: MatchOutcome): void {
  if (outcome.outcome === 'W') progress.currentWinStreak += 1
  else {
    if (progress.perfectActive) progress.perfectEndedMatch = outcome.match
    progress.perfectActive = false
    progress.currentWinStreak = 0
  }

  if (outcome.outcome !== 'L') progress.currentUnbeatenStreak += 1
  else {
    if (progress.unbeatenActive) progress.unbeatenEndedMatch = outcome.match
    progress.unbeatenActive = false
    progress.currentUnbeatenStreak = 0
  }

  progress.longestWinStreak = Math.max(progress.longestWinStreak, progress.currentWinStreak)
  progress.longestUnbeatenStreak = Math.max(progress.longestUnbeatenStreak, progress.currentUnbeatenStreak)
  if (outcome.resolution === 'extra_time_win') progress.hadExtraTimeWin = true
  if (outcome.resolution === 'penalties_win') progress.hadPenaltyAdvance = true
}

function progressToStreaks(progress: RunProgress): StreakReport {
  return {
    currentWinStreak: progress.currentWinStreak,
    longestWinStreak: progress.longestWinStreak,
    currentUnbeatenStreak: progress.currentUnbeatenStreak,
    longestUnbeatenStreak: progress.longestUnbeatenStreak,
    perfectEndedMatch: progress.perfectEndedMatch,
    unbeatenEndedMatch: progress.unbeatenEndedMatch,
  }
}

function simulatePhaseMatches(
  mode: ModeConfig,
  count: number,
  ratings: TeamRatings,
  effectiveTeamQuality: EffectiveTeamQuality,
  seed: string,
  pressure: number,
  progress: RunProgress,
  offset = 0,
  phase = 'Match',
  chaosEvents?: ChaosEvent[],
  knockout = false,
): MatchOutcome[] {
  const eventSink = chaosEvents
  return Array.from({ length: count }, (_, index) => {
    const matchIndex = offset + index
    const matchNumber = matchIndex + 1
    const chaosEvent = eventSink ? createChaosEvent(seed, matchNumber, phase) : undefined
    if (chaosEvent && eventSink) {
      eventSink.push(chaosEvent)
    }

    const outcome = simulateMatch({
      mode,
      ratings,
      effectiveTeamQuality,
      rngSeed: `${seed}:match:${matchIndex}`,
      pressure: pressure + matchIndex * 0.03 + (chaosEvent?.modifier ?? 0),
      match: matchNumber,
      phase,
      progress,
      knockout,
    })
    updateRunProgress(progress, outcome)
    return outcome
  })
}

function aggregateAdvance(outcomes: MatchOutcome[], ratings: TeamRatings, effectiveTeamQuality: EffectiveTeamQuality, seed: string): boolean {
  if (outcomes.length === 1 && typeof outcomes[0].advanced === 'boolean') return outcomes[0].advanced
  const gf = outcomes.reduce((sum, match) => sum + match.gf, 0)
  const ga = outcomes.reduce((sum, match) => sum + match.ga, 0)
  if (gf > ga) return true
  if (gf < ga) return false
  const rng = createRng(`${seed}:pens:${gf}:${ga}`)
  const finalMatch = outcomes.at(-1)
  const opponentDifficulty = finalMatch?.opponentDifficulty ?? 65
  const advanced = rng.next() < tieBreakEdge(ratings, effectiveTeamQuality, opponentDifficulty)
  if (finalMatch) {
    finalMatch.resolution = advanced ? 'penalties_win' : 'penalties_loss'
    finalMatch.advanced = advanced
    finalMatch.note = advanced ? `Advanced on penalties after an aggregate draw.` : `Lost on penalties after an aggregate draw.`
  }
  return advanced
}

function simulateKnockoutRounds({
  phases,
  rounds,
  championStage,
  mode,
  ratings,
  effectiveTeamQuality,
  seed,
  pressure,
  progress,
  offset,
  chaosEvents,
  pressureStep = 2.4,
}: {
  phases: CompetitionPhase[]
  rounds: readonly KnockoutRound[]
  championStage: string
  mode: ModeConfig
  ratings: TeamRatings
  effectiveTeamQuality: EffectiveTeamQuality
  seed: string
  pressure: number
  progress: RunProgress
  offset: number
  chaosEvents?: ChaosEvent[]
  pressureStep?: number
}): { phases: CompetitionPhase[]; stage: string } {
  let nextOffset = offset

  for (let index = 0; index < rounds.length; index += 1) {
    const [roundName, matchCount, exitStage] = rounds[index]
    const matches = simulatePhaseMatches(mode, matchCount, ratings, effectiveTeamQuality, seed, pressure + index * pressureStep, progress, nextOffset, roundName, chaosEvents, matchCount === 1)
    nextOffset += matchCount
    const advanced = aggregateAdvance(matches, ratings, effectiveTeamQuality, `${seed}:${roundName}`)
    if (!advanced) {
      phases.push(summarizePhase(roundName, matches, exitStage))
      return { phases, stage: exitStage }
    }

    phases.push(summarizePhase(roundName, matches, index === rounds.length - 1 ? championStage : 'Advanced'))
  }

  return { phases, stage: championStage }
}

function simulateGroupKnockoutPath({
  mode,
  groupPhaseName,
  championStage,
  ratings,
  effectiveTeamQuality,
  seed,
  pressure,
  progress,
  rounds,
  chaosEvents,
}: {
  mode: ModeConfig
  groupPhaseName: string
  championStage: string
  ratings: TeamRatings
  effectiveTeamQuality: EffectiveTeamQuality
  seed: string
  pressure: number
  progress: RunProgress
  rounds: readonly KnockoutRound[]
  chaosEvents?: ChaosEvent[]
}): { phases: CompetitionPhase[]; stage: string } {
  const group = simulatePhaseMatches(mode, 3, ratings, effectiveTeamQuality, seed, pressure, progress, 0, groupPhaseName, chaosEvents)
  const groupSummary = summarizePhase(groupPhaseName, group, 'Qualified for knockouts')
  const groupPoints = groupSummary.record.wins * 3 + groupSummary.record.draws
  if (groupPoints < 4) {
    return { phases: [summarizePhase(groupPhaseName, group, `${groupPhaseName} exit`)], stage: `${groupPhaseName} exit` }
  }

  return simulateKnockoutRounds({
    phases: [groupSummary],
    rounds,
    championStage,
    mode,
    ratings,
    effectiveTeamQuality,
    seed: `${seed}:${mode.modeId}`,
    pressure: pressure + 2,
    progress,
    offset: 3,
    chaosEvents,
  })
}

function simulateCompetitionPath(
  mode: ModeConfig,
  ratings: TeamRatings,
  effectiveTeamQuality: EffectiveTeamQuality,
  seed: string,
  pressure: number,
  progress: RunProgress,
  chaosEvents?: ChaosEvent[],
): { phases: CompetitionPhase[]; stage: string } {
  if (mode.simulationFormat === 'domestic') {
    const outcomes = simulatePhaseMatches(mode, mode.matchCount, ratings, effectiveTeamQuality, seed, pressure, progress, 0, 'League season', chaosEvents)
    const wins = outcomes.filter((outcome) => outcome.outcome === 'W').length
    const draws = outcomes.filter((outcome) => outcome.outcome === 'D').length
    const losses = outcomes.filter((outcome) => outcome.outcome === 'L').length
    const stage = getDomesticStage(mode, wins, draws, losses)
    return { phases: [summarizePhase('League season', outcomes, stage)], stage }
  }

  if (mode.simulationFormat === 'mls') {
    const regularSeason = simulatePhaseMatches(mode, mode.matchCount, ratings, effectiveTeamQuality, seed, pressure, progress, 0, 'Regular season', chaosEvents)
    const regularSummary = summarizePhase('Regular season', regularSeason, 'Qualified for playoffs')
    const points = regularSummary.record.wins * 3 + regularSummary.record.draws
    if (points < mode.matchCount * 1.35) {
      return { phases: [summarizePhase('Regular season', regularSeason, 'Missed playoffs')], stage: 'Missed playoffs' }
    }

    return simulateKnockoutRounds({
      phases: [regularSummary],
      rounds: [
        ['Round One', 1, 'Round One exit'],
        ['Conference semi-final', 1, 'Conference semi-final exit'],
        ['Conference final', 1, 'Conference final exit'],
        ['MLS Cup', 1, 'MLS Cup Finalist'],
      ],
      championStage: 'MLS Cup Champion',
      mode,
      ratings,
      effectiveTeamQuality,
      seed,
      pressure: pressure + 3,
      progress,
      offset: mode.matchCount,
      chaosEvents,
    })
  }

  if (mode.simulationFormat === 'world_cup') {
    return simulateGroupKnockoutPath({
      mode,
      groupPhaseName: 'Group stage',
      championStage: mode.modeId === 'nation_xi' ? `${mode.modeName} Champion` : 'World Champion',
      ratings,
      effectiveTeamQuality,
      seed,
      pressure,
      progress,
      rounds: [
        ['Round of 16', 1, 'Round of 16 exit'],
        ['Quarter-final', 1, 'Quarter-final exit'],
        ['Semi-final', 1, 'Semi-final exit'],
        ['Final', 1, 'Finalist'],
      ],
      chaosEvents,
    })
  }

  if (mode.simulationFormat === 'ucl') {
    const league = simulatePhaseMatches(mode, 8, ratings, effectiveTeamQuality, seed, pressure, progress, 0, 'League phase', chaosEvents)
    const leagueSummary = summarizePhase('League phase', league, 'Qualified for knockouts')
    const leaguePoints = leagueSummary.record.wins * 3 + leagueSummary.record.draws
    if (leaguePoints < 9) {
      return { phases: [summarizePhase('League phase', league, 'League phase exit')], stage: 'League phase exit' }
    }

    const phases = [leagueSummary]
    const rounds = [
      ['Round of 16', 2, 'Round of 16 exit'],
      ['Quarter-final', 2, 'Quarter-final exit'],
      ['Semi-final', 2, 'Semi-final exit'],
      ['Final', 1, 'Finalist'],
    ] as const

    let offset = 8
    for (let index = 0; index < rounds.length; index += 1) {
      const [roundName, matchCount, exitStage] = rounds[index]
      const matches = simulatePhaseMatches(mode, matchCount, ratings, effectiveTeamQuality, seed, pressure + 3 + index * 2.2, progress, offset, roundName, chaosEvents, matchCount === 1)
      offset += matchCount
      const advanced = aggregateAdvance(matches, ratings, effectiveTeamQuality, `${seed}:${roundName}`)
      if (!advanced) {
        phases.push(summarizePhase(roundName, matches, exitStage))
        return { phases, stage: exitStage }
      }
      phases.push(summarizePhase(roundName, matches, index === rounds.length - 1 ? 'UCL Champion' : 'Advanced'))
    }

    return { phases, stage: 'UCL Champion' }
  }

  if (mode.simulationFormat === 'classic_european_cup') {
    return simulateKnockoutRounds({
      phases: [],
      rounds: [
        ['First round', 2, 'First round exit'],
        ['Quarter-final', 2, 'Quarter-final exit'],
        ['Semi-final', 2, 'Semi-final exit'],
        ['Final', 1, 'Finalist'],
      ],
      championStage: 'European Cup Champion',
      mode,
      ratings,
      effectiveTeamQuality,
      seed,
      pressure,
      progress,
      offset: 0,
      chaosEvents,
      pressureStep: 2.5,
    })
  }

  if (mode.simulationFormat === 'generic_tournament') {
    return simulateGroupKnockoutPath({
      mode,
      groupPhaseName: 'Group stage',
      championStage: `${mode.modeName} Champion`,
      ratings,
      effectiveTeamQuality,
      seed,
      pressure,
      progress,
      rounds: [
        ['Round of 16', 1, 'Round of 16 exit'],
        ['Quarter-final', 1, 'Quarter-final exit'],
        ['Semi-final', 1, 'Semi-final exit'],
        ['Final', 1, 'Finalist'],
      ],
      chaosEvents,
    })
  }

  const outcomes = simulatePhaseMatches(mode, mode.matchCount, ratings, effectiveTeamQuality, seed, pressure, progress, 0, 'Campaign', chaosEvents)
  const wins = outcomes.filter((outcome) => outcome.outcome === 'W').length
  const draws = outcomes.filter((outcome) => outcome.outcome === 'D').length
  const losses = outcomes.filter((outcome) => outcome.outcome === 'L').length
  const stage = getDomesticStage(mode, wins, draws, losses)
  return { phases: [summarizePhase('Campaign', outcomes, stage)], stage }
}

function gradeFromTier(tierId: NonNullable<RunResult['resultTier']>['id'], wins: number, matchCount: number): [string, string] {
  if (tierId === 'perfect') return ['SS', 'Perfect run']
  if (tierId === 'invincible') return ['S', 'Invincible']
  if (tierId === 'perfect_near_miss') return ['S', 'Perfect near-miss']
  if (tierId === 'undefeated') return ['A+', 'Undefeated']
  if (tierId === 'undefeated_near_miss') return ['A', 'Undefeated near-miss']
  if (tierId === 'strong') return ['B', 'Strong run']
  if (wins >= Math.round(matchCount * 0.55)) return ['C', 'Respectable']
  return ['D', 'Exposed']
}

function perfectionResultFromTier(tier: NonNullable<RunResult['resultTier']>): string {
  if (tier.id === 'perfect') return 'Perfect'
  if (tier.id === 'invincible') return 'Invincible'
  if (tier.id === 'undefeated') return 'Undefeated'
  return tier.label
}

function probabilityExamples(ratings: TeamRatings, effectiveTeamQuality: EffectiveTeamQuality) {
  return [-30, -10, 0, 15, 30, 45].map((dominanceDelta) => {
    const base = baseDominanceProbabilities(dominanceDelta)
    const conversionProbability = drawConversionProbability({
      ratings,
      effectiveScore: effectiveTeamQuality.score,
      positionFit: effectiveTeamQuality.positionFit,
      chemistry: effectiveTeamQuality.chemistry,
      roleBalance: effectiveTeamQuality.roleBalance,
      weakLinkPenalty: effectiveTeamQuality.weakLinkPenalty,
      opponentDifficulty: effectiveTeamQuality.score - dominanceDelta,
      dominanceDelta,
      matchImportance: 1,
    })
    return {
      dominanceDelta,
      base,
      conversionProbability,
      final: finalProbabilities(base, conversionProbability),
    }
  })
}

function createSimulationDetails(matches: MatchTrace[], ratings: TeamRatings, effectiveTeamQuality: EffectiveTeamQuality, pressure: number, mode: ModeConfig): SimulationDetails {
  const averageProbability = (key: keyof MatchProbabilitySet) => Math.round(average(matches.map((match) => match.finalProbabilities?.[key] ?? 0.33)) * 100)
  const winProbability = averageProbability('win')
  const drawProbability = averageProbability('draw')
  const lossProbability = Math.max(0, 100 - winProbability - drawProbability)
  const averageWin = average(matches.map((match) => match.finalProbabilities?.win ?? 0.45))
  const averageDraw = average(matches.map((match) => match.finalProbabilities?.draw ?? 0.18))
  const averageOpponent = average(matches.map((match) => match.opponentDifficulty ?? 55))
  const perfectRunProbability = round(clamp(matches.reduce((product, match) => product * (match.finalProbabilities?.win ?? averageWin), 1) * 100, 0, 99.99), 2)
  const tieBreakEstimate = clamp(
    0.42 +
      (ratings.goalkeeping - 82) * 0.004 +
      (ratings.bigGame - 82) * 0.003 +
      (ratings.consistency - 82) * 0.003 +
      (effectiveTeamQuality.score - averageOpponent) * 0.004,
    0.3,
    0.78,
  )
  const trophyRaw = mode.simulationFormat === 'domestic' || mode.simulationFormat === 'mls'
    ? logistic(((averageWin * 3 + averageDraw) - 2.35) * 7)
    : matches.reduce((product, match) => {
      const win = match.finalProbabilities?.win ?? averageWin
      const draw = match.finalProbabilities?.draw ?? averageDraw
      const isKnockout = mode.usesKnockouts && !/group|league phase|regular/i.test(match.phase)
      const survival = isKnockout ? win + draw * tieBreakEstimate : win + draw * 0.42
      return product * clamp(survival, 0.08, 0.96)
    }, 1)
  const trophyProbability = Math.round(clamp(trophyRaw * 100, 1, 98))
  const trophyEstimateLabel = mode.simulationFormat === 'domestic' ? 'Title %' : mode.simulationFormat === 'mls' ? 'Playoff %' : 'Trophy %'
  const trophyEstimateMethod = mode.simulationFormat === 'domestic' || mode.simulationFormat === 'mls'
    ? 'Logistic estimate from stored fixture win/draw probabilities and the mode title pace; perfect chance is the product of stored win probabilities.'
    : 'Path estimate from stored fixture win/draw probabilities, with knockout draws weighted by the XI tie-break profile.'

  return {
    averageWinProbability: winProbability,
    averageDrawProbability: drawProbability,
    averageLossProbability: lossProbability,
    trophyProbability,
    trophyEstimateLabel,
    trophyEstimateMethod,
    perfectRunProbability,
    teamStrength: effectiveTeamQuality.score,
    defensiveBase: round(ratings.defense * 0.46 + ratings.goalkeeping * 0.32 + ratings.chemistry * 0.22, 1),
    matchPressure: round(pressure, 1),
    expectedGoalsForPerMatch: round(average(matches.map((match) => match.xgFor)), 2),
    expectedGoalsAgainstPerMatch: round(average(matches.map((match) => match.xgAgainst)), 2),
    averageOpponentDifficulty: round(averageOpponent, 1),
    averageDominanceDelta: round(average(matches.map((match) => match.dominanceDelta ?? 0)), 1),
    averageConversionProbability: round(average(matches.map((match) => match.conversionProbability ?? 0)) * 100, 1),
    probabilityExamples: probabilityExamples(ratings, effectiveTeamQuality),
  }
}

function matchThatChangedSeason(matches: MatchTrace[]) {
  const firstDamage = matches.find((match) => match.outcome !== 'W')
  const fallback = [...matches].filter((match) => match.outcome === 'L').sort((left, right) => (right.opponentDifficulty ?? 0) - (left.opponentDifficulty ?? 0))[0] ?? matches.find((match) => match.outcome === 'D')
  const match = firstDamage ?? fallback
  if (!match) return undefined
  return {
    match: match.match,
    phase: match.phase,
    outcome: match.outcome,
    result: match.result,
    opponentDifficulty: match.opponentDifficulty,
    note: match.note,
  }
}

function tacticalReasonForRun({
  ratings,
  effectiveTeamQuality,
  matches,
  losses,
  draws,
  chemistryWarnings,
  tacticWeaknesses,
}: {
  ratings: TeamRatings
  effectiveTeamQuality: EffectiveTeamQuality
  matches: MatchTrace[]
  losses: number
  draws: number
  chemistryWarnings: string[]
  tacticWeaknesses: string[]
}): TacticalReason {
  const turningPoint = matchThatChangedSeason(matches)
  const lateBreak = Boolean(turningPoint && turningPoint.match > Math.max(1, matches.length - 8))
  const highDifficultyBreak = Boolean(turningPoint && (turningPoint.opponentDifficulty ?? 0) >= 68)

  if (effectiveTeamQuality.minimumPositionFit < 80 || effectiveTeamQuality.weakLinks.some((link) => link.includes('fit'))) {
    return { category: 'position_fit', summary: 'A weak position fit capped the XI when the schedule found it.' }
  }
  if (ratings.chemistry < 68 || chemistryWarnings.length) {
    return { category: 'chemistry', summary: chemistryWarnings[0] ?? 'The XI had enough talent, but the links were too loose.' }
  }
  if (ratings.goalkeeping < 82 && highDifficultyBreak) {
    return { category: 'goalkeeper', summary: 'The keeper profile did not steal enough in the hardest fixture.' }
  }
  if (lateBreak && (ratings.pressResistance < 82 || ratings.consistency < 82)) {
    return { category: 'pressure', summary: 'Late-season pressure asked for more press resistance and consistency.' }
  }
  if (draws > losses && ratings.midfieldControl < 84) {
    return { category: 'midfield', summary: 'Midfield control was not sharp enough to turn territory into wins.' }
  }
  if (draws > losses && ratings.attack < 84) {
    return { category: 'attack', summary: 'The attack left too many tight matches alive.' }
  }
  if (ratings.defense < 82 || tacticWeaknesses.some((weakness) => weakness.includes('defensive') || weakness.includes('space'))) {
    return { category: 'defense', summary: 'The defensive structure made the margins too thin.' }
  }
  if (losses === 0 && draws === 0) {
    return { category: 'variance', summary: 'Everything clicked: quality, fit, chemistry, and the match luck all lined up.' }
  }
  return { category: 'variance', summary: 'Your XI was strong, but perfection still needs luck as well as quality.' }
}

export function simulateRun(picks: DraftPick[], modeId: string, seed: string): RunResult {
  const mode = getModeConfig(modeId)
  const starterPicks = picks.filter((pick) => !isBenchSlot(pick.slot))
  const benchPicks = picks.filter((pick) => isBenchSlot(pick.slot))
  const tacticalPicks = starterPicks.length ? starterPicks : picks
  const squadReport = mode.modeType === 'manager' || benchPicks.length > 0 ? createSquadReport(tacticalPicks, benchPicks) : undefined
  const chemistryReport = calculateChemistry(tacticalPicks)
  const ratings = calculateTeamRatings(tacticalPicks, chemistryReport.score)
  const tacticReport = inferTactic(tacticalPicks, ratings)
  const effectiveTeamQuality = calculateEffectiveTeamQuality({ picks: tacticalPicks, ratings, chemistryReport })
  const basePressure = mode.opponentDistribution === 'elite' ? 9 : mode.opponentDistribution === 'continental' ? 12 : mode.opponentDistribution === 'international' ? 13 : 6
  const pressure = basePressure + (mode.modeType === 'manager' ? 3 : 0) - (squadReport?.benchImpact ?? 0)
  const progress = createRunProgress()
  const chaosEvents: ChaosEvent[] = []
  const chaosEventSink = mode.opponentDistribution === 'chaos' ? chaosEvents : undefined

  const { phases: competitionPath, stage } = simulateCompetitionPath(mode, ratings, effectiveTeamQuality, seed, pressure, progress, chaosEventSink)
  const matchTrace = matchTraceFromPhases(competitionPath)
  const { wins, draws, losses } = recordFromPhases(competitionPath)
  const { goalsFor, goalsAgainst, xgFor, xgAgainst } = totalsFromPhases(competitionPath)
  const resultTier = classifyResultTier({
    mode,
    wins,
    draws,
    losses,
    stage,
    hadExtraTimeWin: progress.hadExtraTimeWin,
    hadPenaltyAdvance: progress.hadPenaltyAdvance,
  })
  const [grade, gradeLabel] = gradeFromTier(resultTier.id, wins, matchTrace.length || mode.matchCount)
  const perfectionResult = perfectionResultFromTier(resultTier)
  const simulationDetails = createSimulationDetails(matchTrace, ratings, effectiveTeamQuality, pressure, mode)
  const streaks = progressToStreaks(progress)
  const turningPoint = matchThatChangedSeason(matchTrace)
  const bestPlayerDetail = playerContributionDetail(tacticalPicks, 'best')
  const weakLinkDetail = playerContributionDetail(tacticalPicks, 'weak', bestPlayerDetail.playerName)
  const reportUnitScores = unitScoreDetails(ratings, matchTrace)
  const strongest = [...reportUnitScores].sort((left, right) => right.score - left.score)[0]?.label ?? strongestUnit(ratings)
  const weakest = [...reportUnitScores].sort((left, right) => left.score - right.score)[0]?.label ?? weakestUnit(ratings)
  const tacticalReason = tacticalReasonForRun({
    ratings,
    effectiveTeamQuality,
    matches: matchTrace,
    losses,
    draws,
    chemistryWarnings: chemistryReport.warnings,
    tacticWeaknesses: tacticReport.weaknesses,
  })
  const failure = tacticalReason.summary || failureReason(weakest, chemistryReport.warnings, tacticReport.weaknesses, simulationDetails)
  const firstDamage = matchTrace.find((match) => match.outcome !== 'W')

  const baseResult = {
    modeId: mode.modeId,
    modeName: mode.modeName,
    targetRecord: mode.targetRecord,
    record: { wins, draws, losses },
    points: mode.usesDraws ? wins * 3 + draws : undefined,
    goalsFor,
    goalsAgainst,
    xgFor,
    xgAgainst,
    grade,
    gradeLabel,
    trophyResult: stage.toLowerCase().includes('champion') ? 'Trophy won' : stage,
    perfectionResult,
    resultTier,
    scoringVersion,
    stage,
    bestPlayer: bestPlayerDetail.playerName,
    bestPlayerDetail,
    weakLink: `${weakLinkDetail.slotLabel}: ${weakLinkDetail.playerName}`,
    weakLinkDetail,
    strongestUnit: strongest,
    weakestUnit: weakest,
    unitScores: reportUnitScores,
    dominanceReason: dominanceReason(strongest, ratings),
    failureReason: failure,
    tacticalReason,
    why: explain({
      losses,
      draws,
      chemistryWarnings: chemistryReport.warnings,
      tacticWeaknesses: tacticReport.weaknesses,
      ratingsBalance: ratings.balance,
      weakestUnit: weakest,
      firstDamage,
    }),
    effectiveTeamQuality,
    streaks,
    matchThatChangedSeason: turningPoint,
    probabilityExamples: simulationDetails.probabilityExamples,
    teamRatings: ratings,
    tacticReport,
    chemistryReport,
    keyMatches: keyMatches(mode, matchTrace),
    competitionPath,
    matchTrace,
    chaosEvents,
    squadReport,
    simulationDetails,
    runId: seed,
  }

  return {
    ...baseResult,
    shareText: createShareText(baseResult),
  }
}
