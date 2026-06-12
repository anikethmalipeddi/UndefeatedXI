import { mkdir, writeFile } from 'node:fs/promises'
import { modeConfigs } from '../src/data/modes'
import { modeValidations, validateDataSet } from '../src/engine/validation'

const report = {
  generatedAt: new Date().toISOString(),
  totalContexts: modeValidations.find((validation) => validation.modeId === 'world_xi')?.contextCount ?? 0,
  totalModes: modeConfigs.length,
  datasetIssues: validateDataSet(),
  modes: modeConfigs.map((mode) => {
    const validation = modeValidations.find((item) => item.modeId === mode.modeId)
    return {
      modeId: mode.modeId,
      modeName: mode.modeName,
      status: mode.status,
      contextCount: validation?.contextCount ?? 0,
      rosterSlots: mode.rosterSlots,
      playable: validation?.playable ?? false,
      demoPlayable: validation?.demoPlayable ?? false,
      readiness: validation?.readiness ?? 'thin',
      issues: validation?.issues ?? [],
      slotCoverage: validation?.slotCoverage ?? {},
      demoSlotCoverage: validation?.demoSlotCoverage ?? {},
      formationCoverage: validation?.formationCoverage ?? {},
      demoFormationCoverage: validation?.demoFormationCoverage ?? {},
    }
  }),
}

await mkdir('src/data/generated', { recursive: true })
await writeFile('src/data/generated/coverageReport.json', `${JSON.stringify(report, null, 2)}\n`)

const publicModes = report.modes.filter((mode) => mode.status === 'public')
const playablePublicModes = publicModes.filter((mode) => mode.playable)
console.log(`Coverage: ${report.totalContexts} contexts, ${playablePublicModes.length}/${publicModes.length} public modes playable.`)
