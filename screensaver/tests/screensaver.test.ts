import { expect, mock, test } from 'claude-code/testing'

const START = { cwd: '/', surface: 'desktop', isInteractive: true } as const

test('rotates every 3 minutes, and /screensaver skips, pins, resumes and stops', async ($, on) => {
  const clock = mock.clock(on)
  mock.store(on)
  const scenes: string[] = []
  let cleared = 0
  on('command.register', () => ({ value: { command: 'screensaver' } }))
  on('ui.toast', () => ({ value: undefined }))
  on('theme.set', (_, e) => {
    if (e.backdrop && 'scene' in e.backdrop && e.backdrop.scene) scenes.push(e.backdrop.scene)
    return { value: { isDrawn: true, requestId: 'r' } }
  })
  on('theme.clear', () => {
    cleared++
    return { value: { isDrawn: true, requestId: 'r' } }
  })
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  const run = (args: string) =>
    $.command.run({
      command: 'screensaver',
      args,
      origin: { kind: 'composer' },
      presentation: { isFullscreen: false, columns: 120 },
    })

  await $.session.start(START)
  expect(scenes.length).toBe(1)

  await clock.advance(179_000)
  expect(scenes.length).toBe(1) // not yet: it waits the full 3 minutes
  await clock.advance(1_000)
  expect(scenes.length).toBe(2)
  expect(scenes[1]).not.toBe(scenes[0])

  await run('next')
  expect(scenes.length).toBe(3)

  expect((await run('nope')).text).toContain('Pick one of')
  expect(scenes.length).toBe(3)

  await run('hong-kong')
  expect(scenes.at(-1)).toBe('hong-kong')
  await clock.advance(540_000)
  expect(scenes.at(-1)).toBe('hong-kong') // pinned: the rotation holds

  await run('auto')
  await clock.advance(180_000)
  expect(scenes.length).toBe(6)

  await run('off')
  expect(cleared).toBe(1)
  await clock.advance(360_000)
  expect(scenes.length).toBe(6)
})

test('a new chat carries on the schedule another chat left, instead of picking a new scene', async ($, on) => {
  // Another chat put Hong Kong up a minute ago.
  const clock = mock.clock(on, { now: 60_000 })
  mock.store(on, { schedule: { id: 'hong-kong', since: 0, pinned: false, off: false } })
  const scenes: string[] = []
  on('command.register', () => ({ value: { command: 'screensaver' } }))
  on('ui.toast', () => ({ value: undefined }))
  on('theme.set', (_, e) => {
    if (e.backdrop && 'scene' in e.backdrop && e.backdrop.scene) scenes.push(e.backdrop.scene)
    return { value: { isDrawn: true, requestId: 'r' } }
  })
  on('session.start', (_, e) => ({ cwd: e.cwd }))

  await $.session.start(START)
  expect(scenes).toEqual(['hong-kong'])
  await clock.advance(119_000)
  expect(scenes).toEqual(['hong-kong'])
  await clock.advance(1_000) // 3 minutes after it came up in the other chat, not after this one opened
  expect(scenes).toEqual(['hong-kong', 'nan-lian'])
})

test('a pin made in another chat holds in a new one', async ($, on) => {
  const clock = mock.clock(on, { now: 10_000_000 })
  mock.store(on, { schedule: { id: 'blueprint', since: 0, pinned: true, off: false } })
  const scenes: string[] = []
  on('command.register', () => ({ value: { command: 'screensaver' } }))
  on('ui.toast', () => ({ value: undefined }))
  on('theme.set', (_, e) => {
    if (e.backdrop && 'scene' in e.backdrop && e.backdrop.scene) scenes.push(e.backdrop.scene)
    return { value: { isDrawn: true, requestId: 'r' } }
  })
  on('session.start', (_, e) => ({ cwd: e.cwd }))

  await $.session.start(START)
  await clock.advance(600_000)
  expect(scenes).toEqual(['blueprint'])
})

test('turned off in another chat, a new chat keeps the app look', async ($, on) => {
  const clock = mock.clock(on, { now: 500_000 })
  mock.store(on, { schedule: { id: 'night-reef', since: 0, pinned: false, off: true } })
  const scenes: string[] = []
  on('command.register', () => ({ value: { command: 'screensaver' } }))
  on('ui.toast', () => ({ value: undefined }))
  on('theme.set', (_, e) => {
    if (e.backdrop && 'scene' in e.backdrop && e.backdrop.scene) scenes.push(e.backdrop.scene)
    return { value: { isDrawn: true, requestId: 'r' } }
  })
  on('session.start', (_, e) => ({ cwd: e.cwd }))

  await $.session.start(START)
  await clock.advance(600_000)
  expect(scenes).toEqual([])
})
