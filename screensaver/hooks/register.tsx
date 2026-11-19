import type { EngineInterface, Register } from 'claude-code'

import { THEMES } from './themes'
import type { Theme } from './themes'

const EVERY_MS = 60_000 // one scene per minute, like a screensaver

const NAMES = THEMES.map(t => t.id).join(', ')

// Module state: a reload starts the rotation over, which is fine for a screensaver.
let at = 0
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

async function show($: EngineInterface, i: number) {
  at = (i + THEMES.length) % THEMES.length
  const t = THEMES[at]!
  svgOf(t) // build before the switch: a backdrop answered late is drawn still
  return $.theme.set({
    ...(t.colors !== undefined && { colors: t.colors }),
    ...(t.scheme !== undefined && { overrideColorScheme: t.scheme }),
    backdrop: { scene: t.id, glass: t.glass },
  })
}

function rotate($: EngineInterface) {
  tick?.cancel()
  tick = $.clock.every(EVERY_MS, () => void show($, at + 1))
}

function stop() {
  tick?.cancel()
  tick = undefined
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'screensaver',
      description: 'Rotating backdrops: /screensaver [next | <scene> | auto | off]',
    })
    const unpainted = THEMES.flatMap(t => (t.problems ?? []).filter(p => p.startsWith("Desktop won't paint")).map(p => `${t.name}: ${p}`))
    if (unpainted[0] !== undefined) $.ui.toast(unpainted[0])
    await show($, Math.floor(Math.random() * THEMES.length))
    rotate($)

    return next(e)
  })

  on('command.run', { command: 'screensaver' }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()
    const now = () => THEMES[at]!.name

    if (arg === '') {
      return { text: `Showing ${now()}${tick ? ', rotating every minute' : ', pinned'}. Scenes: ${NAMES}. Use /screensaver next, /screensaver <scene>, /screensaver auto or /screensaver off.` }
    }
    if (arg === 'off') {
      stop()
      await $.theme.clear()
      return { text: 'Screensaver off, back to the app look. /screensaver auto turns it back on.' }
    }
    if (arg === 'auto') {
      await show($, at + 1)
      rotate($)
      return { text: `Rotating every minute. Now showing ${now()}.` }
    }
    if (arg === 'next') {
      const set = await show($, at + 1)
      if (tick) rotate($) // give the new scene its full minute
      return { text: set.isDrawn ? `Now showing ${now()}.` : `Switched to ${now()}, but nothing draws here: ${set.reason}` }
    }
    const i = THEMES.findIndex(t => t.id === arg || t.name.toLowerCase() === arg)
    if (i < 0) return { text: `No scene called "${arg}". Pick one of: ${NAMES}.` }
    stop()
    await show($, i)
    return { text: `Pinned ${now()}. /screensaver auto resumes the rotation.` }
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
