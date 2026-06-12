import type { ModeConfig, RerollCounts, TeamRollOption } from '../types'
import { formations } from './formations'

const allFormations = formations.map((formation) => formation.formationId)
const standardRosterSlots = { starters: 11, bench: 0, total: 11 }
const managerRosterSlots = { starters: 11, bench: 7, total: 18 }

const classicRerolls: RerollCounts = { team: 1, era: 1, full: 0 }
const noRerolls: RerollCounts = { team: 0, era: 0, full: 0 }

const clubs = (...labels: string[]): TeamRollOption[] => labels.map((label) => ({ label, teamType: 'club' }))
const nations = (...labels: string[]): TeamRollOption[] => labels.map((label) => ({ label, teamType: 'nation' }))

const premierLeagueClubs = clubs(
  'Arsenal',
  'Chelsea',
  'Liverpool',
  'Manchester United',
  'Manchester City',
  'Tottenham',
  'Everton',
  'Aston Villa',
  'Newcastle',
  'West Ham',
  'Blackburn',
  'Leicester',
  'Nottingham Forest',
  'Bournemouth',
  'Brighton',
  'Brentford',
  'Wolves',
)

const englishTopFlightClubs = clubs(
  'Manchester United',
  'Liverpool',
  'Nottingham Forest',
  'Everton',
  'Arsenal',
  'Chelsea',
  'Blackburn',
  'Aston Villa',
  'Newcastle',
  'West Ham',
  'Leicester',
  'Tottenham',
  'Manchester City',
)

const laligaClubs = clubs('Barcelona', 'Real Madrid', 'Atletico Madrid', 'Valencia', 'Sevilla', 'Villarreal', 'Real Sociedad', 'Athletic Bilbao', 'Deportivo La Coruna', 'Real Betis')
const serieAClubs = clubs('AC Milan', 'Juventus', 'Inter', 'Roma', 'Napoli', 'Lazio', 'Fiorentina', 'Parma', 'Sampdoria', 'Torino')
const bundesligaClubs = clubs('Bayern Munich', 'Borussia Dortmund', 'Bayer Leverkusen', 'Schalke 04', 'Hamburg', 'Werder Bremen', 'Stuttgart', 'Borussia Monchengladbach', 'Wolfsburg', 'Eintracht Frankfurt')
const ligue1Clubs = clubs('PSG', 'Marseille', 'Lyon', 'Monaco', 'Saint-Etienne', 'Bordeaux', 'Lille', 'Nantes', 'Rennes', 'Lens')
const mlsClubs = clubs(
  'LA Galaxy',
  'Inter Miami',
  'DC United',
  'Seattle Sounders',
  'Atlanta United',
  'Colorado Rapids',
  'Nashville SC',
  'Columbus Crew',
  'Houston Dynamo',
  'Sporting KC',
  'Toronto FC',
  'Tampa Bay Mutiny',
  'LAFC',
  'Vancouver Whitecaps',
  'Portland Timbers',
  'New York Red Bulls',
)

const majorClubs = clubs(
  'Barcelona',
  'Real Madrid',
  'Manchester United',
  'Liverpool',
  'Arsenal',
  'Chelsea',
  'Manchester City',
  'Bayern Munich',
  'Borussia Dortmund',
  'AC Milan',
  'Inter',
  'Juventus',
  'Napoli',
  'Roma',
  'Ajax',
  'PSG',
  'Benfica',
  'Porto',
  'Atletico Madrid',
  'Santos',
  'Boca Juniors',
  'River Plate',
)

const worldCupNations = nations(
  'Brazil',
  'Argentina',
  'France',
  'Germany',
  'Spain',
  'Italy',
  'Netherlands',
  'England',
  'Portugal',
  'Uruguay',
  'Belgium',
  'Croatia',
  'Mexico',
  'United States',
  'Japan',
  'South Korea',
  'Morocco',
  'Cameroon',
  'Nigeria',
  'Ghana',
  'Senegal',
  'Ivory Coast',
  'Denmark',
  'Chile',
  'Colombia',
  'Paraguay',
)

const eurosNations = nations(
  'France',
  'Germany',
  'Spain',
  'Italy',
  'Netherlands',
  'England',
  'Portugal',
  'Denmark',
  'Croatia',
  'Belgium',
  'Czech Republic',
  'Greece',
  'Sweden',
  'Turkey',
  'Poland',
  'Switzerland',
  'Austria',
  'Ukraine',
  'Serbia',
  'Russia',
)

const copaAmericaNations = nations(
  'Brazil',
  'Argentina',
  'Uruguay',
  'Chile',
  'Colombia',
  'Paraguay',
  'Peru',
  'Ecuador',
  'Bolivia',
  'Venezuela',
  'Mexico',
  'United States',
)

const afconNations = nations(
  'Egypt',
  'Cameroon',
  'Senegal',
  'Ivory Coast',
  'Ghana',
  'Nigeria',
  'Algeria',
  'Morocco',
  'Tunisia',
  'South Africa',
  'Mali',
  'DR Congo',
  'Zambia',
  'Burkina Faso',
)

const nationXiNations = nations(
  'Brazil',
  'Argentina',
  'France',
  'Germany',
  'Spain',
  'Italy',
  'England',
  'Netherlands',
  'Portugal',
  'Uruguay',
  'Belgium',
  'Croatia',
  'Mexico',
  'United States',
  'Japan',
  'South Korea',
  'Morocco',
  'Cameroon',
  'Nigeria',
  'Ghana',
  'Senegal',
  'Ivory Coast',
)

const majorNations = worldCupNations

const decades = ['1950s', '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s']
const modernDecades = ['1990s', '2000s', '2010s', '2020s']
const europeanEras = ['1950s European Cup', '1960s European Cup', '1970s European Cup', '1980s European Cup', '1990s UCL', '2000s UCL', '2010s UCL', '2020s UCL']
const tournamentEras = ['1950s', '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s']
const knockoutModeIds = new Set(['classic_european_cup', 'euros', 'copa_america', 'afcon', 'club_world_cup', 'nation_xi'])
const sevenMatchTournamentModeIds = new Set(['euros', 'copa_america', 'afcon', 'club_world_cup', 'nation_xi'])

function tournamentTeamPoolFor(modeId: string, modeType: ModeConfig['modeType']): TeamRollOption[] {
  if (modeId === 'classic_european_cup' || modeId === 'club_world_cup') return majorClubs
  if (modeId === 'euros') return eurosNations
  if (modeId === 'copa_america') return copaAmericaNations
  if (modeId === 'afcon') return afconNations
  if (modeId === 'nation_xi') return nationXiNations
  if (modeType === 'international_tournament' || modeType === 'nation_history') return majorNations
  return [...majorClubs, ...majorNations]
}

export const modeConfigs: ModeConfig[] = [
  {
    modeId: 'world_xi',
    modeName: 'World XI',
    shortDescription: 'Global all-time legends chasing 38-0-0.',
    modeType: 'domestic_super_league',
    status: 'public',
    targetRecord: '38-0-0',
    matchCount: 38,
    usesDraws: true,
    usesKnockouts: false,
    usesGroupStage: false,
    usesLeaguePhase: false,
    usesPlayoffs: false,
    eligiblePoolType: 'global_all_time',
    rollDimensions: ['club_or_nation', 'era'],
    allowedFormations: allFormations,
    rosterSlots: standardRosterSlots,
    simulationFormat: 'domestic',
    trophyCondition: 'finish first',
    perfectionCondition: 'win all 38 matches',
    invincibleCondition: 'zero losses',
    rerollRules: classicRerolls,
    opponentDistribution: 'elite',
    resultGradeScale: 'domestic_38',
    shareTextTemplate: 'My 38-0-0 went {record} in World XI Mode.',
    teamPool: [...majorClubs, ...majorNations],
    eraPool: decades,
  },
  {
    modeId: 'premier_league',
    modeName: 'Premier League',
    shortDescription: 'Premier League era legends only.',
    modeType: 'domestic_league',
    status: 'public',
    targetRecord: '38-0-0',
    matchCount: 38,
    usesDraws: true,
    usesKnockouts: false,
    usesGroupStage: false,
    usesLeaguePhase: false,
    usesPlayoffs: false,
    eligiblePoolType: 'premier_league_appearances',
    rollDimensions: ['club', 'era'],
    allowedFormations: allFormations,
    rosterSlots: standardRosterSlots,
    simulationFormat: 'domestic',
    trophyCondition: 'win the league',
    perfectionCondition: 'win all 38 matches',
    invincibleCondition: 'zero losses',
    rerollRules: classicRerolls,
    opponentDistribution: 'league',
    resultGradeScale: 'domestic_38',
    shareTextTemplate: 'My 38-0-0 went {record} in Premier League Mode.',
    teamPool: premierLeagueClubs,
    eraPool: modernDecades,
  },
  {
    modeId: 'champions_league',
    modeName: 'Champions League',
    shortDescription: 'UCL and European Cup icons chasing a perfect European campaign.',
    modeType: 'continental_club',
    status: 'public',
    targetRecord: 'Perfect European campaign',
    matchCount: 15,
    usesDraws: true,
    usesKnockouts: true,
    usesGroupStage: false,
    usesLeaguePhase: true,
    usesPlayoffs: false,
    eligiblePoolType: 'ucl_or_european_cup_appearances',
    rollDimensions: ['club', 'european_era'],
    allowedFormations: allFormations,
    rosterSlots: standardRosterSlots,
    simulationFormat: 'ucl',
    trophyCondition: 'win the final',
    perfectionCondition: 'win every match in the campaign',
    invincibleCondition: 'zero losses',
    rerollRules: classicRerolls,
    opponentDistribution: 'continental',
    resultGradeScale: 'ucl',
    shareTextTemplate: 'My 38-0-0 chased Europe and finished {record}.',
    teamPool: clubs('Real Madrid', 'Barcelona', 'AC Milan', 'Ajax', 'Liverpool', 'Bayern Munich', 'Manchester United', 'Inter', 'Chelsea', 'Juventus'),
    eraPool: europeanEras,
  },
  {
    modeId: 'world_cup',
    modeName: 'World Cup',
    shortDescription: 'National-team legends chasing a perfect tournament.',
    modeType: 'international_tournament',
    status: 'public',
    targetRecord: 'Perfect World Cup',
    matchCount: 7,
    usesDraws: true,
    usesKnockouts: true,
    usesGroupStage: true,
    usesLeaguePhase: false,
    usesPlayoffs: false,
    eligiblePoolType: 'world_cup_appearances',
    rollDimensions: ['nation', 'tournament_era'],
    allowedFormations: allFormations,
    rosterSlots: standardRosterSlots,
    simulationFormat: 'world_cup',
    trophyCondition: 'win the final',
    perfectionCondition: 'win every match in the tournament',
    invincibleCondition: 'zero losses',
    rerollRules: classicRerolls,
    opponentDistribution: 'international',
    resultGradeScale: 'world_cup',
    shareTextTemplate: 'My 38-0-0 World Cup run finished {record}.',
    teamPool: majorNations,
    eraPool: tournamentEras,
  },
  {
    modeId: 'ball_knowledge',
    modeName: 'Ball Knowledge',
    shortDescription: 'Stats hidden. Reputation, memory, and football IQ only.',
    modeType: 'knowledge',
    status: 'public',
    targetRecord: '38-0-0',
    matchCount: 38,
    usesDraws: true,
    usesKnockouts: false,
    usesGroupStage: false,
    usesLeaguePhase: false,
    usesPlayoffs: false,
    eligiblePoolType: 'global_all_time_hidden_stats',
    rollDimensions: ['club_or_nation', 'era'],
    allowedFormations: allFormations,
    rosterSlots: standardRosterSlots,
    simulationFormat: 'domestic',
    trophyCondition: 'finish first',
    perfectionCondition: 'win all 38 matches',
    invincibleCondition: 'zero losses',
    rerollRules: classicRerolls,
    opponentDistribution: 'elite',
    resultGradeScale: 'domestic_38',
    shareTextTemplate: 'My 38-0-0 Ball Knowledge run went {record}.',
    teamPool: [...majorClubs, ...majorNations],
    eraPool: decades,
    hidesRatings: true,
  },
  {
    modeId: 'english_top_flight',
    modeName: 'English Top Flight',
    shortDescription: 'Pre-1992 and modern English top-flight history.',
    modeType: 'domestic_league',
    status: 'public',
    targetRecord: '38-0-0',
    matchCount: 38,
    usesDraws: true,
    usesKnockouts: false,
    usesGroupStage: false,
    usesLeaguePhase: false,
    usesPlayoffs: false,
    eligiblePoolType: 'english_top_flight',
    rollDimensions: ['club', 'era'],
    allowedFormations: allFormations,
    rosterSlots: standardRosterSlots,
    simulationFormat: 'domestic',
    trophyCondition: 'win the league',
    perfectionCondition: 'win all matches',
    invincibleCondition: 'zero losses',
    rerollRules: classicRerolls,
    opponentDistribution: 'league',
    resultGradeScale: 'domestic_38',
    shareTextTemplate: 'My English Top Flight 38-0-0 went {record}.',
    teamPool: englishTopFlightClubs,
    eraPool: decades,
  },
  ...([
    ['laliga', 'LaLiga', 'LaLiga legends chasing league perfection.', laligaClubs],
    ['serie_a', 'Serie A', 'Italian football icons chasing an unbeaten season.', serieAClubs],
    ['bundesliga', 'Bundesliga', 'German top-flight legends chasing 34-0-0.', bundesligaClubs],
    ['ligue_1', 'Ligue 1', 'French league legends across eras.', ligue1Clubs],
    ['mls', 'MLS', 'Regular-season perfection with playoff pressure.', mlsClubs],
  ] satisfies Array<[string, string, string, TeamRollOption[]]>).map(([modeId, modeName, shortDescription, teamPool]) => ({
    modeId,
    modeName,
    shortDescription,
    modeType: 'domestic_league' as const,
    status: 'public' as ModeConfig['status'],
    targetRecord: modeId === 'bundesliga' || modeId === 'mls' ? '34-0-0' : '38-0-0',
    matchCount: modeId === 'bundesliga' || modeId === 'mls' ? 34 : 38,
    usesDraws: true,
    usesKnockouts: modeId === 'mls',
    usesGroupStage: false,
    usesLeaguePhase: false,
    usesPlayoffs: modeId === 'mls',
    eligiblePoolType: `${modeId}_appearances`,
    rollDimensions: ['club', 'era'] as ModeConfig['rollDimensions'],
    allowedFormations: allFormations,
    rosterSlots: standardRosterSlots,
    simulationFormat: modeId === 'mls' ? 'mls' as const : 'domestic' as const,
    trophyCondition: modeId === 'mls' ? 'win MLS Cup' : 'win the league',
    perfectionCondition: 'win every regular-season match',
    invincibleCondition: 'zero losses',
    rerollRules: classicRerolls,
    opponentDistribution: 'league' as const,
    resultGradeScale: 'domestic_38',
    shareTextTemplate: `My ${modeName} 38-0-0 went {record}.`,
    teamPool: teamPool as TeamRollOption[],
    eraPool: modernDecades,
  })),
  ...[
    ['classic_european_cup', 'European Cup', 'Knockout-heavy classic European nights.', 'continental_club', 'classic_european_cup'],
    ['euros', 'Euros', 'Continental international immortality.', 'international_tournament', 'generic_tournament'],
    ['copa_america', 'Copa America', 'South American tournament legends.', 'international_tournament', 'generic_tournament'],
    ['afcon', 'AFCON', 'African football legends and tournament pressure.', 'international_tournament', 'generic_tournament'],
    ['club_world_cup', 'Club World Cup', 'Club champions on the global stage.', 'continental_club', 'generic_tournament'],
    ['one_club', 'One-Club XI', 'One club, every era, no escape routes.', 'club_history', 'domestic'],
    ['nation_xi', 'Nation XI', 'One nation across football history.', 'nation_history', 'world_cup'],
    ['era_lock', 'Era Lock', 'One era only. No time-travel shortcuts.', 'era_lock', 'domestic'],
    ['chaos', 'Chaos Mode', 'Form swings, away traps, red cards, and regret.', 'chaos', 'domestic'],
    ['manager', 'Manager Mode', 'Longer full-squad draft with rotation pressure.', 'manager', 'domestic'],
  ].map(([modeId, modeName, shortDescription, modeType, simulationFormat]) => ({
    modeId,
    modeName,
    shortDescription,
    modeType: modeType as ModeConfig['modeType'],
    status: 'public' as ModeConfig['status'],
    targetRecord: modeId === 'classic_european_cup' ? 'Perfect European Cup run' : modeId === 'club_world_cup' ? 'Perfect Club World Cup' : modeId === 'nation_xi' ? 'Perfect nation tournament' : modeId === 'manager' ? 'Invincible full-squad season' : modeType === 'international_tournament' ? 'Perfect tournament' : 'Invincible run',
    matchCount: modeId === 'classic_european_cup' || sevenMatchTournamentModeIds.has(modeId) ? 7 : 38,
    usesDraws: true,
    usesKnockouts: knockoutModeIds.has(modeId),
    usesGroupStage: modeType === 'international_tournament' || modeId === 'club_world_cup' || modeId === 'nation_xi',
    usesLeaguePhase: false,
    usesPlayoffs: false,
    eligiblePoolType: `${modeId}_contexts`,
    rollDimensions:
      modeId === 'one_club'
        ? (['era'] as ModeConfig['rollDimensions'])
        : modeId === 'nation_xi'
          ? (['tournament_era'] as ModeConfig['rollDimensions'])
          : modeId === 'era_lock'
            ? (['club_or_nation'] as ModeConfig['rollDimensions'])
            : modeType === 'international_tournament' || modeType === 'nation_history'
              ? (['nation', 'tournament_era'] as ModeConfig['rollDimensions'])
              : (['club_or_nation', 'era'] as ModeConfig['rollDimensions']),
    allowedFormations: allFormations,
    rosterSlots: modeId === 'manager' ? managerRosterSlots : standardRosterSlots,
    simulationFormat: simulationFormat as ModeConfig['simulationFormat'],
    trophyCondition: 'win the final or finish first',
    perfectionCondition: 'win every match',
    invincibleCondition: 'zero losses',
    rerollRules: modeId === 'chaos' ? noRerolls : classicRerolls,
    opponentDistribution: modeId === 'chaos' ? 'chaos' as const : 'elite' as const,
    resultGradeScale: modeType === 'international_tournament' || modeId === 'club_world_cup' || modeId === 'nation_xi' ? 'world_cup' : 'domestic_38',
    shareTextTemplate: `My ${modeName} 38-0-0 finished {record}.`,
    teamPool: modeId === 'one_club' ? clubs('Barcelona', 'Real Madrid', 'Bayern Munich', 'AC Milan', 'Chelsea', 'Liverpool', 'Manchester United') : tournamentTeamPoolFor(modeId, modeType as ModeConfig['modeType']),
    eraPool: modeType === 'international_tournament' || modeType === 'nation_history' ? tournamentEras : decades,
    specialSetup:
      modeId === 'one_club'
        ? 'fixed_club' as const
        : modeId === 'nation_xi'
          ? 'fixed_nation' as const
          : modeId === 'era_lock'
            ? 'fixed_era' as const
            : undefined,
  })),
]

export const defaultModeId = 'world_xi'

export function getModeConfig(modeId: string): ModeConfig {
  return modeConfigs.find((mode) => mode.modeId === modeId) ?? modeConfigs[0]
}

export const publicModeConfigs = modeConfigs.filter((mode) => mode.status === 'public')
export const previewModeConfigs = modeConfigs.filter((mode) => mode.status === 'preview')
