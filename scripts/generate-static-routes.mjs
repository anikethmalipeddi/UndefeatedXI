import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = join(__dirname, '..', 'dist')
const shell = readFileSync(join(distDir, 'index.html'), 'utf8')
const siteUrl = 'https://www.undefeatedxi.com'
const socialImage = `${siteUrl}/og-image.png`

const homeDescription = 'Play UndefeatedXI, a free soccer and football draft simulator. Build a perfect XI, chase 38-0-0, and test football history teams across top modes.'
const soccerDescription = 'Play UndefeatedXI, the official soccer and football version of 82-0. Draft legends, build a perfect XI, and chase 38-0-0 across football history.'
const footballDescription = 'Play UndefeatedXI, the official football version of 82-0. Build a perfect XI, draft legends, and chase unbeaten league and tournament runs.'
const howDescription = 'Learn how to play UndefeatedXI. Draft soccer and football legends, place a perfect XI, and chase 38-0-0, World Cup, and Champions League runs.'
const leaderboardDescription = 'View UndefeatedXI leaderboards for perfect XI runs, 38-0-0 seasons, and unbeaten soccer and football drafts across every mode.'
const sharedResultDescription = 'Open a shared UndefeatedXI football draft result with the final XI, record, streaks, tactical reason, and shareable run summary.'

const faqItems = [
  ['Is there a soccer version of 82-0?', 'Yes. UndefeatedXI is the official soccer and football version of the viral 82-0 game.'],
  ['What is the 82-0 football version?', 'UndefeatedXI turns the 82-0 concept into a football history draft game where you build an all-time XI and chase perfect seasons and tournaments.'],
  ['Is UndefeatedXI free?', 'Yes. UndefeatedXI is free to play and has no ads.'],
  ['What modes are in UndefeatedXI?', 'UndefeatedXI includes World Cup, Champions League, Euros, AFCON, World XI, Premier League, La Liga, Serie A, Bundesliga, and more.'],
  ['What is the goal of the game?', 'Build the best possible XI and see if your team can go undefeated, chase 38-0-0, or win perfect tournament runs.'],
]

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function routeUrl(path) {
  return path === '/' ? `${siteUrl}/` : `${siteUrl}${path}`
}

function gameSchema(description = homeDescription) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: 'UndefeatedXI',
    url: `${siteUrl}/`,
    description,
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
    name: 'UndefeatedXI',
    url: `${siteUrl}/`,
    description: homeDescription,
  }
}

function faqSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(([question, answer]) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answer,
      },
    })),
  }
}

function breadcrumbSchema(path, name) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'UndefeatedXI', item: `${siteUrl}/` },
      { '@type': 'ListItem', position: 2, name, item: routeUrl(path) },
    ],
  }
}

function setTitle(html, title) {
  return html.replace(/<title>.*?<\/title>/s, `<title>${escapeHtml(title)}</title>`)
}

function setMeta(html, selector, content, attribute = 'name') {
  const escaped = escapeHtml(content)
  const pattern = new RegExp(`<meta\\b(?=[^>]*\\b${attribute}="${escapeRegExp(selector)}")[^>]*>\\s*`, 'i')
  const next = `<meta ${attribute}="${selector}" content="${escaped}" />`
  if (pattern.test(html)) return html.replace(pattern, next)
  return html.replace('</head>', `    ${next}\n  </head>`)
}

function setCanonical(html, canonical) {
  const next = `<link rel="canonical" href="${canonical}" />`
  if (/rel="canonical"/i.test(html)) return html.replace(/<link\b(?=[^>]*\brel="canonical")[^>]*>\s*/i, next)
  return html.replace('</head>', `    ${next}\n  </head>`)
}

function setJsonLd(html, id, schema) {
  const json = JSON.stringify(schema)
  const next = `<script id="${id}" type="application/ld+json">${json}</script>`
  const pattern = new RegExp(`<script\\s+id="${id}"\\s+type="application\\/ld\\+json">.*?<\\/script>`, 's')
  if (pattern.test(html)) return html.replace(pattern, next)
  return html.replace('</head>', `    ${next}\n  </head>`)
}

function renderFaq() {
  return `
      <section>
        <h2>FAQ</h2>
        ${faqItems.map(([question, answer]) => `
        <details open>
          <summary>${escapeHtml(question)}</summary>
          <p>${escapeHtml(answer)}</p>
        </details>`).join('')}
      </section>`
}

const popularLinks = `
      <section>
        <h2>Popular pages</h2>
        <p>
          <a href="/82-0-soccer-game">82-0 Soccer Game</a>
          <a href="/82-0-football-game">82-0 Football Game</a>
          <a href="/82-0-soccer-game">Soccer Version of 82-0</a>
          <a href="/82-0-football-game">Football Version of 82-0</a>
          <a href="/">Football Draft Simulator</a>
          <a href="/#/setup/world_cup">World Cup Draft Game</a>
          <a href="/#/setup/champions_league">Champions League Draft Game</a>
          <a href="/how-to-play">How to Play</a>
          <a href="/leaderboard">Leaderboard</a>
        </p>
      </section>`

const routeContent = {
  '/': `
    <main>
      <h1>UndefeatedXI</h1>
      <p>Draft football and soccer legends, build a perfect XI, and chase unbeaten records like 38-0-0 across World Cup, Champions League, league, and all-time modes.</p>
      <p>UndefeatedXI is a free soccer draft simulator, football draft simulator, football history draft game, and soccer history draft game with no ads and no data selling.</p>
      <section><h2>Build an undefeated football XI</h2><p>Choose a mode, pick a formation, draft legends from clubs, nations, and eras, then see if your XI can survive the run. The challenge rewards position fit, chemistry, balance, and a little luck.</p></section>
      ${popularLinks}
    </main>`,
  '/82-0-soccer-game': `
    <main>
      <nav><a href="/">UndefeatedXI</a> / <span>82-0 Soccer Game</span></nav>
      <h1>UndefeatedXI: The Official Soccer Version of the 82-0 Game</h1>
      <p>${escapeHtml(soccerDescription)}</p>
      <section><h2>What is UndefeatedXI?</h2><p>UndefeatedXI is a soccer draft simulator and football draft simulator for football history fans. You draft legends into a real XI, balance the lineup, and chase unbeaten seasons, 38-0-0, and perfect tournament runs.</p></section>
      <section><h2>How the game works</h2><p>Pick a mode, choose a formation, spin clubs, nations, and eras, then draft one player into a compatible slot. Position fit, ratings, chemistry, tactics, goalkeeper quality, and mode rules all affect the final run.</p></section>
      <section><h2>How it relates to 82-0</h2><p>82-0 made the perfect-season draft idea instantly readable. UndefeatedXI is the official soccer version of 82-0 and the official football version of 82-0: instead of building a basketball roster, you build a perfect soccer XI or perfect football XI and test it across football history.</p></section>
      <section><h2>Modes included</h2><p>Play World Cup draft game runs, Champions League draft game runs, Euros, AFCON, Copa America, Club World Cup, Nation XI, World XI, Premier League, La Liga, Serie A, Bundesliga, Ligue 1, MLS, and more.</p></section>
      <section><h2>Why soccer and football fans will like it</h2><p>The fun is in the argument. Do you take the highest-rated player, a natural fit, a chemistry link, a stronger goalkeeper, or the clutch midfielder who can turn draws into wins?</p></section>
      <section><h2>Free to play, no ads</h2><p>UndefeatedXI is free to play, has no ads, and does not sell data. You can play, share a result, and come back later without creating an account.</p></section>
      ${popularLinks}
      ${renderFaq()}
    </main>`,
  '/82-0-football-game': `
    <main>
      <nav><a href="/">UndefeatedXI</a> / <span>82-0 Football Game</span></nav>
      <h1>The Official Football Version of 82-0</h1>
      <p>${escapeHtml(footballDescription)}</p>
      <section><h2>What is the 82-0 football version?</h2><p>UndefeatedXI turns the 82-0 concept into a football history draft game where you build an all-time XI and chase perfect seasons and tournaments.</p></section>
      <section><h2>How the game works</h2><p>Draft legends from clubs, nations, leagues, and eras, then let the sim judge the XI through attack, midfield, defense, goalkeeping, chemistry, position fit, and tactical balance.</p></section>
      <section><h2>Modes included</h2><p>Play World Cup, Champions League, Euros, AFCON, World XI, Premier League, La Liga, Serie A, Bundesliga, and more.</p></section>
      <section><h2>Free to play</h2><p>UndefeatedXI is free, has no ads, and keeps the focus on building a perfect football XI.</p></section>
      ${popularLinks}
      ${renderFaq()}
    </main>`,
  '/how-to-play': `
    <main>
      <nav><a href="/">UndefeatedXI</a> / <span>How to Play</span></nav>
      <h1>How to Play UndefeatedXI</h1>
      <p>Choose a mode, choose a formation, spin football-history prompts, draft one player per round, and build an XI that can chase 38-0-0 or perfect tournament runs.</p>
      <section><h2>Core loop</h2><p>Spin a club, nation, or era, pick a player, place them in a compatible slot, and repeat until your XI is complete. Some modes lock you to one club, one nation, or one era.</p></section>
      <section><h2>What matters</h2><p>Ratings, chemistry, position fit, tactical balance, squad depth, goalkeeper quality, and mode rules all affect the final simulation.</p></section>
      <section><h2>Records and modes</h2><p>League modes chase 38-0-0 or similar perfect seasons. Tournament modes care about regulation wins, extra time, penalties, and trophy paths across World Cup, Champions League, Euros, AFCON, and more.</p></section>
      ${popularLinks}
    </main>`,
  '/leaderboard': `
    <main>
      <nav><a href="/">UndefeatedXI</a> / <span>Leaderboard</span></nav>
      <h1>UndefeatedXI Leaderboard</h1>
      <p>Compare perfect XI runs, 38-0-0 seasons, invincible records, and unbeaten soccer and football drafts across UndefeatedXI modes.</p>
      <section><h2>One main leaderboard</h2><p>The live app loads one filterable leaderboard with global, mode-specific, and signed-in player views. It keeps the page simple on mobile while still letting you compare World XI, World Cup, Champions League, Premier League, La Liga, Serie A, Bundesliga, and more.</p></section>
      <section><h2>What ranks well</h2><p>Perfect records rank first, but elite near-misses, invincible runs, goal difference, mode difficulty, and team quality still matter. A 37-1-0 season should feel worth sharing.</p></section>
      ${popularLinks}
    </main>`,
  '/privacy': `
    <main>
      <nav><a href="/">UndefeatedXI</a> / <span>Privacy Policy</span></nav>
      <h1>Privacy Policy</h1>
      <p>UndefeatedXI is free to play. There are no ads, no paywall, and no data selling.</p>
      <section><h2>Local saves</h2><p>Preferences, theme, recent runs, and best records may be stored in your browser.</p></section>
      <section><h2>Optional features</h2><p>Accounts, leaderboard submissions, shared runs, and feedback use Supabase only when you choose those features.</p></section>
      <section><h2>Basic analytics</h2><p>The production site uses Vercel Analytics and Speed Insights for aggregate traffic and performance information.</p></section>
    </main>`,
  '/contact': `
    <main>
      <nav><a href="/">UndefeatedXI</a> / <span>Contact and Feedback</span></nav>
      <h1>Feedback</h1>
      <p>Send player corrections, mode ideas, bug reports, and rating arguments from the live app.</p>
    </main>`,
  '/r': `
    <main>
      <nav><a href="/">UndefeatedXI</a> / <span>Shared Result</span></nav>
      <h1>Shared UndefeatedXI Result</h1>
      <p>${escapeHtml(sharedResultDescription)}</p>
      <section><h2>Open the run</h2><p>The live app loads the shared football draft result, including the final XI, W-D-L record, result tier, longest win streak, and tactical reason.</p></section>
      <p><a href="/leaderboard">View the leaderboard</a> or <a href="/">play UndefeatedXI</a>.</p>
    </main>`,
}

const routes = [
  {
    path: '/',
    title: 'UndefeatedXI | Football Draft Simulator and 82-0 Soccer Game',
    description: homeDescription,
    schemas: [
      ['structured-data-game', gameSchema(homeDescription)],
      ['structured-data-website', websiteSchema()],
      ['structured-data-faq', null],
      ['structured-data-breadcrumb', null],
    ],
  },
  {
    path: '/82-0-soccer-game',
    title: 'UndefeatedXI | Official Soccer Version of the 82-0 Game',
    description: soccerDescription,
    schemas: [
      ['structured-data-game', gameSchema(soccerDescription)],
      ['structured-data-website', websiteSchema()],
      ['structured-data-faq', faqSchema()],
      ['structured-data-breadcrumb', breadcrumbSchema('/82-0-soccer-game', '82-0 Soccer Game')],
    ],
  },
  {
    path: '/82-0-football-game',
    title: 'UndefeatedXI | Official Football Version of the 82-0 Game',
    description: footballDescription,
    schemas: [
      ['structured-data-game', gameSchema(footballDescription)],
      ['structured-data-website', websiteSchema()],
      ['structured-data-faq', faqSchema()],
      ['structured-data-breadcrumb', breadcrumbSchema('/82-0-football-game', '82-0 Football Game')],
    ],
  },
  {
    path: '/how-to-play',
    title: 'How to Play UndefeatedXI | Football Draft Simulator',
    description: howDescription,
    schemas: [
      ['structured-data-game', gameSchema()],
      ['structured-data-website', websiteSchema()],
      ['structured-data-faq', null],
      ['structured-data-breadcrumb', breadcrumbSchema('/how-to-play', 'How to Play')],
    ],
  },
  {
    path: '/leaderboard',
    title: 'UndefeatedXI Leaderboard | Perfect Season Football Drafts',
    description: leaderboardDescription,
    schemas: [
      ['structured-data-game', gameSchema()],
      ['structured-data-website', websiteSchema()],
      ['structured-data-faq', null],
      ['structured-data-breadcrumb', breadcrumbSchema('/leaderboard', 'Leaderboard')],
    ],
  },
  {
    path: '/privacy',
    title: 'Privacy Policy | UndefeatedXI',
    description: 'Read the UndefeatedXI privacy policy for this football draft simulator, including local saves, optional accounts, leaderboard runs, and feedback handling.',
    schemas: [
      ['structured-data-game', gameSchema()],
      ['structured-data-website', websiteSchema()],
      ['structured-data-faq', null],
      ['structured-data-breadcrumb', breadcrumbSchema('/privacy', 'Privacy Policy')],
    ],
  },
  {
    path: '/contact',
    title: 'Contact and Feedback | UndefeatedXI',
    description: 'Contact UndefeatedXI or send feedback about player data, bugs, modes, leaderboards, and shareable football draft results.',
    schemas: [
      ['structured-data-game', gameSchema()],
      ['structured-data-website', websiteSchema()],
      ['structured-data-faq', null],
      ['structured-data-breadcrumb', breadcrumbSchema('/contact', 'Contact and Feedback')],
    ],
  },
  {
    path: '/r',
    title: 'Shared UndefeatedXI Result | Football Draft Simulator',
    description: sharedResultDescription,
    robots: 'noindex,follow',
    schemas: [
      ['structured-data-game', gameSchema()],
      ['structured-data-website', websiteSchema()],
      ['structured-data-faq', null],
      ['structured-data-breadcrumb', null],
    ],
  },
]

function setRouteHtml(route) {
  let html = shell
  const canonical = routeUrl(route.path)

  html = setTitle(html, route.title)
  html = setCanonical(html, canonical)
  html = setMeta(html, 'robots', route.robots ?? 'index,follow')
  html = setMeta(html, 'description', route.description)
  html = setMeta(html, 'og:title', route.title, 'property')
  html = setMeta(html, 'og:description', route.description, 'property')
  html = setMeta(html, 'og:type', 'website', 'property')
  html = setMeta(html, 'og:site_name', 'UndefeatedXI', 'property')
  html = setMeta(html, 'og:url', canonical, 'property')
  html = setMeta(html, 'og:image', socialImage, 'property')
  html = setMeta(html, 'og:image:secure_url', socialImage, 'property')
  html = setMeta(html, 'og:image:type', 'image/png', 'property')
  html = setMeta(html, 'og:image:width', '1200', 'property')
  html = setMeta(html, 'og:image:height', '630', 'property')
  html = setMeta(html, 'og:image:alt', 'UndefeatedXI soccer and football draft simulator share image', 'property')
  html = setMeta(html, 'og:locale', 'en_US', 'property')
  html = setMeta(html, 'twitter:card', 'summary_large_image')
  html = setMeta(html, 'twitter:title', route.title)
  html = setMeta(html, 'twitter:description', route.description)
  html = setMeta(html, 'twitter:url', canonical)
  html = setMeta(html, 'twitter:image', socialImage)
  html = setMeta(html, 'twitter:image:alt', 'UndefeatedXI football history draft game share image')

  for (const [id, schema] of route.schemas) {
    if (schema) html = setJsonLd(html, id, schema)
    else html = html.replace(new RegExp(`<script\\s+id="${id}"\\s+type="application\\/ld\\+json">.*?<\\/script>\\s*`, 's'), '')
  }

  const content = routeContent[route.path] ?? routeContent['/']
  return html.replace('<div id="root"></div>', `<div id="root">${content}</div>`)
}

for (const route of routes) {
  const html = setRouteHtml(route)
  if (route.path === '/') {
    writeFileSync(join(distDir, 'index.html'), html)
    continue
  }

  const routeDir = join(distDir, route.path.slice(1))
  mkdirSync(routeDir, { recursive: true })
  writeFileSync(join(routeDir, 'index.html'), html)
  writeFileSync(join(distDir, `${route.path.slice(1)}.html`), html)
}

console.log(`Generated ${routes.length} static route HTML files.`)
