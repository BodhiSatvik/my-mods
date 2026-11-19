import { expect, mock, test } from 'claude-code/testing'

test('rotates every minute, and /screensaver skips, pins, resumes and stops', async ($, on) => {
  const clock = mock.clock(on)
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

  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  expect(scenes.length).toBe(1)

  await clock.advance(60_000)
  expect(scenes.length).toBe(2)
  expect(scenes[1]).not.toBe(scenes[0])

  await run('next')
  expect(scenes.length).toBe(3)

  expect((await run('nope')).text).toContain('Pick one of')
  expect(scenes.length).toBe(3)

  await run('hong-kong')
  expect(scenes.at(-1)).toBe('hong-kong')
  await clock.advance(180_000)
  expect(scenes.at(-1)).toBe('hong-kong') // pinned: the minute timer is off

  await run('auto')
  await clock.advance(60_000)
  expect(scenes.length).toBe(6)

  await run('off')
  expect(cleared).toBe(1)
  await clock.advance(120_000)
  expect(scenes.length).toBe(6)
})
