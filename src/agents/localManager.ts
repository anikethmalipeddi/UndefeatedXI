import type {
  AgentManagerInput,
  AgentManagerReport,
  AgentRecommendation,
  AgentSquadMember,
  AgentTrace,
} from './types'

interface SpecialistResult<T> {
  value: T
  trace: AgentTrace
}
interface ScoutResult {
  weakest: AgentSquadMember
  fitRisks: AgentSquadMember[]
  recommendation: AgentRecommendation
}

interface TacticianResult {
  strongestMetric: [string, number]
  weakestMetric: [string, number]
  formationPlan: string
  recommendation: AgentRecommendation
}

interface CriticResult {
  risks: string[]
  confidence: number
  recommendation: AgentRecommendation
}

const ratingLabels: Record<string, string> = {
  attack: 'Attack',
  midfield: 'Midfield',
  defense: 'Defense',
  goalkeeping: 'Goalkeeping',
  chemistry: 'Chemistry',
  tacticalCoherence: 'Tactical coherence',
  balance: 'Unit balance',
  pressResistance: 'Press resistance',
  defensiveTransitions: 'Defensive transitions',
  chanceCreation: 'Chance creation',
  finishing: 'Finishing',
}

function now(): number {
  return typeof performance === 'undefined' ? Date.now() : performance.now()
}

function duration(startedAt: number): number {
  return Math.max(0, Math.round(now() - startedAt))
}

function runSpecialist<T>(id: AgentTrace['id'], label: string, note: string, work: () => T): SpecialistResult<T> {
  const startedAt = now()
  const value = work()
  return {
    value,
    trace: { id, label, status: 'completed', durationMs: duration(startedAt), note },
  }
}

function roleScore(member: AgentSquadMember): number {
  const ratings = member.ratings
  const position = member.slot.toUpperCase()
  const base = position.includes('GK')
    ? ratings.goalkeeping
    : /CB|LB|RB|LWB|RWB|DM/.test(position)
      ? ratings.defense * 0.62 + ratings.physical * 0.22 + ratings.press * 0.16
      : /CM|AM|LM|RM/.test(position)
        ? ratings.control * 0.44 + ratings.creation * 0.32 + ratings.press * 0.24
        : ratings.attack * 0.62 + ratings.creation * 0.22 + ratings.physical * 0.16
  return Math.round(base * (member.positionFit / 100))
}

function runScout(input: AgentManagerInput): SpecialistResult<ScoutResult> {
  return runSpecialist('scout', 'Squad scout', 'Ranked every player by role score and position fit.', () => {
    const ranked = [...input.squad].sort((left, right) => roleScore(left) - roleScore(right))
    const weakest = ranked[0]
    const fitRisks = ranked.filter((member) => member.positionFit < 86).slice(0, 3)
    const fitEvidence = `${weakest.player} at ${weakest.slot}: ${roleScore(weakest)} role score, ${weakest.positionFit}% fit`
    return {
      weakest,
      fitRisks,
      recommendation: {
        title: fitRisks.length ? 'Resolve the position-fit debt' : 'Raise the floor of the XI',
        detail: fitRisks.length
          ? `Start with ${fitRisks[0].player} at ${fitRisks[0].slot}. A more natural fit protects the rest of the shape without changing the stars around it.`
          : `${weakest.player} is the lowest role-score player in this setup. Upgrade or reposition that slot before adding another luxury profile.`,
        evidence: [fitEvidence],
      },
    }
  })
}

function relevantTeamRatings(input: AgentManagerInput): [string, number][] {
  const keys = input.objective === 'attack'
    ? ['attack', 'finishing', 'chanceCreation', 'midfield', 'balance']
    : input.objective === 'resilience'
      ? ['defense', 'goalkeeping', 'defensiveTransitions', 'pressResistance', 'chemistry', 'balance']
      : ['attack', 'midfield', 'defense', 'goalkeeping', 'chemistry', 'tacticalCoherence', 'balance']
  return keys.map((key) => [key, input.teamRatings[key as keyof typeof input.teamRatings]] as [string, number])
}

function objectivePlan(input: AgentManagerInput, weakestLabel: string): string {
  if (input.objective === 'attack') {
    return `Keep the ${input.formationId} base, push one creator closer to the forwards, and preserve a two-player rest defense while targeting ${weakestLabel.toLowerCase()}.`
  }
  if (input.objective === 'resilience') {
    return `Keep the ${input.formationId} compact, protect the center with a true screen, and make the first change wherever ${weakestLabel.toLowerCase()} is exposed.`
  }
  return `Use the ${input.formationId} as a flexible ${input.tactic.identity.toLowerCase()} shape: keep the strongest phase intact and reinforce ${weakestLabel.toLowerCase()} first.`
}

function runTactician(input: AgentManagerInput): SpecialistResult<TacticianResult> {
  return runSpecialist('tactician', 'Tactical analyst', 'Compared the objective against team, chemistry, and simulation metrics.', () => {
    const sorted = relevantTeamRatings(input).sort((left, right) => left[1] - right[1])
    const weakestMetric = sorted[0]
    const strongestMetric = sorted[sorted.length - 1]
    const weakestLabel = ratingLabels[weakestMetric[0]] ?? weakestMetric[0]
    const strongestLabel = ratingLabels[strongestMetric[0]] ?? strongestMetric[0]
    return {
      weakestMetric,
      strongestMetric,
      formationPlan: objectivePlan(input, weakestLabel),
      recommendation: {
        title: `Build around ${strongestLabel.toLowerCase()}`,
        detail: `${strongestLabel} is the clearest advantage at ${strongestMetric[1]}. Use it to cover ${weakestLabel.toLowerCase()} (${weakestMetric[1]}) instead of changing the entire identity.`,
        evidence: [
          `${strongestLabel}: ${strongestMetric[1]}`,
          `${weakestLabel}: ${weakestMetric[1]}`,
          `Tactic: ${input.tactic.identity}`,
        ],
      },
    }
  })
}

function runCritic(input: AgentManagerInput, scout: ScoutResult, tactician: TacticianResult): SpecialistResult<CriticResult> {
  return runSpecialist('critic', 'Risk critic', 'Challenged the plan against weak links, tactical warnings, and run probabilities.', () => {
    const risks = [
      ...input.tactic.weaknesses,
      ...input.chemistry.warnings,
      ...scout.fitRisks.map((member) => `${member.player} is only a ${member.positionFit}% fit at ${member.slot}.`),
    ].filter(Boolean).slice(0, 4)
    const dataConfidence = input.teamRatings.dataConfidence
    const tacticalSpread = tactician.strongestMetric[1] - tactician.weakestMetric[1]
    const confidence = Math.max(55, Math.min(96, Math.round(dataConfidence - tacticalSpread * 0.35 - risks.length * 1.5)))
    return {
      risks: risks.length ? risks : ['No structural red flag; the main risk is match variance rather than squad construction.'],
      confidence,
      recommendation: {
        title: 'Keep a rollback path',
        detail: `Test the first adjustment against the current ${input.record.wins}-${input.record.draws}-${input.record.losses} baseline. Keep it only if xGA and loss probability improve without materially reducing win probability.`,
        evidence: [
          `Win probability: ${input.simulation.averageWinProbability}%`,
          `Loss probability: ${input.simulation.averageLossProbability}%`,
          `xGA per match: ${input.simulation.expectedGoalsAgainstPerMatch}`,
        ],
      },
    }
  })
}

function strengthSummary(tactician: TacticianResult, input: AgentManagerInput): string[] {
  const strongestLabel = ratingLabels[tactician.strongestMetric[0]] ?? tactician.strongestMetric[0]
  return [
    `${strongestLabel}: ${tactician.strongestMetric[1]}`,
    `${input.tactic.identity}: ${input.tactic.strengths.slice(0, 2).join(' + ') || 'adaptable structure'}`,
    `Trophy probability: ${input.simulation.trophyProbability}%`,
  ]
}

export function runLocalAgentManager(input: AgentManagerInput, fallbackReason?: string): AgentManagerReport {
  const contextTrace: AgentTrace = {
    id: 'context',
    label: 'Context builder',
    status: 'completed',
    durationMs: 0,
    note: `Grounded the run in ${input.squad.length} players and structured simulation metrics.`,
  }
  const scout = runScout(input)
  const tactician = runTactician(input)
  const critic = runCritic(input, scout.value, tactician.value)
  const manager = runSpecialist('manager', 'Manager synthesis', 'Merged specialist recommendations and preserved a measurable rollback gate.', () => {
    const weakestLabel = ratingLabels[tactician.value.weakestMetric[0]] ?? tactician.value.weakestMetric[0]
    return {
      headline: `${input.tactic.identity} is viable; fix ${weakestLabel.toLowerCase()} before adding more star power.`,
      summary: `The agent team reviewed the ${input.formationId}, every player fit, the tactic report, and the simulated ${input.record.wins}-${input.record.draws}-${input.record.losses} run. The highest-leverage move is a targeted correction, not a rebuild.`,
    }
  })

  return {
    version: 1,
    runId: input.runId,
    objective: input.objective,
    source: 'local',
    headline: manager.value.headline,
    summary: manager.value.summary,
    formationPlan: tactician.value.formationPlan,
    keyChanges: [scout.value.recommendation, tactician.value.recommendation, critic.value.recommendation],
    strengths: strengthSummary(tactician.value, input),
    risks: critic.value.risks,
    confidence: critic.value.confidence,
    evidence: [
      `Overall: ${input.teamRatings.overall}`,
      `Chemistry: ${input.chemistry.score}`,
      `Role balance: ${input.chemistry.roleBalance}`,
      `${scout.value.weakest.player} role score: ${roleScore(scout.value.weakest)}`,
    ],
    guardrails: [
      'Grounded only in this run’s structured squad and simulation data',
      'No external player claims or invented transfer targets',
      'Every recommendation includes a measurable evidence trail',
      'Changes require a regression check against the original run',
    ],
    traces: [contextTrace, scout.trace, tactician.trace, critic.trace, manager.trace],
    generatedAt: new Date().toISOString(),
    fallbackReason,
  }
}
