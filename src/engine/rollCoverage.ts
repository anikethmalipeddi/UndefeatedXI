import { eraMatches, modeMatchesPlayer, teamMatches } from './eligibility'
import type { ModeConfig, PlayerContext, RollCoverageSummary, RollResult, TeamRollOption } from '../types'

export const rollCoverageThresholds = {
  minimumTotal: 18,
  minimumGk: 1,
  minimumDef: 5,
  minimumMid: 5,
  minimumAtt: 4,
  minimumTeamContexts: 24,
}

const defensivePositions = new Set(['GK', 'LB', 'CB', 'RB', 'LWB', 'RWB', 'DM'])
const midfieldPositions = new Set(['DM', 'CM', 'AM', 'LM', 'RM'])
const attackingPositions = new Set(['AM', 'LM', 'RM', 'LW', 'RW', 'CF', 'ST'])

function uniquePeople(players: PlayerContext[]): PlayerContext[] {
  const seen = new Set<string>()
  return players.filter((player) => {
    if (seen.has(player.personId)) return false
    seen.add(player.personId)
    return true
  })
}

function countRole(players: PlayerContext[], roles: Set<string>): number {
  return uniquePeople(players.filter((player) => player.positions.some((position) => roles.has(position)))).length
}

export function issuesForRollCoverage(summary: Pick<RollCoverageSummary, 'total' | 'gk' | 'def' | 'mid' | 'att'>): string[] {
  const issues: string[] = []
  if (summary.total < rollCoverageThresholds.minimumTotal) issues.push(`needs ${rollCoverageThresholds.minimumTotal} players`)
  if (summary.gk < rollCoverageThresholds.minimumGk) issues.push('needs a goalkeeper')
  if (summary.def < rollCoverageThresholds.minimumDef) issues.push(`needs ${rollCoverageThresholds.minimumDef} defensive options`)
  if (summary.mid < rollCoverageThresholds.minimumMid) issues.push(`needs ${rollCoverageThresholds.minimumMid} midfield options`)
  if (summary.att < rollCoverageThresholds.minimumAtt) issues.push(`needs ${rollCoverageThresholds.minimumAtt} attacking options`)
  return issues
}

export function rollCoverageMeetsDepth(summary: Pick<RollCoverageSummary, 'total' | 'gk' | 'def' | 'mid' | 'att'>): boolean {
  return issuesForRollCoverage(summary).length === 0
}

export function summarizeRollPool(team: TeamRollOption, era: string, pool: PlayerContext[]): RollCoverageSummary {
  const uniquePool = uniquePeople(pool)
  const summary = {
    team,
    era,
    total: uniquePool.length,
    gk: countRole(uniquePool, new Set(['GK'])),
    def: countRole(uniquePool, defensivePositions),
    mid: countRole(uniquePool, midfieldPositions),
    att: countRole(uniquePool, attackingPositions),
  }

  const issues = issuesForRollCoverage(summary)
  return {
    ...summary,
    playable: issues.length === 0,
    issues,
  }
}

export function playersForRoll(mode: ModeConfig, team: TeamRollOption, era: string, players: PlayerContext[], strictMode = false): PlayerContext[] {
  const roll: RollResult = { team, era }
  return uniquePeople(players.filter((player) => modeMatchesPlayer(mode, player, strictMode) && teamMatches(mode, roll, player) && eraMatches(mode, roll, player)))
}

export function summarizeModeRollCoverage(mode: ModeConfig, players: PlayerContext[], strictMode = false): RollCoverageSummary[] {
  return mode.teamPool.flatMap((team) =>
    mode.eraPool.map((era) => summarizeRollPool(team, era, playersForRoll(mode, team, era, players, strictMode))),
  )
}

export function playableTeamsForMode(mode: ModeConfig, coverage: RollCoverageSummary[], players: PlayerContext[], strictMode = false): TeamRollOption[] {
  return mode.teamPool.filter((team) => {
    const teamContexts = uniquePeople(players.filter((player) => (
      modeMatchesPlayer(mode, player, strictMode) &&
      player.teamType === team.teamType &&
      player.teamName === team.label
    )))
    return teamContexts.length >= rollCoverageThresholds.minimumTeamContexts && coverage.some((roll) => roll.team.label === team.label && roll.team.teamType === team.teamType && roll.playable)
  })
}

export function incompleteTeamsForMode(mode: ModeConfig, coverage: RollCoverageSummary[], players: PlayerContext[], strictMode = false) {
  const playableTeamKeys = new Set(playableTeamsForMode(mode, coverage, players, strictMode).map((team) => `${team.teamType}:${team.label}`))
  return mode.teamPool
    .filter((team) => !playableTeamKeys.has(`${team.teamType}:${team.label}`))
    .map((team) => {
      const teamContexts = uniquePeople(players.filter((player) => (
        modeMatchesPlayer(mode, player, strictMode) &&
        player.teamType === team.teamType &&
        player.teamName === team.label
      )))
      const rollIssues = coverage
        .filter((roll) => roll.team.label === team.label && roll.team.teamType === team.teamType)
        .flatMap((roll) => roll.issues)
      const reasons = Array.from(new Set([
        ...(teamContexts.length < rollCoverageThresholds.minimumTeamContexts ? [`only ${teamContexts.length} loaded contexts`] : []),
        ...(rollIssues.length > 0 ? rollIssues : ['no playable era roll']),
      ])).slice(0, 6)

      return { team, reasons }
    })
}
