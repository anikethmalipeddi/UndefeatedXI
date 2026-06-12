import type { DraftPick, TacticReport, TeamRatings } from '../types'

const defensivePositions = ['CB', 'LB', 'RB', 'LWB', 'RWB', 'DM']
const attackingPositions = ['LW', 'RW', 'ST', 'CF', 'AM']

function average(values: number[]): number {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0
}

function rating(value: number): number {
  return Math.round(Math.max(35, Math.min(100, value)))
}

function includesRole(pick: DraftPick, terms: string[]): boolean {
  return pick.player.roleTags.some((tag) => terms.some((term) => tag.toLowerCase().includes(term)))
}

function countRole(picks: DraftPick[], terms: string[]): number {
  return picks.filter((pick) => includesRole(pick, terms)).length
}

function hasRealKeeper(picks: DraftPick[]): boolean {
  return picks.some((pick) => pick.slot.accepts.includes('GK') && pick.player.positions.includes('GK') && pick.player.ratings.goalkeeping >= 70)
}

function isCenterBackPick(pick: DraftPick): boolean {
  return pick.slot.accepts.includes('CB') || pick.player.positions.includes('CB')
}

function centerBackMobility(picks: DraftPick[]): number {
  const centerBacks = picks.filter(isCenterBackPick)
  return average(centerBacks.map((pick) => pick.player.ratings.physical * 0.55 + pick.player.ratings.press * 0.45))
}

function structuralWeaknesses(picks: DraftPick[], ratings: TeamRatings, identity: string): string[] {
  const ballWinners = countRole(picks, ['ball-winner', 'screen', 'destroyer', 'duel'])
  const creators = picks.filter((pick) => includesRole(pick, ['creator', 'controller', 'passing', 'tempo']) || (pick.player.ratings.creation >= 86 && pick.player.ratings.control >= 82)).length
  const finishers = picks.filter((pick) => includesRole(pick, ['scorer', 'finisher', 'striker', 'killer']) || (pick.player.positions.some((position) => attackingPositions.includes(position)) && pick.player.ratings.attack >= 90)).length
  const defensiveCover = picks.filter((pick) => pick.player.positions.some((position) => defensivePositions.includes(position)) && pick.player.ratings.defense >= 78).length
  const weaknesses: string[] = []

  if (!hasRealKeeper(picks) || ratings.goalkeeping < 60) weaknesses.push('no real goalkeeper')
  if (ballWinners === 0) weaknesses.push('no ball-winning screen')
  if (creators === 0) weaknesses.push('no reliable creator')
  if (finishers === 0) weaknesses.push('no ruthless finisher')
  if (defensiveCover < 3) weaknesses.push('thin defensive cover')
  if ((identity === 'High Press' || identity === 'Possession') && centerBackMobility(picks) < 74) weaknesses.push('slow high-line center backs')
  if (creators > 5 || finishers > 4) weaknesses.push('role overload')
  if (ratings.chemistry < 62) weaknesses.push('weak chemistry')
  if (ratings.balance < 75) weaknesses.push('one unit looks weaker than the rest')

  return weaknesses
}

function mergeWeaknesses(...groups: string[][]): string[] {
  return [...new Set(groups.flat())]
}

function confidenceValue(pick: DraftPick): number {
  if (pick.player.dataConfidence === 'High') return 92
  if (pick.player.dataConfidence === 'Medium') return 78
  return 66
}

function diversityScore(values: string[]): number {
  const counts = values.reduce<Record<string, number>>((totals, value) => {
    totals[value] = (totals[value] ?? 0) + 1
    return totals
  }, {})
  const maxShare = Math.max(...Object.values(counts)) / Math.max(values.length, 1)
  return 100 - Math.max(0, maxShare - 0.45) * 55 - Math.max(0, Object.keys(counts).length - 5) * 2
}

export function calculateTeamRatings(picks: DraftPick[], chemistryScore: number): TeamRatings {
  const attackers = picks.filter((pick) => pick.slot.accepts.some((position) => ['LW', 'RW', 'ST', 'CF', 'AM'].includes(position)))
  const midfielders = picks.filter((pick) => pick.slot.accepts.some((position) => ['DM', 'CM', 'AM', 'LM', 'RM'].includes(position)))
  const defenders = picks.filter((pick) => pick.slot.accepts.some((position) => ['CB', 'LB', 'RB', 'LWB', 'RWB', 'DM'].includes(position)))
  const keeper = picks.find((pick) => pick.slot.accepts.includes('GK'))

  // Team ratings are phase-weighted so a great XI needs football logic, not just eleven high overalls.
  const finishing = average(attackers.map((pick) => pick.player.ratings.attack * 0.82 + pick.player.ratings.bigGame * 0.18))
  const chanceCreation = average(picks.map((pick) => pick.player.ratings.creation * 0.72 + pick.player.ratings.control * 0.2 + pick.player.ratings.attack * 0.08))
  const ballProgression = average(picks.map((pick) => pick.player.ratings.control * 0.44 + pick.player.ratings.creation * 0.34 + pick.player.ratings.physical * 0.12 + pick.player.ratings.press * 0.1))
  const midfieldControl = average(midfielders.map((pick) => pick.player.ratings.control * 0.58 + pick.player.ratings.creation * 0.25 + pick.player.ratings.defense * 0.17))
  const pressResistance = average(picks.map((pick) => pick.player.ratings.control * 0.6 + pick.player.ratings.physical * 0.18 + pick.player.ratings.creation * 0.14 + pick.player.ratings.bigGame * 0.08))
  const defensiveSolidity = average(defenders.map((pick) => pick.player.ratings.defense * 0.72 + pick.player.ratings.physical * 0.18 + pick.player.ratings.bigGame * 0.1))
  const defensiveTransitions = average([...defenders, ...midfielders].map((pick) => pick.player.ratings.press * 0.42 + pick.player.ratings.defense * 0.36 + pick.player.ratings.physical * 0.22))
  const pressing = average(picks.map((pick) => pick.player.ratings.press * 0.72 + pick.player.ratings.physical * 0.18 + pick.player.ratings.defense * 0.1))
  const aerialSetPiece = average(picks.map((pick) => {
    const aerialBonus = includesRole(pick, ['aerial', 'target', 'box command', 'set pieces', 'set-piece']) ? 8 : 0
    return pick.player.ratings.physical * 0.58 + pick.player.ratings.defense * 0.22 + pick.player.ratings.attack * 0.14 + pick.player.ratings.bigGame * 0.06 + aerialBonus
  }))
  const physicality = average(picks.map((pick) => pick.player.ratings.physical))
  const consistency = average(picks.map((pick) => pick.player.ratings.bigGame * 0.48 + pick.player.ratings.control * 0.28 + pick.player.ratings.defense * 0.14 + pick.player.ratings.attack * 0.1))
  const dataConfidence = average(picks.map(confidenceValue))
  const eraBalance = diversityScore(picks.map((pick) => pick.player.decade))
  const attack = finishing * 0.58 + chanceCreation * 0.42
  const midfield = midfieldControl * 0.5 + ballProgression * 0.28 + pressResistance * 0.22
  const defense = defensiveSolidity * 0.58 + defensiveTransitions * 0.26 + aerialSetPiece * 0.16
  const goalkeeping = keeper?.player.ratings.goalkeeping ?? 45
  const bigGame = average(picks.map((pick) => pick.player.ratings.bigGame))
  const balance = 100 - Math.max(0, Math.max(attack, midfield, defense, goalkeeping) - Math.min(attack, midfield, defense, goalkeeping)) * 0.8
  const tacticalCoherence = chemistryScore * 0.48 + balance * 0.2 + defensiveTransitions * 0.12 + pressResistance * 0.1 + eraBalance * 0.1
  const overall = attack * 0.2 + midfield * 0.2 + defense * 0.18 + goalkeeping * 0.1 + chemistryScore * 0.1 + bigGame * 0.07 + tacticalCoherence * 0.1 + dataConfidence * 0.05

  return {
    attack: rating(attack),
    finishing: rating(finishing),
    chanceCreation: rating(chanceCreation),
    ballProgression: rating(ballProgression),
    midfield: rating(midfield),
    midfieldControl: rating(midfieldControl),
    pressResistance: rating(pressResistance),
    defense: rating(defense),
    defensiveSolidity: rating(defensiveSolidity),
    defensiveTransitions: rating(defensiveTransitions),
    pressing: rating(pressing),
    aerialSetPiece: rating(aerialSetPiece),
    goalkeeping: rating(goalkeeping),
    physicality: rating(physicality),
    consistency: rating(consistency),
    chemistry: chemistryScore,
    bigGame: rating(bigGame),
    tacticalCoherence: rating(tacticalCoherence),
    eraBalance: rating(eraBalance),
    dataConfidence: rating(dataConfidence),
    balance: rating(balance),
    overall: rating(overall),
  }
}

export function inferTactic(picks: DraftPick[], ratings: TeamRatings): TacticReport {
  const tags = picks.flatMap((pick) => pick.player.roleTags.map((tag) => tag.toLowerCase()))
  const hasPress = tags.filter((tag) => tag.includes('press') || tag.includes('engine')).length
  const hasCreators = tags.filter((tag) => tag.includes('creator') || tag.includes('controller') || tag.includes('passing')).length
  const hasRunners = tags.filter((tag) => tag.includes('runner') || tag.includes('transition')).length
  const hasDirectPlay = tags.filter((tag) => tag.includes('aerial') || tag.includes('target') || tag.includes('set piece') || tag.includes('set-piece') || tag.includes('long passing') || tag.includes('box') || tag.includes('duel')).length

  if (ratings.midfield >= 88 && hasCreators >= 3) {
    return {
      identity: 'Possession',
      summary: 'The XI wants the ball, squeezes the pitch, and trusts the midfield to suffocate games.',
      strengths: ['control', 'chance creation', 'game-state management'],
      weaknesses: mergeWeaknesses(ratings.defense < 82 ? ['space behind the fullbacks'] : [], structuralWeaknesses(picks, ratings, 'Possession')),
    }
  }

  if (hasPress >= 4 && ratings.defense >= 84) {
    return {
      identity: 'High Press',
      summary: 'The side wins the ball early and turns mistakes into shots before opponents breathe.',
      strengths: ['pressure', 'territory', 'fast starts'],
      weaknesses: mergeWeaknesses(ratings.goalkeeping < 86 ? ['keeper exposed by the high line'] : [], structuralWeaknesses(picks, ratings, 'High Press')),
    }
  }

  if (ratings.aerialSetPiece >= 86 && ratings.physicality >= 84 && hasDirectPlay >= 3) {
    return {
      identity: 'Direct Football',
      summary: 'This XI can go early, win first contact, and turn territory into box pressure.',
      strengths: ['aerial threat', 'set pieces', 'second balls'],
      weaknesses: mergeWeaknesses(ratings.chanceCreation < 78 ? ['no clean supply line'] : [], structuralWeaknesses(picks, ratings, 'Direct Football')),
    }
  }

  if (hasRunners >= 3 && ratings.attack >= 88) {
    return {
      identity: 'Counterattack',
      summary: 'The front line wants grass to attack. Win it, release it, punish the panic.',
      strengths: ['transition threat', 'direct running', 'late-match danger'],
      weaknesses: mergeWeaknesses(ratings.midfield < 82 ? ['long spells without control'] : [], structuralWeaknesses(picks, ratings, 'Counterattack')),
    }
  }

  if (ratings.defense >= 90 && ratings.goalkeeping >= 90) {
    return {
      identity: 'Low Block',
      summary: 'Good luck finding clean chances. This XI can suffer, clear, and strike late.',
      strengths: ['box defense', 'keeper protection', 'set-piece threat'],
      weaknesses: mergeWeaknesses(ratings.midfield < 80 ? ['limited invention against packed defenses'] : [], structuralWeaknesses(picks, ratings, 'Low Block')),
    }
  }

  return {
    identity: 'Balanced',
    summary: 'No gimmick. Strong spine, enough stars, and a shape that can tilt either way.',
    strengths: ['adaptability', 'balanced phases'],
    weaknesses: structuralWeaknesses(picks, ratings, 'Balanced'),
  }
}
