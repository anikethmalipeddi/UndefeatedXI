import type { RunResult } from '../types'
import { targetRecordLabel } from '../brand'

export function formatRecord(record: RunResult['record']): string {
  return `${record.wins}-${record.draws}-${record.losses}`
}

export function createShareText(result: Pick<RunResult, 'record' | 'modeName' | 'grade' | 'gradeLabel' | 'goalsFor' | 'goalsAgainst' | 'tacticReport' | 'bestPlayer' | 'weakLink'>): string {
  return [
    `My ${targetRecordLabel} went ${formatRecord(result.record)} in ${result.modeName}.`,
    `Grade: ${result.grade} - ${result.gradeLabel}`,
    `GF: ${result.goalsFor} | GA: ${result.goalsAgainst} | GD: ${result.goalsFor - result.goalsAgainst}`,
    `Tactic: ${result.tacticReport.identity}`,
    `Best player: ${result.bestPlayer}`,
    `Weak link: ${result.weakLink}`,
    `Can your XI go ${targetRecordLabel}?`,
  ].join('\n')
}
