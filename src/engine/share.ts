import type { RunResult } from '../types'
import { targetRecordLabel } from '../brand'

export function formatRecord(record: RunResult['record']): string {
  return `${record.wins}-${record.draws}-${record.losses}`
}

export function createShareText(result: Pick<RunResult, 'record' | 'modeName' | 'grade' | 'gradeLabel' | 'goalsFor' | 'goalsAgainst' | 'tacticReport' | 'bestPlayer' | 'weakLink'> & Partial<Pick<RunResult, 'resultTier' | 'streaks' | 'tacticalReason'>>): string {
  const tierLabel = result.resultTier?.label ?? result.gradeLabel
  const streakLine = result.streaks ? `Longest win streak: ${result.streaks.longestWinStreak}` : `Grade: ${result.grade} - ${result.gradeLabel}`
  const reason = result.tacticalReason?.summary
  return [
    `My ${targetRecordLabel} went ${formatRecord(result.record)} in ${result.modeName}.`,
    `Tier: ${tierLabel}`,
    streakLine,
    `GF: ${result.goalsFor} | GA: ${result.goalsAgainst} | GD: ${result.goalsFor - result.goalsAgainst}`,
    `Tactic: ${result.tacticReport.identity}`,
    ...(reason ? [`Why: ${reason}`] : []),
    `Best player: ${result.bestPlayer}`,
    `Weak link: ${result.weakLink}`,
    `Can your XI go ${targetRecordLabel}?`,
  ].join('\n')
}
