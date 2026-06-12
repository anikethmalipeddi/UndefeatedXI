import type { Formation, FormationSlot, ModeConfig } from '../types'

export const managerBenchSlots: FormationSlot[] = [
  { slotId: 'bench_gk', label: 'Bench GK', accepts: ['GK'], need: 'rotation keeper who can survive pressure matches', x: 0, y: 0, squadRole: 'bench' },
  { slotId: 'bench_cb', label: 'Bench CB', accepts: ['CB'], need: 'reserve center-back for injuries, suspensions, and late leads', x: 0, y: 0, squadRole: 'bench' },
  { slotId: 'bench_fb', label: 'Bench FB/WB', accepts: ['LB', 'RB', 'LWB', 'RWB'], need: 'wide defensive cover for fixture congestion', x: 0, y: 0, squadRole: 'bench' },
  { slotId: 'bench_dmcm', label: 'Bench DM/CM', accepts: ['DM', 'CM'], need: 'fresh legs for control, duels, and closing games', x: 0, y: 0, squadRole: 'bench' },
  { slotId: 'bench_creator', label: 'Bench Creator', accepts: ['CM', 'AM', 'LM', 'RM'], need: 'a change-of-rhythm passer or between-lines option', x: 0, y: 0, squadRole: 'bench' },
  { slotId: 'bench_wide', label: 'Bench Wide FWD', accepts: ['LW', 'RW', 'LM', 'RM', 'CF'], need: 'wide threat when the first XI needs a different angle', x: 0, y: 0, squadRole: 'bench' },
  { slotId: 'bench_st', label: 'Bench ST/CF', accepts: ['ST', 'CF'], need: 'goals from the bench when the run gets tight', x: 0, y: 0, squadRole: 'bench' },
]

export function getDraftSlots(mode: ModeConfig, formation: Formation): FormationSlot[] {
  const starters = formation.slots.slice(0, mode.rosterSlots.starters).map((slot) => ({ ...slot, squadRole: 'starter' as const }))
  const bench = managerBenchSlots.slice(0, mode.rosterSlots.bench)

  if (bench.length > 0) {
    return [
      ...starters,
      ...bench,
    ]
  }

  return starters
}

export function isBenchSlot(slot: FormationSlot): boolean {
  return slot.squadRole === 'bench' || slot.slotId.startsWith('bench_')
}
