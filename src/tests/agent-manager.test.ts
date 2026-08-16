import { describe, expect, it } from 'vitest'
import { makeAgentEvalInput } from '../agents/evalFixtures'
import { runLocalAgentManager } from '../agents/localManager'
import { parseAgentManagerReport, validateAgentManagerInput } from '../agents/validation'

describe('agent manager', () => {
  it('produces a complete grounded report with an inspectable trace', () => {
    const input = makeAgentEvalInput()
    const report = runLocalAgentManager(input)

    expect(validateAgentManagerInput(input)).toEqual([])
    expect(report.runId).toBe(input.runId)
    expect(report.keyChanges).toHaveLength(3)
    expect(report.keyChanges.every((change) => change.evidence.length > 0)).toBe(true)
    expect(report.traces.map((trace) => trace.id)).toEqual(['context', 'scout', 'tactician', 'critic', 'manager'])
    expect(report.guardrails).toEqual(expect.arrayContaining([
      expect.stringMatching(/structured squad/i),
      expect.stringMatching(/regression check/i),
    ]))
    expect(JSON.stringify(report)).not.toContain('Transfer Target')
  })

  it('changes the plan when the user changes the objective', () => {
    const attack = runLocalAgentManager(makeAgentEvalInput('attack'))
    const resilience = runLocalAgentManager(makeAgentEvalInput('resilience'))

    expect(attack.formationPlan).not.toBe(resilience.formationPlan)
    expect(attack.formationPlan).toMatch(/creator/i)
    expect(resilience.formationPlan).toMatch(/compact/i)
  })

  it('rejects ungrounded or malformed cloud output', () => {
    const input = makeAgentEvalInput()
    const report = runLocalAgentManager(input)

    expect(parseAgentManagerReport({ ...report, runId: 'IXI-WRONG' }, input)).toBeNull()
    expect(parseAgentManagerReport({ ...report, keyChanges: [] }, input)).toBeNull()
    expect(parseAgentManagerReport({ ...report, headline: '<script> noisy\u0000 headline </script>' }, input)?.headline)
      .toBe('<script> noisy headline </script>')
  })
})
