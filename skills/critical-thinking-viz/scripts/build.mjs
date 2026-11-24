#!/usr/bin/env node
// Build the outputs of the critical-thinking-viz skill from one data file.
//
//   node build.mjs page <data.json> <out.html>   interactive page (publish as an Artifact or open locally)
//   node build.mjs card <data.json> <out.png>    1600x900 social card, rendered at 2x with headless Chrome/Edge
//   node build.mjs both <data.json> <out-dir>    page.html + card.png in out-dir
//
// Set CHROME_PATH to pick the browser used for the card.
import { readFileSync, writeFileSync, existsSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs'
import { dirname, join, resolve, basename } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'

const here = dirname(fileURLToPath(import.meta.url))
const tpl = (name) => readFileSync(join(here, '..', 'templates', name), 'utf8')

function fill(template, data) {
  // JSON inside <script> must not close the tag early.
  const json = JSON.stringify(data).replace(/<\/(script)/gi, '<\\/$1')
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
  return template
    .replace('/*__DATA__*/', () => json)
    .replace('/*__VENN__*/', () => tpl('venn.js'))
    .replaceAll('__TITLE__', esc(data.pageTitle || data.title || 'Argument map'))
    .replaceAll('__LANG__', esc(data.lang || 'en'))
}

function check(data) {
  const errs = []
  if (!data.title) errs.push('title is required')
  if (!data.claim?.text) errs.push('claim.text is required')
  const ps = data.argument?.premises
  if (!Array.isArray(ps) || ps.length < 2) errs.push('argument.premises needs at least 2 items')
  else {
    if (ps.length > 5) errs.push('argument.premises: at most 5 (the card shows the first 4)')
    ps.forEach((p, i) => {
      if (!p.id || !p.text) errs.push(`argument.premises[${i}] needs id and text`)
      if (!['stated', 'hidden'].includes(p.kind)) errs.push(`argument.premises[${i}].kind must be "stated" or "hidden"`)
    })
    if (!ps.some((p) => p.kind === 'hidden')) errs.push('at least one premise should be kind "hidden"')
  }
  if (!data.argument?.conclusion?.text) errs.push('argument.conclusion.text is required')
  for (const [i, v] of (data.venn || []).entries())
    if (!['inside', 'overlap', 'disjoint'].includes(v.layout)) errs.push(`venn[${i}].layout must be inside | overlap | disjoint`)
  const ids = new Set((ps || []).map((p) => p.id))
  for (const [i, t] of (data.tests || []).entries())
    if (t.target && !ids.has(t.target)) errs.push(`tests[${i}].target "${t.target}" is not a premise id`)
  if (errs.length) {
    console.error('Data file problems:\n- ' + errs.join('\n- '))
    process.exit(1)
  }
}

function findBrowser() {
  const cands = [
    process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/microsoft-edge',
  ].filter(Boolean)
  const hit = cands.find((p) => existsSync(p))
  if (!hit) {
    console.error('No Chrome or Edge found. Set CHROME_PATH to a Chromium-based browser.')
    process.exit(1)
  }
  return hit
}

function buildPage(data, out) {
  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, fill(tpl('page.html'), data))
  console.log('page →', out)
}

function buildCard(data, out) {
  mkdirSync(dirname(out), { recursive: true })
  const html = out.replace(/\.png$/i, '') + '.card.html'
  writeFileSync(html, fill(tpl('card.html'), data))
  const profile = mkdtempSync(join(tmpdir(), 'ctv-'))
  const r = spawnSync(findBrowser(), [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', `--user-data-dir=${profile}`,
    '--force-device-scale-factor=2', '--window-size=1600,900', '--virtual-time-budget=6000',
    `--screenshot=${out}`, pathToFileURL(html).href,
  ], { stdio: 'ignore', timeout: 90000 })
  try { rmSync(profile, { recursive: true, force: true }) } catch {}
  if (!existsSync(out)) {
    console.error('Screenshot failed (exit ' + r.status + '). The card HTML is at ' + html)
    process.exit(1)
  }
  console.log('card →', out, '(source', basename(html) + ')')
}

const [cmd, dataPath, outArg] = process.argv.slice(2)
if (!['page', 'card', 'both'].includes(cmd) || !dataPath || !outArg) {
  console.error('Usage: node build.mjs page|card|both <data.json> <out>')
  process.exit(2)
}
const data = JSON.parse(readFileSync(dataPath, 'utf8'))
check(data)
const out = resolve(outArg)
if (cmd === 'page') buildPage(data, out)
else if (cmd === 'card') buildCard(data, out)
else {
  buildPage(data, join(out, 'page.html'))
  buildCard(data, join(out, 'card.png'))
}
