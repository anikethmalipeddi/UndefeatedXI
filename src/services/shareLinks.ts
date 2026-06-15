import { brandVersion } from '../brand'
import { formatRecord } from '../engine/share'
import { scoreRun } from '../engine/storage'
import { hasSupabaseConfig } from './supabaseConfig'
import type { DraftPick, Ratings, SharedPickSnapshot, SharedRunSnapshot, ShareResult, RunResult, TeamRatings } from '../types'

const canonicalSiteUrl = 'https://www.undefeatedxi.com/'

function getPlayerInitials(name: string): string {
  const parts = name.replace(/[^\p{L}\p{N}\s-]/gu, '').split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'XI'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts.at(-1)?.[0] ?? ''}`.toUpperCase()
}

function originForLinks(): string {
  if (typeof window === 'undefined') return canonicalSiteUrl
  const isLocalHost = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname)
  if (isLocalHost) return `${window.location.origin}${window.location.pathname}`
  return canonicalSiteUrl
}

function utf8ToBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
}

function base64UrlToUtf8(value: string): string {
  const normalized = value.replaceAll('-', '+').replaceAll('_', '/')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
  const binary = atob(padded)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

const ratingFields = ['attack', 'creation', 'control', 'defense', 'goalkeeping', 'physical', 'press', 'bigGame'] as const
const teamRatingFields = [
  'attack',
  'finishing',
  'chanceCreation',
  'ballProgression',
  'midfield',
  'midfieldControl',
  'pressResistance',
  'defense',
  'defensiveSolidity',
  'defensiveTransitions',
  'pressing',
  'aerialSetPiece',
  'goalkeeping',
  'physicality',
  'consistency',
  'chemistry',
  'bigGame',
  'tacticalCoherence',
  'eraBalance',
  'dataConfidence',
  'balance',
  'overall',
] as const

type CompactPick = [
  number,
  string,
  string,
  string,
  string,
  string,
  string,
  SharedPickSnapshot['positions'],
  number[],
]

interface CompactSharedRunSnapshot {
  v: 1
  b: string
  c: string
  id: string
  m: [string, string]
  f: string
  t: string
  r: [number, number, number]
  p?: number
  g: [number, number, number, number]
  gr: [string, string]
  res: [string, string, string | undefined, string, string, string, string, string]
  tr: number[]
  ta: SharedRunSnapshot['tacticReport']
  ch: SharedRunSnapshot['chemistryReport']
  km: Array<[string, string, string]>
  cp: Array<[string, number, number, number, number, number, number, number, string]>
  pk: CompactPick[]
}

function ratingsToArray(ratings: Ratings): number[] {
  return ratingFields.map((field) => ratings[field])
}

function ratingsFromArray(values: number[]): Ratings {
  return Object.fromEntries(ratingFields.map((field, index) => [field, values[index] ?? 0])) as unknown as Ratings
}

function teamRatingsToArray(ratings: TeamRatings): number[] {
  return teamRatingFields.map((field) => ratings[field])
}

function teamRatingsFromArray(values: number[]): TeamRatings {
  return Object.fromEntries(teamRatingFields.map((field, index) => [field, values[index] ?? 0])) as unknown as TeamRatings
}

function compactSharedRunSnapshot(snapshot: SharedRunSnapshot): CompactSharedRunSnapshot {
  return {
    v: 1,
    b: snapshot.brandVersion,
    c: snapshot.createdAt,
    id: snapshot.runId,
    m: [snapshot.modeId, snapshot.modeName],
    f: snapshot.formationId,
    t: snapshot.targetRecord,
    r: [snapshot.record.wins, snapshot.record.draws, snapshot.record.losses],
    p: snapshot.points,
    g: [snapshot.goalsFor, snapshot.goalsAgainst, snapshot.xgFor, snapshot.xgAgainst],
    gr: [snapshot.grade, snapshot.gradeLabel],
    res: [
      snapshot.trophyResult,
      snapshot.perfectionResult,
      snapshot.stage,
      snapshot.bestPlayer,
      snapshot.weakLink,
      snapshot.strongestUnit,
      snapshot.weakestUnit,
      snapshot.why,
    ],
    tr: teamRatingsToArray(snapshot.teamRatings),
    ta: snapshot.tacticReport,
    ch: snapshot.chemistryReport,
    km: snapshot.keyMatches.map((match) => [match.label, match.result, match.note]),
    cp: snapshot.competitionPath.map((phase) => [
      phase.phase,
      phase.record.wins,
      phase.record.draws,
      phase.record.losses,
      phase.goalsFor,
      phase.goalsAgainst,
      phase.xgFor,
      phase.xgAgainst,
      phase.outcome,
    ]),
    pk: snapshot.picks.map((pick) => [
      pick.round,
      pick.slotId,
      pick.slotLabel,
      pick.playerName,
      pick.initials,
      pick.team,
      pick.era,
      pick.positions,
      ratingsToArray(pick.ratings),
    ]),
  }
}

function expandCompactSharedRunSnapshot(compact: CompactSharedRunSnapshot): SharedRunSnapshot {
  return {
    brandVersion: compact.b,
    createdAt: compact.c,
    runId: compact.id,
    modeId: compact.m[0],
    modeName: compact.m[1],
    formationId: compact.f,
    targetRecord: compact.t,
    record: {
      wins: compact.r[0],
      draws: compact.r[1],
      losses: compact.r[2],
    },
    points: compact.p,
    goalsFor: compact.g[0],
    goalsAgainst: compact.g[1],
    xgFor: compact.g[2],
    xgAgainst: compact.g[3],
    grade: compact.gr[0],
    gradeLabel: compact.gr[1],
    trophyResult: compact.res[0],
    perfectionResult: compact.res[1],
    stage: compact.res[2],
    bestPlayer: compact.res[3],
    weakLink: compact.res[4],
    strongestUnit: compact.res[5],
    weakestUnit: compact.res[6],
    why: compact.res[7],
    teamRatings: teamRatingsFromArray(compact.tr),
    tacticReport: compact.ta,
    chemistryReport: compact.ch,
    keyMatches: compact.km.map(([label, result, note]) => ({ label, result, note })),
    competitionPath: compact.cp.map(([phase, wins, draws, losses, goalsFor, goalsAgainst, xgFor, xgAgainst, outcome]) => ({
      phase,
      record: { wins, draws, losses },
      goalsFor,
      goalsAgainst,
      xgFor,
      xgAgainst,
      outcome,
      matches: [],
    })),
    matchTrace: [],
    picks: compact.pk.map(([round, slotId, slotLabel, playerName, initials, team, era, positions, ratings]) => ({
      round,
      slotId,
      slotLabel,
      playerName,
      initials,
      team,
      era,
      positions,
      ratings: ratingsFromArray(ratings),
    })),
  }
}

function isCompactSharedRunSnapshot(value: unknown): value is CompactSharedRunSnapshot {
  return Boolean(value && typeof value === 'object' && (value as CompactSharedRunSnapshot).v === 1 && Array.isArray((value as CompactSharedRunSnapshot).m))
}

function pickSnapshot(pick: DraftPick): SharedPickSnapshot {
  return {
    round: pick.round,
    slotId: pick.slot.slotId,
    slotLabel: pick.slot.label,
    playerName: pick.player.displayName,
    initials: getPlayerInitials(pick.player.displayName),
    team: pick.roll.team.label,
    era: pick.roll.era,
    positions: pick.player.positions,
    ratings: pick.player.ratings,
  }
}

export function createSharedRunSnapshot(result: RunResult, formationId: string, picks: DraftPick[], createdAt = new Date().toISOString()): SharedRunSnapshot {
  return {
    brandVersion,
    createdAt,
    runId: result.runId,
    modeId: result.modeId,
    modeName: result.modeName,
    formationId,
    targetRecord: result.targetRecord,
    record: result.record,
    points: result.points,
    goalsFor: result.goalsFor,
    goalsAgainst: result.goalsAgainst,
    xgFor: result.xgFor,
    xgAgainst: result.xgAgainst,
    grade: result.grade,
    gradeLabel: result.gradeLabel,
    trophyResult: result.trophyResult,
    perfectionResult: result.perfectionResult,
    stage: result.stage,
    bestPlayer: result.bestPlayer,
    weakLink: result.weakLink,
    strongestUnit: result.strongestUnit,
    weakestUnit: result.weakestUnit,
    why: result.why,
    teamRatings: result.teamRatings,
    tacticReport: result.tacticReport,
    chemistryReport: result.chemistryReport,
    keyMatches: result.keyMatches,
    competitionPath: result.competitionPath,
    matchTrace: result.matchTrace,
    picks: picks.map(pickSnapshot),
  }
}

export function validateSharedRunSnapshot(snapshot: SharedRunSnapshot): string[] {
  const issues: string[] = []
  const matchTotal = snapshot.record.wins + snapshot.record.draws + snapshot.record.losses
  const serializedLength = JSON.stringify(snapshot).length

  if (!/^IXI-[A-Z0-9-]{4,32}$/.test(snapshot.runId)) issues.push('Invalid run id.')
  if (!/^[a-z0-9_]+$/.test(snapshot.modeId)) issues.push('Invalid mode id.')
  if (!/^\d-\d-\d(?:-\d)?$/.test(snapshot.formationId)) issues.push('Invalid formation.')
  if (snapshot.matchTrace.length > 0 && matchTotal !== snapshot.matchTrace.length) issues.push('Record does not match match trace.')
  if (matchTotal < 1 || matchTotal > 42) issues.push('Impossible match count.')
  if (snapshot.picks.length < 1 || snapshot.picks.length > 18) issues.push('Invalid pick count.')
  if (snapshot.goalsFor < 0 || snapshot.goalsAgainst < 0 || snapshot.goalsFor > 250 || snapshot.goalsAgainst > 250) issues.push('Impossible goals.')
  if (scoreRun(snapshot) < -5000 || scoreRun(snapshot) > 20000) issues.push('Invalid score.')
  if (serializedLength > 50000) issues.push('Snapshot too large.')

  return issues
}

export function localResultUrl(snapshot: SharedRunSnapshot): string {
  return `${originForLinks()}#/r/local/${utf8ToBase64Url(JSON.stringify(compactSharedRunSnapshot(snapshot)))}`
}

export function decodeLocalSharedRun(payload: string): SharedRunSnapshot | null {
  try {
    const decoded = JSON.parse(base64UrlToUtf8(payload)) as unknown
    const snapshot = isCompactSharedRunSnapshot(decoded) ? expandCompactSharedRunSnapshot(decoded) : decoded as SharedRunSnapshot
    const issues = validateSharedRunSnapshot(snapshot).filter((issue) => issue !== 'Snapshot too large.')
    return issues.length === 0 ? snapshot : null
  } catch {
    return null
  }
}

export async function fetchSharedRunSnapshot(shareId: string): Promise<SharedRunSnapshot | null> {
  if (!hasSupabaseConfig || !/^[a-zA-Z0-9_-]{8,64}$/.test(shareId)) return null
  const { supabase } = await import('./supabase')
  if (!supabase) return null
  const { data, error } = await supabase
    .from('shared_runs')
    .select('snapshot')
    .eq('share_id', shareId)
    .single()

  if (error || !data?.snapshot) return null
  const snapshot = data.snapshot as SharedRunSnapshot
  return validateSharedRunSnapshot(snapshot).length === 0 ? snapshot : null
}

export async function createShareLink(snapshot: SharedRunSnapshot, text: string): Promise<ShareResult> {
  const issues = validateSharedRunSnapshot(snapshot)
  const localUrl = localResultUrl(snapshot)
  if (issues.some((issue) => issue !== 'Snapshot too large.')) return { text, source: 'text-fallback' }

  if (issues.length === 0 && hasSupabaseConfig) {
    try {
      const { supabase } = await import('./supabase')
      if (!supabase) throw new Error('Supabase is not configured.')
      const { data, error } = await supabase.functions.invoke('share-run', { body: snapshot })
      const shareId = typeof data?.share_id === 'string' ? data.share_id : typeof data?.shareId === 'string' ? data.shareId : ''
      if (!error && shareId) {
        return { url: `${originForLinks()}#/r/${shareId}`, text, source: 'supabase' }
      }
    } catch {
      // Local URLs keep signed-out/offline play shareable.
    }
  }

  return { url: localUrl, text: `${text}\n${localUrl}`, source: 'local-url' }
}

export function sharedResultTitle(snapshot: SharedRunSnapshot): string {
  return `${snapshot.modeName} ${formatRecord(snapshot.record)} (${snapshot.grade})`
}
