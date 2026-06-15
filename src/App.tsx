import {
  Check,
  ChevronDown,
  Clipboard,
  EyeOff,
  Home,
  Info,
  LogOut,
  Menu,
  Moon,
  Play,
  RefreshCw,
  Search,
  Sun,
  Target,
  Trophy,
  User,
  X,
} from 'lucide-react'
import { type CSSProperties, type FormEvent, type MouseEvent, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { brandName, targetRecordLabel } from './brand'
import { defaultFormationId, formations, getFormation } from './data/formations'
import { loadModePlayerContexts } from './data/modeContextLoader'
import { defaultModeId, previewModeConfigs, publicModeConfigs, getModeConfig } from './data/modes'
import coverageReport from './data/generated/coverageReport.json'
import { isBenchSlot } from './data/squad'
import { slotMatchesPlayer } from './engine/eligibility'
import { formatStoredRecord, loadPreferences, recordRun, savePreferences } from './engine/storage'
import { randomPick } from './engine/random'
import {
  createSharedRunSnapshot,
  createShareLink,
  decodeLocalSharedRun,
  fetchSharedRunSnapshot,
  sharedResultTitle,
} from './services/shareLinks'
import { sanitizeDisplayName } from './services/sanitize'
import { hasSupabaseConfig } from './services/supabaseConfig'
import type { AuthProfile, FeedbackCategory, LeaderboardRun } from './services/supabase'
import type { DraftPick, DraftState, ModeConfig, ModeValidation, PlayerContext, Position, RunResult, SharedRunSnapshot, SpecialSelection, TeamRatings, TeamRollOption } from './types'
import type { StoredRunSummary } from './engine/storage'

type Screen = 'home' | 'seoLanding' | 'footballLanding' | 'how' | 'setup' | 'draft' | 'result' | 'sharedResult' | 'privacy' | 'contact' | 'leaderboard' | 'notFound'
type ThemeMode = 'light' | 'dark'
type HomeModeTab = 'main' | 'leagues' | 'more'
type PlayerFilter = 'all' | 'gk' | 'def' | 'mid' | 'att'
type PlayerSort = 'best' | 'atk' | 'mid' | 'def' | 'gk' | 'big'
type RollSpinScope = 'full' | 'team' | 'era'
type LeaderboardStatus = 'idle' | 'submitting' | 'submitted' | 'error'
const spinRevealMs = import.meta.env.MODE === 'test' ? 1 : 3000
const legacyRulesDismissedKey = 'invinciblexi.rules.dismissed'
const legacyRecordRulesDismissedKey = '38-0-0.rules.dismissed'
const rulesDismissedKey = 'undefeatedxi.rules.dismissed'
const legacyThemeKey = 'invinciblexi.theme'
const legacyRecordThemeKey = '38-0-0.theme'
const themeKey = 'undefeatedxi.theme'
const appName = brandName
const logoImageSizes = '(min-width: 900px) 184px, 172px'
const logoImageSrcSet = '/logo-160.avif 160w, /logo-320.avif 320w, /logo-640.avif 640w'
const logoWebpSrcSet = '/logo-160.webp 160w, /logo-320.webp 320w, /logo-640.webp 640w'
const logoPngSrcSet = '/logo-320.png 320w, /logo-640.png 640w'
const siteUrl = 'https://www.undefeatedxi.com'
const socialImageUrl = `${siteUrl}/og-image.png`
const homeSeoDescription = 'Play UndefeatedXI, a free soccer and football draft simulator where you build a perfect XI, chase 38-0-0, and test football history teams across World Cup, Champions League, league, and all-time modes.'
const landingSeoDescription = 'Play UndefeatedXI, the official soccer and football version of the viral 82-0 game. Draft legends, build a perfect XI, and chase 38-0-0 across World Cup, Champions League, Euros, AFCON, and more. Free with no ads.'
const footballLandingSeoDescription = 'Play UndefeatedXI, the official football version of the viral 82-0 game. Build a perfect football XI, draft legends from clubs and nations, and chase unbeaten league and tournament runs for free.'
const faqItems = [
  {
    question: 'Is there a soccer version of 82-0?',
    answer: 'Yes. UndefeatedXI is the official soccer and football version of the viral 82-0 game.',
  },
  {
    question: 'What is the 82-0 football version?',
    answer: 'UndefeatedXI turns the 82-0 concept into a football history draft game where you build an all-time XI and chase perfect seasons and tournaments.',
  },
  {
    question: 'Is UndefeatedXI free?',
    answer: 'Yes. UndefeatedXI is free to play and has no ads.',
  },
  {
    question: 'What modes are in UndefeatedXI?',
    answer: 'UndefeatedXI includes World Cup, Champions League, Euros, AFCON, World XI, Premier League, La Liga, Serie A, Bundesliga, and more.',
  },
  {
    question: 'What is the goal of the game?',
    answer: 'Build the best possible XI and see if your team can go undefeated, chase 38-0-0, or win perfect tournament runs.',
  },
]

const popularPages = [
  { label: '82-0 Soccer Game', screen: 'seoLanding' as const, href: '/82-0-soccer-game' },
  { label: '82-0 Football Game', screen: 'footballLanding' as const, href: '/82-0-football-game' },
  { label: 'Soccer Version of 82-0', screen: 'seoLanding' as const, href: '/82-0-soccer-game' },
  { label: 'Football Version of 82-0', screen: 'footballLanding' as const, href: '/82-0-football-game' },
  { label: 'Football Draft Simulator', screen: 'home' as const, href: '/' },
  { label: 'World Cup Draft Game', screen: 'setup' as const, modeId: 'world_cup', href: '/#/setup/world_cup' },
  { label: 'Champions League Draft Game', screen: 'setup' as const, modeId: 'champions_league', href: '/#/setup/champions_league' },
  { label: 'How to Play', screen: 'how' as const, href: '/how-to-play' },
  { label: 'Leaderboard', screen: 'leaderboard' as const, href: '/leaderboard' },
]
type PopularPage = (typeof popularPages)[number]
type LeaderboardSelection = 'global' | 'mine' | string

function loadSupabaseService() {
  return import('./services/supabase')
}

function popularPageModeId(page: PopularPage): string | undefined {
  return 'modeId' in page ? page.modeId : undefined
}

interface RouteState {
  screen: Screen
  modeId?: string
  shareId?: string
  localSharePayload?: string
}

const mainModeIds = ['world_xi', 'ball_knowledge', 'champions_league', 'world_cup', 'premier_league', 'manager']
const leagueModeIds = ['premier_league', 'english_top_flight', 'laliga', 'serie_a', 'bundesliga', 'ligue_1', 'mls']
const modeValidations = coverageReport.modes as ModeValidation[]

function publicModeIsReady(modeId: string): boolean {
  return modeValidations.find((validation) => validation.modeId === modeId)?.playable ?? false
}

function liveTeamsForMode(mode: ModeConfig): TeamRollOption[] {
  const validation = modeValidations.find((item) => item.modeId === mode.modeId)
  return validation?.playableTeams?.length ? validation.playableTeams : mode.teamPool
}

function isDraftCompleteState(state: DraftState): boolean {
  return state.picks.length >= state.draftSlots.length
}

function normalizeRouteMode(modeId?: string): string | undefined {
  if (!modeId) return undefined
  return getModeConfig(modeId).modeId === modeId ? modeId : undefined
}

function readRoute(): RouteState {
  if (typeof window === 'undefined') return { screen: 'home' }
  const hashParts = window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean)
  const [hashRoute, hashModeId] = hashParts

  if (hashRoute) {
    if (hashRoute === 'how') return { screen: 'how' }
    if (hashRoute === 'privacy') return { screen: 'privacy' }
    if (hashRoute === 'contact') return { screen: 'contact' }
    if (hashRoute === 'leaderboard') return { screen: 'leaderboard' }
    if (hashRoute === '82-0-soccer-game') return { screen: 'seoLanding' }
    if (hashRoute === '82-0-football-game') return { screen: 'footballLanding' }
    if (hashRoute === 'r' && hashModeId === 'local' && hashParts[2]) return { screen: 'sharedResult', localSharePayload: hashParts[2] }
    if (hashRoute === 'r' && hashModeId) return { screen: 'sharedResult', shareId: hashModeId }
    if (hashRoute === 'modes' || hashRoute === 'setup') return { screen: 'setup', modeId: normalizeRouteMode(hashModeId) }
    if (hashRoute === 'draft') return { screen: 'draft' }
    if (hashRoute === 'result') return { screen: 'result' }
    return { screen: 'notFound' }
  }

  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  if (path === '/' || path === '/index.html') return { screen: 'home' }
  if (path === '/82-0-soccer-game') return { screen: 'seoLanding' }
  if (path === '/82-0-football-game') return { screen: 'footballLanding' }
  if (path === '/how-to-play') return { screen: 'how' }
  if (path === '/privacy') return { screen: 'privacy' }
  if (path === '/contact') return { screen: 'contact' }
  if (path === '/leaderboard') return { screen: 'leaderboard' }
  return { screen: 'notFound' }
}

function routeFor(screen: Screen, modeId?: string): string {
  if (screen === 'home') return '/'
  if (screen === 'seoLanding') return '/82-0-soccer-game'
  if (screen === 'footballLanding') return '/82-0-football-game'
  if (screen === 'how') return '/how-to-play'
  if (screen === 'privacy') return '/privacy'
  if (screen === 'contact') return '/contact'
  if (screen === 'leaderboard') return '/leaderboard'
  if (screen === 'setup') return `/#/setup/${modeId ?? defaultModeId}`
  if (screen === 'sharedResult') return modeId ? `/#/r/${modeId}` : '/leaderboard'
  if (screen === 'draft') return '/#/draft'
  if (screen === 'result') return '/#/result'
  return '/404'
}

function canonicalFor(screen: Screen): string {
  if (screen === 'seoLanding') return `${siteUrl}/82-0-soccer-game`
  if (screen === 'footballLanding') return `${siteUrl}/82-0-football-game`
  if (screen === 'how') return `${siteUrl}/how-to-play`
  if (screen === 'leaderboard') return `${siteUrl}/leaderboard`
  if (screen === 'privacy') return `${siteUrl}/privacy`
  if (screen === 'contact') return `${siteUrl}/contact`
  return `${siteUrl}/`
}

function titleFor(screen: Screen): string {
  if (screen === 'seoLanding') return 'UndefeatedXI | Official Soccer Version of the 82-0 Game'
  if (screen === 'footballLanding') return 'UndefeatedXI | Official Football Version of the 82-0 Game'
  if (screen === 'how') return 'How to Play UndefeatedXI | Football Draft Simulator'
  if (screen === 'leaderboard') return 'UndefeatedXI Leaderboard | Perfect Season Football Drafts'
  if (screen === 'sharedResult') return 'Shared UndefeatedXI Result | Football Draft Simulator'
  if (screen === 'privacy') return 'Privacy Policy | UndefeatedXI'
  if (screen === 'contact') return 'Contact and Feedback | UndefeatedXI'
  if (screen === 'notFound') return 'Page Not Found | UndefeatedXI'
  return 'UndefeatedXI | Football Draft Simulator and 82-0 Soccer Game'
}

function descriptionFor(screen: Screen): string {
  if (screen === 'seoLanding') return landingSeoDescription
  if (screen === 'footballLanding') return footballLandingSeoDescription
  if (screen === 'how') return 'Learn how to play UndefeatedXI, the soccer and football version of the 82-0 perfect-record idea. Draft legends, place them in an XI, and chase unbeaten runs.'
  if (screen === 'leaderboard') return 'View UndefeatedXI leaderboards for perfect football draft runs, including global records, mode leaderboards, and shareable unbeaten results.'
  if (screen === 'sharedResult') return 'Open a shared UndefeatedXI football draft result with the final XI, record, rating breakdown, key matches, and simulation summary.'
  if (screen === 'privacy') return 'Read the UndefeatedXI privacy policy for this football draft simulator, including local saves, optional accounts, leaderboard runs, and feedback handling.'
  if (screen === 'contact') return 'Contact UndefeatedXI or send feedback about player data, bugs, modes, leaderboards, and shareable football draft results.'
  if (screen === 'notFound') return 'The requested UndefeatedXI page could not be found.'
  return homeSeoDescription
}

function gameSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: appName,
    url: `${siteUrl}/`,
    description: homeSeoDescription,
    applicationCategory: 'Game',
    operatingSystem: 'Web',
    genre: ['Sports', 'Football', 'Soccer', 'Draft Simulator'],
    isAccessibleForFree: true,
    sameAs: 'https://82-0.com/',
  }
}

function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: appName,
    url: `${siteUrl}/`,
    description: homeSeoDescription,
  }
}

function faqSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

function breadcrumbSchema(screen: Screen) {
  const name = screen === 'footballLanding'
    ? '82-0 Football Game'
    : screen === 'seoLanding'
      ? '82-0 Soccer Game'
      : screen === 'how'
        ? 'How to Play'
        : screen === 'leaderboard'
          ? 'Leaderboard'
          : screen === 'privacy'
            ? 'Privacy Policy'
            : ''
  if (!name) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'UndefeatedXI', item: `${siteUrl}/` },
      { '@type': 'ListItem', position: 2, name, item: canonicalFor(screen) },
    ],
  }
}

function setMeta(name: string, content: string, attribute: 'name' | 'property' = 'name') {
  let meta = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${name}"]`)
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute(attribute, name)
    document.head.appendChild(meta)
  }
  meta.content = content
}

function setCanonical(href: string) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'canonical'
    document.head.appendChild(link)
  }
  link.href = href
}

function setJsonLd(id: string, schema: object | null) {
  const existing = document.getElementById(id)
  if (!schema) {
    existing?.remove()
    return
  }

  const script = existing instanceof HTMLScriptElement ? existing : document.createElement('script')
  script.id = id
  script.type = 'application/ld+json'
  script.textContent = JSON.stringify(schema)
  if (!existing) document.head.appendChild(script)
}

function useRouteSeo(screen: Screen) {
  useEffect(() => {
    const title = titleFor(screen)
    const description = descriptionFor(screen)
    const canonical = canonicalFor(screen)

    document.title = title
    setMeta('description', description)
    setCanonical(canonical)
    setMeta('og:title', title, 'property')
    setMeta('og:description', description, 'property')
    setMeta('og:type', 'website', 'property')
    setMeta('og:site_name', appName, 'property')
    setMeta('og:url', canonical, 'property')
    setMeta('og:image', socialImageUrl, 'property')
    setMeta('og:image:width', '1264', 'property')
    setMeta('og:image:height', '843', 'property')
    setMeta('og:image:alt', 'UndefeatedXI soccer draft simulator logo', 'property')
    setMeta('twitter:card', 'summary_large_image')
    setMeta('twitter:title', title)
    setMeta('twitter:description', description)
    setMeta('twitter:image', socialImageUrl)
    setMeta('twitter:image:alt', 'UndefeatedXI football history draft game logo')
    setJsonLd('structured-data-game', gameSchema())
    setJsonLd('structured-data-website', websiteSchema())
    setJsonLd('structured-data-faq', screen === 'seoLanding' || screen === 'footballLanding' ? faqSchema() : null)
    setJsonLd('structured-data-breadcrumb', breadcrumbSchema(screen))
  }, [screen])
}

function defaultSpecialSelection(mode: ModeConfig, teams = liveTeamsForMode(mode)): SpecialSelection {
  if (mode.specialSetup === 'fixed_club' || mode.specialSetup === 'fixed_nation') {
    return { fixedTeam: teams[0] ?? mode.teamPool[0] }
  }

  if (mode.specialSetup === 'fixed_era') {
    return { fixedEra: mode.eraPool.includes('2010s') ? '2010s' : mode.eraPool[0] }
  }

  return {}
}

function normalizeSpecialSelection(mode: ModeConfig, selection: SpecialSelection, teams = liveTeamsForMode(mode)): SpecialSelection {
  if (mode.specialSetup === 'fixed_club' || mode.specialSetup === 'fixed_nation') {
    const matchingLiveTeam = teams.find((team) => team.label === selection.fixedTeam?.label && team.teamType === selection.fixedTeam?.teamType)
    return { fixedTeam: matchingLiveTeam ?? teams[0] ?? mode.teamPool[0] }
  }

  if (mode.specialSetup === 'fixed_era') {
    return { fixedEra: selection.fixedEra ?? (mode.eraPool.includes('2010s') ? '2010s' : mode.eraPool[0]) }
  }

  return {}
}

function App() {
  const [storedPreferences] = useState(() => (typeof window !== 'undefined' ? loadPreferences() : {}))
  const [initialRoute] = useState(readRoute)
  const [screen, setScreen] = useState<Screen>(initialRoute.screen)
  const [routeState, setRouteState] = useState<RouteState>(initialRoute)
  const [selectedModeId, setSelectedModeId] = useState(initialRoute.modeId ?? storedPreferences.modeId ?? defaultModeId)
  const [selectedFormationId, setSelectedFormationId] = useState(storedPreferences.formationId ?? defaultFormationId)
  const [specialSelection, setSpecialSelection] = useState<SpecialSelection>(() => defaultSpecialSelection(getModeConfig(initialRoute.modeId ?? storedPreferences.modeId ?? defaultModeId)))
  const [draftState, setDraftState] = useState<DraftState | null>(null)
  const [result, setResult] = useState<RunResult | null>(null)
  const [bestRecords, setBestRecords] = useState(() => storedPreferences.bestRecords ?? {})
  const [recentRuns, setRecentRuns] = useState(() => storedPreferences.recentRuns ?? [])
  const [copied, setCopied] = useState(false)
  const [shareMessage, setShareMessage] = useState('')
  const [shareFallbackValue, setShareFallbackValue] = useState('')
  const [sharedSnapshot, setSharedSnapshot] = useState<SharedRunSnapshot | null>(null)
  const [sharedError, setSharedError] = useState('')
  const [isSpinning, setIsSpinning] = useState(false)
  const [spinningRoll, setSpinningRoll] = useState<{ team: string; era: string } | null>(null)
  const [showRules, setShowRules] = useState(() => (
    typeof window === 'undefined'
      ? false
      : localStorage.getItem(rulesDismissedKey) !== 'true' && localStorage.getItem(legacyRecordRulesDismissedKey) !== 'true' && localStorage.getItem(legacyRulesDismissedKey) !== 'true'
  ))
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'light'
    const savedTheme = localStorage.getItem(themeKey) ?? localStorage.getItem(legacyRecordThemeKey) ?? localStorage.getItem(legacyThemeKey)
    return savedTheme === 'dark' ? 'dark' : 'light'
  })
  const [menuOpen, setMenuOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [authProfile, setAuthProfile] = useState<AuthProfile | null>(null)
  const [leaderboardStatus, setLeaderboardStatus] = useState<LeaderboardStatus>('idle')
  const [leaderboardMessage, setLeaderboardMessage] = useState('')
  const [isDraftLoading, setIsDraftLoading] = useState(false)
  const draftEngineRef = useRef<Promise<typeof import('./engine/draft')> | null>(null)
  const modePlayerContextRef = useRef(new Map<string, Promise<PlayerContext[]>>())
  const spinIntervalRef = useRef<number | undefined>(undefined)
  const spinTimeoutRef = useRef<number | undefined>(undefined)

  const selectedMode = getModeConfig(selectedModeId)
  const selectedFormation = getFormation(selectedFormationId)
  const selectedLiveTeams = liveTeamsForMode(selectedMode)
  const activeSpecialSelection = normalizeSpecialSelection(selectedMode, specialSelection, selectedLiveTeams)
  const validationsByMode = useMemo(() => new Map(modeValidations.map((validation) => [validation.modeId, validation])), [])

  const navigate = (nextScreen: Screen, routeModeId = selectedModeId) => {
    setScreen(nextScreen)
    setRouteState({ screen: nextScreen, modeId: routeModeId })
    if (typeof window === 'undefined') return
    const nextRoute = routeFor(nextScreen, routeModeId)
    const nextUrl = new URL(nextRoute, window.location.origin)
    if (window.location.pathname !== nextUrl.pathname || window.location.hash !== nextUrl.hash) {
      window.history.pushState(null, '', nextRoute)
    }
  }

  const clearSpinTimers = () => {
    if (spinIntervalRef.current) window.clearInterval(spinIntervalRef.current)
    if (spinTimeoutRef.current) window.clearTimeout(spinTimeoutRef.current)
    spinIntervalRef.current = undefined
    spinTimeoutRef.current = undefined
  }

  const loadDraftEngine = () => {
    draftEngineRef.current ??= import('./engine/draft').catch((error) => {
      draftEngineRef.current = null
      throw error
    })
    return draftEngineRef.current
  }

  const loadDraftRuntime = async (modeId = selectedModeId) => {
    const contextsPromise = modePlayerContextRef.current.get(modeId) ?? loadModePlayerContexts(modeId)
    modePlayerContextRef.current.set(modeId, contextsPromise)
    const [engine, contexts] = await Promise.all([loadDraftEngine(), contextsPromise])
    engine.configureDraftPlayerContexts(contexts)
    return engine
  }

  const preloadDraftEngine = (modeId = selectedModeId) => {
    void loadDraftRuntime(modeId).catch(() => undefined)
  }

  const randomSpinRoll = (mode: ModeConfig, scope: RollSpinScope, currentRoll?: DraftState['currentRoll'], specialSelection?: SpecialSelection, teams = liveTeamsForMode(mode)) => ({
    team:
      specialSelection?.fixedTeam?.label
        ?? (scope === 'era' && currentRoll
          ? currentRoll.team.label
          : randomPick(teams)?.label ?? '...'),
    era:
      specialSelection?.fixedEra
        ?? (scope === 'team' && currentRoll
          ? currentRoll.era
          : randomPick(mode.eraPool) ?? '...'),
  })

  const animateSpin = (mode: ModeConfig, reveal: () => DraftState | Promise<DraftState>, scope: RollSpinScope = 'full', currentRoll?: DraftState['currentRoll'], specialSelection?: SpecialSelection) => {
    clearSpinTimers()
    const teams = liveTeamsForMode(mode)
    setIsSpinning(true)
    setSpinningRoll(randomSpinRoll(mode, scope, currentRoll, specialSelection, teams))

    spinIntervalRef.current = window.setInterval(() => {
      setSpinningRoll(randomSpinRoll(mode, scope, currentRoll, specialSelection, teams))
    }, 78)

    spinTimeoutRef.current = window.setTimeout(() => {
      clearSpinTimers()
      Promise.resolve(reveal())
        .then((nextState) => {
          setDraftState(nextState)
          setSpinningRoll(nextState.currentRoll ? { team: nextState.currentRoll.team.label, era: nextState.currentRoll.era } : null)
          setIsSpinning(false)
          window.setTimeout(() => setSpinningRoll(null), 420)
        })
        .catch(() => {
          setSpinningRoll(null)
          setIsSpinning(false)
        })
    }, spinRevealMs)
  }

  useEffect(() => {
    const syncRoute = () => {
      const route = readRoute()
      if (route.modeId) {
        setSelectedModeId(route.modeId)
        setSpecialSelection(defaultSpecialSelection(getModeConfig(route.modeId)))
      }
      setRouteState(route)
      setScreen(route.screen)
    }

    window.addEventListener('hashchange', syncRoute)
    window.addEventListener('popstate', syncRoute)
    return () => {
      window.removeEventListener('hashchange', syncRoute)
      window.removeEventListener('popstate', syncRoute)
    }
  }, [])

  useEffect(() => {
    savePreferences({
      modeId: selectedModeId,
      formationId: selectedFormationId,
      bestRecords,
      recentRuns,
    })
  }, [bestRecords, recentRuns, selectedFormationId, selectedModeId])

  useEffect(() => {
    localStorage.setItem(themeKey, theme)
    localStorage.removeItem(legacyRecordThemeKey)
    localStorage.removeItem(legacyThemeKey)
    document.documentElement.dataset.theme = theme
    const themeColor = theme === 'dark' ? '#08110c' : '#eef5ea'
    let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'theme-color'
      document.head.appendChild(meta)
    }
    meta.content = themeColor
  }, [theme])

  useEffect(() => {
    if (routeState.screen !== 'sharedResult') return
    let mounted = true

    async function loadSharedSnapshot() {
      if (routeState.localSharePayload) {
        const snapshot = decodeLocalSharedRun(routeState.localSharePayload)
        return snapshot
          ? { snapshot, error: '' }
          : { snapshot: null, error: 'That shared result link is malformed or too large.' }
      }

      if (!routeState.shareId) {
        return { snapshot: null, error: 'Missing shared result id.' }
      }

      try {
        const snapshot = await fetchSharedRunSnapshot(routeState.shareId)
        return {
          snapshot,
          error: snapshot ? '' : hasSupabaseConfig ? 'That shared run could not be found.' : 'Supabase is not configured on this build.',
        }
      } catch {
        return { snapshot: null, error: 'That shared run could not be loaded.' }
      }
    }

    loadSharedSnapshot()
      .then(({ snapshot, error }) => {
        if (!mounted) return
        setSharedSnapshot(snapshot)
        setSharedError(error)
      })

    return () => {
      mounted = false
    }
  }, [routeState])

  useEffect(() => () => clearSpinTimers(), [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().includes('jsdom')) return
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [screen, routeState.modeId, routeState.shareId, routeState.localSharePayload])

  const openSetup = (modeId = selectedModeId) => {
    clearSpinTimers()
    setIsSpinning(false)
    setSpinningRoll(null)
    setSelectedModeId(modeId)
    setSpecialSelection(defaultSpecialSelection(getModeConfig(modeId)))
    setDraftState(null)
    setResult(null)
    navigate('setup', modeId)
    preloadDraftEngine(modeId)
  }

  const startDraft = async () => {
    if (isDraftLoading) return
    clearSpinTimers()
    setIsSpinning(false)
    setSpinningRoll(null)
    setIsDraftLoading(true)
    try {
      const { createDraftState } = await loadDraftRuntime(selectedMode.modeId)
      const state = createDraftState(selectedMode, selectedFormation.formationId, activeSpecialSelection)
      setDraftState(state)
      setResult(null)
      setShareMessage('')
      setShareFallbackValue('')
      setLeaderboardStatus('idle')
      setLeaderboardMessage('')
      navigate('draft')
    } finally {
      setIsDraftLoading(false)
    }
  }

  const handleSpin = () => {
    if (!draftState || isSpinning || draftState.currentRoll) return
    animateSpin(selectedMode, async () => {
      const { spinForSlot } = await loadDraftRuntime(selectedMode.modeId)
      return spinForSlot(selectedMode, draftState)
    }, 'full', draftState.currentRoll, draftState.specialSelection)
  }

  const handleReroll = (type: 'team' | 'era' | 'full') => {
    if (!draftState || isSpinning) return
    if (type === 'team' && draftState.specialSelection?.fixedTeam) return
    if (type === 'era' && draftState.specialSelection?.fixedEra) return
    animateSpin(selectedMode, async () => {
      const { reroll } = await loadDraftRuntime(selectedMode.modeId)
      return reroll(selectedMode, draftState, type)
    }, type, draftState.currentRoll, draftState.specialSelection)
  }

  const handleSelect = async (player: PlayerContext, slotId?: string) => {
    if (!draftState || isSpinning) return
    const { isDraftComplete, selectPlayerForSlot } = await loadDraftRuntime(selectedMode.modeId)
    const nextState = selectPlayerForSlot(draftState, player, slotId)

    if (isDraftComplete(nextState)) {
      const { simulateRun } = await import('./engine/simulation')
      const nextResult = simulateRun(nextState.picks, selectedMode.modeId, nextState.seed)
      const nextPreferences = recordRun(
        {
          modeId: selectedModeId,
          formationId: selectedFormationId,
          bestRecords,
          recentRuns,
        },
        nextResult,
        selectedFormation.formationId,
      )
      setBestRecords(nextPreferences.bestRecords)
      setRecentRuns(nextPreferences.recentRuns)
      setDraftState(nextState)
      setResult(nextResult)
      setShareMessage('')
      setShareFallbackValue('')
      setLeaderboardStatus('idle')
      setLeaderboardMessage('')
      navigate('result')
      return
    }

    setDraftState(nextState)
  }

  const shareResult = async () => {
    if (!result || !draftState) return
    const snapshot = createSharedRunSnapshot(result, selectedFormation.formationId, draftState.picks)
    const share = await createShareLink(snapshot, result.shareText)
    const clipboardValue = share.url ?? share.text
    const copiedMessage = share.source === 'supabase' ? 'Public result link copied.' : share.source === 'local-url' ? 'Local result link copied.' : 'Share text copied.'
    const sharedMessage = share.source === 'supabase' ? 'Public result link shared.' : share.source === 'local-url' ? 'Local result link shared.' : 'Result shared.'
    setShareFallbackValue('')

    try {
      await navigator.clipboard.writeText(clipboardValue)
      setCopied(true)
      setShareMessage(copiedMessage)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      try {
        if (!share.url || typeof navigator.share !== 'function') throw new Error('Native share unavailable.')
        await navigator.share({
          title: sharedResultTitle(snapshot),
          text: result.shareText,
          url: share.url,
        })
        setCopied(true)
        setShareMessage(sharedMessage)
        window.setTimeout(() => setCopied(false), 1600)
      } catch {
        try {
          await navigator.clipboard.writeText(share.text)
          setCopied(true)
          setShareMessage('Share text copied.')
          window.setTimeout(() => setCopied(false), 1600)
        } catch {
          setCopied(false)
          setShareFallbackValue(clipboardValue)
          setShareMessage('Copy this share link manually.')
        }
      }
    }
  }

  const closeRules = (neverShowAgain = false) => {
    if (neverShowAgain) {
      localStorage.setItem(rulesDismissedKey, 'true')
      localStorage.removeItem(legacyRecordRulesDismissedKey)
      localStorage.removeItem(legacyRulesDismissedKey)
    }
    setShowRules(false)
  }

  const goToPage = (nextScreen: Screen) => {
    setMenuOpen(false)
    navigate(nextScreen)
  }

  const submitCurrentRun = async () => {
    if (!result || !draftState) return
    if (!authProfile) {
      setLeaderboardStatus('error')
      setLeaderboardMessage('Sign in to submit a leaderboard run.')
      setAuthOpen(true)
      return
    }

    setLeaderboardStatus('submitting')
    setLeaderboardMessage('')
    try {
      const { createLeaderboardSubmission, submitLeaderboardRun } = await loadSupabaseService()
      await submitLeaderboardRun(createLeaderboardSubmission(result, selectedFormation.formationId, draftState.picks))
      setLeaderboardStatus('submitted')
      setLeaderboardMessage('Run submitted to the leaderboard.')
    } catch (error) {
      setLeaderboardStatus('error')
      setLeaderboardMessage(error instanceof Error ? error.message : 'Could not submit this run.')
    }
  }

  const activeScreen =
    screen === 'draft' && !draftState
      ? 'setup'
      : screen === 'result' && (!draftState || !result)
        ? 'home'
        : screen
  useRouteSeo(activeScreen)

  return (
    <div className={['app-shell', `theme-${theme}`, showRules ? 'rules-active' : ''].filter(Boolean).join(' ')}>
      <Header
        theme={theme}
        onHome={() => navigate('home')}
        authProfile={authProfile}
        onSignIn={() => setAuthOpen(true)}
        onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
        onMenu={() => setMenuOpen(true)}
      />

      {activeScreen === 'home' && (
        <HomePage
          recentRuns={recentRuns}
          onMode={openSetup}
          onHome={() => navigate('home')}
          onSeoLanding={() => navigate('seoLanding')}
          onFootballLanding={() => navigate('footballLanding')}
          onNavigate={(page) => {
            const modeId = popularPageModeId(page)
            if (modeId) openSetup(modeId)
            else navigate(page.screen)
          }}
        />
      )}
      {activeScreen === 'seoLanding' && (
        <SeoLandingPage
          variant="soccer"
          onPlay={() => navigate('home')}
          onNavigate={(page) => {
            const modeId = popularPageModeId(page)
            if (modeId) openSetup(modeId)
            else navigate(page.screen)
          }}
        />
      )}
      {activeScreen === 'footballLanding' && (
        <SeoLandingPage
          variant="football"
          onPlay={() => navigate('home')}
          onNavigate={(page) => {
            const modeId = popularPageModeId(page)
            if (modeId) openSetup(modeId)
            else navigate(page.screen)
          }}
        />
      )}
      {activeScreen === 'how' && <HowToPlay onBack={() => navigate('home')} />}
      {activeScreen === 'privacy' && <PrivacyPage onBack={() => navigate('home')} />}
      {activeScreen === 'contact' && <ContactPage onBack={() => navigate('home')} />}
      {activeScreen === 'leaderboard' && (
        <LeaderboardScreen
          authProfile={authProfile}
          onBack={() => navigate('home')}
          onSignIn={() => setAuthOpen(true)}
        />
      )}
      {activeScreen === 'sharedResult' && (
        <SharedResultScreen
          snapshot={sharedSnapshot}
          error={sharedError}
          onHome={() => navigate('home')}
        />
      )}
      {activeScreen === 'setup' && (
        <SetupScreen
          selectedMode={selectedMode}
          selectedModeId={selectedModeId}
          selectedFormationId={selectedFormationId}
          specialSelection={activeSpecialSelection}
          liveTeams={selectedLiveTeams}
          validationsByMode={validationsByMode}
          onMode={(modeId) => {
            setSelectedModeId(modeId)
            setSpecialSelection(defaultSpecialSelection(getModeConfig(modeId)))
            navigate('setup', modeId)
            preloadDraftEngine(modeId)
          }}
          onFormation={setSelectedFormationId}
          onSpecialSelection={setSpecialSelection}
          onStart={startDraft}
          isDraftLoading={isDraftLoading}
          onHome={() => navigate('home')}
        />
      )}
      {activeScreen === 'draft' && draftState && (
        <DraftScreen
          key={`${draftState.roundIndex}:${draftState.currentRoll?.team.label ?? 'none'}:${draftState.currentRoll?.team.teamType ?? 'none'}:${draftState.currentRoll?.era ?? 'none'}`}
          mode={selectedMode}
          liveTeams={selectedLiveTeams}
          formation={selectedFormation}
          draftState={draftState}
          isSpinning={isSpinning}
          spinningRoll={spinningRoll}
          onSpin={handleSpin}
          onReroll={handleReroll}
          onSelect={handleSelect}
          onHome={() => navigate('home')}
          onChangeMode={() => openSetup()}
        />
      )}
      {activeScreen === 'result' && result && draftState && (
        <ResultScreen
          result={result}
          picks={draftState.picks}
          bestRecord={bestRecords[result.modeId]}
          onShare={shareResult}
          copied={copied}
          shareMessage={shareMessage}
          shareFallbackValue={shareFallbackValue}
          leaderboardStatus={leaderboardStatus}
          leaderboardMessage={leaderboardMessage}
          authProfile={authProfile}
          onSubmitLeaderboard={submitCurrentRun}
          onRunBack={startDraft}
          onHome={() => navigate('home')}
          onChangeMode={() => openSetup()}
        />
      )}
      {activeScreen === 'notFound' && <NotFoundPage onHome={() => navigate('home')} />}

      <Footer
        onSeoLanding={() => navigate('seoLanding')}
        onFootballLanding={() => navigate('footballLanding')}
        onHow={() => navigate('how')}
        onLeaderboard={() => navigate('leaderboard')}
        onPrivacy={() => navigate('privacy')}
        onContact={() => navigate('contact')}
      />
      {menuOpen && (
        <SideMenu
          onClose={() => setMenuOpen(false)}
          onHome={() => goToPage('home')}
          onSeoLanding={() => goToPage('seoLanding')}
          onFootballLanding={() => goToPage('footballLanding')}
          onHow={() => goToPage('how')}
          onLeaderboard={() => goToPage('leaderboard')}
          onPrivacy={() => goToPage('privacy')}
          onContact={() => goToPage('contact')}
        />
      )}
      {authOpen && (
        <AuthModal
          authProfile={authProfile}
          onClose={() => setAuthOpen(false)}
          onAuthProfile={setAuthProfile}
        />
      )}
      {showRules && <RulesModal onClose={() => closeRules()} onNeverShow={() => closeRules(true)} />}
    </div>
  )
}

function RulesModal({ onClose, onNeverShow }: { onClose: () => void; onNeverShow: () => void }) {
  return (
    <div className="rules-overlay" role="presentation">
      <section className="rules-dialog" role="dialog" aria-modal="true" aria-labelledby="rules-title">
        <button className="rules-close" type="button" onClick={onClose} aria-label="Close rules">
          <X size={24} />
        </button>
        <h2 id="rules-title">How to Play {appName}</h2>
        <p className="rules-intro">Build the ultimate football all-time XI and see if you can go {targetRecordLabel}.</p>

        <div className="rules-copy">
          <h3>The Draft</h3>
          <p>Each round, spin to get a random club/nation and era.</p>
          <p>Select one player from that prompt to add to your XI.</p>
          <p>Complete all 11 rounds to fill your starting lineup.</p>

          <h3>Building Your Lineup</h3>
          <p>Fill every slot in your formation, from GK to your front line.</p>
          <p>Use rerolls carefully. Some eras and teams are loaded, others are traps.</p>

          <h3>Team Rating</h3>
          <p>Players use EA-style 0-100 peak ratings instead of messy cross-era raw stats.</p>
          <p>The sim turns those ratings into attack, midfield, defense, keeper, chemistry, and overall scores.</p>
          <p>Broken football logic gets punished: no keeper, no ball-winner, weak width, bad balance.</p>
          <p>Aim for the perfect {targetRecordLabel} season.</p>
        </div>

        <p className="rules-question">Can your XI go undefeated?</p>

        <div className="rules-actions">
          <button className="button secondary" type="button" onClick={onClose}>Close</button>
          <button className="button modal-primary" type="button" onClick={onNeverShow}>Don't Show Again</button>
        </div>
      </section>
    </div>
  )
}

function Header({
  theme,
  authProfile,
  onHome,
  onSignIn,
  onToggleTheme,
  onMenu,
}: {
  theme: ThemeMode
  authProfile: AuthProfile | null
  onHome: () => void
  onSignIn: () => void
  onToggleTheme: () => void
  onMenu: () => void
}) {
  return (
    <header className="topbar">
      <button className="top-home-link" onClick={onHome} type="button" aria-label={`Go to ${appName} home`} />
      <nav className="top-actions" aria-label="Primary navigation">
        <button className="icon-button" type="button" onClick={onSignIn} aria-label={authProfile ? `Signed in as ${authProfile.displayName}` : 'Sign in'}>
          <User size={20} />
        </button>
        <button className="icon-button" type="button" onClick={onToggleTheme} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button className="icon-button" type="button" onClick={onMenu} aria-label="Open menu">
          <Menu size={21} />
        </button>
      </nav>
    </header>
  )
}

function SideMenu({
  onClose,
  onHome,
  onSeoLanding,
  onFootballLanding,
  onHow,
  onLeaderboard,
  onPrivacy,
  onContact,
}: {
  onClose: () => void
  onHome: () => void
  onSeoLanding: () => void
  onFootballLanding: () => void
  onHow: () => void
  onLeaderboard: () => void
  onPrivacy: () => void
  onContact: () => void
}) {
  return (
    <div className="side-menu-overlay" role="presentation" onMouseDown={onClose}>
      <aside className="side-menu" aria-label="Site menu" onMouseDown={(event) => event.stopPropagation()}>
        <div className="side-menu-head">
          <strong>Menu</strong>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close menu">
            <X size={21} />
          </button>
        </div>
        <button type="button" onClick={onHome}>Home</button>
        <button type="button" onClick={onSeoLanding}>82-0 Soccer Game</button>
        <button type="button" onClick={onFootballLanding}>82-0 Football Game</button>
        <button type="button" onClick={onHow}>How to Play</button>
        <button type="button" onClick={onLeaderboard}>Leaderboard</button>
        <button type="button" onClick={onPrivacy}>Privacy Policy</button>
        <button type="button" onClick={onContact}>Contact and Feedback</button>
        <p>Independent fan project. No official clubs, leagues, or player likenesses.</p>
      </aside>
    </div>
  )
}

function HomePage({
  recentRuns,
  onMode,
  onHome,
  onSeoLanding,
  onFootballLanding,
  onNavigate,
}: {
  recentRuns: StoredRunSummary[]
  onMode: (modeId: string) => void
  onHome: () => void
  onSeoLanding: () => void
  onFootballLanding: () => void
  onNavigate: (page: PopularPage) => void
}) {
  const worldValidation = modeValidations.find((validation) => validation.modeId === 'world_xi')
  const readyPublicModes = publicModeConfigs.filter((mode) => publicModeIsReady(mode.modeId)).length
  const [activeTab, setActiveTab] = useState<HomeModeTab>('main')
  const readyModes = publicModeConfigs.filter((mode) => publicModeIsReady(mode.modeId))
  const modeCards = modesForHomeTab(readyModes, activeTab)
    .map((mode) => ({
      id: mode.modeId,
      name: mode.modeName,
      copy: mode.shortDescription,
      mark: modeMarkFor(mode.modeId, mode.modeName),
    }))

  return (
    <main>
      <section className="hero-section">
        <BrandMark onClick={onHome} />
        <div className="hero-copy">
          <h1>UndefeatedXI</h1>
          <p className="hero-mode-title">Can you build a perfect XI?</p>
          <p className="hero-text">Draft football and soccer legends, build an all-time XI, and chase unbeaten records like 38-0-0 across clubs, nations, leagues, and tournaments.</p>
        </div>
      </section>

      <div className="home-mode-tabs" role="tablist" aria-label="Mode groups">
        {[
          ['main', 'Main'],
          ['leagues', 'Leagues'],
          ['more', 'More'],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={activeTab === id ? 'selected' : ''}
            onClick={() => setActiveTab(id as HomeModeTab)}
            role="tab"
            aria-selected={activeTab === id}
          >
            {label}
          </button>
        ))}
      </div>

      <section className="mode-grid" aria-label="Playable mode choices">
        {modeCards.map((card) => (
            <button
              key={card.id}
              className="mode-card"
              type="button"
              onClick={() => onMode(card.id)}
              {...(import.meta.env.MODE === 'test' ? { 'aria-label': card.name } : {})}
            >
              <span className="mode-mark">{card.mark}</span>
              <span className="mode-card-title">{card.name}</span>
              <span>{card.copy}</span>
              <span className="mode-card-cta"><Play size={16} /> Play {card.name}</span>
            </button>
        ))}
      </section>

      <section className="support-strip">
        <span>{worldValidation?.contextCount ?? 0} sourced contexts</span>
        <span>{readyPublicModes} playable modes</span>
      </section>

      <section className="home-seo-section" aria-labelledby="home-about-title">
        <p className="section-kicker">Football version of 82-0</p>
        <h2 id="home-about-title">UndefeatedXI: The Official Soccer Version of 82-0</h2>
        <p>UndefeatedXI is the official soccer and football version of the viral 82-0 game. Instead of chasing 82-0 in basketball, you draft football legends into a real XI and simulate whether your squad can finish unbeaten.</p>
        <p>It works as a football draft simulator, a soccer history draft game, and a perfect-season challenge for fans who want to build a perfect XI and see if the engine respects it.</p>
        <div className="inline-link-row" aria-label="Featured UndefeatedXI pages">
          <a href="/82-0-soccer-game" onClick={(event) => { event.preventDefault(); onSeoLanding() }}>82-0 Soccer Game</a>
          <a href="/82-0-football-game" onClick={(event) => { event.preventDefault(); onFootballLanding() }}>82-0 Football Game</a>
        </div>
      </section>

      <PopularPages onNavigate={onNavigate} />

      {recentRuns.length > 0 && <RecentRuns runs={recentRuns.slice(0, 4)} />}
    </main>
  )
}

function SeoLandingPage({
  variant,
  onPlay,
  onNavigate,
}: {
  variant: 'soccer' | 'football'
  onPlay: () => void
  onNavigate: (page: PopularPage) => void
}) {
  const isFootball = variant === 'football'
  const headline = isFootball
    ? 'The Official Football Version of 82-0'
    : 'The Official Soccer and Football Version of 82-0'
  const intro = isFootball
    ? 'Looking for the football version of 82-0? UndefeatedXI turns the perfect-record idea into a football history draft game built around XIs, tactics, chemistry, leagues, and tournaments.'
    : 'Looking for an 82-0 soccer game? UndefeatedXI takes the perfect-record chase and rebuilds it for football history, from all-time XIs to World Cup and Champions League runs.'

  return (
    <main className="text-page seo-landing-page">
      <Breadcrumbs current={isFootball ? '82-0 Football Game' : '82-0 Soccer Game'} onHome={onPlay} />
      <button className="button ghost" type="button" onClick={onPlay}>
        <Home size={18} /> Back to Game
      </button>
      <section className="seo-hero">
        <BrandMark />
        <p className="section-kicker">{isFootball ? '82-0 football game' : '82-0 soccer game'}</p>
        <h1>{headline}</h1>
        <p>{intro}</p>
        <p>You draft an all-time XI from clubs, nations, eras, and competitions, then simulate whether your team can finish unbeaten.</p>
        <button className="button primary" type="button" onClick={onPlay}>
          <Play size={18} /> Play UndefeatedXI
        </button>
      </section>

      <section>
        <h2>What is UndefeatedXI?</h2>
        <p>UndefeatedXI is a soccer draft simulator and football draft simulator for people who like football history arguments. Each run gives you prompts, player choices, and lineup decisions, then tests your XI across realistic records, from 38-0-0 league seasons to perfect tournament runs.</p>
      </section>

      <section>
        <h2>How the game works</h2>
        <p>Pick a mode, choose a formation, spin a club, nation, or era prompt, then draft one player into a compatible slot. The sim scores attack, midfield, defense, goalkeeping, chemistry, tactical fit, position fit, and big-game quality before it produces your record.</p>
      </section>

      <section>
        <h2>Why it is different from 82-0</h2>
        <p>82-0 made the perfect-season draft idea instantly understandable. UndefeatedXI is the official soccer version of the 82-0 game and the official football version of the 82-0 game: instead of building a basketball roster, you build a perfect soccer XI or perfect football XI and chase unbeaten seasons, trophies, leaderboards, and shareable results.</p>
      </section>

      <section>
        <h2>Modes included</h2>
        <p>Play World Cup draft game runs, Champions League draft game runs, Euros, AFCON, World XI, Premier League, La Liga, Serie A, Bundesliga, and more. Some modes chase 38-0-0. Others care about tournament perfection, trophy paths, or pure ball knowledge.</p>
      </section>

      <section>
        <h2>Why soccer and football fans will like it</h2>
        <p>The fun is in the choices. You balance legends, eras, chemistry, positions, and tactics while deciding whether to take the obvious superstar or trust a deeper cut from a club, nation, league, World Cup, or Champions League prompt.</p>
      </section>

      <section>
        <h2>Free to play, no ads</h2>
        <p>UndefeatedXI is free. There are no ads, no paywall, and no data selling. You can play a run, share the result, and come back later without creating an account.</p>
      </section>

      <PopularPages onNavigate={onNavigate} />
      <FaqSection />
    </main>
  )
}

function Breadcrumbs({ current, onHome }: { current: string; onHome: () => void }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <a href="/" onClick={(event) => { event.preventDefault(); onHome() }}>UndefeatedXI</a>
      <span aria-hidden="true">/</span>
      <span>{current}</span>
    </nav>
  )
}

function PopularPages({ onNavigate }: { onNavigate: (page: PopularPage) => void }) {
  return (
    <section className="popular-pages" aria-labelledby="popular-pages-title">
      <div>
        <p className="section-kicker">Popular pages</p>
        <h2 id="popular-pages-title">Find the right UndefeatedXI run</h2>
      </div>
      <div className="popular-link-grid">
        {popularPages.map((page) => (
          <a
            key={`${page.label}-${page.href}`}
            href={page.href}
            onClick={(event) => {
              event.preventDefault()
              onNavigate(page)
            }}
          >
            {page.label}
          </a>
        ))}
      </div>
    </section>
  )
}

function FaqSection() {
  return (
    <section className="faq-section" aria-label="UndefeatedXI FAQ">
      <h2>FAQ</h2>
      {faqItems.map((item) => (
        <details key={item.question} open>
          <summary>{item.question}</summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </section>
  )
}

function modesForHomeTab(modes: ModeConfig[], tab: HomeModeTab) {
  const byId = new Map(modes.map((mode) => [mode.modeId, mode]))

  if (tab === 'main') {
    return mainModeIds.flatMap((modeId) => byId.get(modeId) ?? [])
  }

  if (tab === 'leagues') {
    return leagueModeIds.flatMap((modeId) => byId.get(modeId) ?? [])
  }

  const pinned = new Set([...mainModeIds, ...leagueModeIds])
  return modes.filter((mode) => !pinned.has(mode.modeId))
}

function modeMarkFor(modeId: string, modeName: string) {
  const marks: Record<string, string> = {
    world_xi: 'XI',
    premier_league: 'PL',
    english_top_flight: 'EN',
    laliga: 'LL',
    serie_a: 'SA',
    bundesliga: 'BL',
    ligue_1: 'L1',
    mls: 'MLS',
    champions_league: 'CL',
    classic_european_cup: 'EC',
    world_cup: 'WC',
    euros: 'EU',
    copa_america: 'CA',
    afcon: 'AF',
    club_world_cup: 'CWC',
    one_club: 'OC',
    nation_xi: 'NAT',
    era_lock: 'ERA',
    ball_knowledge: 'IQ',
    chaos: 'CH',
    manager: 'MGR',
  }

  return marks[modeId] ?? modeName.split(/\s+/).map((word) => word[0]).join('').slice(0, 3).toUpperCase()
}

function BrandMark({ compact = false, onClick }: { compact?: boolean; onClick?: () => void }) {
  const className = [compact ? 'brand-mark compact' : 'brand-mark', onClick ? 'clickable' : ''].filter(Boolean).join(' ')
  const sizes = compact ? '54px' : logoImageSizes
  const imageAlt = compact ? '' : 'UndefeatedXI soccer draft simulator logo'
  const content = (
    <picture>
      <source type="image/avif" srcSet={logoImageSrcSet} sizes={sizes} />
      <source type="image/webp" srcSet={logoWebpSrcSet} sizes={sizes} />
      <img
        className="brand-logo"
        alt={imageAlt}
        aria-hidden={compact ? 'true' : undefined}
        src="/logo-320.png"
        srcSet={logoPngSrcSet}
        sizes={sizes}
        width={320}
        height={320}
        loading={compact ? 'lazy' : 'eager'}
        fetchPriority={compact ? 'auto' : 'high'}
        decoding="async"
      />
    </picture>
  )

  if (onClick) {
    return (
      <button className={className} type="button" onClick={onClick} aria-label={`Go to ${appName} home`}>
        {content}
      </button>
    )
  }

  return (
    <div className={className} aria-label={appName}>
      {content}
    </div>
  )
}

function RecentRuns({ runs }: { runs: StoredRunSummary[] }) {
  return (
    <section className="recent-runs panel" aria-label="Recent saved runs">
      <div>
        <p className="section-kicker">Saved locally</p>
        <h2>Recent Runs</h2>
      </div>
      <div className="recent-run-grid">
        {runs.map((run) => (
          <article key={run.runId} className="recent-run">
            <strong>{run.modeName}</strong>
            <span>{formatStoredRecord(run.record)} | {run.grade} - {run.gradeLabel}</span>
            <small>{run.formationId} | {run.bestPlayer}</small>
          </article>
        ))}
      </div>
    </section>
  )
}

function SetupScreen({
  selectedMode,
  selectedModeId,
  selectedFormationId,
  specialSelection,
  liveTeams,
  validationsByMode,
  onMode,
  onFormation,
  onSpecialSelection,
  onStart,
  isDraftLoading,
  onHome,
}: {
  selectedMode: ModeConfig
  selectedModeId: string
  selectedFormationId: string
  specialSelection: SpecialSelection
  liveTeams: TeamRollOption[]
  validationsByMode: Map<string, ModeValidation>
  onMode: (modeId: string) => void
  onFormation: (formationId: string) => void
  onSpecialSelection: (selection: SpecialSelection) => void
  onStart: () => void
  isDraftLoading: boolean
  onHome: () => void
}) {
  const publicReady = publicModeIsReady(selectedModeId)
  const validation = validationsByMode.get(selectedModeId)
  const selectedIsDemo = selectedMode.status === 'preview' && validation?.readiness === 'demo'

  return (
    <main className="setup-layout">
      <section className="section-heading">
        <div className="setup-brand">
          <BrandMark onClick={onHome} />
        </div>
        <p className="section-kicker">The draw</p>
        <h1>Choose the run.</h1>
        <p>Pick a mode and formation. The draft stays slot-based so your XI has to make football sense.</p>
      </section>

      <div className="setup-grid">
        <section className="panel">
          <h2>Mode</h2>
          <div className="option-list">
            {publicModeConfigs.map((mode) => (
              <button key={mode.modeId} className={mode.modeId === selectedModeId ? 'option selected' : 'option'} type="button" onClick={() => onMode(mode.modeId)}>
                <span>
                  <strong>{mode.modeName}</strong>
                  <small>{mode.shortDescription}</small>
                </span>
                {mode.modeId === selectedModeId && <Check size={18} />}
              </button>
            ))}
          </div>
          {previewModeConfigs.length > 0 && (
            <details className="preview-details">
              <summary>
                <ChevronDown size={16} /> More Modes
              </summary>
              <div className="preview-list">
                {previewModeConfigs.map((mode) => (
                  <button key={mode.modeId} type="button" className={mode.modeId === selectedModeId ? 'preview-mode selected' : 'preview-mode'} onClick={() => onMode(mode.modeId)}>
                    <span>{mode.modeName}</span>
                    <small>{validationsByMode.get(mode.modeId)?.readiness === 'ready' ? 'Data ready' : 'Engine demo'}</small>
                  </button>
                ))}
              </div>
            </details>
          )}
        </section>

        <section className="panel">
          <h2>Formation</h2>
          <div className="formation-grid">
            {formations.map((formation) => (
              <button
                key={formation.formationId}
                className={formation.formationId === selectedFormationId ? 'chip selected' : 'chip'}
                type="button"
                onClick={() => onFormation(formation.formationId)}
              >
                {formation.name}
              </button>
            ))}
          </div>

          {selectedMode.specialSetup && (
            <SpecialModeControls
              mode={selectedMode}
              teams={liveTeams}
              selection={specialSelection}
              onSelection={onSpecialSelection}
            />
          )}

          <div className="mode-summary">
            <Target size={18} />
            <div>
              <strong>{selectedMode.modeName}</strong>
              <span>Target: {selectedMode.targetRecord}</span>
              <span>Pool: {selectedMode.eligiblePoolType.replaceAll('_', ' ')}</span>
              <span>Roster: {selectedMode.rosterSlots.total} players ({selectedMode.rosterSlots.starters} XI{selectedMode.rosterSlots.bench ? ` + ${selectedMode.rosterSlots.bench} bench` : ''})</span>
              <span>Contexts: {validation?.contextCount ?? 0} strict / {validation?.readiness ?? 'thin'}</span>
              {specialSelection.fixedTeam && <span>Locked: {specialSelection.fixedTeam.label}</span>}
              {specialSelection.fixedEra && <span>Locked era: {specialSelection.fixedEra}</span>}
            </div>
          </div>
          {selectedMode.status === 'preview' && !selectedIsDemo && <p className="notice">Preview mode: strict data coverage exists, but it is still staged while the mode rules are polished.</p>}
          {selectedIsDemo && <p className="notice">Engine demo: this mode uses the shared draft/simulation loop, but strict mode-specific player coverage is not ready yet.</p>}
          {selectedMode.status === 'public' && !publicReady && <p className="notice danger">{validation?.issues[0] ?? 'This mode needs more data before release.'}</p>}
          <button className="button primary full" type="button" onClick={onStart} disabled={isDraftLoading}>
            <Play size={18} /> {isDraftLoading ? 'Loading Draft' : 'Start Draft'}
          </button>
        </section>
      </div>
    </main>
  )
}

function SpecialModeControls({
  mode,
  teams,
  selection,
  onSelection,
}: {
  mode: ModeConfig
  teams: TeamRollOption[]
  selection: SpecialSelection
  onSelection: (selection: SpecialSelection) => void
}) {
  if (mode.specialSetup === 'fixed_club' || mode.specialSetup === 'fixed_nation') {
    const label = mode.specialSetup === 'fixed_club' ? 'Choose Club' : 'Choose Nation'
    return (
      <section className="special-controls" aria-label={label}>
        <h2>{label}</h2>
        <div className="special-grid">
          {teams.map((team) => (
            <button
              key={team.label}
              type="button"
              className={selection.fixedTeam?.label === team.label ? 'chip selected' : 'chip'}
              onClick={() => onSelection({ fixedTeam: team })}
            >
              {team.label}
            </button>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="special-controls" aria-label="Choose era">
      <h2>Choose Era</h2>
      <div className="special-grid">
        {mode.eraPool.map((era) => (
          <button
            key={era}
            type="button"
            className={selection.fixedEra === era ? 'chip selected' : 'chip'}
            onClick={() => onSelection({ fixedEra: era })}
          >
            {era}
          </button>
        ))}
      </div>
    </section>
  )
}

function DraftScreen({
  mode,
  liveTeams,
  formation,
  draftState,
  isSpinning,
  spinningRoll,
  onSpin,
  onReroll,
  onSelect,
  onHome,
  onChangeMode,
}: {
  mode: ModeConfig
  liveTeams: TeamRollOption[]
  formation: ReturnType<typeof getFormation>
  draftState: DraftState
  isSpinning: boolean
  spinningRoll: { team: string; era: string } | null
  onSpin: () => void
  onReroll: (type: 'team' | 'era' | 'full') => void
  onSelect: (player: PlayerContext, slotId?: string) => void
  onHome: () => void
  onChangeMode: () => void
}) {
  const [previewPlayerId, setPreviewPlayerId] = useState<string | null>(null)
  const [placingPlayerId, setPlacingPlayerId] = useState<string | null>(null)
  const [positionFilter, setPositionFilter] = useState<PlayerFilter>('all')
  const [playerSearch, setPlayerSearch] = useState('')
  const [playerSort, setPlayerSort] = useState<PlayerSort>('best')
  const totalRounds = draftState.draftSlots.length
  const usesBench = totalRounds > formation.slots.length
  const currentRound = Math.min(draftState.roundIndex + 1, totalRounds)
  const hasActiveRoll = Boolean(draftState.currentRoll)
  const lockedTeam = draftState.specialSelection?.fixedTeam
  const lockedEra = draftState.specialSelection?.fixedEra
  const startingTeam = lockedTeam ?? liveTeams.find((team) => team.label === 'Manchester United') ?? liveTeams[0] ?? mode.teamPool[0]
  const startingEra = lockedEra ?? (mode.eraPool.includes('1990s') ? '1990s' : mode.eraPool[0])
  const reelTeam = abbreviateTeamName(lockedTeam?.label ?? spinningRoll?.team ?? draftState.currentRoll?.team.label ?? startingTeam?.label ?? 'World XI')
  const reelEra = lockedEra ?? spinningRoll?.era ?? draftState.currentRoll?.era ?? startingEra ?? '2010s'
  const canRerollTeam = !lockedTeam
  const canRerollEra = !lockedEra
  const sortsPlayers = !mode.hidesRatings
  const rollPlayers = mode.hidesRatings ? draftState.currentOptions : rollPlayersForState(draftState)
  const placingPlayer = rollPlayers.find((player) => player.contextId === placingPlayerId)
  const previewPlayer = rollPlayers.find((player) => player.contextId === previewPlayerId)
  const activePlayer = placingPlayer ?? previewPlayer
  const selectablePlayerIds = new Set(draftState.currentOptions.map((player) => player.contextId))
  const selectablePersonIds = new Set(draftState.currentOptions.map((player) => player.personId))
  const openStarterSlots = formation.slots.filter((slot) => !draftState.picks.some((pick) => pick.slot.slotId === slot.slotId))
  const openDraftSlots = draftState.draftSlots.filter((slot) => !draftState.picks.some((pick) => pick.slot.slotId === slot.slotId))
  const benchSlots = draftState.draftSlots.filter((slot) => isBenchSlot(slot))
  const canSelectForOpenSlot = (player: PlayerContext) => openDraftSlots.some((slot) => slotMatchesPlayer(slot, player))
  const canSelectVisiblePlayer = (player: PlayerContext) => (
    (selectablePlayerIds.has(player.contextId) || selectablePersonIds.has(player.personId) || rollPlayers.some((option) => option.contextId === player.contextId)) &&
    canSelectForOpenSlot(player)
  )
  const compatibleSlotIds = activePlayer ? openStarterSlots.filter((slot) => slotMatchesPlayer(slot, activePlayer)).map((slot) => slot.slotId) : []
  const compatibleBenchSlotIds = activePlayer ? benchSlots.filter((slot) => !draftState.picks.some((pick) => pick.slot.slotId === slot.slotId) && slotMatchesPlayer(slot, activePlayer)).map((slot) => slot.slotId) : []
  const placingSlots = placingPlayer ? openDraftSlots.filter((slot) => slotMatchesPlayer(slot, placingPlayer)) : []
  const quickPlaceSlot = placingSlots.length === 1 ? placingSlots[0] : undefined
  const filteredOptions = [...rollPlayers]
    .filter((player) => playerMatchesPositionFilter(player, positionFilter))
    .filter((player) => {
      const query = playerSearch.trim().toLowerCase()
      if (!query) return true
      return `${player.displayName} ${player.teamName} ${player.positions.join(' ')}`.toLowerCase().includes(query)
    })
  const visibleOptions = sortsPlayers
    ? filteredOptions.sort((left, right) => playerSortValue(right, playerSort) - playerSortValue(left, playerSort) || left.displayName.localeCompare(right.displayName))
    : filteredOptions
  const visibleSelectableCount = visibleOptions.filter(canSelectVisiblePlayer).length

  const startPlacement = (player: PlayerContext) => {
    if (isSpinning) return
    if (!canSelectVisiblePlayer(player)) {
      setPlacingPlayerId(null)
      setPreviewPlayerId(player.contextId)
      return
    }
    setPlacingPlayerId(player.contextId)
    setPreviewPlayerId(player.contextId)
  }

  const placePlayer = (slotId: string) => {
    if (!placingPlayer) return
    setPreviewPlayerId(null)
    setPlacingPlayerId(null)
    onSelect(placingPlayer, slotId)
  }

  return (
    <main className="draft-page">
      <section className="draft-round-header" aria-label={`Round ${currentRound} of ${totalRounds}`}>
        <BrandMark compact onClick={onHome} />
        <div>
          <strong>Round {currentRound}/{totalRounds}</strong>
          <span>{mode.modeName} · {formation.name}</span>
        </div>
      </section>

      <section className="roll-strip" aria-label="Current roll">
        <div className="roll-boxes">
          <div className="roll-box team">
            <span>Team</span>
            <strong>{reelTeam}</strong>
            <small>Club/Nation</small>
          </div>
          <div className="roll-box era">
            <span>Era</span>
            <strong>{reelEra}</strong>
            <small>Era</small>
          </div>
        </div>
        <div className="roll-actions">
          {!hasActiveRoll ? (
            <button className="button primary spin-button" type="button" onClick={onSpin} disabled={isSpinning || isDraftCompleteState(draftState)}>
              <RefreshCw size={18} /> {isSpinning ? 'Spinning' : 'Spin'}
            </button>
          ) : (
            <>
              {canRerollTeam && (
                <button className="roll-reroll team-reroll" type="button" onClick={() => onReroll('team')} disabled={isSpinning || draftState.rerolls.team === 0}>
                  <RefreshCw size={18} /> Team
                </button>
              )}
              {canRerollEra && (
                <button className="roll-reroll era-reroll" type="button" onClick={() => onReroll('era')} disabled={isSpinning || draftState.rerolls.era === 0}>
                  <RefreshCw size={18} /> Era
                </button>
              )}
            </>
          )}
        </div>
      </section>

      <div className="draft-layout">
        <section className="draft-main">
          {draftState.freeRerollNotice && <p className="notice">{draftState.freeRerollNotice}</p>}

          <section className="player-options" aria-label="Player options">
            {isSpinning ? (
              <div className="empty-options spinning-options">
                <RefreshCw size={18} />
                <span>Finding a team and era...</span>
              </div>
            ) : rollPlayers.length === 0 ? (
              <div className="empty-options">
                <Info size={18} />
                <span>Spin to reveal players from a team and era.</span>
              </div>
            ) : (
              <div className="player-options-shell">
                <div className="player-controls">
                  <div className="position-tabs" role="tablist" aria-label="Filter players by position group">
                    {playerFilters.map((filter) => (
                      <button
                        key={filter.id}
                        type="button"
                        className={positionFilter === filter.id ? 'selected' : ''}
                        onClick={() => setPositionFilter(filter.id)}
                        role="tab"
                        aria-selected={positionFilter === filter.id}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                  <label className="player-search">
                    <Search size={17} aria-hidden="true" />
                    <input
                      value={playerSearch}
                      onChange={(event) => setPlayerSearch(event.target.value)}
                      placeholder="Search..."
                      aria-label="Search players"
                    />
                  </label>
                  {sortsPlayers && (
                    <label className="player-sort">
                      <select value={playerSort} onChange={(event) => setPlayerSort(event.target.value as PlayerSort)} aria-label="Sort players">
                        <option value="best">Best</option>
                        <option value="atk">ATK</option>
                        <option value="mid">MID</option>
                        <option value="def">DEF</option>
                        <option value="gk">GK</option>
                        <option value="big">BIG</option>
                      </select>
                      <ChevronDown size={16} aria-hidden="true" />
                    </label>
                  )}
                </div>
                <div className="options-toolbar">
                  <strong>{visibleSelectableCount} selectable · {visibleOptions.length} in roll</strong>
                  <span>{placingPlayer ? `Placing ${placingPlayer.displayName}` : 'Pick, then place'}</span>
                  {quickPlaceSlot && (
                    <button
                      className="quick-place-button"
                      type="button"
                      onClick={() => placePlayer(quickPlaceSlot.slotId)}
                      aria-label={`Place selected player at ${quickPlaceSlot.label}`}
                    >
                      <Target size={15} />
                      Place at {quickPlaceSlot.label}
                    </button>
                  )}
                </div>
                <div className="player-list">
                  {visibleOptions.length === 0 ? (
                    <div className="empty-options compact">No players match those filters.</div>
                  ) : visibleOptions.map((player) => (
                    <PlayerCard
                      key={player.contextId}
                      player={player}
                      hiddenRatings={Boolean(mode.hidesRatings)}
                      selected={placingPlayerId === player.contextId}
                      selectable={canSelectVisiblePlayer(player)}
                      hasOpenSlot={canSelectForOpenSlot(player)}
                      onPreview={() => setPreviewPlayerId(player.contextId)}
                      onPreviewEnd={() => {
                        if (!placingPlayerId) setPreviewPlayerId(null)
                      }}
                      onSelect={() => startPlacement(player)}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>
        </section>

        <aside className="draft-side">
          <section className="lineup-panel" aria-label="Formation lineup">
            <div className="lineup-title">
              <strong>{formation.name}</strong>
              <span>{draftState.picks.length}/{formation.slots.length} XI filled</span>
            </div>
            <PitchBoard
              formation={formation}
              picks={draftState.picks}
              activePlayer={activePlayer}
              compatibleSlotIds={compatibleSlotIds}
              placingPlayer={placingPlayer}
              onPlace={placePlayer}
            />
            {usesBench && (
              <BenchBoard
                picks={draftState.picks}
                benchSlots={benchSlots}
                compatibleSlotIds={compatibleBenchSlotIds}
                placingPlayer={placingPlayer}
                onPlace={placePlayer}
              />
            )}
          </section>
          <DraftHistory picks={draftState.picks} />
          <button className="button ghost full" type="button" onClick={onChangeMode}>
            Change Mode
          </button>
        </aside>
      </div>
    </main>
  )
}

function rollPlayersForState(state: DraftState): PlayerContext[] {
  return state.currentRollPool?.length ? state.currentRollPool : state.currentOptions
}

function PlayerCard({
  player,
  hiddenRatings,
  selected,
  selectable,
  hasOpenSlot,
  onPreview,
  onPreviewEnd,
  onSelect,
}: {
  player: PlayerContext
  hiddenRatings: boolean
  selected: boolean
  selectable: boolean
  hasOpenSlot: boolean
  onPreview: () => void
  onPreviewEnd: () => void
  onSelect: () => void
}) {
  const metrics = getPlayerMetrics(player)

  return (
    <button
      className={['player-row', selected ? 'selected' : '', selectable ? '' : 'unavailable'].filter(Boolean).join(' ')}
      type="button"
      onClick={onSelect}
      onFocus={onPreview}
      onBlur={onPreviewEnd}
      onMouseEnter={onPreview}
      onMouseLeave={onPreviewEnd}
      aria-disabled={!selectable}
      aria-label={selectable ? `Choose player ${player.displayName}` : hasOpenSlot ? `${player.displayName} is in this roll but is unavailable for this pick` : `${player.displayName} is in this roll but has no open formation slot`}
    >
      <span className="player-row-main">
        <h2>{player.displayName}</h2>
        <span className="player-positions">{player.positions.slice(0, 4).join(' · ')}</span>
        <small>{player.teamName} · {player.eraLabel}{selectable ? '' : hasOpenSlot ? ' · unavailable' : ' · no open slot'}</small>
      </span>
      {hiddenRatings ? (
        <span className="player-row-hidden"><EyeOff size={16} /> Stats hidden</span>
      ) : (
        <span className="player-row-metrics">
          {metrics.map((metric) => (
            <span key={metric.label}>
              <strong>{metric.value}</strong>
              <small>{metric.label}</small>
            </span>
          ))}
        </span>
      )}
    </button>
  )
}

function PitchBoard({
  formation,
  picks,
  activePlayer,
  compatibleSlotIds,
  placingPlayer,
  onPlace,
}: {
  formation: ReturnType<typeof getFormation>
  picks: DraftPick[]
  activePlayer?: PlayerContext
  compatibleSlotIds: string[]
  placingPlayer?: PlayerContext
  onPlace: (slotId: string) => void
}) {
  const [hoveredSlotId, setHoveredSlotId] = useState<string | undefined>()
  const pickBySlot = new Map(picks.map((pick) => [pick.slot.slotId, pick]))
  const compatibleSlots = new Set(compatibleSlotIds)
  const hoveredSlot = formation.slots.find((slot) => slot.slotId === hoveredSlotId)
  const hoveredPick = hoveredSlot ? pickBySlot.get(hoveredSlot.slotId) : undefined

  return (
    <div className="pitch-board" aria-label={`${formation.name} pitch lineup`}>
      <div className="pitch-line center" />
      <div className="pitch-box top" />
      <div className="pitch-box bottom" />
      {formation.slots.map((slot) => {
        const pick = pickBySlot.get(slot.slotId)
        const canPlace = Boolean(placingPlayer && compatibleSlots.has(slot.slotId) && !pick)
        const previewCompatible = Boolean(activePlayer && compatibleSlots.has(slot.slotId) && !pick)
        const kit = pick ? getTeamKitColors(pick.roll.team.label) : undefined
        const slotStyle = {
          left: `${slot.x}%`,
          top: `${slot.y}%`,
          ...(kit ? {
            '--kit-color': kit.primary,
            '--kit-text': kit.text,
            '--kit-accent': kit.accent ?? kit.primary,
          } : {}),
        } as CSSProperties

        return (
          <button
            key={slot.slotId}
            className={[
              'pitch-slot',
              pick ? 'filled' : '',
              pick && hoveredSlotId === slot.slotId ? 'tooltip-active' : '',
              previewCompatible ? 'compatible' : '',
              canPlace ? 'placeable' : '',
            ].filter(Boolean).join(' ')}
            style={slotStyle}
            type="button"
            disabled={!canPlace && !pick}
            onClick={() => {
              if (canPlace) onPlace(slot.slotId)
            }}
            onMouseEnter={() => {
              if (pick) setHoveredSlotId(slot.slotId)
            }}
            onMouseLeave={() => {
              if (pick) setHoveredSlotId((current) => current === slot.slotId ? undefined : current)
            }}
            onFocus={() => {
              if (pick) setHoveredSlotId(slot.slotId)
            }}
            onBlur={() => {
              if (pick) setHoveredSlotId((current) => current === slot.slotId ? undefined : current)
            }}
            aria-describedby={pick && hoveredSlotId === slot.slotId ? 'pitch-player-popover' : undefined}
            aria-label={pick ? `${slot.label}: ${pick.player.displayName}` : canPlace ? `Place ${placingPlayer?.displayName} at ${slot.label}` : `${slot.label} empty`}
          >
            <span className="jersey" aria-hidden="true">
              <strong>{pick ? getPlayerInitials(pick.player.displayName) : slot.label}</strong>
              {pick && <small>{slot.label}</small>}
            </span>
          </button>
        )
      })}
      {hoveredPick && hoveredSlot && <PitchPopover pick={hoveredPick} slotX={hoveredSlot.x} slotY={hoveredSlot.y} />}
    </div>
  )
}

function getPitchPopoverClass(x: number, y: number): string {
  const vertical = y <= 28 ? 'popover-below' : 'popover-above'
  const horizontal = x <= 24 ? 'popover-align-left' : x >= 76 ? 'popover-align-right' : 'popover-align-center'
  return `${vertical} ${horizontal}`
}

function PitchPopover({ pick, slotX, slotY }: { pick: DraftPick; slotX: number; slotY: number }) {
  const metrics = getPlayerMetrics(pick.player, pick.slot).slice(0, 3)
  return (
    <span
      id="pitch-player-popover"
      className={['pitch-popover', getPitchPopoverClass(slotX, slotY)].join(' ')}
      style={{ '--popover-left': `${slotX}%`, '--popover-top': `${slotY}%` } as CSSProperties}
      role="tooltip"
    >
      <strong>{pick.player.displayName}</strong>
      <span>{pick.roll.team.label} · {pick.slot.label}</span>
      <span>{metrics.map((metric) => `${metric.value} ${metric.label}`).join(' · ')}</span>
    </span>
  )
}

const playerFilters: { id: PlayerFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'gk', label: 'GK' },
  { id: 'def', label: 'DEF' },
  { id: 'mid', label: 'MID' },
  { id: 'att', label: 'ATT' },
]

const playerFilterPositions: Record<Exclude<PlayerFilter, 'all'>, Position[]> = {
  gk: ['GK'],
  def: ['LB', 'CB', 'RB', 'LWB', 'RWB'],
  mid: ['DM', 'CM', 'AM', 'LM', 'RM'],
  att: ['LW', 'RW', 'CF', 'ST'],
}

function playerMatchesPositionFilter(player: PlayerContext, filter: PlayerFilter): boolean {
  if (filter === 'all') return true
  return player.positions.some((position) => playerFilterPositions[filter].includes(position))
}

function playerSortValue(player: PlayerContext, sort: PlayerSort): number {
  const ratings = player.ratings
  if (sort === 'atk') return ratings.attack
  if (sort === 'mid') return ratings.control * 0.45 + ratings.creation * 0.35 + ratings.press * 0.2
  if (sort === 'def') return ratings.defense
  if (sort === 'gk') return ratings.goalkeeping
  if (sort === 'big') return ratings.bigGame
  return Math.max(
    ratings.goalkeeping,
    ratings.attack * 0.62 + ratings.creation * 0.24 + ratings.physical * 0.14,
    ratings.defense * 0.7 + ratings.physical * 0.2 + ratings.control * 0.1,
    ratings.control * 0.45 + ratings.creation * 0.35 + ratings.press * 0.2,
  ) + ratings.bigGame * 0.04
}

const teamAbbreviations: Record<string, string> = {
  'AC Milan': 'MIL',
  Ajax: 'AJX',
  Algeria: 'ALG',
  Argentina: 'ARG',
  Arsenal: 'ARS',
  'Atletico Madrid': 'ATM',
  'Atlanta United': 'ATL',
  Barcelona: 'BAR',
  'Bayer Leverkusen': 'LEV',
  'Bayern Munich': 'BAY',
  Benfica: 'BEN',
  Blackburn: 'BLB',
  Bordeaux: 'BOR',
  Brazil: 'BRA',
  Belgium: 'BEL',
  'Boca Juniors': 'BOC',
  'Borussia Dortmund': 'BVB',
  'Borussia Monchengladbach': 'BMG',
  Cameroon: 'CMR',
  Chelsea: 'CHE',
  Chile: 'CHI',
  Colombia: 'COL',
  'Colorado Rapids': 'COL',
  'Columbus Crew': 'CLB',
  Croatia: 'CRO',
  'DC United': 'DC',
  Denmark: 'DEN',
  Egypt: 'EGY',
  England: 'ENG',
  Everton: 'EVE',
  France: 'FRA',
  Germany: 'GER',
  Ghana: 'GHA',
  Hamburg: 'HSV',
  'Houston Dynamo': 'HOU',
  Inter: 'INT',
  'Inter Miami': 'MIA',
  Italy: 'ITA',
  'Ivory Coast': 'CIV',
  Juventus: 'JUV',
  'LA Galaxy': 'LAG',
  LAFC: 'LAFC',
  Liverpool: 'LIV',
  Lyon: 'LYO',
  Marseille: 'OM',
  'Manchester City': 'MCI',
  'Manchester United': 'MUN',
  Monaco: 'ASM',
  Morocco: 'MAR',
  Napoli: 'NAP',
  Nashville: 'NSH',
  'Nashville SC': 'NSH',
  Netherlands: 'NED',
  Nigeria: 'NGA',
  'Nottingham Forest': 'NFO',
  Paraguay: 'PAR',
  Porto: 'POR',
  Portugal: 'POR',
  'Portland Timbers': 'POR',
  PSG: 'PSG',
  'Real Madrid': 'RMA',
  'River Plate': 'RIV',
  Roma: 'ROM',
  Santos: 'SAN',
  Senegal: 'SEN',
  'Seattle Sounders': 'SEA',
  Sevilla: 'SEV',
  Spain: 'ESP',
  'Sporting KC': 'SKC',
  'Soviet Union': 'URS',
  'Saint-Etienne': 'ASSE',
  'Tampa Bay Mutiny': 'TBM',
  Tottenham: 'TOT',
  'Toronto FC': 'TOR',
  Uruguay: 'URU',
  Valencia: 'VAL',
  'Vancouver Whitecaps': 'VAN',
  'Werder Bremen': 'BRE',
  'World XI': 'XI',
}

const teamKitColors: Record<string, { primary: string; text: string; accent?: string }> = {
  'AC Milan': { primary: '#d00027', text: '#ffffff', accent: '#111111' },
  Ajax: { primary: '#d71920', text: '#ffffff' },
  Algeria: { primary: '#ffffff', text: '#006233', accent: '#006233' },
  Argentina: { primary: '#75aadb', text: '#10233f', accent: '#ffffff' },
  Arsenal: { primary: '#ef0107', text: '#ffffff' },
  'Atletico Madrid': { primary: '#c8152e', text: '#ffffff', accent: '#ffffff' },
  'Atlanta United': { primary: '#80000a', text: '#ffffff', accent: '#a19060' },
  Barcelona: { primary: '#a50044', text: '#ffcb05', accent: '#004d98' },
  'Bayer Leverkusen': { primary: '#e32221', text: '#ffffff', accent: '#111111' },
  'Bayern Munich': { primary: '#dc052d', text: '#ffffff' },
  Belgium: { primary: '#ed2939', text: '#ffe936', accent: '#111111' },
  Benfica: { primary: '#e83030', text: '#ffffff' },
  Blackburn: { primary: '#0b63b6', text: '#ffffff' },
  Brazil: { primary: '#f7df1e', text: '#0b7a3b', accent: '#1f55a5' },
  'Boca Juniors': { primary: '#003f86', text: '#ffcf00', accent: '#ffcf00' },
  'Borussia Dortmund': { primary: '#fde100', text: '#121212', accent: '#121212' },
  'Borussia Monchengladbach': { primary: '#111111', text: '#ffffff', accent: '#2fb344' },
  Cameroon: { primary: '#007a5e', text: '#ffd700', accent: '#ce1126' },
  Chelsea: { primary: '#034694', text: '#ffffff' },
  Chile: { primary: '#d52b1e', text: '#ffffff', accent: '#0039a6' },
  Colombia: { primary: '#fcd116', text: '#12326f', accent: '#ce1126' },
  'Colorado Rapids': { primary: '#862633', text: '#ffffff', accent: '#8bb8e8' },
  'Columbus Crew': { primary: '#fdd92e', text: '#111111' },
  Croatia: { primary: '#f2f2f2', text: '#d00027', accent: '#171796' },
  'DC United': { primary: '#111111', text: '#ffffff', accent: '#d71920' },
  Denmark: { primary: '#c60c30', text: '#ffffff' },
  Egypt: { primary: '#c8102e', text: '#ffffff', accent: '#111111' },
  England: { primary: '#f7f7f2', text: '#10233f', accent: '#c8102e' },
  Everton: { primary: '#003399', text: '#ffffff' },
  France: { primary: '#1f4aa8', text: '#ffffff', accent: '#ed2939' },
  Germany: { primary: '#f2f2e8', text: '#111111', accent: '#d4af37' },
  Ghana: { primary: '#fcd116', text: '#111111', accent: '#006b3f' },
  Hamburg: { primary: '#ffffff', text: '#173b7a', accent: '#ed1c24' },
  'Houston Dynamo': { primary: '#f68712', text: '#111111' },
  Inter: { primary: '#0068a8', text: '#ffffff', accent: '#111111' },
  'Inter Miami': { primary: '#f7b5cd', text: '#111111', accent: '#111111' },
  Italy: { primary: '#0052b4', text: '#ffffff' },
  'Ivory Coast': { primary: '#f77f00', text: '#ffffff', accent: '#009e60' },
  Juventus: { primary: '#f5f5ef', text: '#111111', accent: '#111111' },
  'LA Galaxy': { primary: '#00245d', text: '#ffffff', accent: '#ffd200' },
  LAFC: { primary: '#111111', text: '#d6b25e' },
  Liverpool: { primary: '#c8102e', text: '#ffffff' },
  Lyon: { primary: '#ffffff', text: '#1d4597', accent: '#d0021b' },
  Marseille: { primary: '#2faee0', text: '#ffffff' },
  'Manchester City': { primary: '#6cabdd', text: '#10233f', accent: '#ffffff' },
  'Manchester United': { primary: '#da291c', text: '#ffffff', accent: '#fbe122' },
  Monaco: { primary: '#e32636', text: '#ffffff' },
  Morocco: { primary: '#c1272d', text: '#ffffff', accent: '#006233' },
  Napoli: { primary: '#12a0d7', text: '#ffffff' },
  Bordeaux: { primary: '#4b1238', text: '#ffffff', accent: '#ffffff' },
  Nashville: { primary: '#ece83a', text: '#111111', accent: '#1f2a44' },
  'Nashville SC': { primary: '#ece83a', text: '#111111', accent: '#1f2a44' },
  Netherlands: { primary: '#f36c21', text: '#111111' },
  Nigeria: { primary: '#008751', text: '#ffffff' },
  'Nottingham Forest': { primary: '#dd0000', text: '#ffffff' },
  Paraguay: { primary: '#d52b1e', text: '#ffffff', accent: '#0038a8' },
  Porto: { primary: '#005bac', text: '#ffffff' },
  Portugal: { primary: '#c8102e', text: '#ffffff', accent: '#006b3f' },
  'Portland Timbers': { primary: '#004812', text: '#f7d117', accent: '#d6a100' },
  PSG: { primary: '#004170', text: '#ffffff', accent: '#da291c' },
  'Real Madrid': { primary: '#f7f3df', text: '#132257', accent: '#febd11' },
  'River Plate': { primary: '#ffffff', text: '#c8102e', accent: '#c8102e' },
  Roma: { primary: '#8e1f2f', text: '#f6b352' },
  Santos: { primary: '#ffffff', text: '#111111', accent: '#111111' },
  Senegal: { primary: '#00853f', text: '#fdef42', accent: '#e31b23' },
  'Seattle Sounders': { primary: '#5d9741', text: '#ffffff', accent: '#236192' },
  Sevilla: { primary: '#ffffff', text: '#d71920', accent: '#d71920' },
  Spain: { primary: '#c60b1e', text: '#ffc400' },
  'Sporting KC': { primary: '#91bfe3', text: '#10233f' },
  'Soviet Union': { primary: '#cc0000', text: '#ffd700' },
  'Saint-Etienne': { primary: '#007a3d', text: '#ffffff' },
  'Tampa Bay Mutiny': { primary: '#104e8b', text: '#ffffff', accent: '#f6c343' },
  Tottenham: { primary: '#ffffff', text: '#132257', accent: '#132257' },
  'Toronto FC': { primary: '#d71920', text: '#ffffff' },
  Uruguay: { primary: '#7db7e8', text: '#10233f' },
  Valencia: { primary: '#ffffff', text: '#111111', accent: '#f28c28' },
  'Vancouver Whitecaps': { primary: '#ffffff', text: '#00245e', accent: '#78be20' },
  'Werder Bremen': { primary: '#009a44', text: '#ffffff' },
  'World XI': { primary: '#0f7a43', text: '#ffffff' },
}

const teamKitAliases: Record<string, string> = {
  'arsenal london': 'Arsenal',
  'atleti': 'Atletico Madrid',
  'bayer 04 leverkusen': 'Bayer Leverkusen',
  'bayern munchen': 'Bayern Munich',
  'blackburn rovers': 'Blackburn',
  'borussia monchengladbach': 'Borussia Monchengladbach',
  'borussia dortmund': 'Borussia Dortmund',
  'd c united': 'DC United',
  dc: 'DC United',
  'fc barcelona': 'Barcelona',
  'fc bayern munchen': 'Bayern Munich',
  'fc porto': 'Porto',
  'hamburger sv': 'Hamburg',
  hsv: 'Hamburg',
  internazionale: 'Inter',
  'inter milan': 'Inter',
  'la galaxy': 'LA Galaxy',
  'los angeles galaxy': 'LA Galaxy',
  'man city': 'Manchester City',
  'manchester city': 'Manchester City',
  'manchester united': 'Manchester United',
  'man utd': 'Manchester United',
  'man united': 'Manchester United',
  'milan': 'AC Milan',
  'olympique lyonnais': 'Lyon',
  'olympique marseille': 'Marseille',
  'paris saint germain': 'PSG',
  'paris sg': 'PSG',
  'portland': 'Portland Timbers',
  'real madrid': 'Real Madrid',
  'river plate': 'River Plate',
  'saint etienne': 'Saint-Etienne',
  'seattle sounders': 'Seattle Sounders',
  'sporting kansas city': 'Sporting KC',
  spurs: 'Tottenham',
  'tottenham hotspur': 'Tottenham',
  'werder bremen': 'Werder Bremen',
}

const fallbackKitPalette = [
  { primary: '#0f7a43', text: '#ffffff', accent: '#b58b2b' },
  { primary: '#123a64', text: '#ffffff', accent: '#72b6df' },
  { primary: '#7d1f2a', text: '#ffffff', accent: '#d8af55' },
  { primary: '#f2f0e6', text: '#10233f', accent: '#0f7a43' },
  { primary: '#d8af55', text: '#111814', accent: '#0f7a43' },
]

function normalizeTeamColorName(teamName: string): string {
  return teamName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.'’]/g, '')
    .toLowerCase()
    .replace(/\b(fc|cf|sc|afc|the)\b/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function getTeamKitColors(teamName: string) {
  const direct = teamKitColors[teamName]
  if (direct) return direct

  const normalized = normalizeTeamColorName(teamName)
  const alias = teamKitAliases[normalized]
  if (alias && teamKitColors[alias]) return teamKitColors[alias]

  const normalizedMatch = Object.keys(teamKitColors).find((key) => normalizeTeamColorName(key) === normalized)
  if (normalizedMatch) return teamKitColors[normalizedMatch]

  const hash = Array.from(teamName).reduce((total, char) => total + char.charCodeAt(0), 0)
  return fallbackKitPalette[hash % fallbackKitPalette.length]
}

function abbreviateTeamName(teamName: string): string {
  if (teamAbbreviations[teamName]) return teamAbbreviations[teamName]
  const initials = teamName
    .replace(/\b(fc|sc|cf|afc|the)\b/gi, '')
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .toUpperCase()

  return initials.length >= 2 ? initials.slice(0, 4) : teamName.slice(0, 3).toUpperCase()
}

function getPlayerMetrics(player: PlayerContext, slot?: DraftPick['slot']) {
  const accepts = slot?.accepts ?? player.primaryPositions
  const ratings = player.ratings

  if (accepts.includes('GK') || player.primaryPositions.includes('GK')) {
    return [
      { label: 'GK', value: ratings.goalkeeping },
      { label: 'DEF', value: ratings.defense },
      { label: 'CTRL', value: ratings.control },
      { label: 'BIG', value: ratings.bigGame },
    ]
  }

  if (accepts.some((position) => ['CB', 'LB', 'RB', 'LWB', 'RWB', 'DM'].includes(position))) {
    return [
      { label: 'DEF', value: ratings.defense },
      { label: 'PHY', value: ratings.physical },
      { label: 'CTRL', value: ratings.control },
      { label: 'PRS', value: ratings.press },
    ]
  }

  if (accepts.some((position) => ['CM', 'AM', 'LM', 'RM'].includes(position))) {
    return [
      { label: 'CTRL', value: ratings.control },
      { label: 'CRE', value: ratings.creation },
      { label: 'PRS', value: ratings.press },
      { label: 'DEF', value: ratings.defense },
    ]
  }

  return [
    { label: 'ATK', value: ratings.attack },
    { label: 'CRE', value: ratings.creation },
    { label: 'PHY', value: ratings.physical },
    { label: 'BIG', value: ratings.bigGame },
  ]
}

function getPlayerInitials(name: string) {
  const parts = name.replace(/[^\p{L}\p{N}\s-]/gu, '').split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'XI'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts.at(-1)?.[0] ?? ''}`.toUpperCase()
}

function BenchBoard({
  picks,
  benchSlots,
  compatibleSlotIds,
  placingPlayer,
  onPlace,
}: {
  picks: DraftPick[]
  benchSlots: DraftState['draftSlots']
  compatibleSlotIds: string[]
  placingPlayer?: PlayerContext
  onPlace: (slotId: string) => void
}) {
  const pickBySlot = new Map(picks.filter((pick) => isBenchSlot(pick.slot)).map((pick) => [pick.slot.slotId, pick]))
  const compatibleSlots = new Set(compatibleSlotIds)

  return (
    <section className="bench-board" aria-label="Bench picks">
      <div className="bench-header">
        <h2>Bench</h2>
        {placingPlayer && <span>Place {placingPlayer.displayName}</span>}
      </div>
      <div className="bench-grid">
        {benchSlots.map((slot) => {
          const pick = pickBySlot.get(slot.slotId)
          const canPlace = Boolean(placingPlayer && compatibleSlots.has(slot.slotId) && !pick)

          return (
            <button
              key={slot.slotId}
              className={[
                'bench-slot',
                pick ? 'filled' : 'empty',
                canPlace ? 'placeable' : '',
              ].filter(Boolean).join(' ')}
              type="button"
              disabled={!canPlace}
              onClick={() => onPlace(slot.slotId)}
              aria-label={pick ? `${slot.label}: ${pick.player.displayName}` : canPlace ? `Place ${placingPlayer?.displayName} at ${slot.label}` : `${slot.label} empty`}
            >
              <strong>{slot.label}</strong>
              <span>{pick ? pick.player.displayName : slot.accepts.join(' / ')}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

function DraftHistory({ picks }: { picks: DraftPick[] }) {
  return (
    <section className="history panel">
      <h2>Draft History</h2>
      {picks.length === 0 ? (
        <p>No picks locked yet.</p>
      ) : (
        <ol>
          {picks.map((pick) => (
            <li key={`${pick.round}-${pick.player.contextId}`}>
              <span>{pick.round}. {pick.slot.label}</span>
              <strong>{pick.player.displayName}</strong>
              <small>{pick.roll.team.label} {pick.roll.era}</small>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

function ResultScreen({
  result,
  picks,
  bestRecord,
  onShare,
  copied,
  shareMessage,
  shareFallbackValue,
  leaderboardStatus,
  leaderboardMessage,
  authProfile,
  onSubmitLeaderboard,
  onRunBack,
  onHome,
  onChangeMode,
}: {
  result: RunResult
  picks: DraftPick[]
  bestRecord?: StoredRunSummary
  onShare: () => void
  copied: boolean
  shareMessage: string
  shareFallbackValue: string
  leaderboardStatus: LeaderboardStatus
  leaderboardMessage: string
  authProfile: AuthProfile | null
  onSubmitLeaderboard: () => void
  onRunBack: () => void
  onHome: () => void
  onChangeMode: () => void
}) {
  const record = `${result.record.wins}-${result.record.draws}-${result.record.losses}`
  const isPersonalBest = bestRecord?.runId === result.runId
  const teamSummary = calculateResultTeamSummary(result.teamRatings)
  const resultPicks = orderResultPicks(picks)
  return (
    <main className="result-page">
      <section className="result-scorecard">
        <BrandMark onClick={onHome} />
        <h1>Can you go undefeated?</h1>
        <span className="result-mode-pill">{result.modeName}</span>
        <p className="result-label">Projected record</p>
        <strong className="result-record">{record}</strong>
        <p className="result-grade">
          <span>{result.grade}</span>
          {result.gradeLabel}
          <small>{result.points ? `· ${result.points} pts` : ''}</small>
        </p>
        <p className="result-summary">{result.perfectionResult}</p>
        {bestRecord && (
          <p className="best-record">
            {isPersonalBest ? 'New personal best for this mode.' : `Personal best: ${formatStoredRecord(bestRecord.record)} (${bestRecord.grade})`}
          </p>
        )}
      </section>

      <section className="result-actions">
        <button className="button primary" type="button" onClick={onShare}>
          <Clipboard size={18} /> {copied ? 'Link copied' : 'Share Link'}
        </button>
        <button className="button secondary" type="button" onClick={onSubmitLeaderboard} disabled={leaderboardStatus === 'submitting'}>
          <Trophy size={18} /> {leaderboardStatus === 'submitting' ? 'Submitting' : leaderboardStatus === 'submitted' ? 'Submitted' : authProfile ? 'Submit Run' : 'Sign in to submit'}
        </button>
        <button className="button secondary" type="button" onClick={onRunBack}>
          Build Another
        </button>
        <button className="button ghost" type="button" onClick={onChangeMode}>
          Change Mode
        </button>
      </section>
      {(shareMessage || leaderboardMessage) && (
        <p className={leaderboardStatus === 'error' ? 'result-status danger' : 'result-status'} role="status">
          {[shareMessage, leaderboardMessage].filter(Boolean).join(' ')}
        </p>
      )}
      {shareFallbackValue && (
        <label className="share-fallback">
          Share Link
          <textarea readOnly value={shareFallbackValue} onFocus={(event) => event.currentTarget.select()} aria-label="Manual share link" />
        </label>
      )}

      <section className="result-roster" aria-label="Final squad">
        <div className="result-roster-list">
          {resultPicks.map((pick) => (
            <ResultPlayerRow key={`${pick.round}-${pick.player.contextId}`} pick={pick} />
          ))}
        </div>
        <div className="result-team-totals" aria-label="Team totals">
          {teamSummary.map((metric) => (
            <span key={metric.label}>
              <strong>{metric.value}</strong>
              <small>{metric.label}</small>
            </span>
          ))}
        </div>
      </section>

      <section className="result-grid">
        <Metric label="GF" value={result.goalsFor} />
        <Metric label="GA" value={result.goalsAgainst} />
        <Metric label="GD" value={result.goalsFor - result.goalsAgainst} />
        <Metric label="xG For" value={result.xgFor} />
        <Metric label="xG Against" value={result.xgAgainst} />
        <Metric label="Trophy %" value={`${result.simulationDetails.trophyProbability}%`} />
      </section>

      <section className="panel result-story">
        <h2>{result.trophyResult}</h2>
        <p>{result.why}</p>
        <div className="story-grid">
          <span><strong>Best player</strong>{result.bestPlayer}</span>
          <span><strong>Weak link</strong>{result.weakLink}</span>
          <span><strong>Strongest unit</strong>{result.strongestUnit}</span>
          <span><strong>Weakest unit</strong>{result.weakestUnit}</span>
          <span><strong>Tactic</strong>{result.tacticReport.identity}</span>
          {result.squadReport && <span><strong>Squad depth</strong>{result.squadReport.depthScore}</span>}
          <span><strong>Run ID</strong>{result.runId}</span>
        </div>
      </section>

      <section className="advanced">
        <details>
          <summary>View rating breakdown</summary>
          <div className="breakdown-grid">
            {Object.entries(result.teamRatings).map(([label, value]) => (
              <Metric key={label} label={formatRatingLabel(label)} value={value} />
            ))}
          </div>
        </details>
        {result.squadReport && (
          <details>
            <summary>View squad depth</summary>
            <div className="breakdown-grid">
              <Metric label="Depth" value={result.squadReport.depthScore} />
              <Metric label="Coverage" value={`${result.squadReport.rotationCoverage}/6`} />
              <Metric label="Rotation" value={formatModifier(result.squadReport.benchImpact)} />
            </div>
            {[...result.squadReport.bonuses, ...result.squadReport.warnings].map((line) => <p key={line}>{line}</p>)}
          </details>
        )}
        <details>
          <summary>View tactic report</summary>
          <p>{result.tacticReport.summary}</p>
          <p>{result.dominanceReason}</p>
          <p>{result.failureReason}</p>
          {[...result.tacticReport.strengths, ...result.tacticReport.weaknesses].map((line) => <p key={line}>{line}</p>)}
        </details>
        <details>
          <summary>View simulation details</summary>
          <div className="breakdown-grid">
            <Metric label="Win %" value={`${result.simulationDetails.averageWinProbability}%`} />
            <Metric label="Draw %" value={`${result.simulationDetails.averageDrawProbability}%`} />
            <Metric label="Loss %" value={`${result.simulationDetails.averageLossProbability}%`} />
            <Metric label="Trophy %" value={`${result.simulationDetails.trophyProbability}%`} />
            <Metric label="xG / match" value={result.simulationDetails.expectedGoalsForPerMatch} />
            <Metric label="xGA / match" value={result.simulationDetails.expectedGoalsAgainstPerMatch} />
            <Metric label="Pressure" value={result.simulationDetails.matchPressure} />
            <Metric label="Strength" value={result.simulationDetails.teamStrength} />
          </div>
        </details>
        <details>
          <summary>View key matches</summary>
          <div className="key-match-list">
            {result.keyMatches.map((match) => (
              <article key={match.label}>
                <strong>{match.label}: {match.result}</strong>
                <p>{match.note}</p>
              </article>
            ))}
          </div>
        </details>
        {result.chaosEvents.length > 0 && (
          <details>
            <summary>View chaos report</summary>
            <div className="key-match-list">
              {result.chaosEvents.map((event) => (
                <article key={`${event.match}-${event.title}`}>
                  <strong>Match {event.match}: {event.title}</strong>
                  <p>
                    {event.phase} | {event.impact} | pressure {formatModifier(event.modifier)}
                  </p>
                  <p>{event.note}</p>
                </article>
              ))}
            </div>
          </details>
        )}
        <details>
          <summary>View competition path</summary>
          <div className="key-match-list">
            {result.competitionPath.map((phase) => (
              <article key={phase.phase}>
                <strong>{phase.phase}: {phase.outcome}</strong>
                <p>
                  {phase.record.wins}-{phase.record.draws}-{phase.record.losses}
                  {' | '}
                  GF {phase.goalsFor} | GA {phase.goalsAgainst}
                  {' | '}
                  xG {phase.xgFor}-{phase.xgAgainst}
                </p>
              </article>
            ))}
          </div>
        </details>
        <details>
          <summary>View chemistry report</summary>
          <p>Score: {result.chemistryReport.score}</p>
          {[...result.chemistryReport.bonuses, ...result.chemistryReport.warnings].map((line) => <p key={line}>{line}</p>)}
        </details>
        <details>
          <summary>View XI</summary>
          <DraftHistory picks={picks} />
        </details>
      </section>
    </main>
  )
}

function resultPickSortValue(pick: DraftPick): number {
  if (pick.slot.accepts.some((position) => ['LW', 'RW', 'ST', 'CF'].includes(position))) return 10
  if (pick.slot.accepts.some((position) => ['AM'].includes(position))) return 20
  if (pick.slot.accepts.some((position) => ['LM', 'RM', 'CM', 'DM'].includes(position))) return 30
  if (pick.slot.accepts.some((position) => ['LB', 'CB', 'RB', 'LWB', 'RWB'].includes(position))) return 40
  if (pick.slot.accepts.includes('GK')) return 50
  return 60
}

function orderResultPicks(picks: DraftPick[]): DraftPick[] {
  return [...picks].sort((left, right) => (
    resultPickSortValue(left) - resultPickSortValue(right)
    || left.slot.y - right.slot.y
    || left.slot.x - right.slot.x
    || left.round - right.round
  ))
}

function ResultPlayerRow({ pick }: { pick: DraftPick }) {
  const metrics = getPlayerMetrics(pick.player, pick.slot)
  const kit = getTeamKitColors(pick.roll.team.label)
  const rowStyle = {
    '--row-kit': kit.primary,
    '--row-kit-text': kit.text,
    '--row-accent': kit.accent ?? kit.primary,
  } as CSSProperties

  return (
    <article className="result-player-row" style={rowStyle}>
      <span className="result-player-jersey" aria-hidden="true">
        <strong>{getPlayerInitials(pick.player.displayName)}</strong>
        <small>{pick.slot.label}</small>
      </span>
      <span className="result-player-main">
        <strong>{pick.player.displayName}</strong>
        <small>{pick.roll.team.label} · {pick.roll.era}</small>
      </span>
      <span className="result-player-metrics">
        {metrics.map((metric) => (
          <span key={metric.label}>
            <strong>{metric.value}</strong>
            <small>{metric.label}</small>
          </span>
        ))}
      </span>
    </article>
  )
}

function calculateResultTeamSummary(teamRatings: TeamRatings) {
  return [
    { label: 'ATK', value: teamRatings.attack },
    { label: 'MID', value: teamRatings.midfield },
    { label: 'DEF', value: teamRatings.defense },
    { label: 'GK', value: teamRatings.goalkeeping },
    { label: 'CHEM', value: teamRatings.chemistry },
    { label: 'OVR', value: teamRatings.overall },
  ]
}

function formatModifier(value: number): string {
  return `${value > 0 ? '+' : ''}${value}`
}

function formatRatingLabel(label: string): string {
  return label.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase())
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function HowToPlay({ onBack }: { onBack: () => void }) {
  return (
    <main className="text-page">
      <Breadcrumbs current="How to Play" onHome={onBack} />
      <button className="button ghost" type="button" onClick={onBack}>
        <Home size={18} /> Back to Game
      </button>
      <h1>How to Play</h1>
      <p>UndefeatedXI is the soccer and football version of the 82-0 perfect-record idea: build an XI or full matchday squad from randomized football-history prompts, then see whether the side can go perfect, invincible, win the trophy, or fall apart.</p>
      {[
        ['Choose a Mode', 'World XI is the default. Champions League, World Cup, Premier League, and Ball Knowledge change the pool and target.'],
        ['Choose a Formation', 'Most runs draft 11 fixed slots. Manager Mode extends the same shape with a rotation bench.'],
        ['Spin Clubs, Nations, and Eras', 'Each round gives you a prompt. Pick a player, then place them into any compatible open slot.'],
        ['Draft One Player Per Round', 'Take the legend now or gamble with scarce rerolls.'],
        ['Rerolls', 'Most runs include one club/nation reroll and one era reroll. Some modes remove them.'],
        ['Ratings', 'Players use EA-style 0-100 peak ratings, calibrated with current public ratings where useful and curated for legends.'],
        ['Chemistry and Tactics', 'The engine rewards a real spine, role balance, same-team links, and tactical fit.'],
        ['The Simulation', 'Domestic modes chase perfect seasons. Tournaments track trophy status and perfection separately.'],
        ['Result Grades', 'Perfect is rare. Invincible is excellent. Broken teams get exposed.'],
      ].map(([title, copy], index) => (
        <section key={title}>
          <h2>{index + 1}. {title}</h2>
          <p>{copy}</p>
        </section>
      ))}
      <table>
        <caption>Core Ratings</caption>
        <tbody>
          {[
            ['Attack', 'chance quality, scoring volume, pressure on opponents'],
            ['Midfield', 'control, progression, chance creation, press resistance'],
            ['Defense', 'chance prevention, transitions, aerial security'],
            ['Goalkeeping', 'shot-stopping, sweeping, cross claiming'],
            ['Chemistry', 'role balance, tactical fit, same-team links'],
            ['Big Game', 'knockout and high-pressure performance'],
          ].map(([rating, effect]) => (
            <tr key={rating}><th>{rating}</th><td>{effect}</td></tr>
          ))}
        </tbody>
      </table>
      <table>
        <caption>Modes</caption>
        <tbody>
          {publicModeConfigs.map((mode) => (
            <tr key={mode.modeId}><th>{mode.modeName}</th><td>{mode.targetRecord}</td><td>{mode.eligiblePoolType.replaceAll('_', ' ')}</td></tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}

function NotFoundPage({ onHome }: { onHome: () => void }) {
  return (
    <main className="text-page">
      <button className="button ghost" type="button" onClick={onHome}>
        <Home size={18} /> Back to Game
      </button>
      <h1>Page Not Found</h1>
      <p>That UndefeatedXI page does not exist. Head back to the game to draft an all-time XI and chase an unbeaten run.</p>
    </main>
  )
}

function PrivacyPage({ onBack }: { onBack: () => void }) {
  return (
    <main className="text-page">
      <Breadcrumbs current="Privacy Policy" onHome={onBack} />
      <button className="button ghost" type="button" onClick={onBack}>
        <Home size={18} /> Back to Game
      </button>
      <h1>Privacy Policy</h1>
      <section>
        <h2>Short version</h2>
        <p>{appName} is free to play. There are no ads, no paywall, and no data selling.</p>
      </section>
      <section>
        <h2>Local game saves</h2>
        <p>The app stores preferences, recent runs, theme choice, and best records in your browser so the game works quickly when you come back. Clearing browser storage removes those local saves.</p>
      </section>
      <section>
        <h2>Accounts, leaderboards, and feedback</h2>
        <p>You can play without an account. If you sign in, submit a leaderboard run, share a public run, or send feedback, Supabase stores the information needed for that feature, such as your display name, submitted result, share snapshot, or feedback text.</p>
      </section>
      <section>
        <h2>Basic analytics</h2>
        <p>The production site uses Vercel Analytics and Speed Insights for aggregate traffic and performance information. That helps spot broken pages and slow routes. UndefeatedXI does not use ad trackers or sell personal data.</p>
      </section>
    </main>
  )
}

function ContactPage({ onBack }: { onBack: () => void }) {
  const [category, setCategory] = useState<FeedbackCategory>('bug')
  const [message, setMessage] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const messageLength = message.trim().length

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!hasSupabaseConfig) {
      setStatus('Feedback is not configured on this local build.')
      return
    }

    setBusy(true)
    setStatus('')
    try {
      const { submitFeedback } = await loadSupabaseService()
      await submitFeedback({
        category,
        message,
        contactEmail,
        pageUrl: typeof window === 'undefined' ? undefined : window.location.href,
      })
      setMessage('')
      setContactEmail('')
      setCategory('bug')
      setStatus('Feedback sent. Thank you.')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not send feedback.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="text-page">
      <Breadcrumbs current="Contact and Feedback" onHome={onBack} />
      <button className="button ghost" type="button" onClick={onBack}>
        <Home size={18} /> Back to Game
      </button>
      <h1>Feedback</h1>
      <p>Send mode ideas, player corrections, and rating arguments. The data model keeps source notes and confidence labels so every improvement has somewhere to land.</p>
      <form className="feedback-form panel" onSubmit={submit}>
        <label>
          Category
          <select value={category} onChange={(event) => setCategory(event.target.value as FeedbackCategory)}>
            <option value="bug">Bug</option>
            <option value="player_data">Player data</option>
            <option value="feature">Feature idea</option>
            <option value="general">General</option>
          </select>
        </label>
        <label>
          Feedback
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            maxLength={2000}
            minLength={8}
            required
            placeholder="What happened? What should be changed?"
          />
        </label>
        <label>
          Email optional
          <input
            value={contactEmail}
            onChange={(event) => setContactEmail(event.target.value)}
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </label>
        <div className="feedback-actions">
          <small>{messageLength}/2000</small>
          <button className="button primary" type="submit" disabled={busy || messageLength < 8}>
            {busy ? 'Sending' : 'Send Feedback'}
          </button>
        </div>
        {status && <p className={status.includes('sent') ? 'form-status success' : 'form-status'} role="status">{status}</p>}
      </form>
    </main>
  )
}

function AuthModal({
  authProfile,
  onClose,
  onAuthProfile,
}: {
  authProfile: AuthProfile | null
  onClose: () => void
  onAuthProfile: (profile: AuthProfile | null) => void
}) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState(authProfile?.displayName ?? '')
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!hasSupabaseConfig || authProfile) return
    let mounted = true

    loadSupabaseService()
      .then(({ getCurrentSession, profileFromSession }) => getCurrentSession().then(profileFromSession))
      .then((profile) => {
        if (!mounted || !profile) return
        onAuthProfile(profile)
        setDisplayName(profile.displayName)
        setStatus('Signed in.')
      })
      .catch(() => undefined)

    return () => {
      mounted = false
    }
  }, [authProfile, onAuthProfile])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!hasSupabaseConfig) {
      setStatus('Accounts are not configured on this local build.')
      return
    }

    setBusy(true)
    setStatus('')
    try {
      const { getCurrentSession, profileFromSession, signIn, signUp, updateDisplayName } = await loadSupabaseService()
      if (authProfile) {
        await updateDisplayName(displayName)
        const session = await getCurrentSession()
        onAuthProfile(profileFromSession(session))
        setStatus('Profile updated.')
      } else if (mode === 'signup') {
        await signUp(email, password, displayName)
        setStatus('Check your email if confirmation is enabled, then sign in.')
      } else {
        await signIn(email, password)
        const session = await getCurrentSession()
        onAuthProfile(profileFromSession(session))
        onClose()
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Authentication failed.')
    } finally {
      setBusy(false)
    }
  }

  const handleReset = async () => {
    if (!email) {
      setStatus('Enter your email first.')
      return
    }
    setBusy(true)
    try {
      const { resetPassword } = await loadSupabaseService()
      await resetPassword(email)
      setStatus('Password reset email sent.')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not send reset email.')
    } finally {
      setBusy(false)
    }
  }

  const handleGuestSignIn = async () => {
    if (!hasSupabaseConfig) {
      setStatus('Accounts are not configured on this local build.')
      return
    }

    setBusy(true)
    setStatus('')
    try {
      const { getCurrentSession, profileFromSession, signInAsGuest } = await loadSupabaseService()
      await signInAsGuest(displayName || 'Guest')
      const session = await getCurrentSession()
      onAuthProfile(profileFromSession(session))
      onClose()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not start guest session.')
    } finally {
      setBusy(false)
    }
  }

  const handleSignOut = async () => {
    setBusy(true)
    try {
      const { signOut } = await loadSupabaseService()
      await signOut()
      onAuthProfile(null)
      onClose()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not sign out.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="modal-overlay" role="presentation" onMouseDown={onClose}>
      <section className="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="rules-close" type="button" onClick={onClose} aria-label="Close sign in">
          <X size={22} />
        </button>
        <h2 id="auth-title">{authProfile ? 'Account' : mode === 'signin' ? 'Sign in' : 'Create account'}</h2>
        <p>Play stays open without an account. Continue as guest to submit leaderboard runs without waiting on email.</p>

        <form className="auth-form" onSubmit={submit}>
          {authProfile ? (
            <>
              <label>
                Display name
                <input value={displayName} onChange={(event) => setDisplayName(sanitizeDisplayName(event.target.value))} maxLength={32} />
              </label>
              <small>{authProfile.email}</small>
            </>
          ) : (
            <>
              <label>
                Email
                <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" required />
              </label>
              <label>
                Password
                <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} minLength={8} required />
              </label>
              {mode === 'signup' && (
                <label>
                  Display name
                  <input value={displayName} onChange={(event) => setDisplayName(sanitizeDisplayName(event.target.value))} maxLength={32} />
                </label>
              )}
            </>
          )}
          {!hasSupabaseConfig && <p className="notice">Supabase env vars are missing. Local play still works.</p>}
          {status && <p className="auth-status" role="status">{status}</p>}
          {!authProfile && (
            <button className="button primary full" type="button" onClick={handleGuestSignIn} disabled={busy}>
              {busy ? 'Working' : 'Continue as Guest'}
            </button>
          )}
          <button className="button primary full" type="submit" disabled={busy}>
            {busy ? 'Working' : authProfile ? 'Save Profile' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="auth-switcher">
          {authProfile ? (
            <button className="button ghost" type="button" onClick={handleSignOut} disabled={busy}>
              <LogOut size={18} /> Sign Out
            </button>
          ) : (
            <>
              <button className="button ghost" type="button" onClick={() => setMode((current) => (current === 'signin' ? 'signup' : 'signin'))}>
                {mode === 'signin' ? 'Create account' : 'Already have one'}
              </button>
              <button className="button ghost" type="button" onClick={handleReset} disabled={busy}>
                Reset password
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  )
}

function LeaderboardScreen({
  authProfile,
  onBack,
  onSignIn,
}: {
  authProfile: AuthProfile | null
  onBack: () => void
  onSignIn: () => void
}) {
  const leaderboardModeOptions = useMemo(() => publicModeConfigs.filter((mode) => publicModeIsReady(mode.modeId)), [])
  const normalizeLeaderboardSelection = (value: string | null): LeaderboardSelection => {
    if (!value) return 'global'
    if (value === 'mine') return 'mine'
    const normalized = value.replaceAll('-', '_')
    return leaderboardModeOptions.some((mode) => mode.modeId === normalized) ? normalized : 'global'
  }
  const [selectedLeaderboard, setSelectedLeaderboard] = useState<LeaderboardSelection>(() => {
    if (typeof window === 'undefined') return 'global'
    return normalizeLeaderboardSelection(new URLSearchParams(window.location.search).get('mode'))
  })
  const [runs, setRuns] = useState<LeaderboardRun[]>([])
  const [status, setStatus] = useState('')
  const selectedMode = selectedLeaderboard !== 'global' && selectedLeaderboard !== 'mine'
    ? leaderboardModeOptions.find((mode) => mode.modeId === selectedLeaderboard)
    : undefined

  useEffect(() => {
    let mounted = true

    async function loadLeaderboard() {
      if (!hasSupabaseConfig) return { items: [], message: 'Leaderboard needs Supabase env vars.' }
      if (selectedLeaderboard === 'mine' && !authProfile) return { items: [], message: 'Sign in to view your runs.' }
      const { fetchLeaderboardRuns } = await loadSupabaseService()
      const items = selectedLeaderboard === 'global'
        ? await fetchLeaderboardRuns('global')
        : selectedLeaderboard === 'mine'
          ? await fetchLeaderboardRuns('mine')
          : await fetchLeaderboardRuns('mode', selectedLeaderboard)
      const emptyMessage = selectedLeaderboard === 'global'
        ? 'No runs submitted yet.'
        : selectedLeaderboard === 'mine'
          ? 'No runs submitted by your account yet.'
          : `No runs submitted for ${selectedMode?.modeName ?? 'this mode'} yet.`
      return { items, message: items.length ? '' : emptyMessage }
    }

    loadLeaderboard()
      .then((items) => {
        if (!mounted) return
        setRuns(items.items)
        setStatus(items.message)
      })
      .catch((error) => {
        if (mounted) setStatus(error instanceof Error ? error.message : 'Could not load leaderboard.')
      })
    return () => {
      mounted = false
    }
  }, [authProfile, selectedLeaderboard, selectedMode?.modeName])

  const updateSelection = (value: LeaderboardSelection) => {
    setSelectedLeaderboard(value)
    if (typeof window === 'undefined') return
    const nextUrl = value === 'global'
      ? '/leaderboard'
      : `/leaderboard?mode=${value.replaceAll('_', '-')}`
    window.history.replaceState(null, '', nextUrl)
  }

  return (
    <main className="text-page leaderboard-page">
      <Breadcrumbs current="Leaderboard" onHome={onBack} />
      <button className="button ghost" type="button" onClick={onBack}>
        <Home size={18} /> Back to Game
      </button>
      <h1>Leaderboard</h1>
      <p>Compare UndefeatedXI runs across World XI, World Cup, Champions League, Premier League, and the rest of the football draft simulator modes. The main leaderboard uses one filter so the page stays simple on mobile.</p>
      <p>Signed-out players can still play, share local links, and keep browser saves. Sign in when you want a run saved publicly on the leaderboard.</p>
      <section className="leaderboard-board" aria-label="Leaderboard results">
        <div className="leaderboard-section-head">
          <h2>{selectedLeaderboard === 'global' ? 'Global / All Modes' : selectedLeaderboard === 'mine' ? 'My Runs' : selectedMode?.modeName ?? 'Mode Leaderboard'}</h2>
          <label className="leaderboard-mode-select">
            <span className="sr-only">Choose leaderboard</span>
            <select
              value={selectedLeaderboard}
              onChange={(event) => updateSelection(event.target.value)}
              aria-label="Choose leaderboard"
            >
              <option value="global">Global / All Modes</option>
              {leaderboardModeOptions.map((mode) => (
                <option key={mode.modeId} value={mode.modeId}>{mode.modeName}</option>
              ))}
              <option value="mine">My Runs</option>
            </select>
            <ChevronDown size={16} aria-hidden="true" />
          </label>
        </div>
        {selectedLeaderboard === 'mine' && !authProfile && (
          <button className="button secondary" type="button" onClick={onSignIn}>
            <User size={18} /> Sign in for My Runs
          </button>
        )}
        {status && <p className="notice" role="status">{status}</p>}
        <LeaderboardRows runs={runs} ariaLabel="Leaderboard runs" />
      </section>
      {!authProfile && selectedLeaderboard !== 'mine' && (
        <button className="button secondary" type="button" onClick={onSignIn}>
          <User size={18} /> Sign in for My Runs
        </button>
      )}
    </main>
  )
}

function LeaderboardRows({ runs, ariaLabel }: { runs: LeaderboardRun[]; ariaLabel: string }) {
  return (
    <section className="leaderboard-list" aria-label={ariaLabel}>
      {runs.map((run, index) => (
        <article key={run.run_id} className="leaderboard-row">
          <span className="leaderboard-rank">{index + 1}</span>
          <span>
            <strong>{run.display_name || 'Player'}</strong>
            <small>{run.mode_name} · {run.formation_id} · {formatStoredRecord(run.record)}</small>
          </span>
          <span>
            <strong>{run.score}</strong>
            <small>{run.grade} · OVR {run.team_rating}</small>
          </span>
        </article>
      ))}
    </section>
  )
}

function SharedResultScreen({
  snapshot,
  error,
  onHome,
}: {
  snapshot: SharedRunSnapshot | null
  error: string
  onHome: () => void
}) {
  if (!snapshot) {
    return (
      <main className="result-page shared-result-page">
        <section className="result-scorecard">
          <BrandMark onClick={onHome} />
          <h1>{error || 'Loading result...'}</h1>
          <button className="button secondary" type="button" onClick={onHome}>Back Home</button>
        </section>
      </main>
    )
  }

  const record = `${snapshot.record.wins}-${snapshot.record.draws}-${snapshot.record.losses}`
  const teamSummary = calculateResultTeamSummary(snapshot.teamRatings)

  return (
    <main className="result-page shared-result-page">
      <section className="result-scorecard">
        <BrandMark onClick={onHome} />
        <h1>Can you go undefeated?</h1>
        <span className="result-mode-pill">{snapshot.modeName}</span>
        <p className="result-label">Shared record</p>
        <strong className="result-record">{record}</strong>
        <p className="result-grade">
          <span>{snapshot.grade}</span>
          {snapshot.gradeLabel}
          <small>{snapshot.points ? `· ${snapshot.points} pts` : ''}</small>
        </p>
        <p className="result-summary">{snapshot.perfectionResult}</p>
      </section>

      <section className="result-roster" aria-label="Shared squad">
        <div className="result-roster-list">
          {snapshot.picks.map((pick) => (
            <SharedResultPlayerRow key={`${pick.round}-${pick.slotId}-${pick.playerName}`} pick={pick} />
          ))}
        </div>
        <div className="result-team-totals" aria-label="Team totals">
          {teamSummary.map((metric) => (
            <span key={metric.label}>
              <strong>{metric.value}</strong>
              <small>{metric.label}</small>
            </span>
          ))}
        </div>
      </section>

      <section className="panel result-story">
        <h2>{snapshot.trophyResult}</h2>
        <p>{snapshot.why}</p>
        <div className="story-grid">
          <span><strong>Best player</strong>{snapshot.bestPlayer}</span>
          <span><strong>Weak link</strong>{snapshot.weakLink}</span>
          <span><strong>Strongest unit</strong>{snapshot.strongestUnit}</span>
          <span><strong>Weakest unit</strong>{snapshot.weakestUnit}</span>
          <span><strong>Tactic</strong>{snapshot.tacticReport.identity}</span>
          <span><strong>Run ID</strong>{snapshot.runId}</span>
        </div>
      </section>

      <section className="advanced">
        <details open>
          <summary>View key matches</summary>
          <div className="key-match-list">
            {snapshot.keyMatches.map((match) => (
              <article key={match.label}>
                <strong>{match.label}: {match.result}</strong>
                <p>{match.note}</p>
              </article>
            ))}
          </div>
        </details>
        <details>
          <summary>View competition path</summary>
          <div className="key-match-list">
            {snapshot.competitionPath.map((phase) => (
              <article key={phase.phase}>
                <strong>{phase.phase}: {phase.outcome}</strong>
                <p>{phase.record.wins}-{phase.record.draws}-{phase.record.losses} | GF {phase.goalsFor} | GA {phase.goalsAgainst} | xG {phase.xgFor}-{phase.xgAgainst}</p>
              </article>
            ))}
          </div>
        </details>
      </section>
    </main>
  )
}

function SharedResultPlayerRow({ pick }: { pick: SharedRunSnapshot['picks'][number] }) {
  const kit = getTeamKitColors(pick.team)
  const metrics = getSharedPickMetrics(pick)
  const rowStyle = {
    '--row-kit': kit.primary,
    '--row-kit-text': kit.text,
    '--row-accent': kit.accent ?? kit.primary,
  } as CSSProperties

  return (
    <article className="result-player-row" style={rowStyle}>
      <span className="result-player-jersey" aria-hidden="true">
        <strong>{pick.initials}</strong>
        <small>{pick.slotLabel}</small>
      </span>
      <span className="result-player-main">
        <strong>{pick.playerName}</strong>
        <small>{pick.team} · {pick.era}</small>
      </span>
      <span className="result-player-metrics">
        {metrics.map((metric) => (
          <span key={metric.label}>
            <strong>{metric.value}</strong>
            <small>{metric.label}</small>
          </span>
        ))}
      </span>
    </article>
  )
}

function getSharedPickMetrics(pick: SharedRunSnapshot['picks'][number]) {
  if (pick.positions.includes('GK')) {
    return [
      { label: 'GK', value: pick.ratings.goalkeeping },
      { label: 'DEF', value: pick.ratings.defense },
      { label: 'CTRL', value: pick.ratings.control },
      { label: 'BIG', value: pick.ratings.bigGame },
    ]
  }
  if (pick.positions.some((position) => ['CB', 'LB', 'RB', 'LWB', 'RWB', 'DM'].includes(position))) {
    return [
      { label: 'DEF', value: pick.ratings.defense },
      { label: 'PHY', value: pick.ratings.physical },
      { label: 'CTRL', value: pick.ratings.control },
      { label: 'PRS', value: pick.ratings.press },
    ]
  }
  return [
    { label: 'ATK', value: pick.ratings.attack },
    { label: 'CRE', value: pick.ratings.creation },
    { label: 'PHY', value: pick.ratings.physical },
    { label: 'BIG', value: pick.ratings.bigGame },
  ]
}

function Footer({
  onSeoLanding,
  onFootballLanding,
  onHow,
  onLeaderboard,
  onPrivacy,
  onContact,
}: {
  onSeoLanding: () => void
  onFootballLanding: () => void
  onHow: () => void
  onLeaderboard: () => void
  onPrivacy: () => void
  onContact: () => void
}) {
  const follow = (event: MouseEvent<HTMLAnchorElement>, callback: () => void) => {
    event.preventDefault()
    callback()
  }

  return (
    <footer className="footer">
      <div>
        <a href="/82-0-soccer-game" onClick={(event) => follow(event, onSeoLanding)}>82-0 Soccer Game</a>
        <a href="/82-0-football-game" onClick={(event) => follow(event, onFootballLanding)}>82-0 Football Game</a>
        <a href="/how-to-play" onClick={(event) => follow(event, onHow)}>How to Play</a>
        <a href="/leaderboard" onClick={(event) => follow(event, onLeaderboard)}>Leaderboard</a>
        <a href="/privacy" onClick={(event) => follow(event, onPrivacy)}>Privacy Policy</a>
        <a href="/contact" onClick={(event) => follow(event, onContact)}>Feedback</a>
      </div>
      <p>{appName} is an independent fan project and is not affiliated with FIFA, UEFA, any league, club, federation, player association, or player.</p>
    </footer>
  )
}

export default App
