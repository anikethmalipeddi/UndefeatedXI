import { makeAgentEvalInput } from '../src/agents/evalFixtures'
import { runLocalAgentManager } from '../src/agents/localManager'
import { parseAgentManagerReport, validateAgentManagerInput } from '../src/agents/validation'

interface EvalCase {
  name: string
  passed: boolean
  detail: string
}

const reports = ['balanced', 'attack', 'resilience'].map((objective, index) => {
  const input = makeAgentEvalInput(objective as 'balanced' | 'attack' | 'resilience', `IXI-EVAL20${27 + index}`)
  return { input, report: runLocalAgentManager(input) }
})
const rosterNames = new Set(reports[0].input.squad.map((member) => member.player))
const cases: EvalCase[] = [
  {
    name: 'input-schema',
    passed: reports.every(({ input }) => validateAgentManagerInput(input).length === 0),
    detail: 'All eval contexts pass request validation.',
  },
  {
    name: 'output-schema',
    passed: reports.every(({ input, report }) => parseAgentManagerReport(report, input) !== null),
    detail: 'All reports survive the same boundary validation as cloud output.',
  },
  {
    name: 'trace-completeness',
    passed: reports.every(({ report }) => new Set(report.traces.map((trace) => trace.id)).size === 5),
    detail: 'Every run exposes context, scout, tactician, critic, and manager stages.',
  },
  {
    name: 'evidence-coverage',
    passed: reports.every(({ report }) => report.keyChanges.length === 3 && report.keyChanges.every((change) => change.evidence.length > 0)),
    detail: 'Each plan contains three evidence-backed changes.',
  },
  {
    name: 'objective-sensitivity',
    passed: new Set(reports.map(({ report }) => report.formationPlan)).size === reports.length,
    detail: 'Balanced, attack, and resilience objectives produce different plans.',
  },
  {
    name: 'roster-grounding',
    passed: reports.every(({ report }) => {
      const playerMentions = report.evidence.filter((line) => line.includes('role score')).map((line) => line.split(' role score')[0])
      return playerMentions.every((name) => rosterNames.has(name))
    }),
    detail: 'Every named player in generated evidence belongs to the supplied squad.',
  },
]

for (const item of cases) {
  console.log(`${item.passed ? 'PASS' : 'FAIL'} ${item.name}: ${item.detail}`)
}

const failures = cases.filter((item) => !item.passed)
console.log(`\n${cases.length - failures.length}/${cases.length} agent evals passed.`)
if (failures.length) process.exitCode = 1
