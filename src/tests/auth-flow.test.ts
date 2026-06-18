import type { Session } from '@supabase/supabase-js'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loadAuthProfile, signIn, submitLeaderboardRun, type LeaderboardSubmission } from '../services/supabase'

const mocks = vi.hoisted(() => {
  const profileBuilder = {
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle: vi.fn(),
    upsert: vi.fn(),
    single: vi.fn(),
  }
  profileBuilder.select.mockReturnValue(profileBuilder)
  profileBuilder.eq.mockReturnValue(profileBuilder)
  profileBuilder.upsert.mockReturnValue(profileBuilder)

  const supabase = {
    auth: {
      getSession: vi.fn(),
      signInWithPassword: vi.fn(),
      updateUser: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    from: vi.fn(),
    functions: {
      invoke: vi.fn(),
    },
  }

  return {
    createClient: vi.fn(() => supabase),
    profileBuilder,
    supabase,
  }
})

vi.mock('@supabase/supabase-js', () => ({
  createClient: mocks.createClient,
}))

vi.mock('../services/supabaseConfig', () => ({
  hasSupabaseConfig: true,
  supabaseAnonKey: 'anon-key',
  supabaseUrl: 'https://example.supabase.co',
}))

function makeSession(displayName?: string, email = 'player@example.com'): Session {
  return {
    access_token: 'access-token',
    refresh_token: 'refresh-token',
    expires_in: 3600,
    token_type: 'bearer',
    user: {
      id: 'user-1',
      aud: 'authenticated',
      role: 'authenticated',
      email: email || undefined,
      app_metadata: {},
      user_metadata: displayName ? { display_name: displayName } : {},
      created_at: '2026-06-15T00:00:00.000Z',
    },
  } as Session
}

function leaderboardPayload(): LeaderboardSubmission {
  return {
    runId: 'IXI-ABCD',
    modeId: 'world_xi',
    modeName: 'World XI',
    formationId: '4-3-3',
    score: 1000,
    grade: 'A',
    resultTier: 'strong',
    scoringVersion: 2,
    record: { wins: 30, draws: 4, losses: 4 },
    goalsFor: 90,
    goalsAgainst: 32,
    teamRating: 88,
    picksDigest: 'GK:Player@Team/2020s',
    shareText: 'World XI: 30-4-4',
  }
}

describe('Supabase auth profile flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.supabase.from.mockReturnValue(mocks.profileBuilder)
    mocks.profileBuilder.select.mockReturnValue(mocks.profileBuilder)
    mocks.profileBuilder.eq.mockReturnValue(mocks.profileBuilder)
    mocks.profileBuilder.upsert.mockReturnValue(mocks.profileBuilder)
    mocks.profileBuilder.maybeSingle.mockResolvedValue({ data: null, error: null })
    mocks.profileBuilder.single.mockResolvedValue({ data: { display_name: 'Captain' }, error: null })
    mocks.supabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null })
    mocks.supabase.auth.signInWithPassword.mockResolvedValue({ data: { session: null }, error: null })
    mocks.supabase.auth.updateUser.mockResolvedValue({ data: { user: makeSession('Captain').user }, error: null })
    mocks.supabase.auth.onAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } })
    mocks.supabase.functions.invoke.mockResolvedValue({ error: null })
  })

  it('creates a profile row from auth metadata and reuses it as the display name', async () => {
    const profile = await loadAuthProfile(makeSession('Captain'))

    expect(profile).toMatchObject({ id: 'user-1', displayName: 'Captain' })
    expect(mocks.profileBuilder.upsert).toHaveBeenCalledWith(
      { id: 'user-1', display_name: 'Captain' },
      { onConflict: 'id' },
    )
  })

  it('uses an existing profile row without asking for the name again', async () => {
    mocks.supabase.auth.signInWithPassword.mockResolvedValue({ data: { session: makeSession('Old Name') }, error: null })
    mocks.profileBuilder.maybeSingle.mockResolvedValue({ data: { display_name: 'Saved Name' }, error: null })

    const profile = await signIn('player@example.com', 'password123')

    expect(profile).toMatchObject({ id: 'user-1', displayName: 'Saved Name' })
    expect(profile?.needsDisplayName).toBeUndefined()
    expect(mocks.supabase.auth.updateUser).toHaveBeenCalledWith({ data: { display_name: 'Saved Name' } })
  })

  it('marks old sessions without a saved display name for one-time profile setup', async () => {
    const profile = await loadAuthProfile(makeSession(undefined, ''))

    expect(profile).toMatchObject({ id: 'user-1', displayName: 'Player', needsDisplayName: true })
    expect(mocks.profileBuilder.upsert).not.toHaveBeenCalled()
  })

  it('does not submit leaderboard runs until the signed-in user has a display name', async () => {
    mocks.supabase.auth.getSession.mockResolvedValue({ data: { session: makeSession(undefined, '') }, error: null })

    await expect(submitLeaderboardRun(leaderboardPayload())).rejects.toThrow('Choose a display name')
    expect(mocks.supabase.functions.invoke).not.toHaveBeenCalled()
  })
})
