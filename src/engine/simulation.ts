import { getModeConfig } from '../data/modes'
import { isBenchSlot } from '../data/squad'
import { calculateChemistry } from './chemistry'
import { clamp, createRng, round } from './random'
import { createShareText } from './share'
import { calculateTeamRatings, inferTactic } from './tactics'
import type { ChaosEvent, CompetitionPhase, DraftPick, KeyMatch, MatchTrace, ModeConfig, RunResult, SimulationDetails, SquadReport, TeamRatings } from '../types'

interface MatchOutcome {
  match: number
  phase: string
  outcome: 'W' | 'D' | 'L'
  gf: number
  ga: number
  xgf: number
  xga: number
  pressure: number
  note: string
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

function poisson(lambda: number, goals: number): number {
  let factorial = 1
  for (let value = 2; value <= goals; value += 1) factorial *= value
  return (Math.exp(-lambda) * lambda ** goals) / factorial
}

function samplePoisson(lambda: number, rng: ReturnType<typeof createRng>): number {
  const limit = Math.exp(-lambda)
  let product = 1
  let goals = 0

  do {
    goals += 1
    product *= rng.next()
  } while (product > limit && goals < 10)

  return goals - 1
}

function attackingBase(ratings: TeamRatings): number {
  return ratings.attack * 0.46 + ratings.chanceCreation * 0.24 + ratings.midfield * 0.14 + ratings.bigGame * 0.1 + ratings.chemistry * 0.06
}

function controlBase(ratings: TeamRatings): number {
  return ratings.midfield * 0.42 + ratings.pressResistance * 0.22 + ratings.tacticalCoherence * 0.2 + ratings.balance * 0.16
}

function expectedGoalProfile(ratings: TeamRatings, strength: number, defensiveBase: number, pressure: number) {
  const attack = attackingBase(ratings)
  const control = controlBase(ratings)
  const netQuality = strength - pressure
  const expectedGoalsFor = clamp(
    1.56 +
      (netQuality - 72) * 0.055 +
      (attack - 82) * 0.035 +
      (control - 82) * 0.014 +
      (ratings.consistency - 82) * 0.006,
    0.62,
    3.55,
  )
  const expectedGoalsAgainst = clamp(
    1.2 -
      (defensiveBase - 78) * 0.038 +
      (pressure - 6) * 0.04 -
      (control - 82) * 0.012 -
      (ratings.consistency - 82) * 0.006,
    0.38,
    2.65,
  )

  return { expectedGoalsFor, expectedGoalsAgainst }
}

function outcomeProbabilities(expectedGoalsForPerMatch: number, expectedGoalsAgainstPerMatch: number) {
  let win = 0
  let draw = 0
  let loss = 0

  for (let gf = 0; gf <= 10; gf += 1) {
    for (let ga = 0; ga <= 10; ga += 1) {
      const probability = poisson(expectedGoalsForPerMatch, gf) * poisson(expectedGoalsAgainstPerMatch, ga)
      if (gf > ga) win += probability
      else if (gf === ga) draw += probability
      else loss += probability
    }
  }

  const total = win + draw + loss || 1
  return {
    win: win / total,
    draw: draw / total,
    loss: loss / total,
  }
}

function logistic(value: number): number {
  return 1 / (1 + Math.exp(-value))
}

function estimateTrophyProbability(mode: ModeConfig, probabilities: ReturnType<typeof outcomeProbabilities>, strength: number, pressure: number): number {
  const pointsPerMatch = probabilities.win * 3 + probabilities.draw
  const penaltyEdge = clamp((strength - pressure - 55) / 38, 0.28, 0.78)
  const oneMatchAdvance = clamp(probabilities.win + probabilities.draw * penaltyEdge, 0.03, 0.96)
  const lateKnockoutAdvance = clamp(oneMatchAdvance - 0.06, 0.03, 0.94)
  const splitTie = probabilities.win * probabilities.loss * 1.25
  const twoLegAdvance = clamp(
    probabilities.win ** 2 +
      probabilities.win * probabilities.draw * 2 +
      probabilities.draw ** 2 * penaltyEdge +
      splitTie * penaltyEdge,
    0.03,
    0.96,
  )

  if (mode.simulationFormat === 'domestic') {
    const titleLine = mode.matchCount >= 38 ? 2.42 : 2.34
    return Math.round(clamp(logistic((pointsPerMatch - titleLine) * 8.5) * 100, 1, 98))
  }

  if (mode.simulationFormat === 'mls') {
    const playoffChance = logistic((pointsPerMatch - 1.38) * 5.2)
    return Math.round(clamp(playoffChance * oneMatchAdvance ** 4 * 100, 1, 96))
  }

  if (mode.simulationFormat === 'ucl') {
    const leaguePhaseChance = logistic((pointsPerMatch - 1.38) * 4.2)
    return Math.round(clamp(leaguePhaseChance * twoLegAdvance ** 3 * lateKnockoutAdvance * 100, 1, 96))
  }

  if (mode.simulationFormat === 'classic_european_cup') {
    return Math.round(clamp(twoLegAdvance ** 3 * lateKnockoutAdvance * 100, 1, 96))
  }

  if (mode.usesGroupStage) {
    const groupChance = logistic((pointsPerMatch - 1.28) * 4.8)
    return Math.round(clamp(groupChance * oneMatchAdvance * lateKnockoutAdvance ** 3 * 100, 1, 96))
  }

  return Math.round(clamp(oneMatchAdvance ** Math.max(2, Math.min(5, mode.matchCount)) * 100, 1, 96))
}

function estimateMatchProfile(ratings: TeamRatings, strength: number, defense: number, pressure: number, mode: ModeConfig): SimulationDetails {
  const { expectedGoalsFor, expectedGoalsAgainst } = expectedGoalProfile(ratings, strength, defense, pressure)
  const expectedGoalsForPerMatch = round(expectedGoalsFor, 2)
  const expectedGoalsAgainstPerMatch = round(expectedGoalsAgainst, 2)
  const probabilities = outcomeProbabilities(expectedGoalsForPerMatch, expectedGoalsAgainstPerMatch)
  const averageWinProbability = Math.round(probabilities.win * 100)
  const averageDrawProbability = Math.round(probabilities.draw * 100)
  const averageLossProbability = Math.max(0, 100 - averageWinProbability - averageDrawProbability)
  const trophyProbability = estimateTrophyProbability(mode, probabilities, strength, pressure)

  return {
    averageWinProbability,
    averageDrawProbability,
    averageLossProbability,
    trophyProbability,
    teamStrength: round(strength, 1),
    defensiveBase: round(defense, 1),
    matchPressure: round(pressure, 1),
    expectedGoalsForPerMatch,
    expectedGoalsAgainstPerMatch,
  }
}

function matchNote(outcome: 'W' | 'D' | 'L', gf: number, ga: number, xgf: number, xga: number, pressure: number): string {
  const margin = gf - ga
  if (outcome === 'W' && margin >= 3) return `The XI controlled the game state and turned ${xgf.toFixed(1)} xG into a statement win.`
  if (outcome === 'W' && pressure >= 12) return `Won through pressure: ${gf}-${ga}, with the defensive base holding ${xga.toFixed(1)} xGA.`
  if (outcome === 'W') return `Professional win, ${gf}-${ga}, with the stronger unit protecting the margin.`
  if (outcome === 'D') return `Perfection slipped in a ${gf}-${ga} draw after ${xga.toFixed(1)} xGA kept the opponent alive.`
  return `The run cracked ${gf}-${ga}; pressure ${round(pressure, 1)} exposed the weakest unit.`
}

function simulateMatch(ratings: TeamRatings, strength: number, defense: number, rngSeed: string, pressure = 0, match = 1, phase = 'Match'): MatchOutcome {
  const rng = createRng(rngSeed)
  const profile = expectedGoalProfile(ratings, strength, defense, pressure)
  const stability = clamp((ratings.consistency + ratings.chemistry + ratings.balance) / 3, 50, 98)
  const volatility = clamp(0.26 - (stability - 70) * 0.003 + pressure * 0.003, 0.14, 0.34)
  const formSwing = (rng.next() - rng.next()) * volatility
  const opponentSwing = (rng.next() - rng.next()) * (0.1 + pressure * 0.003)
  const xgf = clamp(profile.expectedGoalsFor + formSwing * 0.45 + opponentSwing * 0.1, 0.35, 3.8)
  const xga = clamp(profile.expectedGoalsAgainst - formSwing * 0.3 - opponentSwing * 0.08, 0.25, 3.1)
  const gf = samplePoisson(xgf, rng)
  const ga = samplePoisson(xga, rng)
  const outcome = gf > ga ? 'W' : gf === ga ? 'D' : 'L'
  const roundedXgf = round(xgf, 1)
  const roundedXga = round(xga, 1)

  return {
    match,
    phase,
    outcome,
    gf,
    ga,
    xgf: roundedXgf,
    xga: roundedXga,
    pressure: round(pressure, 1),
    note: matchNote(outcome, gf, ga, roundedXgf, roundedXga, pressure),
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

function gradeDomestic(wins: number, _draws: number, losses: number, matchCount: number): [string, string] {
  if (wins === matchCount) return ['SS', 'Perfect season']
  if (losses === 0 && wins >= matchCount - 3) return ['S', 'Invincible, not perfect']
  if (losses === 0) return ['A+', 'Invincible grind']
  if (wins >= matchCount - 4) return ['A', 'Title-level machine']
  if (wins >= Math.round(matchCount * 0.72)) return ['B', 'Great XI, flawed run']
  if (wins >= Math.round(matchCount * 0.58)) return ['C', 'Star names, broken balance']
  return ['D', 'The simulation exposed the gaps']
}

function gradeTournament(mode: ModeConfig, _wins: number, draws: number, losses: number, stage: string): [string, string] {
  if (stage.includes('Champion') && losses === 0 && draws === 0) return ['SS', `Perfect ${mode.modeName} Champion`]
  if (stage.includes('Champion')) return ['S', 'Champion, not perfect']
  if (stage.includes('Finalist')) return ['A', 'Finalist']
  if (stage.includes('Semi')) return ['B', 'Semi-final exit']
  if (stage.includes('Quarter')) return ['C', 'Quarter-final exit']
  return ['D', 'The run collapsed early']
}

function getDomesticStage(mode: ModeConfig, wins: number, draws: number, losses: number): string {
  const points = wins * 3 + draws
  if (losses === 0 && wins === mode.matchCount) return 'Perfect league champion'
  if (losses === 0) return 'Invincible league champion'
  if (points >= mode.matchCount * 2.45) return 'League champion'
  if (points >= mode.matchCount * 2.1) return 'Title race'
  return 'Top-four fight'
}

function bestPlayer(picks: DraftPick[]): string {
  return [...picks].sort((left, right) => {
    const leftScore = scorePickForSlot(left) + left.player.ratings.bigGame * 0.08
    const rightScore = scorePickForSlot(right) + right.player.ratings.bigGame * 0.08
    return rightScore - leftScore
  })[0]?.player.displayName ?? 'No standout'
}

function weakLink(picks: DraftPick[]): string {
  const sorted = [...picks].sort((left, right) => {
    const slotScore = (pick: DraftPick) => {
      if (pick.slot.accepts.includes('GK')) return pick.player.ratings.goalkeeping
      if (pick.slot.accepts.some((position) => ['CB', 'LB', 'RB', 'DM'].includes(position))) return pick.player.ratings.defense
      if (pick.slot.accepts.some((position) => ['CM', 'AM'].includes(position))) return pick.player.ratings.control
      return pick.player.ratings.attack
    }
    return slotScore(left) - slotScore(right)
  })

  const weakest = sorted[0]
  if (!weakest) return 'No weak link found'
  if (weakest.player.ratings.defense < 76 && weakest.slot.accepts.some((position) => ['CB', 'LB', 'RB', 'DM'].includes(position))) return `${weakest.slot.label}: exposed defensively`
  if (weakest.player.ratings.goalkeeping < 86 && weakest.slot.accepts.includes('GK')) return 'Keeper did not steal enough points'
  return `${weakest.slot.label}: ${weakest.player.displayName}`
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
  return `The big-game profile gave the run nerve at ${ratings.bigGame}.`
}

function failureReason(unit: string, chemistryWarnings: string[], tacticWeaknesses: string[], details: SimulationDetails): string {
  if (chemistryWarnings.length) return chemistryWarnings[0]
  if (tacticWeaknesses.length) return `The ${tacticWeaknesses[0]} kept the margins thin.`
  if (unit === 'Goalkeeping') return `The goalkeeper unit looked vulnerable, with an average loss probability around ${details.averageLossProbability}%.`
  if (unit === 'Defense') return `Defensive pressure built up: xGA sat near ${details.expectedGoalsAgainstPerMatch} per match.`
  if (unit === 'Midfield') return 'The midfield could not always turn territory into control.'
  if (unit === 'Attack') return `The attack left too many matches alive: xG settled near ${details.expectedGoalsForPerMatch} per match.`
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
    note: outcome.note,
  }
}

function matchTraceFromPhases(phases: CompetitionPhase[]): MatchTrace[] {
  return phases.flatMap((phase) => phase.matches)
}

function keyMatches(mode: ModeConfig, matches: MatchTrace[]): KeyMatch[] {
  if (matches.length === 0) return []
  const wins = matches.filter((match) => match.outcome === 'W')
  const damage = matches.filter((match) => match.outcome !== 'W')
  const statement = [...wins].sort((left, right) => (
    (right.goalsFor - right.goalsAgainst) - (left.goalsFor - left.goalsAgainst)
    || right.xgFor - left.xgFor
  ))[0]
  const trap = damage[0] ?? [...wins].sort((left, right) => (
    (left.goalsFor - left.goalsAgainst) - (right.goalsFor - right.goalsAgainst)
    || right.pressure - left.pressure
  ))[0]
  const finalMatch = matches.at(-1)

  return [
    statement && {
      label: 'Statement win',
      result: statement.result,
      note: `${statement.phase} match ${statement.match}. ${statement.note}`,
    },
    trap && {
      label: damage.length ? 'Record damage' : 'Trap game survived',
      result: trap.result,
      note: `${trap.phase} match ${trap.match}. ${trap.note}`,
    },
    finalMatch && {
      label: mode.usesKnockouts ? finalMatch.phase : 'Run-in',
      result: finalMatch.result,
      note: `Match ${finalMatch.match}. ${finalMatch.note}`,
    },
  ].filter((match): match is KeyMatch => Boolean(match))
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

function simulatePhaseMatches(
  count: number,
  ratings: TeamRatings,
  strength: number,
  defensiveBase: number,
  seed: string,
  pressure: number,
  offset = 0,
  phase = 'Match',
  chaosEvents?: ChaosEvent[],
): MatchOutcome[] {
  const eventSink = chaosEvents
  return Array.from({ length: count }, (_, index) => {
    const matchIndex = offset + index
    const matchNumber = matchIndex + 1
    const chaosEvent = eventSink ? createChaosEvent(seed, matchNumber, phase) : undefined
    if (chaosEvent && eventSink) {
      eventSink.push(chaosEvent)
    }

    return simulateMatch(
      ratings,
      strength,
      defensiveBase,
      `${seed}:match:${matchIndex}`,
      pressure + matchIndex * 0.03 + (chaosEvent?.modifier ?? 0),
      matchNumber,
      phase,
    )
  })
}

function aggregateAdvance(outcomes: MatchOutcome[], strength: number, seed: string): boolean {
  const gf = outcomes.reduce((sum, match) => sum + match.gf, 0)
  const ga = outcomes.reduce((sum, match) => sum + match.ga, 0)
  if (gf > ga) return true
  if (gf < ga) return false
  return createRng(`${seed}:pens:${gf}:${ga}`).next() < clamp((strength - 62) / 36, 0.22, 0.82)
}

function simulateKnockoutRounds({
  phases,
  rounds,
  championStage,
  ratings,
  strength,
  defensiveBase,
  seed,
  pressure,
  offset,
  chaosEvents,
  pressureStep = 2.4,
}: {
  phases: CompetitionPhase[]
  rounds: readonly KnockoutRound[]
  championStage: string
  ratings: TeamRatings
  strength: number
  defensiveBase: number
  seed: string
  pressure: number
  offset: number
  chaosEvents?: ChaosEvent[]
  pressureStep?: number
}): { phases: CompetitionPhase[]; stage: string } {
  let nextOffset = offset

  for (let index = 0; index < rounds.length; index += 1) {
    const [roundName, matchCount, exitStage] = rounds[index]
    const matches = simulatePhaseMatches(matchCount, ratings, strength, defensiveBase, seed, pressure + index * pressureStep, nextOffset, roundName, chaosEvents)
    nextOffset += matchCount
    const advanced = aggregateAdvance(matches, strength, `${seed}:${roundName}`)
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
  strength,
  defensiveBase,
  seed,
  pressure,
  rounds,
  chaosEvents,
}: {
  mode: ModeConfig
  groupPhaseName: string
  championStage: string
  ratings: TeamRatings
  strength: number
  defensiveBase: number
  seed: string
  pressure: number
  rounds: readonly KnockoutRound[]
  chaosEvents?: ChaosEvent[]
}): { phases: CompetitionPhase[]; stage: string } {
  const group = simulatePhaseMatches(3, ratings, strength, defensiveBase, seed, pressure, 0, groupPhaseName, chaosEvents)
  const groupSummary = summarizePhase(groupPhaseName, group, 'Qualified for knockouts')
  const groupPoints = groupSummary.record.wins * 3 + groupSummary.record.draws
  if (groupPoints < 4) {
    return { phases: [summarizePhase(groupPhaseName, group, `${groupPhaseName} exit`)], stage: `${groupPhaseName} exit` }
  }

  return simulateKnockoutRounds({
    phases: [groupSummary],
    rounds,
    championStage,
    ratings,
    strength,
    defensiveBase,
    seed: `${seed}:${mode.modeId}`,
    pressure: pressure + 2,
    offset: 3,
    chaosEvents,
  })
}

function simulateCompetitionPath(
  mode: ModeConfig,
  ratings: TeamRatings,
  strength: number,
  defensiveBase: number,
  seed: string,
  pressure: number,
  chaosEvents?: ChaosEvent[],
): { phases: CompetitionPhase[]; stage: string } {
  if (mode.simulationFormat === 'domestic') {
    const outcomes = simulatePhaseMatches(mode.matchCount, ratings, strength, defensiveBase, seed, pressure, 0, 'League season', chaosEvents)
    const wins = outcomes.filter((outcome) => outcome.outcome === 'W').length
    const draws = outcomes.filter((outcome) => outcome.outcome === 'D').length
    const losses = outcomes.filter((outcome) => outcome.outcome === 'L').length
    const stage = getDomesticStage(mode, wins, draws, losses)
    return { phases: [summarizePhase('League season', outcomes, stage)], stage }
  }

  if (mode.simulationFormat === 'mls') {
    const regularSeason = simulatePhaseMatches(mode.matchCount, ratings, strength, defensiveBase, seed, pressure, 0, 'Regular season', chaosEvents)
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
      ratings,
      strength,
      defensiveBase,
      seed,
      pressure: pressure + 3,
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
      strength,
      defensiveBase,
      seed,
      pressure,
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
    const league = simulatePhaseMatches(8, ratings, strength, defensiveBase, seed, pressure, 0, 'League phase', chaosEvents)
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
      const matches = simulatePhaseMatches(matchCount, ratings, strength, defensiveBase, seed, pressure + 3 + index * 2.2, offset, roundName, chaosEvents)
      offset += matchCount
      const advanced = aggregateAdvance(matches, strength, `${seed}:${roundName}`)
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
      ratings,
      strength,
      defensiveBase,
      seed,
      pressure,
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
      strength,
      defensiveBase,
      seed,
      pressure,
      rounds: [
        ['Round of 16', 1, 'Round of 16 exit'],
        ['Quarter-final', 1, 'Quarter-final exit'],
        ['Semi-final', 1, 'Semi-final exit'],
        ['Final', 1, 'Finalist'],
      ],
      chaosEvents,
    })
  }

  const outcomes = simulatePhaseMatches(mode.matchCount, ratings, strength, defensiveBase, seed, pressure, 0, 'Campaign', chaosEvents)
  const wins = outcomes.filter((outcome) => outcome.outcome === 'W').length
  const draws = outcomes.filter((outcome) => outcome.outcome === 'D').length
  const losses = outcomes.filter((outcome) => outcome.outcome === 'L').length
  const stage = getDomesticStage(mode, wins, draws, losses)
  return { phases: [summarizePhase('Campaign', outcomes, stage)], stage }
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
  const basePressure = mode.opponentDistribution === 'elite' ? 9 : mode.opponentDistribution === 'continental' ? 12 : mode.opponentDistribution === 'international' ? 13 : mode.opponentDistribution === 'chaos' ? 16 : 6
  const pressure = basePressure + (mode.modeType === 'manager' ? 3 : 0) - (squadReport?.benchImpact ?? 0)
  const strength = ratings.overall + (squadReport?.benchImpact ?? 0) * 0.6
  const defensiveBase = ratings.defense * 0.46 + ratings.goalkeeping * 0.32 + ratings.chemistry * 0.22
  const simulationDetails = estimateMatchProfile(ratings, strength, defensiveBase, pressure, mode)
  const chaosEvents: ChaosEvent[] = []
  const chaosEventSink = mode.opponentDistribution === 'chaos' ? chaosEvents : undefined

  const { phases: competitionPath, stage } = simulateCompetitionPath(mode, ratings, strength, defensiveBase, seed, pressure, chaosEventSink)
  const matchTrace = matchTraceFromPhases(competitionPath)
  const { wins, draws, losses } = recordFromPhases(competitionPath)
  const { goalsFor, goalsAgainst, xgFor, xgAgainst } = totalsFromPhases(competitionPath)
  const [grade, gradeLabel] =
    mode.simulationFormat === 'domestic'
      ? gradeDomestic(wins, draws, losses, mode.matchCount)
      : gradeTournament(mode, wins, draws, losses, stage)
  const perfectionResult = losses === 0 && draws === 0 ? 'Perfect' : losses === 0 ? 'Invincible, not perfect' : 'Not invincible'
  const strongest = strongestUnit(ratings)
  const weakest = weakestUnit(ratings)
  const failure = failureReason(weakest, chemistryReport.warnings, tacticReport.weaknesses, simulationDetails)
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
    stage,
    bestPlayer: bestPlayer(tacticalPicks),
    weakLink: weakLink(tacticalPicks),
    strongestUnit: strongest,
    weakestUnit: weakest,
    dominanceReason: dominanceReason(strongest, ratings),
    failureReason: failure,
    why: explain({
      losses,
      draws,
      chemistryWarnings: chemistryReport.warnings,
      tacticWeaknesses: tacticReport.weaknesses,
      ratingsBalance: ratings.balance,
      weakestUnit: weakest,
      firstDamage,
    }),
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
