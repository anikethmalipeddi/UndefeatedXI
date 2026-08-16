import type { ChemistryReport, TeamRatings } from '../types'

export const agentObjectives = [
  { id: 'balanced', label: 'Balance the XI', description: 'Protect the unbeaten run without flattening the attack.' },
  { id: 'attack', label: 'Chase more goals', description: 'Increase chance creation and finishing without losing control.' },
  { id: 'resilience', label: 'Protect the run', description: 'Reduce weak links, transition risk, and late-match variance.' },
] as const

export type AgentObjective = (typeof agentObjectives)[number]['id']
export type AgentReportSource = 'openai' | 'local'
export type AgentTraceStatus = 'completed' | 'fallback'

export interface AgentSquadMember {
  player: string
  slot: string
  team: string
  era: string
  primaryPositions: string[]
  roleTags: string[]
  positionFit: number
  ratings: {
    attack: number
    creation: number
    control: number
    defense: number
    goalkeeping: number
    physical: number
    press: number
    bigGame: number
  }
}
export interface AgentManagerInput {
  version: 1
  runId: string
  modeId: string
  modeName: string
  formationId: string
  objective: AgentObjective
  targetRecord: string
  record: {
    wins: number
    draws: number
    losses: number
  }
  teamRatings: TeamRatings
  tactic: {
    identity: string
    summary: string
    strengths: string[]
    weaknesses: string[]
  }
  chemistry: Pick<ChemistryReport, 'score' | 'roleBalance' | 'warnings' | 'bonuses'>
  simulation: {
    trophyProbability: number
    perfectRunProbability?: number
    expectedGoalsForPerMatch: number
    expectedGoalsAgainstPerMatch: number
    averageWinProbability: number
    averageLossProbability: number
  }
  squad: AgentSquadMember[]
}

export interface AgentRecommendation {
  title: string
  detail: string
  evidence: string[]
}

export interface AgentTrace {
  id: 'context' | 'scout' | 'tactician' | 'critic' | 'manager'
  label: string
  status: AgentTraceStatus
  durationMs: number
  note: string
}

export interface AgentManagerReport {
  version: 1
  runId: string
  objective: AgentObjective
  source: AgentReportSource
  model?: string
  headline: string
  summary: string
  formationPlan: string
  keyChanges: AgentRecommendation[]
  strengths: string[]
  risks: string[]
  confidence: number
  evidence: string[]
  guardrails: string[]
  traces: AgentTrace[]
  generatedAt: string
  fallbackReason?: string
}
