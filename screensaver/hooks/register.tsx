import type { EngineInterface, Register } from 'claude-code'

import { THEMES } from './themes'
import type { Theme } from './themes'

const EVERY_MS = 180_000 // a new scene every 3 minutes, like a screensaver
const CHECK_MS = 15_000 // how often a chat re-reads the shared schedule, so every open chat stays in step
const KEY = 'schedule'

const NAMES = THEMES.map(t => t.id).join(', ')

/**
 * Shared by every chat through $.store, so a new chat carries on where the last one was:
 * scene `id` came up at `since` and the rotation runs on from there, unless pinned or off.
 */
type Schedule = { id: string; since: number; pinned: boolean; off: boolean }

// This chat's own: the scene it draws now and its check timer. A reload starts both over from the schedule.
let shown: string | undefined
let tick: { cancel: () => void } | undefined
const built = new Map<string, string>()

/** A scene's SVG, built once. */
function svgOf(t: Theme): string {
  const ready = built.get(t.id)
  if (ready !== undefined) return ready
  const source = t.scene()
  built.set(t.id, source)
  return source
}

async function load($: EngineInterface): Promise<Schedule> {
  const s = (await $.store.get(KEY)) as Partial<Schedule> | undefined
  if (typeof s?.id === 'string' && typeof s.since === 'number') return { id: s.id, since: s.since, pinned: s.pinned === true, off: s.off === true }
  const fresh: Schedule = { id: THEMES[Math.floor(Math.random() * THEMES.length)]!.id, since: await $.clock.now(), pinned: false, off: false }
  await $.store.set(KEY, fresh)
  return fresh
}

/** The scene the schedule has up at `now`, as an index into THEMES. */
function due(s: Schedule, now: number): number {
  const i = Math.max(0, THEMES.findIndex(t => t.id === s.id)) // a scene since removed falls back to the first
  return s.pinned ? i : (i + Math.floor(Math.max(0, now - s.since) / EVERY_MS)) % THEMES.length
}

function show($: EngineInterface, i: number) {
  const t = THEMES[i]!
  svgOf(t) // build before the switch: a backdrop answered late is drawn still
  shown = t.id
  return $.theme.set({
    ...(t.colors !== undefined && { colors: t.colors }),
    ...(t.scheme !== undefined && { overrideColorScheme: t.scheme }),
    backdrop: { scene: t.id, glass: t.glass },
  })
}

/** Start the schedule over from scene `i`, now, for every chat, and draw it here. */
async function restart($: EngineInterface, i: number, pinned: boolean) {
  const s: Schedule = { id: THEMES[i]!.id, since: await $.clock.now(), pinned, off: false }
  await $.store.set(KEY, s)
  return show($, i)
}

/** Bring this chat in line with the schedule: the scene that's due, or the app's own look when it's off. */
async function sync($: EngineInterface): Promise<void> {
  const s = await load($)
  if (s.off) {
    if (shown === undefined) return
    shown = undefined
    await $.theme.clear()
    return
  }
  const i = due(s, await $.clock.now())
  if (THEMES[i]!.id !== shown) await show($, i)
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'screensaver',
      description: 'Rotating backdrops: /screensaver [next | <scene> | auto | off]',
    })
    const unpainted = THEMES.flatMap(t => (t.problems ?? []).filter(p => p.startsWith("Desktop won't paint")).map(p => `${t.name}: ${p}`))
    if (unpainted[0] !== undefined) $.ui.toast(unpainted[0])
    shown = undefined
    await sync($)
    tick?.cancel()
    tick = $.clock.every(CHECK_MS, () => void sync($).catch(() => undefined))

    return next(e)
  })

  on('command.run', { command: 'screensaver' }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()
    const s = await load($)
    const cur = due(s, await $.clock.now())
    const name = (i: number) => THEMES[i]!.name

    if (arg === '') {
      const state = s.off ? 'Screensaver is off' : `Showing ${name(cur)}${s.pinned ? ', pinned' : ', rotating every 3 minutes'}`
      return { text: `${state}. Scenes: ${NAMES}. Use /screensaver next, /screensaver <scene>, /screensaver auto or /screensaver off.` }
    }
    if (arg === 'off') {
      await $.store.set(KEY, { ...s, off: true } satisfies Schedule)
      shown = undefined
      await $.theme.clear()
      return { text: 'Screensaver off in every chat, back to the app look. /screensaver auto turns it back on.' }
    }
    if (arg === 'auto') {
      const i = (cur + 1) % THEMES.length
      await restart($, i, false)
      return { text: `Rotating every 3 minutes. Now showing ${name(i)}.` }
    }
    if (arg === 'next') {
      const i = (cur + 1) % THEMES.length
      const set = await restart($, i, s.pinned) // a new scene gets its full 3 minutes
      return { text: set.isDrawn ? `Now showing ${name(i)}.` : `Switched to ${name(i)}, but nothing draws here: ${set.reason}` }
    }
    const i = THEMES.findIndex(t => t.id === arg || t.name.toLowerCase() === arg)
    if (i < 0) return { text: `No scene called "${arg}". Pick one of: ${NAMES}.` }
    await restart($, i, true)
    return { text: `Pinned ${name(i)}. /screensaver auto resumes the rotation.` }
  })

  // Not async on purpose: the scene is built before the switch, so this answers at once.
  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if (e.surface !== 'desktop' && e.surface !== 'mobile') return next(e)
    const t = THEMES.find(x => x.id === e.props.scene)
    if (t === undefined || e.props.plugin !== 'screensaver') return next(e)
    const { Svg } = $.ui.resolve(e)

    return <Svg source={svgOf(t)} alt={t.alt} isInteractive />
  })
}
