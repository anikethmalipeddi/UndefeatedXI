import { closeSync, openSync, readFileSync, readSync, statSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import type { DraftPick, ModeConfig, PlayerContext, Ratings } from '../types'
import { formations } from '../data/formations'
import { getModeConfig, modeConfigs, publicModeConfigs } from '../data/modes'
import { playerContexts } from '../data/playerContexts'
import { ratingMethodology, ratingsFromEaStyle } from '../data/ratingModel'
import { getDraftSlots } from '../data/squad'
import { calculateChemistry } from '../engine/chemistry'
import { modeMatchesPlayer, slotMatchesPlayer } from '../engine/eligibility'
import { configureDraftPlayerContexts, createDraftState, isDraftComplete, reroll, selectPlayer, selectPlayerForSlot, spinForSlot } from '../engine/draft'
import { simulateRun } from '../engine/simulation'
import {
  baseDominanceProbabilities,
  calculateEffectiveTeamQuality,
  calculatePositionFitReport,
  classifyResultTier,
  drawConversionProbability,
  finalProbabilities,
  fixtureDifficulty,
  leagueInvincibleDrawLimit,
  modeDifficultyScore,
  positionFitScore,
  scoringVersion,
} from '../engine/simulationModel'
import { createShareText } from '../engine/share'
import { formatStoredRecord, recordRun, scoreRun } from '../engine/storage'
import { calculateTeamRatings, inferTactic } from '../engine/tactics'
import { modeValidations, validateDataSet } from '../engine/validation'

configureDraftPlayerContexts(playerContexts)

function readFileHead(path: string, bytes = 12000): string {
  const fd = openSync(path, 'r')
  const buffer = Buffer.alloc(bytes)
  const read = readSync(fd, buffer, 0, bytes, 0)
  closeSync(fd)
  return buffer.subarray(0, read).toString('utf8')
}

describe('formations', () => {
  it('creates exactly 11 slots for every formation', () => {
    expect(formations.length).toBeGreaterThanOrEqual(7)
    for (const formation of formations) {
      expect(formation.slots).toHaveLength(11)
      expect(new Set(formation.slots.map((slot) => slot.slotId)).size).toBe(11)
    }
  })

  it('keeps pitch slots visually separated at common board sizes', () => {
    const boardSizes = [
      { width: 374, height: 527.34, tokenWidth: 56.1, tokenHeight: 38 },
      { width: 380, height: 535.8, tokenWidth: 57, tokenHeight: 40 },
      { width: 460, height: 648.6, tokenWidth: 64, tokenHeight: 40 },
    ]

    for (const formation of formations) {
      for (const board of boardSizes) {
        for (let leftIndex = 0; leftIndex < formation.slots.length; leftIndex += 1) {
          for (let rightIndex = leftIndex + 1; rightIndex < formation.slots.length; rightIndex += 1) {
            const left = formation.slots[leftIndex]
            const right = formation.slots[rightIndex]
            const dx = Math.abs((left.x - right.x) * board.width / 100)
            const dy = Math.abs((left.y - right.y) * board.height / 100)

            expect(
              dx >= board.tokenWidth || dy >= board.tokenHeight,
              `${formation.name} has colliding slots ${left.slotId}/${right.slotId}`,
            ).toBe(true)
          }
        }
      }
    }
  })
})

describe('mode configs', () => {
  it('includes the requested mode architecture', () => {
    const ids = new Set(modeConfigs.map((mode) => mode.modeId))
    for (const id of ['world_xi', 'premier_league', 'champions_league', 'world_cup', 'ball_knowledge', 'manager', 'chaos']) {
      expect(ids.has(id)).toBe(true)
    }
  })

  it('gives Ball Knowledge one team reroll and one era reroll', () => {
    const mode = getModeConfig('ball_knowledge')
    expect(mode.rerollRules).toEqual({ team: 1, era: 1, full: 0 })
  })

  it('keeps public modes data-playable', () => {
    expect(publicModeConfigs.length).toBeGreaterThanOrEqual(9)
    for (const mode of modeConfigs.filter((item) => item.status === 'public')) {
      const validation = modeValidations.find((item) => item.modeId === mode.modeId)
      if (!validation) throw new Error(`Missing validation for ${mode.modeId}`)
      expect(validation.playable).toBe(true)

      for (const formationId of mode.allowedFormations) {
        const formation = formations.find((item) => item.formationId === formationId)
        if (!formation) throw new Error(`Missing test formation: ${formationId}`)
        const coverage = validation.formationCoverage[formationId] ?? {}

        expect(Object.keys(coverage)).toHaveLength(getDraftSlots(mode, formation).length)
        expect(Object.values(coverage).every((count) => count >= 2)).toBe(true)
      }
    }
  }, 45000)

  it('keeps expanded release modes strict-ready before public exposure', () => {
    for (const modeId of ['ligue_1', 'mls', 'euros', 'copa_america', 'afcon', 'club_world_cup']) {
      const mode = getModeConfig(modeId)
      const validation = modeValidations.find((item) => item.modeId === modeId)

      expect(mode.status).toBe('public')
      expect(validation?.contextCount).toBeGreaterThan(0)
      expect(validation?.playable).toBe(true)
      expect(validation?.readiness).toBe('ready')
    }
  })

  it('keeps domestic special modes out of knockout simulation flags', () => {
    expect(getModeConfig('manager').usesKnockouts).toBe(false)
    expect(getModeConfig('chaos').usesKnockouts).toBe(false)
    expect(getModeConfig('classic_european_cup').usesKnockouts).toBe(true)
    expect(getModeConfig('club_world_cup').matchCount).toBe(7)
    expect(getModeConfig('nation_xi').matchCount).toBe(7)
  })

  it('makes roster slots explicit for every mode config', () => {
    for (const mode of modeConfigs) {
      expect(mode.rosterSlots.starters).toBe(11)
      expect(mode.rosterSlots.total).toBe(mode.rosterSlots.starters + mode.rosterSlots.bench)
      expect(getDraftSlots(mode, formations[0])).toHaveLength(mode.rosterSlots.total)
    }

    expect(getModeConfig('world_xi').rosterSlots).toEqual({ starters: 11, bench: 0, total: 11 })
    expect(getModeConfig('manager').rosterSlots).toEqual({ starters: 11, bench: 7, total: 18 })
  })
})

describe('rating model', () => {
  it('uses an explicit EA-style peak methodology', () => {
    expect(ratingMethodology.version).toBe('ea-style-source-backed-v2')
    expect(ratingMethodology.appAttributes).toContain('bigGame')
  })

  it('maps EA-style outfield attributes into football role ratings', () => {
    const winger = ratingsFromEaStyle('RW', {
      overall: 91,
      pace: 89,
      shooting: 88,
      passing: 86,
      dribbling: 90,
      defending: 45,
      physical: 76,
      bigGame: 92,
    })

    expect(winger.attack).toBeGreaterThan(winger.defense)
    expect(winger.creation).toBeGreaterThanOrEqual(85)
    expect(winger.control).toBeGreaterThanOrEqual(85)
    expect(winger.goalkeeping).toBeLessThan(10)
    expect(winger.bigGame).toBe(92)
  })

  it('keeps goalkeeper conversion keeper-first', () => {
    const keeper = ratingsFromEaStyle('GK', {
      overall: 90,
      passing: 82,
      physical: 86,
      pace: 72,
      goalkeeping: 93,
    })

    expect(keeper.goalkeeping).toBe(93)
    expect(keeper.attack).toBeLessThan(keeper.goalkeeping)
    expect(keeper.creation).toBeGreaterThan(50)
  })
})

describe('draft engine', () => {
  it('spins options, decrements rerolls, and locks picks', () => {
    const mode = getModeConfig('world_xi')
    const state = createDraftState(mode, '4-3-3')
    const spun = spinForSlot(mode, state)
    expect(spun.currentOptions.length).toBeGreaterThan(0)

    const rerolled = reroll(mode, spun, 'team')
    expect(rerolled.rerolls.team).toBe(0)
    expect(rerolled.currentOptions.length).toBeGreaterThan(0)

    const selected = selectPlayer(rerolled, rerolled.currentOptions[0])
    expect(selected.picks).toHaveLength(1)
    expect(selected.roundIndex).toBe(1)
  })

  it('keeps the non-selected roll dimension fixed when rerolling team or era', () => {
    const mode = getModeConfig('world_xi')
    const spun = spinForSlot(mode, createDraftState(mode, '4-3-3'))
    if (!spun.currentRoll) throw new Error('Expected a roll')

    const teamRerolled = reroll(mode, spun, 'team')
    expect(teamRerolled.currentRoll?.era).toBe(spun.currentRoll.era)

    const eraRerolled = reroll(mode, spun, 'era')
    expect(eraRerolled.currentRoll?.team).toEqual(spun.currentRoll.team)
  })

  it('can place a selected player into another compatible open slot', () => {
    const mode = getModeConfig('world_xi')
    const player = playerContexts.find((item) => item.contextId === 'messi_barcelona_2010s')
    if (!player) throw new Error('Missing placement test player')
    const state = {
      ...createDraftState(mode, '4-3-3'),
      currentRoll: { team: { label: player.teamName, teamType: player.teamType }, era: player.eraLabel },
      currentOptions: [player],
    }
    const target = state.draftSlots.find((slot) => slot.slotId === 'rw')
    if (!target) throw new Error('Missing placement test target')

    const selected = selectPlayerForSlot(state, player, target.slotId)

    expect(selected.picks[0].slot.slotId).toBe(target.slotId)
    expect(selected.roundIndex).toBe(1)
  })

  it('allows visible roll-pool players when a selectable option has the same person id', () => {
    const mode = getModeConfig('world_xi')
    const mbappeContexts = playerContexts.filter((player) => player.displayName.includes('Mbapp') && player.positions.some((position) => ['ST', 'CF'].includes(position)))
    const visible = mbappeContexts.find((player) => player.teamName === 'France' && player.eraLabel === '2020s')
    const selectableAlias = mbappeContexts.find((player) => visible && player.personId === visible.personId && player.contextId !== visible.contextId)
    if (!visible || !selectableAlias) throw new Error('Missing same-person Mbappe contexts for selectability test')

    const state = {
      ...createDraftState(mode, '4-2-3-1'),
      currentRoll: { team: { label: visible.teamName, teamType: visible.teamType }, era: visible.eraLabel },
      currentRollPool: [visible],
      currentOptions: [selectableAlias],
    }
    const target = state.draftSlots.find((slot) => slot.accepts.includes('CF') || slot.accepts.includes('ST'))
    if (!target) throw new Error('Missing ST/CF target slot')

    const selected = selectPlayerForSlot(state, visible, target.slotId)

    expect(selected.picks).toHaveLength(1)
    expect(selected.picks[0].player.contextId).toBe(visible.contextId)
    expect(selected.picks[0].player.personId).toBe(selectableAlias.personId)
  })

  it('does not allow another spin before placing the current roll', () => {
    const mode = getModeConfig('world_xi')
    const state = createDraftState(mode, '4-3-3')
    const spun = spinForSlot(mode, state)
    const spunAgain = spinForSlot(mode, spun)

    expect(spunAgain.currentRoll).toEqual(spun.currentRoll)
    expect(spunAgain.currentOptions.map((player) => player.contextId)).toEqual(spun.currentOptions.map((player) => player.contextId))
  })

  it('prevents drafting the same real player through a different context', () => {
    const mode = getModeConfig('world_xi')
    const state = createDraftState(mode, '4-3-3')
    const duplicateSetup = Array.from(
      playerContexts.reduce((groups, player) => {
        const players = groups.get(player.personId) ?? []
        players.push(player)
        groups.set(player.personId, players)
        return groups
      }, new Map<string, PlayerContext[]>()),
    )
      .map(([, players]) => players)
      .flatMap((players) => players.flatMap((first) => {
        const firstSlot = state.draftSlots.find((slot) => slotMatchesPlayer(slot, first))
        if (!firstSlot) return []
        return players
          .filter((second) => second.contextId !== first.contextId)
          .flatMap((second) => {
            const secondSlot = state.draftSlots.find((slot) => slot.slotId !== firstSlot.slotId && slotMatchesPlayer(slot, second))
            return secondSlot ? [{ first, second, firstSlot, secondSlot }] : []
          })
      }))[0]

    if (!duplicateSetup) throw new Error('Expected duplicate contexts to fit two test slots')
    const { first, second, firstSlot, secondSlot } = duplicateSetup

    const picked = selectPlayerForSlot({
      ...state,
      currentRoll: { team: { label: first.teamName, teamType: first.teamType }, era: first.eraLabel },
      currentOptions: [first],
    }, first, firstSlot.slotId)
    const blocked = selectPlayerForSlot({
      ...picked,
      currentRoll: { team: { label: second.teamName, teamType: second.teamType }, era: second.eraLabel },
      currentOptions: [second],
    }, second, secondSlot.slotId)

    expect(blocked.picks).toHaveLength(1)
    expect(blocked.picks[0].player.personId).toBe(first.personId)
  })

  it('keeps sampled rolls spread across the loaded team pool', () => {
    const mode = getModeConfig('world_xi')
    const teams = new Set<string>()
    const eras = new Set<string>()

    for (let index = 0; index < 120; index += 1) {
      const spun = spinForSlot(mode, createDraftState(mode, '4-3-3'))
      if (!spun.currentRoll) throw new Error('Expected random roll')
      teams.add(spun.currentRoll.team.label)
      eras.add(spun.currentRoll.era)
    }

    expect(teams.size).toBeGreaterThan(10)
    expect(eras.size).toBeGreaterThan(5)
  })

  it('spins team and era pools instead of a single current-position pool', () => {
    const mode = getModeConfig('world_xi')
    const state = createDraftState(mode, '4-3-3', {
      fixedTeam: { label: 'Barcelona', teamType: 'club' },
      fixedEra: '2010s',
    })
    const spun = spinForSlot(mode, state)
    const positionPool = new Set(spun.currentOptions.flatMap((player) => player.positions))

    expect(spun.currentRoll?.team.label).toBe('Barcelona')
    expect(spun.currentRoll?.era).toBe('2010s')
    expect(spun.currentOptions.length).toBeGreaterThan(2)
    expect(positionPool.size).toBeGreaterThan(3)
    expect(spun.currentOptions.every((player) => player.teamName === 'Barcelona')).toBe(true)
  })

  it('dedupes accent variants from the same team-era roll', () => {
    const mode = getModeConfig('world_xi')
    const state = createDraftState(mode, '4-3-3', {
      fixedTeam: { label: 'Chelsea', teamType: 'club' },
      fixedEra: '2020s',
    })
    const spun = spinForSlot(mode, state)
    const normalizedNames = spun.currentRollPool.map((player) =>
      player.displayName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/gi, '')
        .toLowerCase(),
    )

    expect(spun.currentRoll?.team.label).toBe('Chelsea')
    expect(spun.currentRoll?.era).toBe('2020s')
    expect(normalizedNames.filter((name) => name === 'ngolokante')).toHaveLength(1)
  })

  it('dedupes generated and curated versions of Peter Schmeichel in the same roll', () => {
    const mode = getModeConfig('world_xi')
    const state = createDraftState(mode, '4-3-3', {
      fixedTeam: { label: 'Denmark', teamType: 'nation' },
      fixedEra: '1990s',
    })
    const spun = spinForSlot(mode, state)
    const schmeichels = spun.currentRollPool.filter((player) => player.displayName === 'Peter Schmeichel')

    expect(spun.currentRoll?.team.label).toBe('Denmark')
    expect(spun.currentRoll?.era).toBe('1990s')
    expect(schmeichels).toHaveLength(1)
    expect(schmeichels[0].ratings.goalkeeping).toBeGreaterThanOrEqual(95)
  })

  it('does not show duplicate normalized player names in fixed team-era roll pools', () => {
    const mode = getModeConfig('world_xi')
    const checks = [
      { label: 'Denmark', teamType: 'nation' as const, era: '1990s' },
      { label: 'England', teamType: 'nation' as const, era: '2000s' },
      { label: 'PSG', teamType: 'club' as const, era: '2010s' },
      { label: 'Real Madrid', teamType: 'club' as const, era: '2010s' },
    ]

    for (const check of checks) {
      const spun = spinForSlot(mode, createDraftState(mode, '4-3-3', {
        fixedTeam: { label: check.label, teamType: check.teamType },
        fixedEra: check.era,
      }))
      const duplicateNames = spun.currentRollPool
        .map((player) =>
          player.displayName
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/gi, '')
            .toLowerCase(),
        )
        .filter((name, index, names) => names.indexOf(name) !== index)

      expect(duplicateNames, `${check.label} ${check.era} has duplicate visible player names`).toEqual([])
    }
  })

  it('keeps exact-roll stars visible even when their positions are already filled', () => {
    const mode = getModeConfig('world_xi')
    const baseState = createDraftState(mode, '4-3-3', {
      fixedTeam: { label: 'Real Madrid', teamType: 'club' },
      fixedEra: '2020s',
    })
    const filledAttackSlots = baseState.draftSlots.filter((slot) => slot.accepts.some((position) => ['LW', 'RW', 'ST', 'CF'].includes(position)))
    const usedPlayers = new Set<string>()
    const picks = filledAttackSlots.map((slot, index) => {
      const player = playerContexts.find((candidate) => !usedPlayers.has(candidate.contextId) && slotMatchesPlayer(slot, candidate) && modeMatchesPlayer(mode, candidate))
      if (!player) throw new Error(`Missing filler for ${slot.label}`)
      usedPlayers.add(player.contextId)
      return {
        round: index + 1,
        slot,
        roll: { team: { label: player.teamName, teamType: player.teamType }, era: player.eraLabel },
        player,
      }
    })
    const state = {
      ...baseState,
      roundIndex: picks.length,
      picks,
    }

    const spun = spinForSlot(mode, state)
    const poolNames = (spun.currentRollPool ?? []).map((player) => player.displayName)
    const selectableNames = spun.currentOptions.map((player) => player.displayName)

    expect(spun.currentRoll?.team.label).toBe('Real Madrid')
    expect(spun.currentRoll?.era).toBe('2020s')
    expect(poolNames).toContain('Karim Benzema')
    expect(selectableNames).not.toContain('Karim Benzema')
  })

  it('protects against thin rolls with fallback options', () => {
    const mode = getModeConfig('world_cup')
    const state = createDraftState(mode, '4-3-3')
    const spun = spinForSlot(mode, state)
    expect(spun.currentOptions.length).toBeGreaterThan(0)
  })

  it('loads old-era legacy coverage deeply enough for Brazil 1950s', () => {
    const mode = getModeConfig('world_xi')
    const state = createDraftState(mode, '4-3-3', {
      fixedTeam: { label: 'Brazil', teamType: 'nation' },
      fixedEra: '1950s',
    })
    const spun = spinForSlot(mode, state)
    const groups = new Set(spun.currentRollPool.map((player) => {
      if (player.positions.includes('GK')) return 'GK'
      if (player.positions.some((position) => ['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(position))) return 'DEF'
      if (player.positions.some((position) => ['DM', 'CM', 'AM', 'LM', 'RM'].includes(position))) return 'MID'
      return 'ATT'
    }))

    expect(spun.currentRoll?.team.label).toBe('Brazil')
    expect(spun.currentRoll?.era).toBe('1950s')
    expect(spun.currentRollPool.length).toBeGreaterThanOrEqual(11)
    expect(groups).toEqual(new Set(['GK', 'DEF', 'MID', 'ATT']))
  })

  it('only shows players that match the displayed roll', () => {
    for (const modeId of ['world_xi', 'premier_league', 'champions_league', 'world_cup', 'ball_knowledge']) {
      const mode = getModeConfig(modeId)
      let state = createDraftState(mode, '4-3-3')
      state = spinForSlot(mode, state)
      const roll = state.currentRoll

      expect(roll, `${modeId} should produce a roll`).toBeDefined()
      expect(state.currentOptions.length, `${modeId} should produce exact options`).toBeGreaterThan(0)
      expect(state.currentOptions.every((player) => modeMatchesPlayer(mode, player))).toBe(true)
      expect(state.currentOptions.every((player) => {
        const teamMatches = player.teamName === roll?.team.label
        const eraPrefix = roll?.era.slice(0, 5)
        const eraMatches = player.decade === roll?.era || player.eraLabel === roll?.era || player.decade === eraPrefix
        return teamMatches && eraMatches
      })).toBe(true)
    }
  })

  it('keeps fixed-club special drafts locked to the selected club', () => {
    const mode = getModeConfig('one_club')
    let state = {
      ...createDraftState(mode, '4-3-3', { fixedTeam: { label: 'Barcelona', teamType: 'club' } }),
      seed: 'IXI-ONE-CLUB-TEST',
    }

    while (state.picks.length < 11) {
      state = spinForSlot(mode, state)
      expect(state.currentRoll?.team.label).toBe('Barcelona')
      expect(state.currentOptions.length).toBeGreaterThan(0)
      expect(state.currentOptions.every((player) => player.teamName === 'Barcelona')).toBe(true)
      const slot = state.draftSlots[state.roundIndex]
      const preferred = state.currentOptions.find((player) => player.primaryPositions.some((position) => slot.accepts.includes(position))) ?? state.currentOptions[0]
      state = selectPlayer(state, preferred)
    }

    expect(state.picks.every((pick) => pick.player.teamName === 'Barcelona')).toBe(true)
    expect(state.rerolls.team).toBe(0)
  })

  it('keeps fixed-era special drafts locked to the selected era', () => {
    const mode = getModeConfig('era_lock')
    const state = createDraftState(mode, '4-3-3', { fixedEra: '2010s' })
    const spun = spinForSlot(mode, state)

    expect(spun.currentRoll?.era).toBe('2010s')
    expect(spun.currentOptions.length).toBeGreaterThan(0)
    expect(spun.currentOptions.every((player) => player.decade === '2010s' || player.eraLabel === '2010s')).toBe(true)
    expect(spun.rerolls.era).toBe(0)
  })

  it('extends Manager Mode drafts to a full matchday squad', () => {
    const mode = getModeConfig('manager')
    let state = createDraftState(mode, '4-3-3')

    expect(state.draftSlots).toHaveLength(18)
    expect(state.draftSlots).toHaveLength(mode.rosterSlots.total)
    expect(state.draftSlots.filter((slot) => slot.squadRole === 'bench')).toHaveLength(mode.rosterSlots.bench)

    while (!isDraftComplete(state)) {
      state = spinForSlot(mode, state)
      expect(state.currentOptions.length).toBeGreaterThan(0)
      state = selectPlayer(state, state.currentOptions[0])
    }

    expect(state.picks).toHaveLength(18)
    expect(state.picks).toHaveLength(mode.rosterSlots.total)
    expect(state.picks.filter((pick) => pick.slot.squadRole === 'bench')).toHaveLength(mode.rosterSlots.bench)
  })

  it('can place a Manager Mode player into a compatible bench slot', () => {
    const mode = getModeConfig('manager')
    const baseState = createDraftState(mode, '4-3-3')
    const benchSlot = baseState.draftSlots.find((slot) => slot.slotId === 'bench_st')
    if (!benchSlot) throw new Error('Missing bench striker slot')

    const usedPeople = new Set<string>()
    const starterPicks = baseState.draftSlots.slice(0, 11).map((slot, index) => {
      const player = playerContexts.find((candidate) => slotMatchesPlayer(slot, candidate) && !usedPeople.has(candidate.personId))
      if (!player) throw new Error(`Missing starter filler for ${slot.label}`)
      usedPeople.add(player.personId)
      return {
        round: index + 1,
        slot,
        roll: { team: { label: player.teamName, teamType: player.teamType }, era: player.eraLabel },
        player,
      }
    })

    const benchPlayer = playerContexts.find((player) => slotMatchesPlayer(benchSlot, player) && !usedPeople.has(player.personId) && modeMatchesPlayer(mode, player))
    if (!benchPlayer) throw new Error('Missing selectable bench striker')

    const state = {
      ...baseState,
      roundIndex: 11,
      picks: starterPicks,
      currentRoll: { team: { label: benchPlayer.teamName, teamType: benchPlayer.teamType }, era: benchPlayer.eraLabel },
      currentOptions: [benchPlayer],
      currentRollPool: [benchPlayer],
    }

    const selected = selectPlayerForSlot(state, benchPlayer, benchSlot.slotId)

    expect(selected.picks.at(-1)?.slot.slotId).toBe('bench_st')
    expect(selected.picks.at(-1)?.player.personId).toBe(benchPlayer.personId)
  })

  it('can place a visible Manager Mode roll-pool player into the only compatible bench slot', () => {
    const mode = getModeConfig('manager')
    const baseState = createDraftState(mode, '4-3-3')
    const openBenchSlot = baseState.draftSlots.find((slot) => slot.slotId === 'bench_fb')
    if (!openBenchSlot) throw new Error('Missing bench fullback slot')

    const usedPeople = new Set<string>()
    const filledSlots = baseState.draftSlots.filter((slot) => slot.slotId !== openBenchSlot.slotId)
    const picks = filledSlots.map((slot, index) => {
      const player = playerContexts.find((candidate) => slotMatchesPlayer(slot, candidate) && modeMatchesPlayer(mode, candidate) && !usedPeople.has(candidate.personId))
      if (!player) throw new Error(`Missing filler for ${slot.label}`)
      usedPeople.add(player.personId)
      return {
        round: index + 1,
        slot,
        roll: { team: { label: player.teamName, teamType: player.teamType }, era: player.eraLabel },
        player,
      }
    })
    const benchPlayer = playerContexts.find((player) => slotMatchesPlayer(openBenchSlot, player) && modeMatchesPlayer(mode, player) && !usedPeople.has(player.personId))
    if (!benchPlayer) throw new Error('Missing visible bench fullback option')

    const state = {
      ...baseState,
      roundIndex: picks.length,
      picks,
      currentRoll: { team: { label: benchPlayer.teamName, teamType: benchPlayer.teamType }, era: benchPlayer.eraLabel },
      currentOptions: [],
      currentRollPool: [benchPlayer],
    }

    const selected = selectPlayerForSlot(state, benchPlayer, openBenchSlot.slotId)

    expect(selected.picks).toHaveLength(baseState.draftSlots.length)
    expect(selected.picks.at(-1)?.slot.slotId).toBe('bench_fb')
    expect(selected.picks.at(-1)?.player.personId).toBe(benchPlayer.personId)
  })

  it('can complete the final World Cup 3-4-3 slot with the current roll player', () => {
    const mode = getModeConfig('world_cup')
    const baseState = createDraftState(mode, '3-4-3')
    const openSlot = baseState.draftSlots.find((slot) => slot.slotId === 'cb3')
    const finalPlayer = playerContexts.find((player) => player.contextId === 'rated_q133903_netherlands_2010s')
    if (!openSlot || !finalPlayer) throw new Error('Missing World Cup final-slot regression setup')

    const usedPeople = new Set<string>([finalPlayer.personId])
    const picks = baseState.draftSlots.filter((slot) => slot.slotId !== openSlot.slotId).map((slot, index) => {
      const player = playerContexts.find((candidate) => slotMatchesPlayer(slot, candidate) && modeMatchesPlayer(mode, candidate) && !usedPeople.has(candidate.personId))
      if (!player) throw new Error(`Missing filler for ${slot.label}`)
      usedPeople.add(player.personId)
      return {
        round: index + 1,
        slot,
        roll: { team: { label: player.teamName, teamType: player.teamType }, era: player.eraLabel },
        player,
      }
    })
    const state = {
      ...baseState,
      roundIndex: picks.length,
      picks,
      currentRoll: { team: { label: 'Netherlands', teamType: 'nation' as const }, era: '2010s' },
      currentOptions: [],
      currentRollPool: [],
    }

    const selected = selectPlayerForSlot(state, finalPlayer, openSlot.slotId)

    expect(selected.picks).toHaveLength(baseState.draftSlots.length)
    expect(selected.picks.at(-1)?.slot.slotId).toBe('cb3')
    expect(selected.picks.at(-1)?.player.contextId).toBe(finalPlayer.contextId)
    expect(isDraftComplete(selected)).toBe(true)
  })

  it('can complete the final visible roll-pool pick in every public mode', () => {
    const formationId = '4-3-3'
    const rollEraForMode = (mode: ModeConfig, player: PlayerContext) => (
      mode.rollDimensions.includes('european_era')
        ? mode.eraPool.find((era) => era.startsWith(player.decade)) ?? player.eraLabel
        : player.eraLabel
    )
    const playerFitsRollDimension = (mode: ModeConfig, player: PlayerContext) => {
      if (mode.rollDimensions.includes('nation')) return player.teamType === 'nation'
      if (mode.rollDimensions.includes('club')) return player.teamType === 'club'
      return true
    }

    for (const mode of publicModeConfigs.filter((item) => item.allowedFormations.includes(formationId))) {
      const baseState = createDraftState(mode, formationId)
      const openSlot = baseState.draftSlots.at(-1)
      if (!openSlot) throw new Error(`Missing final slot for ${mode.modeId}`)
      const finalPlayer = playerContexts.find((player) => slotMatchesPlayer(openSlot, player) && modeMatchesPlayer(mode, player) && playerFitsRollDimension(mode, player))
      if (!finalPlayer) throw new Error(`Missing final visible option for ${mode.modeId}`)

      const usedPeople = new Set<string>([finalPlayer.personId])
      const picks = baseState.draftSlots.filter((slot) => slot.slotId !== openSlot.slotId).map((slot, index) => {
        const player = playerContexts.find((candidate) => (
          slotMatchesPlayer(slot, candidate) &&
          modeMatchesPlayer(mode, candidate) &&
          playerFitsRollDimension(mode, candidate) &&
          !usedPeople.has(candidate.personId)
        ))
        if (!player) throw new Error(`Missing ${mode.modeId} filler for ${slot.label}`)
        usedPeople.add(player.personId)
        return {
          round: index + 1,
          slot,
          roll: { team: { label: player.teamName, teamType: player.teamType }, era: rollEraForMode(mode, player) },
          player,
        }
      })
      const state = {
        ...baseState,
        roundIndex: picks.length,
        picks,
        currentRoll: { team: { label: finalPlayer.teamName, teamType: finalPlayer.teamType }, era: rollEraForMode(mode, finalPlayer) },
        currentOptions: [],
        currentRollPool: [finalPlayer],
      }

      const selected = selectPlayerForSlot(state, finalPlayer, openSlot.slotId)

      expect(selected.picks, `${mode.modeId} did not accept the final ${openSlot.label}`).toHaveLength(baseState.draftSlots.length)
      expect(selected.picks.at(-1)?.player.contextId).toBe(finalPlayer.contextId)
      expect(isDraftComplete(selected), `${mode.modeId} did not complete after final ${openSlot.label}`).toBe(true)
    }
  })

  it('can complete a default draft for every configured ready or demo mode', () => {
    for (const mode of modeConfigs) {
      let state = createDraftState(mode, '4-3-3')

      while (!isDraftComplete(state)) {
        state = spinForSlot(mode, state)
        expect(state.currentOptions.length, `${mode.modeId} stalled on ${state.draftSlots[state.roundIndex]?.label}`).toBeGreaterThan(0)
        const slot = state.draftSlots[state.roundIndex]
        const preferred = state.currentOptions.find((player) => player.primaryPositions.some((position) => slot.accepts.includes(position))) ?? state.currentOptions[0]
        state = selectPlayer(state, preferred)
      }

      expect(state.picks).toHaveLength(mode.rosterSlots.total)
    }
  }, 90000)
})

describe('simulation and sharing', () => {
  const testFormation = formations.find((formation) => formation.formationId === '4-3-3') ?? formations[0]

  function testPick(slotId: string, contextId: string, overrides: { positions?: PlayerContext['positions']; roleTags?: string[]; ratings?: Partial<Ratings> } = {}): DraftPick {
    const slot = testFormation.slots.find((item) => item.slotId === slotId) ?? testFormation.slots[0]
    const source = playerContexts.find((player) => player.contextId === contextId)
    if (!source) throw new Error(`Missing test player context: ${contextId}`)
    return {
      slot,
      player: {
        ...source,
        positions: overrides.positions ?? source.positions,
        roleTags: overrides.roleTags ?? source.roleTags,
        ratings: { ...source.ratings, ...overrides.ratings },
      },
    }
  }

  function possessionTestXI(overrides: Partial<Record<'cb1' | 'cb2', { ratings?: Partial<Ratings>; roleTags?: string[] }>> = {}): DraftPick[] {
    return [
      testPick('gk', 'neuer_bayern_2010s'),
      testPick('lb', 'alba_barcelona_2010s'),
      testPick('cb1', 'beckenbauer_bayern_1970s', overrides.cb1),
      testPick('cb2', 'baresi_milan_1990s', overrides.cb2),
      testPick('rb', 'dani_alves_barcelona_2010s'),
      testPick('dmcm', 'busquets_barcelona_2010s'),
      testPick('cm', 'xavi_barcelona_2010s'),
      testPick('amcm', 'iniesta_barcelona_2010s'),
      testPick('lw', 'ronaldo_real_madrid_2010s'),
      testPick('st', 'pele_brazil_1970s'),
      testPick('rw', 'messi_barcelona_2010s'),
    ]
  }

  function controlledRatings(level: number, isGoalkeeper: boolean): Ratings {
    return isGoalkeeper
      ? { attack: level - 30, creation: level - 25, control: level - 15, defense: level - 8, goalkeeping: level, physical: level - 6, press: level - 16, bigGame: level }
      : { attack: level, creation: level, control: level, defense: level, goalkeeping: 12, physical: level, press: level, bigGame: level }
  }

  function controlledXI(level: number): DraftPick[] {
    return possessionTestXI().map((pick) => ({
      ...pick,
      player: {
        ...pick.player,
        ratings: controlledRatings(level, pick.slot.accepts.includes('GK')),
      },
    }))
  }

  function sampleRuns(picks: DraftPick[], modeId: string, count: number) {
    const runs = Array.from({ length: count }, (_, index) => simulateRun(picks, modeId, `IXI-CAL-${modeId}-${count}-${index}`))
    const totals = runs.reduce(
      (summary, result) => {
        const matches = result.record.wins + result.record.draws + result.record.losses
        return {
          matches: summary.matches + matches,
          wins: summary.wins + result.record.wins,
          draws: summary.draws + result.record.draws,
          losses: summary.losses + result.record.losses,
          perfect: summary.perfect + (result.record.wins === matches ? 1 : 0),
          unbeaten: summary.unbeaten + (result.record.losses === 0 ? 1 : 0),
          trophies: summary.trophies + (result.trophyResult === 'Trophy won' ? 1 : 0),
        }
      },
      { matches: 0, wins: 0, draws: 0, losses: 0, perfect: 0, unbeaten: 0, trophies: 0 },
    )

    return {
      averageWins: totals.wins / count,
      averageDraws: totals.draws / count,
      averageLosses: totals.losses / count,
      winRate: (totals.wins / totals.matches) * 100,
      drawRate: (totals.draws / totals.matches) * 100,
      lossRate: (totals.losses / totals.matches) * 100,
      perfectRate: (totals.perfect / count) * 100,
      unbeatenRate: (totals.unbeaten / count) * 100,
      trophyRate: (totals.trophies / count) * 100,
    }
  }

  function completeDraft(modeId: string) {
    const mode = getModeConfig(modeId)
    let state = createDraftState(mode, '4-3-3')

    while (!isDraftComplete(state)) {
      state = spinForSlot(mode, state)
      state = selectPlayer(state, state.currentOptions[0])
    }

    return state
  }

  it('returns valid domestic records and share text', () => {
    const mode = getModeConfig('world_xi')
    const state = completeDraft('world_xi')

    const result = simulateRun(state.picks, mode.modeId, state.seed)
    expect(result.record.wins + result.record.draws + result.record.losses).toBe(mode.matchCount)
    expect(result.competitionPath).toHaveLength(1)
    expect(result.competitionPath[0].phase).toBe('League season')
    expect(result.goalsFor).toBeGreaterThanOrEqual(0)
    expect(result.goalsAgainst).toBeGreaterThanOrEqual(0)
    expect(result.shareText).toContain('38-0-0')
    expect(result.strongestUnit.length).toBeGreaterThan(0)
    expect(result.weakestUnit.length).toBeGreaterThan(0)
    expect(result.dominanceReason.length).toBeGreaterThan(0)
    expect(result.failureReason.length).toBeGreaterThan(0)
    expect(result.simulationDetails.averageWinProbability + result.simulationDetails.averageDrawProbability + result.simulationDetails.averageLossProbability).toBe(100)
    expect(result.simulationDetails.trophyProbability).toBeGreaterThanOrEqual(1)
  })

  it('derives result summaries from actual simulated matches and drafted players', () => {
    const state = completeDraft('world_xi')
    const result = simulateRun(state.picks, 'world_xi', 'IXI-RESULT-INTEGRITY')
    const phaseRecord = result.competitionPath.reduce(
      (record, phase) => ({
        wins: record.wins + phase.record.wins,
        draws: record.draws + phase.record.draws,
        losses: record.losses + phase.record.losses,
      }),
      { wins: 0, draws: 0, losses: 0 },
    )
    const phaseGoals = result.competitionPath.reduce(
      (totals, phase) => ({
        goalsFor: totals.goalsFor + phase.goalsFor,
        goalsAgainst: totals.goalsAgainst + phase.goalsAgainst,
        xgFor: totals.xgFor + phase.xgFor,
        xgAgainst: totals.xgAgainst + phase.xgAgainst,
      }),
      { goalsFor: 0, goalsAgainst: 0, xgFor: 0, xgAgainst: 0 },
    )

    expect(result.record).toEqual(phaseRecord)
    expect(result.matchTrace).toHaveLength(phaseRecord.wins + phaseRecord.draws + phaseRecord.losses)
    expect(result.goalsFor).toBe(phaseGoals.goalsFor)
    expect(result.goalsAgainst).toBe(phaseGoals.goalsAgainst)
    expect(result.xgFor).toBe(Number(phaseGoals.xgFor.toFixed(1)))
    expect(result.xgAgainst).toBe(Number(phaseGoals.xgAgainst.toFixed(1)))
    expect(result.stage).toBe(result.competitionPath.at(-1)?.outcome)
    expect(result.keyMatches.length).toBeGreaterThan(0)

    for (const keyMatch of result.keyMatches) {
      expect(
        result.matchTrace.some((match) => (
          keyMatch.result === match.result &&
          (keyMatch.note.includes(`${match.phase} match ${match.match}`) || keyMatch.note.includes(`Match ${match.match}.`))
        )),
      ).toBe(true)
    }

    expect(state.picks.map((pick) => pick.player.displayName)).toContain(result.bestPlayer)
    expect(result.why).not.toMatch(/random|placeholder|lorem/i)
  })

  it('keeps summary-page result fields tied to actual simulated phases', () => {
    const result = simulateRun(possessionTestXI(), 'world_xi', 'IXI-SUMMARY-AUDIT')
    const phaseMatches = result.competitionPath.flatMap((phase) => phase.matches)
    const phaseWins = phaseMatches.filter((match) => match.outcome === 'W').length
    const phaseDraws = phaseMatches.filter((match) => match.outcome === 'D').length
    const phaseLosses = phaseMatches.filter((match) => match.outcome === 'L').length

    expect(result.record).toEqual({ wins: phaseWins, draws: phaseDraws, losses: phaseLosses })
    expect(result.points).toBe(result.record.wins * 3 + result.record.draws)
    const expectedPerfectionLabel = result.resultTier?.id === 'perfect'
      ? 'Perfect'
      : result.resultTier?.id === 'invincible'
        ? 'Invincible'
        : result.resultTier?.id === 'undefeated'
          ? 'Undefeated'
          : result.resultTier?.label
    expect(result.perfectionResult).toBe(expectedPerfectionLabel)
    expect(result.trophyResult).toBe(result.stage?.toLowerCase().includes('champion') ? 'Trophy won' : result.stage)
    expect(result.simulationDetails.averageWinProbability + result.simulationDetails.averageDrawProbability + result.simulationDetails.averageLossProbability).toBe(100)

    for (const phase of result.competitionPath) {
      expect(phase.record.wins).toBe(phase.matches.filter((match) => match.outcome === 'W').length)
      expect(phase.record.draws).toBe(phase.matches.filter((match) => match.outcome === 'D').length)
      expect(phase.record.losses).toBe(phase.matches.filter((match) => match.outcome === 'L').length)
      expect(phase.goalsFor).toBe(phase.matches.reduce((sum, match) => sum + match.goalsFor, 0))
      expect(phase.goalsAgainst).toBe(phase.matches.reduce((sum, match) => sum + match.goalsAgainst, 0))
    }
  })

  it('separates elite, average, and weak XIs in long-run domestic calibration', () => {
    const elite = sampleRuns(controlledXI(94), 'world_xi', 120)
    const average = sampleRuns(controlledXI(78), 'world_xi', 120)
    const weak = sampleRuns(controlledXI(62), 'world_xi', 120)

    expect(elite.averageWins).toBeGreaterThan(average.averageWins + 7)
    expect(average.averageWins).toBeGreaterThan(weak.averageWins + 7)
    expect(elite.averageLosses).toBeLessThan(4)
    expect(average.averageLosses).toBeGreaterThan(4)
    expect(weak.averageLosses).toBeGreaterThan(12)
    expect(elite.perfectRate).toBeLessThan(6)
    expect(average.perfectRate).toBe(0)
    expect(weak.unbeatenRate).toBe(0)
  })

  it('keeps reported match probabilities close to observed simulation rates', () => {
    const picks = controlledXI(94)
    const details = simulateRun(picks, 'world_xi', 'IXI-CAL-PROFILE').simulationDetails
    const observed = sampleRuns(picks, 'world_xi', 160)

    expect(Math.abs(observed.winRate - details.averageWinProbability)).toBeLessThanOrEqual(5)
    expect(Math.abs(observed.drawRate - details.averageDrawProbability)).toBeLessThanOrEqual(5)
    expect(Math.abs(observed.lossRate - details.averageLossProbability)).toBeLessThanOrEqual(5)
  })

  it('keeps perfect tournament runs difficult and strength-sensitive', () => {
    const eliteWorldCup = sampleRuns(controlledXI(94), 'world_cup', 160)
    const averageWorldCup = sampleRuns(controlledXI(78), 'world_cup', 160)
    const weakWorldCup = sampleRuns(controlledXI(62), 'world_cup', 160)

    expect(eliteWorldCup.trophyRate).toBeGreaterThan(averageWorldCup.trophyRate + 15)
    expect(averageWorldCup.trophyRate).toBeGreaterThan(weakWorldCup.trophyRate)
    expect(eliteWorldCup.perfectRate).toBeLessThan(25)
    expect(averageWorldCup.perfectRate).toBe(0)
    expect(weakWorldCup.perfectRate).toBe(0)
  })

  it('scores effective team quality from rating, fit, chemistry, balance, and weak-link caps', () => {
    const strongXI = possessionTestXI()
    const strongChemistry = calculateChemistry(strongXI)
    const strongRatings = calculateTeamRatings(strongXI, strongChemistry.score)
    const strongQuality = calculateEffectiveTeamQuality({ picks: strongXI, ratings: strongRatings, chemistryReport: strongChemistry })
    const emergencyKeeperXI = [
      testPick('gk', 'messi_barcelona_2010s', { positions: ['RW'], ratings: { goalkeeping: 4 } }),
      ...possessionTestXI().filter((pick) => pick.slot.slotId !== 'gk'),
    ]
    const weakChemistry = calculateChemistry(emergencyKeeperXI)
    const weakRatings = calculateTeamRatings(emergencyKeeperXI, weakChemistry.score)
    const weakQuality = calculateEffectiveTeamQuality({ picks: emergencyKeeperXI, ratings: weakRatings, chemistryReport: weakChemistry })

    expect(calculatePositionFitReport(strongXI).minimum).toBe(100)
    expect(positionFitScore(strongXI[0].slot, strongXI[0].player)).toBe(100)
    expect(calculatePositionFitReport(emergencyKeeperXI).minimum).toBeLessThan(70)
    expect(weakQuality.score).toBeLessThanOrEqual(68)
    expect(weakQuality.weakLinks).toContain('Emergency goalkeeper')
    expect(strongQuality.score).toBeGreaterThan(weakQuality.score + 18)
  })

  it('maps dominance to capped probabilities and applies draw conversion as a second phase', () => {
    const even = baseDominanceProbabilities(0)
    const dominant = baseDominanceProbabilities(45)
    const underdog = baseDominanceProbabilities(-30)
    const peakConversion = drawConversionProbability({
      ratings: calculateTeamRatings(possessionTestXI(), 95),
      effectiveScore: 94,
      positionFit: 100,
      chemistry: 96,
      roleBalance: 96,
      weakLinkPenalty: 0,
      opponentDifficulty: 48,
      dominanceDelta: 45,
      matchImportance: 1,
    })
    const weakConversion = drawConversionProbability({
      ratings: calculateTeamRatings(controlledXI(62), 55),
      effectiveScore: 58,
      positionFit: 72,
      chemistry: 58,
      roleBalance: 62,
      weakLinkPenalty: 20,
      opponentDifficulty: 70,
      dominanceDelta: -12,
      matchImportance: 1.8,
    })
    const converted = finalProbabilities(dominant, peakConversion)

    expect(underdog.win).toBeLessThan(even.win)
    expect(even.win).toBeLessThan(dominant.win)
    expect(dominant.win).toBeLessThanOrEqual(0.91)
    expect(dominant.draw).toBeLessThan(even.draw)
    expect(dominant.loss).toBeGreaterThanOrEqual(0.025)
    expect(peakConversion).toBeGreaterThan(weakConversion)
    expect(peakConversion).toBeLessThanOrEqual(0.4)
    expect(converted.win).toBeGreaterThan(dominant.win)
    expect(converted.draw).toBeLessThan(dominant.draw)
    expect(converted.loss).toBe(dominant.loss)
    expect(Math.round((converted.win + converted.draw + converted.loss) * 10000)).toBe(10000)
  })

  it('classifies league and tournament result tiers with near-miss subtypes', () => {
    const league = getModeConfig('premier_league')
    const worldCup = getModeConfig('world_cup')

    expect(leagueInvincibleDrawLimit(38)).toBe(3)
    expect(classifyResultTier({ mode: league, wins: 38, draws: 0, losses: 0, stage: 'Champion', hadExtraTimeWin: false, hadPenaltyAdvance: false }).id).toBe('perfect')
    expect(classifyResultTier({ mode: league, wins: 37, draws: 1, losses: 0, stage: 'Champion', hadExtraTimeWin: false, hadPenaltyAdvance: false }).id).toBe('perfect_near_miss')
    expect(classifyResultTier({ mode: league, wins: 37, draws: 0, losses: 1, stage: 'Champion', hadExtraTimeWin: false, hadPenaltyAdvance: false }).id).toBe('undefeated_near_miss')
    expect(classifyResultTier({ mode: league, wins: 35, draws: 3, losses: 0, stage: 'Champion', hadExtraTimeWin: false, hadPenaltyAdvance: false }).id).toBe('invincible')
    expect(classifyResultTier({ mode: worldCup, wins: 7, draws: 0, losses: 0, stage: 'Champion', hadExtraTimeWin: true, hadPenaltyAdvance: false }).id).toBe('invincible')
    expect(classifyResultTier({ mode: worldCup, wins: 6, draws: 1, losses: 0, stage: 'Champion', hadExtraTimeWin: false, hadPenaltyAdvance: true }).id).toBe('undefeated')
  })

  it('adds reproducible opponent difficulty scale and match-level simulation fields', () => {
    const mode = getModeConfig('premier_league')
    const rngValues = [0.1, 0.5, 0.9, 0.5]
    const makeRng = () => {
      let index = 0
      return {
        next: () => rngValues[index++ % rngValues.length],
        between: (min: number, max: number) => min + (max - min) * rngValues[index++ % rngValues.length],
      }
    }
    const first = fixtureDifficulty(mode, 'Matchday 1', makeRng())
    const second = fixtureDifficulty(mode, 'Matchday 1', makeRng())
    const result = simulateRun(controlledXI(94), 'world_xi', 'IXI-V2-FIELDS')

    expect(first).toEqual(second)
    expect(first.difficulty).toBeGreaterThanOrEqual(30)
    expect(first.difficulty).toBeLessThanOrEqual(90)
    expect(result.scoringVersion).toBe(scoringVersion)
    expect(result.effectiveTeamQuality?.score).toBeGreaterThan(80)
    expect(result.streaks?.longestUnbeatenStreak).toBeGreaterThanOrEqual(result.streaks?.longestWinStreak ?? 0)
    if (result.record.draws > 0 || result.record.losses > 0) {
      expect(result.matchThatChangedSeason?.match).toBeGreaterThan(0)
    } else {
      expect(result.matchThatChangedSeason).toBeUndefined()
    }
    expect(result.tacticalReason?.summary.length).toBeGreaterThan(12)
    expect(result.matchTrace.every((match) => match.opponentDifficulty !== undefined && match.baseProbabilities && match.finalProbabilities)).toBe(true)
    expect(result.probabilityExamples).toHaveLength(6)
  })

  it('orders leaderboard scoring v2 by tier before win rate and mode context', () => {
    const template = simulateRun(controlledXI(94), 'world_xi', 'IXI-SCORE-V2')
    const perfect = {
      ...template,
      record: { wins: 38, draws: 0, losses: 0 },
      resultTier: { id: 'perfect' as const, label: 'Perfect', description: 'Every league match was won.', rank: 800 },
      goalsFor: 120,
      goalsAgainst: 18,
      points: 114,
    }
    const nearMiss = {
      ...perfect,
      record: { wins: 37, draws: 1, losses: 0 },
      resultTier: { id: 'perfect_near_miss' as const, label: 'Perfect near-miss', description: 'One draw kept the league from perfection.', rank: 690 },
      points: 112,
    }
    const undefeated = {
      ...perfect,
      record: { wins: 34, draws: 4, losses: 0 },
      resultTier: { id: 'undefeated' as const, label: 'Undefeated', description: 'No losses, but too many draws for invincible perfection.', rank: 640 },
      points: 106,
    }

    expect(scoreRun(perfect)).toBeGreaterThan(scoreRun(nearMiss))
    expect(scoreRun(nearMiss)).toBeGreaterThan(scoreRun(undefeated))
    expect(modeDifficultyScore('world_xi')).toBeGreaterThan(modeDifficultyScore('world_cup'))
    expect(scoringVersion).toBe(2)
  })

  it('persists recent runs while keeping the best run per mode', () => {
    const state = completeDraft('world_xi')
    const strongRun = simulateRun(state.picks, 'world_xi', 'IXI-STRONG')
    const weakRun = {
      ...strongRun,
      runId: 'IXI-WEAK',
      record: { wins: 0, draws: 0, losses: 38 },
      points: 0,
      goalsFor: 12,
      goalsAgainst: 140,
      xgFor: 15,
      xgAgainst: 118,
      grade: 'D',
      gradeLabel: 'The simulation exposed the gaps',
      trophyResult: 'Top-four fight',
      perfectionResult: 'Not invincible',
    }
    const firstPreferences = recordRun({}, strongRun, '4-3-3', '2026-06-08T00:00:00.000Z')
    const nextPreferences = recordRun(firstPreferences, weakRun, '4-3-3', '2026-06-08T00:01:00.000Z')

    expect(nextPreferences.bestRecords.world_xi.runId).toBe(strongRun.runId)
    expect(nextPreferences.recentRuns).toHaveLength(2)
    expect(nextPreferences.recentRuns[0].runId).toBe(weakRun.runId)
    expect(formatStoredRecord(nextPreferences.bestRecords.world_xi.record)).toMatch(/\d+-\d+-\d+/)
  })

  it('returns phase-aware Champions League paths', () => {
    const mode = getModeConfig('champions_league')
    const state = completeDraft('champions_league')
    const result = simulateRun(state.picks, mode.modeId, state.seed)
    const totalMatches = result.record.wins + result.record.draws + result.record.losses

    expect(result.competitionPath[0].phase).toBe('League phase')
    expect(totalMatches).toBeGreaterThanOrEqual(8)
    expect(totalMatches).toBeLessThanOrEqual(15)
    expect(result.stage).toBe(result.competitionPath.at(-1)?.outcome)
  })

  it('returns phase-aware World Cup paths', () => {
    const mode = getModeConfig('world_cup')
    const state = completeDraft('world_cup')
    const result = simulateRun(state.picks, mode.modeId, state.seed)
    const totalMatches = result.record.wins + result.record.draws + result.record.losses

    expect(result.competitionPath[0].phase).toBe('Group stage')
    expect(totalMatches).toBeGreaterThanOrEqual(3)
    expect(totalMatches).toBeLessThanOrEqual(7)
    expect(result.stage).toBe(result.competitionPath.at(-1)?.outcome)
  })

  it('returns playoff-aware MLS paths', () => {
    const mode = getModeConfig('mls')
    const state = completeDraft('world_xi')
    const result = simulateRun(state.picks, mode.modeId, 'IXI-MLS-TEST')
    const totalMatches = result.record.wins + result.record.draws + result.record.losses

    expect(result.competitionPath[0].phase).toBe('Regular season')
    expect(totalMatches).toBeGreaterThanOrEqual(mode.matchCount)
    expect(totalMatches).toBeLessThanOrEqual(mode.matchCount + 4)
    expect(result.stage).toBe(result.competitionPath.at(-1)?.outcome)
    expect(result.competitionPath.every((phase) => phase.phase !== 'Campaign')).toBe(true)
  })

  it('returns group-and-knockout paths for generic tournaments', () => {
    const state = completeDraft('world_xi')

    for (const modeId of ['euros', 'copa_america', 'afcon', 'club_world_cup']) {
      const mode = getModeConfig(modeId)
      const result = simulateRun(state.picks, mode.modeId, `IXI-${modeId}`)
      const totalMatches = result.record.wins + result.record.draws + result.record.losses

      expect(mode.matchCount).toBe(7)
      expect(result.competitionPath[0].phase).toBe('Group stage')
      expect(totalMatches).toBeGreaterThanOrEqual(3)
      expect(totalMatches).toBeLessThanOrEqual(7)
      expect(result.stage).toBe(result.competitionPath.at(-1)?.outcome)
      expect(result.competitionPath.every((phase) => phase.phase !== 'Campaign')).toBe(true)
    }
  })

  it('adds deterministic chaos events to Chaos Mode runs', () => {
    const mode = getModeConfig('chaos')
    const state = completeDraft('world_xi')
    const result = simulateRun(state.picks, mode.modeId, 'IXI-CHAOS-TEST')
    const replay = simulateRun(state.picks, mode.modeId, 'IXI-CHAOS-TEST')
    const normalMode = simulateRun(state.picks, 'world_xi', 'IXI-CHAOS-TEST')
    const totalMatches = result.record.wins + result.record.draws + result.record.losses

    expect(totalMatches).toBe(mode.matchCount)
    expect(result.chaosEvents.length).toBeGreaterThan(0)
    expect(result.chaosEvents).toEqual(replay.chaosEvents)
    expect(result.record).toEqual(replay.record)
    expect(result.chaosEvents.every((event) => event.phase.length > 0 && event.note.length > 0)).toBe(true)
    expect(normalMode.chaosEvents).toEqual([])
  })

  it('returns squad-depth reports for Manager Mode simulations', () => {
    const mode = getModeConfig('manager')
    const state = completeDraft('manager')
    const result = simulateRun(state.picks, mode.modeId, 'IXI-MANAGER-TEST')
    const totalMatches = result.record.wins + result.record.draws + result.record.losses

    expect(state.picks).toHaveLength(18)
    expect(totalMatches).toBe(mode.matchCount)
    expect(result.squadReport?.depthScore).toBeGreaterThanOrEqual(35)
    expect(result.squadReport?.rotationCoverage).toBeGreaterThanOrEqual(4)
    expect(result.chaosEvents).toEqual([])
  })

  it('flags emergency goalkeeping in chemistry and tactic diagnostics', () => {
    const malformedXI = [
      testPick('gk', 'messi_barcelona_2010s', { positions: ['RW'], ratings: { goalkeeping: 4 } }),
      ...possessionTestXI().filter((pick) => pick.slot.slotId !== 'gk'),
    ]
    const chemistry = calculateChemistry(malformedXI)
    const ratings = calculateTeamRatings(malformedXI, chemistry.score)
    const tactic = inferTactic(malformedXI, ratings)

    expect(chemistry.warnings).toContain('No real keeper. The simulation will punish emergency goalkeeping.')
    expect(tactic.weaknesses).toContain('no real goalkeeper')
    expect(ratings.goalkeeping).toBeLessThan(60)
  })

  it('punishes slow center backs in high-line tactics', () => {
    const picks = possessionTestXI({
      cb1: { ratings: { physical: 45, press: 42 } },
      cb2: { ratings: { physical: 48, press: 40 } },
    })
    const chemistry = calculateChemistry(picks)
    const ratings = calculateTeamRatings(picks, chemistry.score)
    const tactic = inferTactic(picks, ratings)

    expect(['Possession', 'High Press']).toContain(tactic.identity)
    expect(tactic.weaknesses).toContain('slow high-line center backs')
  })

  it('surfaces chemistry weakness and role overload in tactic reports', () => {
    const overloadedXI = possessionTestXI({
      cb1: { roleTags: ['Creator', 'Line leader'] },
      cb2: { roleTags: ['Creator', 'Line leader'] },
    })
    const chemistry = calculateChemistry(overloadedXI)
    const ratings = calculateTeamRatings(overloadedXI, 55)
    const tactic = inferTactic(overloadedXI, ratings)

    expect(chemistry.warnings).toContain('Too many creators. Somebody has to run beyond.')
    expect(tactic.weaknesses).toContain('role overload')
    expect(tactic.weaknesses).toContain('weak chemistry')
  })

  it('calculates advanced football-specific team ratings', () => {
    const ratings = calculateTeamRatings(possessionTestXI(), 88)
    const advancedKeys = [
      'finishing',
      'chanceCreation',
      'ballProgression',
      'midfieldControl',
      'pressResistance',
      'defensiveSolidity',
      'defensiveTransitions',
      'pressing',
      'aerialSetPiece',
      'physicality',
      'consistency',
      'tacticalCoherence',
      'eraBalance',
      'dataConfidence',
    ] as const

    for (const key of advancedKeys) {
      expect(ratings[key]).toBeGreaterThanOrEqual(35)
      expect(ratings[key]).toBeLessThanOrEqual(100)
    }

    expect(ratings.overall).toBeGreaterThan(80)
  })

  it('infers Direct Football for physical aerial XIs', () => {
    const directXI = [
      testPick('gk', 'cech_chelsea_2000s', { roleTags: ['Shot-stopper', 'Box command'], ratings: { physical: 90 } }),
      testPick('lb', 'roberto_carlos_brazil_2000s', { roleTags: ['Crossing', 'Set pieces'], ratings: { physical: 96 } }),
      testPick('cb1', 'van_dijk_liverpool_2020s', { roleTags: ['Aerial wall', 'Line leader'], ratings: { physical: 96, press: 70 } }),
      testPick('cb2', 'ramos_real_madrid_2010s', { roleTags: ['Aerial threat', 'Stopper'], ratings: { physical: 95, press: 68 } }),
      testPick('rb', 'cafu_brazil_2000s', { roleTags: ['Crossing', 'Duel winner'], ratings: { physical: 94 } }),
      testPick('dmcm', 'vieira_arsenal_2000s', { roleTags: ['Ball-winner', 'Duel winner', 'Second-ball'], ratings: { physical: 96 } }),
      testPick('cm', 'gerrard_liverpool_2000s', { roleTags: ['Long passing', 'Captain', 'Set pieces'], ratings: { physical: 90 } }),
      testPick('amcm', 'bergkamp_arsenal_2000s', { roleTags: ['Target support', 'Second-ball'], ratings: { creation: 76, control: 80, physical: 88 } }),
      testPick('lw', 'ronaldo_real_madrid_2010s', { roleTags: ['Aerial threat', 'Box runner'], ratings: { physical: 96 } }),
      testPick('st', 'van_basten_milan_1990s', { roleTags: ['Target forward', 'Elite finisher', 'Aerial threat'], ratings: { physical: 94 } }),
      testPick('rw', 'salah_liverpool_2010s', { roleTags: ['Box runner', 'Transition threat'], ratings: { physical: 90 } }),
    ]
    const ratings = calculateTeamRatings(directXI, 82)
    const tactic = inferTactic(directXI, ratings)

    expect(ratings.aerialSetPiece).toBeGreaterThanOrEqual(86)
    expect(tactic.identity).toBe('Direct Football')
    expect(tactic.strengths).toContain('second balls')
  })

  it('generates standalone share text', () => {
    const text = createShareText({
      modeId: 'world_xi',
      modeName: 'World XI',
      targetRecord: '38-0-0',
      record: { wins: 36, draws: 2, losses: 0 },
      points: 110,
      goalsFor: 104,
      goalsAgainst: 18,
      xgFor: 98.4,
      xgAgainst: 20.2,
      grade: 'S',
      gradeLabel: 'Invincible, not perfect',
      trophyResult: 'League champion',
      perfectionResult: 'Invincible, not perfect',
      bestPlayer: 'Lionel Messi',
      weakLink: 'No true ball-winner',
      why: 'Two draws haunt you.',
      teamRatings: { attack: 95, midfield: 93, defense: 90, goalkeeping: 91, chemistry: 88, bigGame: 92, balance: 90, overall: 92 },
      tacticReport: { identity: 'Possession', summary: 'Controlled games.', strengths: [], weaknesses: [] },
      chemistryReport: { score: 88, sameTeamLinks: 2, sameNationLinks: 1, roleBalance: 87, warnings: [], bonuses: [] },
      keyMatches: [],
      runId: 'IXI-TEST',
    })
    expect(text).toContain('36-2-0')
    expect(text).toContain('Can your XI go 38-0-0?')
  })
})

describe('data validation', () => {
  it('has no structural data issues', () => {
    expect(playerContexts.length).toBeGreaterThan(100)
    expect(validateDataSet()).toEqual([])
  })

  it('writes generated source and coverage artifacts', () => {
    const coverage = JSON.parse(readFileSync(`${process.cwd()}/src/data/generated/coverageReport.json`, 'utf8')) as {
      totalContexts: number
      modes: Array<{
        modeId: string
        status: string
        playable: boolean
        demoPlayable: boolean
        readiness: string
        rosterSlots?: { starters: number; bench: number; total: number }
        formationCoverage: Record<string, Record<string, number>>
        demoFormationCoverage: Record<string, Record<string, number>>
      }>
    }
    const sources = JSON.parse(readFileSync(`${process.cwd()}/src/data/generated/sourceAudit.json`, 'utf8')) as {
      sourceStatus: Array<{ url: string; status: number | string; apiStatus?: number | string }>
    }
    const normalized = JSON.parse(readFileSync(`${process.cwd()}/src/data/generated/normalizedSources.json`, 'utf8')) as {
      samples: Array<{
        source: string
        status: number | string
        fileCount?: number
        samplePeople?: unknown[]
        columns?: string[]
        competitionCount?: number
      }>
    }
    const provenancePath = `${process.cwd()}/src/data/generated/contextProvenance.json`
    const playablePath = `${process.cwd()}/src/data/generated/playableContexts.json`
    const provenanceHead = readFileHead(provenancePath)
    const playableHead = readFileHead(playablePath)

    expect(coverage.totalContexts).toBeGreaterThan(100)
    expect(coverage.modes.filter((mode) => mode.status === 'public').every((mode) => mode.playable)).toBe(true)
    expect(
      coverage.modes
        .filter((mode) => mode.status === 'public')
        .every((mode) => Object.values(mode.formationCoverage).every((formation) => Object.values(formation).every((count) => count >= 2))),
    ).toBe(true)
    expect(coverage.modes.find((mode) => mode.modeId === 'world_xi')?.formationCoverage['4-3-3']).toBeDefined()
    expect(coverage.modes.every((mode) => mode.rosterSlots?.total === (mode.rosterSlots?.starters ?? 0) + (mode.rosterSlots?.bench ?? 0))).toBe(true)
    expect(coverage.modes.find((mode) => mode.modeId === 'manager')?.rosterSlots?.total).toBe(18)
    expect(coverage.modes).toHaveLength(21)
    expect(coverage.modes.every((mode) => mode.status === 'public' && mode.readiness === 'ready')).toBe(true)
    expect(sources.sourceStatus.length).toBeGreaterThanOrEqual(5)
    expect(normalized.samples.map((sample) => sample.source)).toEqual(expect.arrayContaining([
      'OpenFootball players',
      'OpenFootball football.json',
      'Wikidata SPARQL',
      'Football-Data.co.uk',
      'StatsBomb open data',
      'EA SPORTS FC ratings',
    ]))
    expect(normalized.samples.every((sample) => sample.fileCount || sample.samplePeople?.length || sample.columns?.length || sample.competitionCount || sample.players?.length)).toBe(true)
    expect(provenanceHead).toContain(`"totalContexts": ${playerContexts.length}`)
    expect(provenanceHead).toContain('"version": "ea-style-source-backed-v2"')
    expect(provenanceHead).toContain('"modeContextCounts"')
    expect(playableHead).toContain(`"totalContexts": ${playerContexts.length}`)
    expect(playableHead).toContain('"contexts"')
    expect(statSync(provenancePath).size).toBeGreaterThan(1_000_000)
    expect(statSync(playablePath).size).toBeGreaterThan(1_000_000)
  })

  it('keeps public draft pools limited to source-backed rated contexts', () => {
    const publicDraftPool = playerContexts.filter((player) => publicModeConfigs.some((mode) => modeMatchesPlayer(mode, player, true)))
    const approvedSourceLabels = ['CSV snapshot', 'Approved public historical numeric rating proxy', 'Legacy proxy:']

    expect(publicDraftPool.length).toBeGreaterThan(1000)
    expect(publicDraftPool.every((player) => player.ratingSourceConfidence && player.ratingSourceConfidence !== 'unrated-hidden')).toBe(true)
    expect(publicDraftPool.every((player) => player.sourceNotes.some((source) => approvedSourceLabels.some((label) => source.includes(label))))).toBe(true)
  })

  it('keeps automatic historical proxy ratings realistic', () => {
    const generatedProxyPool = playerContexts.filter((player) => player.sourceNotes.includes('Legacy proxy: Wikidata facts + appearance model'))
    const ratingFields = ['attack', 'creation', 'control', 'defense', 'goalkeeping', 'physical', 'press', 'bigGame'] as const
    const tierCaps = {
      fringe: { metric: 75, bigGame: 74 },
      regular: { metric: 81, bigGame: 80 },
      important: { metric: 86, bigGame: 85 },
      star: { metric: 89, bigGame: 88 },
      'legend-candidate': { metric: 92, bigGame: 91 },
    }

    expect(generatedProxyPool.length).toBeGreaterThan(1000)

    for (const player of generatedProxyPool) {
      const tierMatch = player.historicalNotes.match(/wikidata-appearance-proxy:([a-z-]+)/)
      const tier = tierMatch?.[1] as keyof typeof tierCaps | undefined

      expect(tier, `${player.displayName} is missing a generated proxy tier`).toBeDefined()
      if (!tier) continue

      const caps = tierCaps[tier]
      for (const field of ratingFields) {
        const cap = field === 'bigGame' ? caps.bigGame : caps.metric
        expect(
          player.ratings[field],
          `${player.displayName} ${player.teamName} ${player.eraLabel} has unrealistic generated ${field}`,
        ).toBeLessThanOrEqual(cap)
      }

      if (player.primaryPositions[0] === 'GK') {
        expect(player.ratings.attack, `${player.displayName} has inflated GK attack`).toBeLessThanOrEqual(30)
      }
    }
  })
})
