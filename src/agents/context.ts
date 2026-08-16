import { positionFitScore } from '../engine/simulationModel'
import type { DraftPick, RunResult } from '../types'
import type { AgentManagerInput, AgentObjective } from './types'

function compactRoles(roleTags: string[]): string[] {
  return [...new Set(roleTags.map((role) => role.trim()).filter(Boolean))].slice(0, 6)
}
export function buildAgentManagerInput(
  result: RunResult,
  picks: DraftPick[],
  formationId: string,
  objective: AgentObjective,
): AgentManagerInput {
  return {
    version: 1,
    runId: result.runId,
    modeId: result.modeId,
    modeName: result.modeName,
    formationId,
    objective,
    targetRecord: result.targetRecord,
    record: { ...result.record },
    teamRatings: { ...result.teamRatings },
    tactic: {
      identity: result.tacticReport.identity,
      summary: result.tacticReport.summary,
      strengths: result.tacticReport.strengths.slice(0, 6),
      weaknesses: result.tacticReport.weaknesses.slice(0, 6),
    },
    chemistry: {
      score: result.chemistryReport.score,
      roleBalance: result.chemistryReport.roleBalance,
      warnings: result.chemistryReport.warnings.slice(0, 6),
      bonuses: result.chemistryReport.bonuses.slice(0, 6),
    },
    simulation: {
      trophyProbability: result.simulationDetails.trophyProbability,
      perfectRunProbability: result.simulationDetails.perfectRunProbability,
      expectedGoalsForPerMatch: result.simulationDetails.expectedGoalsForPerMatch,
      expectedGoalsAgainstPerMatch: result.simulationDetails.expectedGoalsAgainstPerMatch,
      averageWinProbability: result.simulationDetails.averageWinProbability,
      averageLossProbability: result.simulationDetails.averageLossProbability,
    },
    squad: picks.map((pick) => ({
      player: pick.player.displayName,
      slot: pick.slot.label,
      team: pick.roll.team.label,
      era: pick.roll.era,
      primaryPositions: pick.player.primaryPositions.slice(0, 4),
      roleTags: compactRoles(pick.player.roleTags),
      positionFit: positionFitScore(pick.slot, pick.player),
      ratings: {
        attack: pick.player.ratings.attack,
        creation: pick.player.ratings.creation,
        control: pick.player.ratings.control,
        defense: pick.player.ratings.defense,
        goalkeeping: pick.player.ratings.goalkeeping,
        physical: pick.player.ratings.physical,
        press: pick.player.ratings.press,
        bigGame: pick.player.ratings.bigGame,
      },
    })),
  }
}
