import type { ChemistryReport, DraftPick } from '../types'
import { clamp } from './random'

const defensivePositions = ['CB', 'LB', 'RB', 'LWB', 'RWB', 'DM']

function countRole(picks: DraftPick[], terms: string[]): number {
  return picks.filter((pick) => pick.player.roleTags.some((tag) => terms.some((term) => tag.toLowerCase().includes(term)))).length
}

export function calculateChemistry(picks: DraftPick[]): ChemistryReport {
  const sameTeamLinks = picks.reduce((count, pick, index) => {
    return count + picks.slice(index + 1).filter((other) => other.player.teamName === pick.player.teamName).length
  }, 0)

  const sameNationLinks = picks.reduce((count, pick, index) => {
    return count + picks.slice(index + 1).filter((other) => other.player.country === pick.player.country || other.player.teamName === pick.player.teamName).length
  }, 0)

  const creators = countRole(picks, ['creator', 'passing', 'tempo'])
  const ballWinners = countRole(picks, ['ball-winner', 'screen', 'destroyer', 'duel'])
  const finishers = countRole(picks, ['scorer', 'finisher', 'striker', 'killer'])
  const runners = countRole(picks, ['runner', 'engine', 'pressing', 'overlap'])
  const hasRealKeeper = picks.some((pick) => pick.slot.accepts.includes('GK') && pick.player.positions.includes('GK') && pick.player.ratings.goalkeeping >= 70)
  const defensiveCover = picks.filter((pick) => {
    return pick.player.positions.some((position) => defensivePositions.includes(position)) && pick.player.ratings.defense >= 78
  }).length
  const creatorOverload = Math.max(0, creators - 4)
  const finisherOverload = Math.max(0, finishers - 3)

  const roleBalance = clamp(
    55 +
      Math.min(creators, 3) * 8 +
      Math.min(ballWinners, 2) * 9 +
      Math.min(finishers, 2) * 7 +
      Math.min(runners, 3) * 4 -
      creatorOverload * 6 -
      finisherOverload * 5 -
      (hasRealKeeper ? 0 : 18) -
      Math.max(0, 3 - defensiveCover) * 4,
    35,
    100,
  )
  const linkScore = clamp(50 + sameTeamLinks * 3 + sameNationLinks * 1.5, 50, 94)
  const score = Math.round(clamp(roleBalance * 0.72 + linkScore * 0.28, 35, 100))

  const warnings: string[] = []
  const bonuses: string[] = []

  if (!hasRealKeeper) warnings.push('No real keeper. The simulation will punish emergency goalkeeping.')
  if (ballWinners === 0) warnings.push('No true ball-winner. That can turn control into chaos.')
  if (creators === 0) warnings.push('Not enough invention between the lines.')
  if (finishers === 0) warnings.push('Plenty of names, not enough box threat.')
  if (creatorOverload > 0) warnings.push('Too many creators. Somebody has to run beyond.')
  if (finisherOverload > 0) warnings.push('Too many finishers. Build-up may starve the box.')
  if (defensiveCover < 3) warnings.push('Defensive cover is thin behind the stars.')
  if (sameTeamLinks >= 3) bonuses.push('Club links make the automatisms sharper.')
  if (sameNationLinks >= 3) bonuses.push('International familiarity gives the side a tournament feel.')
  if (hasRealKeeper && defensiveCover >= 3 && ballWinners > 0 && creators > 1 && finishers > 0) bonuses.push('The spine makes football sense.')

  return {
    score,
    sameTeamLinks,
    sameNationLinks,
    roleBalance: Math.round(roleBalance),
    warnings,
    bonuses,
  }
}
