import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'

const draftLoadWait = { timeout: 45000 }

function findDraftRound(round: number) {
  return screen.findByText(new RegExp(`Round ${round}/11`, 'i'), {}, draftLoadWait)
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

  it('updates hash routes when choosing modes', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /^World XI$/i }))
    expect(window.location.hash).toBe('#/setup/world_xi')

    const setupHeading = screen.getByRole('heading', { level: 1, name: 'Choose the run.' }).closest('section')
    if (!setupHeading) throw new Error('Missing setup heading')
    await user.click(within(setupHeading).getByRole('button', { name: /Go to UndefeatedXI home/i }))
    expect(window.location.hash).toBe('#/')

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
    expect(screen.getByText(/Weakest unit/i)).toBeInTheDocument()
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
    expect(screen.getByRole('button', { name: /Continue as Guest/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Continue as Guest/i }))
    expect(await screen.findByRole('status')).toHaveTextContent('Accounts are not configured on this local build.')
    await user.click(screen.getByRole('button', { name: /Close sign in/i }))

    await user.click(screen.getByRole('button', { name: /Open menu/i }))
    const sideMenu = screen.getByRole('complementary', { name: /Site menu/i })
    expect(sideMenu).toBeInTheDocument()
    await user.click(within(sideMenu).getByRole('button', { name: /Privacy Policy/i }))
    expect(window.location.hash).toBe('#/privacy')
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
