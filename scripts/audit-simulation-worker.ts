import { parentPort, workerData } from 'node:worker_threads'
import { simulateRun } from '../src/engine/simulation'
import type { DraftPick, RunResult } from '../src/types'
import { auditSeeds } from './simulationAuditConfig'

type DraftBaseline = 'random' | 'greedy_raw' | 'smart'

interface WorkerJob {
  modeId: string
  baseline: DraftBaseline
  picks: DraftPick[]
  startIndex: number
  count: number
}

interface RunCounters {
  runs: number
  perfect: number
  undefeated: number
  invincible: number
  nearPerfect: number
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  longestWinStreak: number
  longestUnbeatenStreak: number
  score: number
  quality: number
}

function cycleSeed(index: number): number {
  return auditSeeds[index % auditSeeds.length]
}

function resultTier(result: RunResult): string {
  return result.resultTier?.id ?? result.perfectionResult
}

function isPerfect(result: RunResult): boolean {
  return resultTier(result) === 'perfect' || result.perfectionResult === 'Perfect'
}

function isUndefeated(result: RunResult): boolean {
  return result.record.losses === 0
}

function isInvincible(result: RunResult): boolean {
  const tier = resultTier(result)
  return tier === 'invincible' || result.perfectionResult.includes('Invincible')
}

function isNearPerfect(result: RunResult): boolean {
  const tier = resultTier(result)
  if (tier.includes('near')) return true
  return (result.record.losses === 0 && result.record.draws === 1) || (result.record.losses === 1 && result.record.draws === 0)
}

function longestStreak(matches: RunResult['matchTrace'], outcome: 'W'): number {
  let current = 0
  let longest = 0
  for (const match of matches) {
    if (match.outcome === outcome) current += 1
    else current = 0
    longest = Math.max(longest, current)
  }
  return longest
}

function longestUnbeatenStreak(matches: RunResult['matchTrace']): number {
  let current = 0
  let longest = 0
  for (const match of matches) {
    if (match.outcome !== 'L') current += 1
    else current = 0
    longest = Math.max(longest, current)
  }
  return longest
}

function teamQuality(result: RunResult): number {
  return result.effectiveTeamQuality?.score ?? result.teamRatings.overall
}

function runScore(result: RunResult): number {
  return result.record.wins * 3 + result.record.draws - result.record.losses * 3 + (result.goalsFor - result.goalsAgainst) * 0.08
}

function emptyCounters(): RunCounters {
  return {
    runs: 0,
    perfect: 0,
    undefeated: 0,
    invincible: 0,
    nearPerfect: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    longestWinStreak: 0,
    longestUnbeatenStreak: 0,
    score: 0,
    quality: 0,
  }
}

function addResult(counters: RunCounters, result: RunResult): void {
  counters.runs += 1
  counters.perfect += isPerfect(result) ? 1 : 0
  counters.undefeated += isUndefeated(result) ? 1 : 0
  counters.invincible += isInvincible(result) ? 1 : 0
  counters.nearPerfect += isNearPerfect(result) ? 1 : 0
  counters.wins += result.record.wins
  counters.draws += result.record.draws
  counters.losses += result.record.losses
  counters.goalsFor += result.goalsFor
  counters.goalsAgainst += result.goalsAgainst
  counters.longestWinStreak += result.streaks?.longestWinStreak ?? longestStreak(result.matchTrace, 'W')
  counters.longestUnbeatenStreak += result.streaks?.longestUnbeatenStreak ?? longestUnbeatenStreak(result.matchTrace)
  counters.score += runScore(result)
  counters.quality += teamQuality(result)
}

const job = workerData as WorkerJob
const counters = emptyCounters()

for (let index = 0; index < job.count; index += 1) {
  const runIndex = job.startIndex + index
  addResult(counters, simulateRun(job.picks, job.modeId, `AUDIT-RUN-${cycleSeed(runIndex)}-${job.modeId}-${job.baseline}-${runIndex}`))
}

parentPort?.postMessage(counters)
