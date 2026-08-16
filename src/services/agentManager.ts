import { runLocalAgentManager } from '../agents/localManager'
import type { AgentManagerInput, AgentManagerReport } from '../agents/types'
import { parseAgentManagerReport, validateAgentManagerInput } from '../agents/validation'

export interface AgentManagerRunOptions {
  preferCloud: boolean
}

async function functionErrorMessage(error: unknown): Promise<string> {
  if (!error || typeof error !== 'object') return 'The cloud agent workflow was unavailable.'
  const context = 'context' in error ? error.context : undefined
  if (context instanceof Response) {
    const body = await context.clone().json().catch(() => null) as { error?: string } | null
    if (body?.error) return body.error
  }
  return 'message' in error && typeof error.message === 'string'
    ? error.message
    : 'The cloud agent workflow was unavailable.'
}

export async function runAgentManager(
  input: AgentManagerInput,
  options: AgentManagerRunOptions,
): Promise<AgentManagerReport> {
  const inputIssues = validateAgentManagerInput(input)
  if (inputIssues.length) throw new Error(inputIssues[0])
  if (!options.preferCloud) return runLocalAgentManager(input)

  try {
    const { supabase } = await import('./supabase')
    if (!supabase) return runLocalAgentManager(input, 'Cloud agents are not configured on this build.')
    const { data, error } = await supabase.functions.invoke('agent-manager', { body: input })
    if (error) throw new Error(await functionErrorMessage(error))
    const report = parseAgentManagerReport(data, input)
    if (!report) throw new Error('The cloud agent response failed schema validation.')
    return report
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'The cloud agent workflow was unavailable.'
    return runLocalAgentManager(input, reason)
  }
}
