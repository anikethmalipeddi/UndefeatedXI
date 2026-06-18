export const auditSeeds = [42, 1337, 99999, 12345, 7] as const

export const defaultSimulationAuditConfig = {
  smartDraftTeamsPerMode: 60,
  smartDraftRerunsPerTeam: 30,
  bestObservedRerunsPerMode: 30000,
  randomDraftsPerMode: 500,
  greedyDraftsPerMode: 500,
} as const
