import type { Position, Ratings } from '../types'

export interface EaStyleAttributes {
  overall: number
  pace?: number
  shooting?: number
  passing?: number
  dribbling?: number
  defending?: number
  physical?: number
  goalkeeping?: number
  bigGame?: number
}

export const ratingMethodology = {
  version: 'ea-style-source-backed-v2',
  summary: 'Players are rated on an EA-style 0-100 football scale from local FIFA/EA/SoFIFA-style CSV snapshots, explicit Icon/Hero rows, and clearly labeled historical proxy rows joined to sourced team and national-team facts.',
  primaryInputs: [
    'local EA/SoFIFA-style career-mode CSV snapshots for FIFA 15 through EA FC 24 attributes',
    'local FIFA Ultimate Team CSV snapshots for FIFA 10 through FIFA 20 archived ratings and explicit Icon/Legend rows',
    'approved legacy-proxy historical numeric rows for older eras that do not have direct EA-era coverage',
    'conservative Wikidata appearance-model proxy rows for otherwise unrated historical players, visibly labeled as legacy-proxy rather than EA data',
    'Wikidata membership facts for player identity, club/nation context, positions, and era eligibility',
  ],
  appAttributes: ['attack', 'creation', 'control', 'defense', 'goalkeeping', 'physical', 'press', 'bigGame'],
  teamPhases: ['attack', 'midfield', 'defense', 'goalkeeping', 'chemistry', 'overall'],
}

export const roleRatingDefaults: Record<Position, Ratings> = {
  GK: { attack: 18, creation: 42, control: 58, defense: 62, goalkeeping: 92, physical: 78, press: 48, bigGame: 82 },
  LB: { attack: 55, creation: 66, control: 70, defense: 82, goalkeeping: 5, physical: 82, press: 78, bigGame: 78 },
  CB: { attack: 35, creation: 58, control: 66, defense: 92, goalkeeping: 4, physical: 88, press: 70, bigGame: 82 },
  RB: { attack: 55, creation: 66, control: 70, defense: 82, goalkeeping: 5, physical: 82, press: 78, bigGame: 78 },
  LWB: { attack: 64, creation: 72, control: 70, defense: 78, goalkeeping: 5, physical: 84, press: 82, bigGame: 76 },
  RWB: { attack: 64, creation: 72, control: 70, defense: 78, goalkeeping: 5, physical: 84, press: 82, bigGame: 76 },
  DM: { attack: 48, creation: 72, control: 86, defense: 86, goalkeeping: 4, physical: 82, press: 84, bigGame: 82 },
  CM: { attack: 66, creation: 84, control: 88, defense: 70, goalkeeping: 4, physical: 78, press: 78, bigGame: 82 },
  AM: { attack: 78, creation: 92, control: 86, defense: 42, goalkeeping: 4, physical: 70, press: 66, bigGame: 84 },
  LM: { attack: 73, creation: 80, control: 76, defense: 55, goalkeeping: 4, physical: 78, press: 72, bigGame: 78 },
  RM: { attack: 73, creation: 80, control: 76, defense: 55, goalkeeping: 4, physical: 78, press: 72, bigGame: 78 },
  LW: { attack: 88, creation: 84, control: 80, defense: 38, goalkeeping: 4, physical: 78, press: 70, bigGame: 82 },
  RW: { attack: 88, creation: 84, control: 80, defense: 38, goalkeeping: 4, physical: 78, press: 70, bigGame: 82 },
  CF: { attack: 90, creation: 82, control: 78, defense: 32, goalkeeping: 4, physical: 80, press: 68, bigGame: 84 },
  ST: { attack: 94, creation: 66, control: 68, defense: 28, goalkeeping: 4, physical: 84, press: 64, bigGame: 84 },
}

function clampRating(value: number): number {
  return Math.round(Math.max(1, Math.min(100, value)))
}

function metric(value: number | undefined, fallback: number): number {
  return value ?? fallback
}

function applyOverrides(ratings: Ratings, overrides: Partial<Ratings>): Ratings {
  return {
    attack: clampRating(overrides.attack ?? ratings.attack),
    creation: clampRating(overrides.creation ?? ratings.creation),
    control: clampRating(overrides.control ?? ratings.control),
    defense: clampRating(overrides.defense ?? ratings.defense),
    goalkeeping: clampRating(overrides.goalkeeping ?? ratings.goalkeeping),
    physical: clampRating(overrides.physical ?? ratings.physical),
    press: clampRating(overrides.press ?? ratings.press),
    bigGame: clampRating(overrides.bigGame ?? ratings.bigGame),
  }
}

export function ratingFor(primary: Position, overall: number, overrides: Partial<Ratings> = {}): Ratings {
  const defaults = roleRatingDefaults[primary]
  const scale = overall / 88
  const ratings = {
    attack: defaults.attack * scale,
    creation: defaults.creation * scale,
    control: defaults.control * scale,
    defense: defaults.defense * scale,
    goalkeeping: defaults.goalkeeping * scale,
    physical: defaults.physical * scale,
    press: defaults.press * scale,
    bigGame: defaults.bigGame * scale,
  }

  return applyOverrides({
    attack: clampRating(ratings.attack),
    creation: clampRating(ratings.creation),
    control: clampRating(ratings.control),
    defense: clampRating(ratings.defense),
    goalkeeping: clampRating(ratings.goalkeeping),
    physical: clampRating(ratings.physical),
    press: clampRating(ratings.press),
    bigGame: clampRating(ratings.bigGame),
  }, overrides)
}

export function ratingsFromEaStyle(primary: Position, ea: EaStyleAttributes, overrides: Partial<Ratings> = {}): Ratings {
  const defaults = ratingFor(primary, ea.overall)
  const pace = metric(ea.pace, defaults.physical)
  const shooting = metric(ea.shooting, defaults.attack)
  const passing = metric(ea.passing, defaults.creation)
  const dribbling = metric(ea.dribbling, defaults.control)
  const defending = metric(ea.defending, defaults.defense)
  const physical = metric(ea.physical, defaults.physical)
  const bigGame = metric(ea.bigGame, ea.overall)

  if (primary === 'GK') {
    return applyOverrides({
      attack: clampRating(ea.overall * 0.14 + passing * 0.18),
      creation: clampRating(passing * 0.58 + ea.overall * 0.22),
      control: clampRating(passing * 0.38 + physical * 0.2 + ea.overall * 0.28),
      defense: clampRating(ea.overall * 0.55 + physical * 0.22),
      goalkeeping: clampRating(metric(ea.goalkeeping, ea.overall)),
      physical: clampRating(physical * 0.72 + pace * 0.18 + ea.overall * 0.1),
      press: clampRating(pace * 0.44 + physical * 0.26 + ea.overall * 0.16),
      bigGame: clampRating(bigGame),
    }, overrides)
  }

  return applyOverrides({
    attack: clampRating(shooting * 0.58 + dribbling * 0.18 + pace * 0.12 + ea.overall * 0.12),
    creation: clampRating(passing * 0.62 + dribbling * 0.24 + ea.overall * 0.14),
    control: clampRating(dribbling * 0.44 + passing * 0.34 + ea.overall * 0.22),
    defense: clampRating(defending * 0.74 + physical * 0.16 + ea.overall * 0.1),
    goalkeeping: defaults.goalkeeping,
    physical: clampRating(physical * 0.58 + pace * 0.28 + ea.overall * 0.14),
    press: clampRating(defending * 0.36 + physical * 0.28 + pace * 0.2 + ea.overall * 0.16),
    bigGame: clampRating(bigGame),
  }, overrides)
}
