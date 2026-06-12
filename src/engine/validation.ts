import { formations } from '../data/formations'
import { modeConfigs } from '../data/modes'
import { playerContexts } from '../data/playerContexts'
import { getDraftSlots } from '../data/squad'
import { modeMatchesPlayer, slotMatchesPlayer } from './eligibility'
import type { FormationSlot, ModeConfig, ModeValidation } from '../types'

function coverageForSlot(mode: ModeConfig, slot: FormationSlot, strictMode: boolean): number {
  return playerContexts.filter((player) => slotMatchesPlayer(slot, player) && modeMatchesPlayer(mode, player, strictMode)).length
}

function recordMinimumCoverage(summary: Record<string, number>, label: string, coverage: number): void {
  summary[label] = Math.min(summary[label] ?? Number.POSITIVE_INFINITY, coverage)
}

export function validateMode(mode: ModeConfig): ModeValidation {
  const slotCoverage: Record<string, number> = {}
  const demoSlotCoverage: Record<string, number> = {}
  const formationCoverage: Record<string, Record<string, number>> = {}
  const demoFormationCoverage: Record<string, Record<string, number>> = {}
  const issues: string[] = []
  const contextCount = playerContexts.filter((player) => modeMatchesPlayer(mode, player, true)).length
  const allowedFormations = formations.filter((formation) => mode.allowedFormations.includes(formation.formationId))

  for (const formation of allowedFormations) {
    const draftSlots = getDraftSlots(mode, formation)
    formationCoverage[formation.formationId] = {}
    demoFormationCoverage[formation.formationId] = {}

    for (const slot of draftSlots) {
      const coverage = coverageForSlot(mode, slot, true)
      const demoCoverage = coverageForSlot(mode, slot, false)
      const coverageKey = `${slot.label} (${slot.slotId})`
      formationCoverage[formation.formationId][coverageKey] = coverage
      demoFormationCoverage[formation.formationId][coverageKey] = demoCoverage
      recordMinimumCoverage(slotCoverage, slot.label, coverage)
      recordMinimumCoverage(demoSlotCoverage, slot.label, demoCoverage)

      if (coverage < 2) {
        issues.push(`${formation.name} ${slot.label} has thin coverage.`)
      }
    }
  }

  const playable = contextCount > 0 && issues.length === 0
  const demoPlayable = Object.values(demoFormationCoverage).every((formation) => Object.values(formation).every((coverage) => coverage >= 2))

  return {
    modeId: mode.modeId,
    contextCount,
    playable,
    demoPlayable,
    readiness: playable ? 'ready' : demoPlayable ? 'demo' : 'thin',
    slotCoverage,
    demoSlotCoverage,
    formationCoverage,
    demoFormationCoverage,
    issues,
  }
}

export const modeValidations = modeConfigs.map(validateMode)

export function publicModeIsReady(modeId: string): boolean {
  return modeValidations.find((validation) => validation.modeId === modeId)?.playable ?? false
}

export function validateDataSet(): string[] {
  const issues: string[] = []
  const ids = new Set<string>()

  for (const player of playerContexts) {
    if (ids.has(player.contextId)) issues.push(`Duplicate context id: ${player.contextId}`)
    ids.add(player.contextId)
    if (player.positions.length === 0) issues.push(`${player.contextId} has no positions`)
    if (player.eligibleModes.length === 0) issues.push(`${player.contextId} has no eligible modes`)
    for (const value of Object.values(player.ratings)) {
      if (value < 0 || value > 100) issues.push(`${player.contextId} has an invalid rating`)
    }
  }

  for (const mode of modeConfigs) {
    if (mode.allowedFormations.length === 0) issues.push(`${mode.modeId} has no allowed formations`)
    for (const formationId of mode.allowedFormations) {
      if (!formations.some((formation) => formation.formationId === formationId)) issues.push(`${mode.modeId} references unknown formation ${formationId}`)
    }
    if (mode.teamPool.length === 0 || mode.eraPool.length === 0) issues.push(`${mode.modeId} has empty roll pools`)
    if (mode.rosterSlots.starters !== 11) issues.push(`${mode.modeId} must define 11 starters`)
    if (mode.rosterSlots.total !== mode.rosterSlots.starters + mode.rosterSlots.bench) issues.push(`${mode.modeId} has inconsistent roster slots`)
    if (mode.rosterSlots.bench < 0 || mode.rosterSlots.total < 11) issues.push(`${mode.modeId} has invalid roster slots`)
  }

  return issues
}
