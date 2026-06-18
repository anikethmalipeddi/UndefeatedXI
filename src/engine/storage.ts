import type { RunResult } from '../types'
import { modeDifficultyScore, scoringVersion } from './simulationModel'

const legacyStorageKeys = ['38-0-0.preferences', 'invinciblexi.preferences']
const storageKey = 'undefeatedxi.preferences'
const maxRecentRuns = 12

export interface StoredRunSummary {
  runId: string
  modeId: string
  modeName: string
  formationId: string
  record: RunResult['record']
  grade: string
  gradeLabel: string
  trophyResult: string
  perfectionResult: string
  resultTier?: RunResult['resultTier']
  scoringVersion?: number
  points?: number
  goalsFor: number
  goalsAgainst: number
  xgFor: number
  xgAgainst: number
  bestPlayer: string
  score: number
  createdAt: string
}

export interface StoredPreferences {
  modeId: string
  formationId: string
  bestRecords: Record<string, StoredRunSummary>
  recentRuns: StoredRunSummary[]
}

export function formatStoredRecord(record: RunResult['record']): string {
  return `${record.wins}-${record.draws}-${record.losses}`
}

function legacyTierRank(result: Pick<RunResult, 'grade' | 'perfectionResult'>): number {
  if (result.perfectionResult === 'Perfect') return 800
  if (result.perfectionResult.includes('Invincible')) return 700
  if (result.grade === 'A+') return 640
  if (result.grade === 'A') return 560
  if (result.grade === 'B') return 470
  if (result.grade === 'C') return 320
  return 120
}

export function scoreRun(result: Pick<RunResult, 'modeId' | 'record' | 'grade' | 'points' | 'goalsFor' | 'goalsAgainst' | 'xgFor' | 'xgAgainst' | 'trophyResult' | 'perfectionResult'> & Partial<Pick<RunResult, 'resultTier' | 'effectiveTeamQuality' | 'scoringVersion'>>): number {
  const matches = Math.max(1, result.record.wins + result.record.draws + result.record.losses)
  const tierRank = result.resultTier?.rank ?? legacyTierRank(result)
  const winRate = result.record.wins / matches
  const goalDifferential = result.goalsFor - result.goalsAgainst
  const xgDifferential = result.xgFor - result.xgAgainst
  const pointsScore = result.points ?? result.record.wins * 3 + result.record.draws
  const trophyBonus = result.trophyResult === 'Trophy won' ? 850 : result.trophyResult.includes('Champion') ? 700 : 0
  const teamQuality = result.effectiveTeamQuality?.score ?? 0

  return Math.round(
    tierRank * 14 +
      winRate * 2100 +
      modeDifficultyScore(result.modeId) * 14 +
      goalDifferential * 7 +
      xgDifferential * 2 +
      pointsScore * 3 +
      teamQuality * 8 -
      result.record.losses * 180 +
      trophyBonus,
  )
}

export function summarizeRun(result: RunResult, formationId: string, createdAt = new Date().toISOString()): StoredRunSummary {
  return {
    runId: result.runId,
    modeId: result.modeId,
    modeName: result.modeName,
    formationId,
    record: result.record,
    grade: result.grade,
    gradeLabel: result.gradeLabel,
    trophyResult: result.trophyResult,
    perfectionResult: result.perfectionResult,
    resultTier: result.resultTier,
    scoringVersion: result.scoringVersion ?? scoringVersion,
    points: result.points,
    goalsFor: result.goalsFor,
    goalsAgainst: result.goalsAgainst,
    xgFor: result.xgFor,
    xgAgainst: result.xgAgainst,
    bestPlayer: result.bestPlayer,
    score: scoreRun(result),
    createdAt,
  }
}

export function recordRun(preferences: Partial<StoredPreferences>, result: RunResult, formationId: string, createdAt?: string): StoredPreferences {
  const summary = summarizeRun(result, formationId, createdAt)
  const currentBest = preferences.bestRecords?.[result.modeId]
  const bestRecords = {
    ...(preferences.bestRecords ?? {}),
    [result.modeId]: !currentBest || summary.score > currentBest.score ? summary : currentBest,
  }
  const recentRuns = [
    summary,
    ...(preferences.recentRuns ?? []).filter((run) => run.runId !== summary.runId),
  ].slice(0, maxRecentRuns)

  return {
    modeId: preferences.modeId ?? result.modeId,
    formationId: preferences.formationId ?? formationId,
    bestRecords,
    recentRuns,
  }
}

function isRecord(value: unknown): value is RunResult['record'] {
  if (!value || typeof value !== 'object') return false
  const record = value as Partial<RunResult['record']>
  return typeof record.wins === 'number' && typeof record.draws === 'number' && typeof record.losses === 'number'
}

function isStoredRunSummary(value: unknown): value is StoredRunSummary {
  if (!value || typeof value !== 'object') return false
  const summary = value as Partial<StoredRunSummary>
  return (
    typeof summary.runId === 'string' &&
    typeof summary.modeId === 'string' &&
    typeof summary.modeName === 'string' &&
    isRecord(summary.record) &&
    typeof summary.grade === 'string' &&
    typeof summary.score === 'number'
  )
}

function normalizePreferences(value: unknown): Partial<StoredPreferences> {
  if (!value || typeof value !== 'object') return {}
  const preferences = value as Partial<StoredPreferences>
  const bestRecords = Object.fromEntries(
    Object.entries(preferences.bestRecords ?? {}).filter((entry): entry is [string, StoredRunSummary] => isStoredRunSummary(entry[1])),
  )
  const recentRuns = Array.isArray(preferences.recentRuns) ? preferences.recentRuns.filter(isStoredRunSummary) : []

  return {
    modeId: typeof preferences.modeId === 'string' ? preferences.modeId : undefined,
    formationId: typeof preferences.formationId === 'string' ? preferences.formationId : undefined,
    bestRecords,
    recentRuns,
  }
}

export function loadPreferences(): Partial<StoredPreferences> {
  try {
    const value = localStorage.getItem(storageKey) ?? legacyStorageKeys.map((key) => localStorage.getItem(key)).find(Boolean)
    return value ? normalizePreferences(JSON.parse(value) as unknown) : {}
  } catch {
    return {}
  }
}

export function savePreferences(preferences: Partial<StoredPreferences>): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(preferences))
    for (const key of legacyStorageKeys) localStorage.removeItem(key)
  } catch {
    // localStorage is optional for playability.
  }
}
