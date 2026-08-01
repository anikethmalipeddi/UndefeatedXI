import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'

const draftLoadWait = { timeout: 45000 }

function findDraftRound(round: number) {
  return screen.findByText(new RegExp(`Round ${round}/11`, 'i'), {}, draftLoadWait)
}

function metaContent(selector: string) {
  return document.head.querySelector<HTMLMetaElement>(selector)?.content
}

async function completeWorldXiDraft(user: ReturnType<typeof userEvent.setup>) {
  for (let round = 1; round <= 11; round += 1) {
    expect(await findDraftRound(round)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^Spin$/i }))
    const playerButtons = await screen.findAllByRole('button', { name: /Choose player/i })
    await user.click(playerButtons[0])
    const placeButtons = await screen.findAllByRole('button', { name: /Place .* at/i })
    await user.click(placeButtons[0])
  }
}

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('undefeatedxi.rules.dismissed', 'true')
    window.history.replaceState(null, '', '/')
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })
  })

  it('starts a draft from the homepage', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(screen.getByRole('button', { name: /Ball Knowledge/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^World XI$/i }))
    await waitFor(() => expect(window.location.hash).toBe('#/setup/world_xi'))
    await user.click(screen.getByRole('button', { name: /Start Draft/i }))

    expect(await findDraftRound(1)).toBeInTheDocument()
    expect(screen.getByText('MUN')).toBeInTheDocument()
    expect(screen.queryByText('Manchester United')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Spin/i })).toBeInTheDocument()
    expect(window.location.hash).toBe('#/draft')

    await user.click(screen.getByRole('button', { name: /^Spin$/i }))
    await screen.findAllByRole('button', { name: /Choose player/i })
    await user.click((await screen.findAllByRole('button', { name: /Choose player/i }))[0])
    expect((await screen.findAllByRole('button', { name: /Place .* at .* fit/i }))[0]).toHaveAccessibleName(/penalty/i)
    expect(screen.queryByRole('button', { name: /^Spin$/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Team$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Era$/i })).toBeInTheDocument()
  })

  it('orders the main menu modes with Manager Mode included', () => {
    render(<App />)

    const modeGrid = screen.getByRole('region', { name: /Playable mode choices/i })
    const mainModeNames = within(modeGrid).getAllByRole('button').map((button) => button.getAttribute('aria-label'))

    expect(mainModeNames).toEqual([
      'World XI',
      'Ball Knowledge',
      'Champions League',
      'World Cup',
      'Premier League',
      'Manager Mode',
    ])
  })

  it('shows Premier League on both Main and Leagues mode tabs', async () => {
    const user = userEvent.setup()
    render(<App />)

    const modeGrid = screen.getByRole('region', { name: /Playable mode choices/i })
    expect(within(modeGrid).getByRole('button', { name: 'Premier League' })).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: /^Leagues$/i }))
    const leagueModeNames = within(modeGrid).getAllByRole('button').map((button) => button.getAttribute('aria-label'))

    expect(leagueModeNames).toEqual([
      'Premier League',
      'English Top Flight',
      'LaLiga',
      'Serie A',
      'Bundesliga',
      'Ligue 1',
      'MLS',
    ])
  })

  it('keeps fixed team modes visibly locked instead of animating team rerolls', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('tab', { name: /^More$/i }))
    await user.click(screen.getByRole('button', { name: /^One-Club XI$/i }))
    await user.click(screen.getByRole('button', { name: /Start Draft/i }))

    expect(await screen.findByText('BAR', {}, draftLoadWait)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^Spin$/i }))
    await screen.findAllByRole('button', { name: /Choose player/i })

    expect(screen.getByText('BAR')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Team$/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Era$/i })).toBeInTheDocument()
  })

  it('keeps fixed era modes visibly locked instead of animating era rerolls', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('tab', { name: /^More$/i }))
    await user.click(screen.getByRole('button', { name: /^Era Lock$/i }))
    await user.click(screen.getByRole('button', { name: /Start Draft/i }))

    expect(await screen.findByText('2010s', {}, draftLoadWait)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^Spin$/i }))
    await screen.findAllByRole('button', { name: /Choose player/i })

    expect(screen.getByText('2010s')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Team$/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Era$/i })).not.toBeInTheDocument()
  })

  it('shows first-load rules and can dismiss them permanently', async () => {
    localStorage.removeItem('undefeatedxi.rules.dismissed')
    localStorage.removeItem('38-0-0.rules.dismissed')
    localStorage.removeItem('invinciblexi.rules.dismissed')
    const user = userEvent.setup()
    render(<App />)

    const dialog = screen.getByRole('dialog', { name: /How to Play UndefeatedXI/i })
    expect(dialog).toBeInTheDocument()
    expect(within(dialog).getByText(/Can your XI go undefeated/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Don't Show Again/i }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(localStorage.getItem('undefeatedxi.rules.dismissed')).toBe('true')
  })

  it('opens informational pages from hash routes', () => {
    window.location.hash = '#/how'

    render(<App />)

    expect(screen.getByRole('heading', { level: 1, name: 'How to Play' })).toBeInTheDocument()
  })

  it('opens clean public routes with route-specific SEO metadata', () => {
    window.history.replaceState(null, '', '/82-0-soccer-game')

    render(<App />)

    expect(screen.getByRole('heading', { level: 1, name: /Official Soccer and Football Version of 82-0/i })).toBeInTheDocument()
    expect(screen.getByText(/Is there a soccer version of 82-0\?/i)).toBeInTheDocument()
    expect(document.title).toBe('UndefeatedXI | Official Soccer Version of the 82-0 Game')
    expect(metaContent('meta[name="description"]')).toBe('Play UndefeatedXI, the official soccer and football version of 82-0. Draft legends, build a perfect XI, and chase 38-0-0 across football history.')
    expect(document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href).toBe('https://www.undefeatedxi.com/82-0-soccer-game')
    expect(metaContent('meta[property="og:image"]')).toBe('https://www.undefeatedxi.com/og-image.png')
    expect(metaContent('meta[name="twitter:url"]')).toBe('https://www.undefeatedxi.com/82-0-soccer-game')
    expect(document.getElementById('structured-data-faq')?.textContent).toContain('FAQPage')
    expect(document.getElementById('structured-data-breadcrumb')?.textContent).toContain('BreadcrumbList')
  })

  it('opens the football landing page with unique metadata', () => {
    window.history.replaceState(null, '', '/82-0-football-game')

    render(<App />)

    expect(screen.getByRole('heading', { level: 1, name: /Official Football Version of 82-0/i })).toBeInTheDocument()
    expect(document.title).toBe('UndefeatedXI | Official Football Version of the 82-0 Game')
    expect(metaContent('meta[name="description"]')).toBe('Play UndefeatedXI, the official football version of 82-0. Build a perfect XI, draft legends, and chase unbeaten league and tournament runs.')
    expect(document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href).toBe('https://www.undefeatedxi.com/82-0-football-game')
  })

  it('opens clean shared result routes without a hash URL', async () => {
    window.history.replaceState(null, '', '/r/testshare123')

    render(<App />)

    expect(document.title).toBe('Shared UndefeatedXI Result | Football Draft Simulator')
    expect(document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href).toBe('https://www.undefeatedxi.com/leaderboard')
    expect(await screen.findByText(/That shared run could not be found|Supabase is not configured/i)).toBeInTheDocument()
  })

  it('uses homepage SEO copy and links to the soccer landing page', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(screen.getByRole('heading', { level: 1, name: /UndefeatedXI/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /UndefeatedXI: The Official Soccer Version of 82-0/i })).toBeInTheDocument()
    expect(screen.getByText(/football version of the viral 82-0 game/i)).toBeInTheDocument()
    expect(document.title).toBe('UndefeatedXI | Football Draft Simulator and 82-0 Soccer Game')
    expect(metaContent('meta[name="description"]')).toContain('free soccer and football draft simulator')

    await user.click(screen.getAllByRole('link', { name: /82-0 Soccer Game/i })[0])
    expect(window.location.pathname).toBe('/82-0-soccer-game')
    expect(screen.getByRole('heading', { level: 1, name: /Official Soccer and Football Version of 82-0/i })).toBeInTheDocument()
  })

  it('shows and validates the feedback form', async () => {
    const user = userEvent.setup()
    window.location.hash = '#/contact'
    render(<App />)

    expect(screen.getByRole('heading', { level: 1, name: 'Feedback' })).toBeInTheDocument()
    await user.selectOptions(screen.getByLabelText('Category'), 'player_data')
    await user.type(screen.getByLabelText('Feedback'), 'Messi should have a better classic Barcelona card.')
    await user.click(screen.getByRole('button', { name: /Send Feedback/i }))

    expect(await screen.findByRole('status')).toHaveTextContent('Feedback is not configured on this local build.')
  })

  it('shows one URL-backed leaderboard selector instead of duplicated mode boards', async () => {
    const user = userEvent.setup()
    window.history.replaceState(null, '', '/leaderboard?mode=premier-league')

    render(<App />)

    expect(screen.getByRole('heading', { level: 1, name: 'Leaderboard' })).toBeInTheDocument()
    expect(screen.queryByText('Mode Leaderboards')).not.toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: /This Mode/i })).not.toBeInTheDocument()

    const selector = screen.getByLabelText('Choose leaderboard') as HTMLSelectElement
    expect(selector.value).toBe('premier_league')
    expect(screen.getByRole('heading', { level: 2, name: 'Premier League' })).toBeInTheDocument()
    expect(await screen.findByRole('status')).toHaveTextContent('Leaderboard needs Supabase env vars.')

    await user.selectOptions(selector, 'global')
    expect(window.location.pathname).toBe('/leaderboard')
    expect(window.location.search).toBe('')
    expect(screen.getByRole('heading', { level: 2, name: 'Global / All Modes' })).toBeInTheDocument()

    await user.selectOptions(selector, 'world_xi')
    expect(window.location.pathname).toBe('/leaderboard')
    expect(window.location.search).toBe('?mode=world-xi')
    expect(screen.getByRole('heading', { level: 2, name: 'World XI' })).toBeInTheDocument()
  })

  it('falls back invalid leaderboard mode query params to global', () => {
    window.history.replaceState(null, '', '/leaderboard?mode=not-real')

    render(<App />)

    expect((screen.getByLabelText('Choose leaderboard') as HTMLSelectElement).value).toBe('global')
    expect(screen.getByRole('heading', { level: 2, name: 'Global / All Modes' })).toBeInTheDocument()
  })

  it('updates hash routes when choosing modes', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /^World XI$/i }))
    expect(window.location.hash).toBe('#/setup/world_xi')

    const setupHeading = screen.getByRole('heading', { level: 1, name: 'Choose the run.' }).closest('section')
    if (!setupHeading) throw new Error('Missing setup heading')
    await user.click(within(setupHeading).getByRole('button', { name: /Go to UndefeatedXI home/i }))
    expect(window.location.pathname).toBe('/')
    expect(window.location.hash).toBe('')

    await user.click(screen.getByRole('button', { name: /^World XI$/i }))
    await user.click(screen.getByRole('button', { name: /Ball Knowledge/i }))
    expect(window.location.hash).toBe('#/setup/ball_knowledge')
  })

  it('shows Ball Knowledge mode with hidden stats', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /^Ball Knowledge$/i }))
    await user.click(screen.getByRole('button', { name: /Start Draft/i }))
    await findDraftRound(1)
    await user.click(screen.getByRole('button', { name: /Spin/i }))

    const teamReroll = await screen.findByRole('button', { name: /^Team$/i })
    const eraReroll = screen.getByRole('button', { name: /^Era$/i })
    expect(teamReroll).toBeEnabled()
    expect(eraReroll).toBeEnabled()
    await user.click(teamReroll)
    expect(await screen.findByRole('button', { name: /^Team$/i })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: /^Era$/i }))
    expect(await screen.findByRole('button', { name: /^Era$/i })).toBeDisabled()
    expect(screen.queryByLabelText('Sort players')).not.toBeInTheDocument()
    expect((await screen.findAllByText(/Stats hidden/i)).length).toBeGreaterThan(0)
  })

  it('plays the core draft flow through result actions', async () => {
    const user = userEvent.setup()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })
    render(<App />)

    await user.click(screen.getByRole('button', { name: /^World XI$/i }))
    await user.click(screen.getByRole('button', { name: /Start Draft/i }))
    await completeWorldXiDraft(user)

    expect(await screen.findByRole('button', { name: /Share/i })).toBeInTheDocument()
    expect(screen.getByText(/New personal best for this mode/i)).toBeInTheDocument()
    expect(screen.getByText(/Strongest unit/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Weakest unit/i).length).toBeGreaterThan(0)
    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem('undefeatedxi.preferences') ?? '{}') as { recentRuns?: unknown[] }
      expect(stored.recentRuns?.length).toBeGreaterThan(0)
    })

    await user.click(screen.getByRole('button', { name: /Share/i }))
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('#/r/local/'))
    expect(await screen.findByRole('button', { name: /Link copied/i })).toBeInTheDocument()
    const copiedUrl = String(writeText.mock.calls[0][0])
    expect(copiedUrl.length).toBeLessThan(12000)

    await user.click(screen.getByRole('button', { name: /Build Another/i }))
    expect(screen.getByText(/Round 1\/11/i)).toBeInTheDocument()
    expect(window.location.hash).toBe('#/draft')

    await user.click(screen.getByRole('button', { name: /Change Mode/i }))
    expect(screen.getByRole('heading', { level: 1, name: 'Choose the run.' })).toBeInTheDocument()
    expect(window.location.hash).toBe('#/setup/world_xi')

    window.location.hash = copiedUrl.slice(copiedUrl.indexOf('#'))
    expect(await screen.findByText(/Shared record/i)).toBeInTheDocument()
  })

  it('opens the menu and toggles the theme controls', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /Switch to dark mode/i }))
    expect(localStorage.getItem('undefeatedxi.theme')).toBe('dark')
    expect(screen.getByRole('button', { name: /Switch to light mode/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Sign in/i }))
    expect(screen.getByRole('dialog', { name: /Sign in/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Continue with Google/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Continue as Guest/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Continue as Guest/i }))
    expect(await screen.findByRole('status')).toHaveTextContent('Accounts are not configured on this local build.')
    await user.click(screen.getByRole('button', { name: /Close sign in/i }))

    await user.click(screen.getByRole('button', { name: /Open menu/i }))
    const sideMenu = screen.getByRole('complementary', { name: /Site menu/i })
    expect(sideMenu).toBeInTheDocument()
    await user.click(within(sideMenu).getByRole('button', { name: /Privacy Policy/i }))
    expect(window.location.pathname).toBe('/privacy')
  })

  it('loads saved recent runs from localStorage', () => {
    localStorage.setItem('invinciblexi.preferences', JSON.stringify({
      modeId: 'world_xi',
      formationId: '4-3-3',
      bestRecords: {},
      recentRuns: [
        {
          runId: 'IXI-SAVED',
          modeId: 'world_xi',
          modeName: 'World XI',
          formationId: '4-3-3',
          record: { wins: 38, draws: 0, losses: 0 },
          grade: 'SS',
          gradeLabel: 'Perfect season',
          trophyResult: 'League champion',
          perfectionResult: 'Perfect',
          points: 114,
          goalsFor: 120,
          goalsAgainst: 12,
          xgFor: 100.4,
          xgAgainst: 20.1,
          bestPlayer: 'Lionel Messi',
          score: 9999,
          createdAt: '2026-06-08T00:00:00.000Z',
        },
      ],
    }))

    render(<App />)

    const recentRuns = screen.getByLabelText('Recent saved runs')
    expect(within(recentRuns).getByText('Recent Runs')).toBeInTheDocument()
    expect(within(recentRuns).getByText(/38-0-0/)).toBeInTheDocument()
    expect(within(recentRuns).getByText(/Lionel Messi/)).toBeInTheDocument()
  })
})

describe('SEO public files', () => {
  it('allows search and AI crawlers without noindexing public pages', () => {
    const robots = readFileSync(join(process.cwd(), 'public/robots.txt'), 'utf8')

    expect(robots).toContain('User-agent: Googlebot')
    expect(robots).toContain('User-agent: OAI-SearchBot')
    expect(robots).toContain('User-agent: GPTBot')
    expect(robots).toContain('Sitemap: https://www.undefeatedxi.com/sitemap.xml')
    expect(robots.toLowerCase()).not.toContain('noindex')
  })

  it('lists canonical public URLs in the sitemap', () => {
    const sitemap = readFileSync(join(process.cwd(), 'public/sitemap.xml'), 'utf8')

    for (const path of ['/', '/82-0-soccer-game', '/82-0-football-game', '/how-to-play', '/leaderboard', '/privacy']) {
      expect(sitemap).toContain(`https://www.undefeatedxi.com${path === '/' ? '/' : path}`)
    }
    expect(sitemap).not.toContain('https://undefeatedxi.com')
    expect(sitemap).not.toContain('/contact')
  })
})
