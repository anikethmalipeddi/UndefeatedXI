import { agentObjectives, type AgentManagerInput, type AgentManagerReport, type AgentObjective, type AgentTrace } from './types'

const objectiveIds = new Set<AgentObjective>(agentObjectives.map((objective) => objective.id))
const traceIds = new Set<AgentTrace['id']>(['context', 'scout', 'tactician', 'critic', 'manager'])

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function cleanText(value: unknown, limit: number): string {
  return typeof value === 'string'
    ? [...value]
        .map((character) => {
          const code = character.codePointAt(0) ?? 0
          return code < 32 || code === 127 ? ' ' : character
        })
        .join('')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, limit)
    : ''
}

function cleanTextArray(value: unknown, limit: number, itemLimit: number): string[] {
  if (!Array.isArray(value)) return []
  return value.map((item) => cleanText(item, itemLimit)).filter(Boolean).slice(0, limit)
}

function cleanObjective(value: unknown, fallback: AgentObjective): AgentObjective {
  return objectiveIds.has(value as AgentObjective) ? value as AgentObjective : fallback
}

export function validateAgentManagerInput(input: AgentManagerInput): string[] {
  const issues: string[] = []
  const serializedLength = JSON.stringify(input).length
  if (serializedLength > 30000) issues.push('Agent context is too large.')
  if (!/^IXI-[A-Z0-9]{4,16}$/.test(input.runId)) issues.push('Invalid run id.')
  if (!/^[a-z0-9_]+$/.test(input.modeId)) issues.push('Invalid mode id.')
  if (!/^\d-\d-\d(?:-\d)?$/.test(input.formationId)) issues.push('Invalid formation id.')
  if (!objectiveIds.has(input.objective)) issues.push('Invalid agent objective.')
  if (input.squad.length < 1 || input.squad.length > 18) issues.push('Invalid squad size.')
  if (input.squad.some((member) => !member.player || member.player.length > 80 || member.positionFit < 0 || member.positionFit > 100)) {
    issues.push('Invalid squad member.')
  }
  if (Object.values(input.teamRatings).some((value) => !Number.isFinite(value) || value < 0 || value > 100)) {
    issues.push('Invalid team ratings.')
  }
  return issues
}

export function parseAgentManagerReport(value: unknown, input: AgentManagerInput): AgentManagerReport | null {
  if (!isRecord(value)) return null
  const keyChanges = Array.isArray(value.keyChanges)
    ? value.keyChanges.slice(0, 4).flatMap((item) => {
        if (!isRecord(item)) return []
        const title = cleanText(item.title, 90)
        const detail = cleanText(item.detail, 360)
        const evidence = cleanTextArray(item.evidence, 4, 140)
        return title && detail && evidence.length ? [{ title, detail, evidence }] : []
      })
    : []
  const traces = Array.isArray(value.traces)
    ? value.traces.slice(0, 8).flatMap((item) => {
        if (!isRecord(item) || !traceIds.has(item.id as AgentTrace['id'])) return []
        const label = cleanText(item.label, 80)
        const note = cleanText(item.note, 220)
        const status = item.status === 'fallback' ? 'fallback' as const : 'completed' as const
        const durationMs = Math.max(0, Math.min(60000, Math.round(Number(item.durationMs) || 0)))
        return label && note ? [{ id: item.id as AgentTrace['id'], label, note, status, durationMs }] : []
      })
    : []
  const report: AgentManagerReport = {
    version: 1,
    runId: cleanText(value.runId, 32),
    objective: cleanObjective(value.objective, input.objective),
    source: value.source === 'openai' ? 'openai' : 'local',
    model: cleanText(value.model, 80) || undefined,
    headline: cleanText(value.headline, 180),
    summary: cleanText(value.summary, 600),
    formationPlan: cleanText(value.formationPlan, 500),
    keyChanges,
    strengths: cleanTextArray(value.strengths, 6, 180),
    risks: cleanTextArray(value.risks, 6, 220),
    confidence: Math.max(0, Math.min(100, Math.round(Number(value.confidence) || 0))),
    evidence: cleanTextArray(value.evidence, 8, 180),
    guardrails: cleanTextArray(value.guardrails, 8, 180),
    traces,
    generatedAt: cleanText(value.generatedAt, 40) || new Date().toISOString(),
    fallbackReason: cleanText(value.fallbackReason, 240) || undefined,
  }
  if (
    report.runId !== input.runId
    || !report.headline
    || !report.summary
    || !report.formationPlan
    || report.keyChanges.length < 2
    || report.strengths.length < 1
    || report.risks.length < 1
    || report.evidence.length < 2
    || report.guardrails.length < 2
    || report.traces.length < 3
  ) return null
  return report
}
