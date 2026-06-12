import type { PlayerContext } from '../../../types'

const modeLoaders = {
  "world_xi": () => import('./world_xi'),
  "premier_league": () => import('./premier_league'),
  "champions_league": () => import('./champions_league'),
  "world_cup": () => import('./world_cup'),
  "ball_knowledge": () => import('./world_xi'),
  "english_top_flight": () => import('./english_top_flight'),
  "laliga": () => import('./laliga'),
  "serie_a": () => import('./serie_a'),
  "bundesliga": () => import('./bundesliga'),
  "ligue_1": () => import('./ligue_1'),
  "mls": () => import('./mls'),
  "classic_european_cup": () => import('./classic_european_cup'),
  "euros": () => import('./euros'),
  "copa_america": () => import('./copa_america'),
  "afcon": () => import('./afcon'),
  "club_world_cup": () => import('./club_world_cup'),
  "one_club": () => import('./one_club'),
  "nation_xi": () => import('./nation_xi'),
  "era_lock": () => import('./world_xi'),
  "chaos": () => import('./world_xi'),
  "manager": () => import('./world_xi'),
} satisfies Record<string, () => Promise<{ modePlayerContexts: PlayerContext[] }>>

export async function loadGeneratedModePlayerContexts(modeId: string): Promise<PlayerContext[]> {
  const loader = modeLoaders[modeId as keyof typeof modeLoaders] ?? modeLoaders['world_xi']
  const module = await loader()
  return module.modePlayerContexts
}
