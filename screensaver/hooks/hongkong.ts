// Hong Kong: Victoria Harbour at night from the Kowloon promenade, in pixel art. An original scene for this mod.
// The Peak in mist, the island's towers with a laser show and a rainbow-banded tower, a red-sailed junk and a
// ferry crossing, fireworks now and then, and neon signs (香港, 牛丸, 大王) hanging over the promenade.

import { makeColors } from './make-colors.js'

const P = 4 // one art pixel in viewBox units: the art is 400 x 250 pixels
const GW = 400
const GH = 250
const SHORE = 175 // the waterline, in art pixels

function rng(seed: number): () => number {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const R = (x: number, y: number, w: number, h: number, fill: string, extra = '') =>
  `<rect x="${x * P}" y="${y * P}" width="${w * P}" height="${h * P}" fill="${fill}"${extra}/>`
const cell = (x: number, y: number, w = 1) => `M${x * P} ${y * P}h${w * P}v${P}h${-w * P}z`
const pts = (list: [number, number][]) => list.map(([x, y]) => `${x * P},${y * P}`).join(' ')
const pick = <T>(r: () => number, items: readonly T[]) => items[Math.floor(r() * items.length)]!

// Window light: mostly warm, some cool office white, a little neon.
const LIGHTS = ['#ffd98a', '#ffd98a', '#ffd98a', '#ffe9b8', '#cfe8ff', '#cfe8ff', '#ff9ac9', '#7fe9ff'] as const

// Pixel glyphs for the neon signs, one string per row.
const GLYPH: Record<string, string[]> = {
  香: ['......###..', '..#####....', '.....#.....', '###########', '....###....', '..##.#.##..', '##...#...##', '..#######..', '..#.....#..', '..#######..', '..#.....#..', '..#######..'],
  港: ['#....#..#..', '.#...#..#..', '...########', '.....#..#..', '#..########', '.#...#...#.', '....#.....#', '..#..#####.', '..#......#.', '.#...#####.', '.#...#....#', '#.....####.'],
  牛: ['..#.#....', '.##.#....', '.#######.', '#...#....', '....#....', '#########', '....#....', '....#....', '....#....'],
  丸: ['..#......', '..#......', '######...', '..#..#...', '..##.#...', '.#..##...', '.#...#..#', '#....#..#', '......##.'],
  大: ['....#....', '....#....', '#########', '....#....', '...#.#...', '...#.#...', '..#...#..', '.#.....#.', '#.......#'],
  王: ['#########', '....#....', '....#....', '....#....', '.#######.', '....#....', '....#....', '....#....', '#########'],
}
function glyph(ch: string, x: number, y: number): string {
  return (GLYPH[ch] ?? []).flatMap((row, j) => [...row].map((c, i) => (c === '#' ? cell(x + i, y + j) : ''))).join('')
}

// One neon sign: a dark box, a neon border, the glyphs, and a soft glow behind.
function sign(x: number, y: number, w: number, h: number, color: string, core: string, glyphs: string, glowId: string, delay: number): string {
  const border = [cell(x, y, w), cell(x, y + h - 1, w), ...Array.from({ length: h - 2 }, (_, j) => cell(x, y + 1 + j) + cell(x + w - 1, y + 1 + j))].join('')
  return (
    `<ellipse cx="${(x + w / 2) * P}" cy="${(y + h / 2) * P}" rx="${(w * 0.5 + 9) * P}" ry="${(h * 0.5 + 9) * P}" fill="url(#${glowId})"/>` +
    R(x, y, w, h, '#14060f') +
    `<g class="flick" style="animation-delay:-${delay}s"><path fill="${color}" d="${border}"/><path fill="${core}" d="${glyphs}"/></g>`
  )
}

// The Peak's ridge as one stepped silhouette, from a height for each column.
function ridge(height: (x: number) => number, fill: string): string {
  let d = `M0 ${SHORE * P}`
  for (let x = 0; x <= GW; x++) d += `V${Math.round(height(x)) * P}H${(x + 1) * P}`
  return `<path fill="${fill}" d="${d}V${SHORE * P}Z"/>`
}
const bump = (x: number, at: number, width: number) => Math.exp(-(((x - at) / width) ** 2))

type Building = { x: number; w: number; top: number; fill: string }

function scene(): string {
  const r = rng(852)
  const windows = new Map<string, string>()
  const addWindow = (color: string, x: number, y: number) => windows.set(color, (windows.get(color) ?? '') + cell(x, y))
  const reflA = new Map<string, string>()
  const reflB = new Map<string, string>()
  const reflect = (color: string, x: number, y: number) => {
    if (r() > 0.4) return
    const depth = SHORE - y
    const into = (m: Map<string, string>, jitter: number) => {
      const ry = Math.round(SHORE + 2 + depth * 0.42 + jitter)
      if (ry < GH - 16) m.set(color, (m.get(color) ?? '') + cell(x + Math.round(r() * 2 - 1), ry, 1 + Math.floor(r() * 3)))
    }
    into(reflA, r() * 2)
    into(reflB, r() * 3)
  }
  const lightUp = (b: Building, chance: number, palette: readonly string[] = LIGHTS, isReflected = true) => {
    for (let y = b.top + 2; y < SHORE - 1; y += 2)
      for (let x = b.x + 1; x < b.x + b.w - 1; x += 2)
        if (r() < chance) {
          const color = pick(r, palette)
          addWindow(color, x, y)
          if (isReflected) reflect(color, x, y)
        }
  }

  // Sky in bands, deep navy to a magenta haze at the harbour.
  const SKY = ['#06071a', '#090a20', '#0d0c27', '#120f30', '#18123a', '#201544', '#2b184e', '#391b57', '#4a1e5d', '#5d2262', '#6f2864']
  const sky = SKY.map((c, i) => R(0, i * 16, GW, 16, c)).join('')

  let stars = ''
  let twinkles = ''
  for (let i = 0; i < 150; i++) {
    const x = Math.floor(r() * GW)
    const y = Math.floor(r() * 105)
    if (Math.abs(x - 248) < 22 && Math.abs(y - 36) < 22) continue
    if (r() < 0.3) twinkles += R(x, y, 1, 1, '#fff6e0', ` class="tw" style="animation-delay:-${(r() * 6).toFixed(1)}s"`)
    else stars += cell(x, y)
  }

  // The moon, with a halo and two thin clouds across it.
  const moon = (() => {
    const cx = 248
    const cy = 36
    let d = ''
    for (let y = -13; y <= 13; y++) {
      const half = Math.floor(Math.sqrt(13.5 * 13.5 - y * y))
      d += cell(cx - half, cy + y, half * 2 + 1)
    }
    const craters = [[-4, -3, 3], [3, 2, 4], [-2, 6, 2], [5, -6, 2]].map(([dx, dy, s]) => R(cx + dx!, cy + dy!, s!, s! - 1, '#ddd2b2')).join('')
    return `<circle cx="${cx * P}" cy="${cy * P}" r="${34 * P}" fill="url(#halo)"/><path fill="#f6eed6" d="${d}"/>${craters}`
  })()
  const cloud = (x: number, y: number, w: number) => R(x, y, w, 2, '#2a1f52') + R(x + 4, y - 1, w - 10, 1, '#3b2c6b') + R(x + 2, y + 2, w - 6, 1, '#1f1842')
  const clouds = `<g class="cloud">${cloud(214, 40, 70)}${cloud(150, 58, 48)}</g><g class="cloud c2">${cloud(300, 24, 56)}</g>`

  // Victoria Peak: a far ridge, a lower one in front, mist between, and the Peak's lookout on top.
  const far = (x: number) => 136 - 46 * bump(x, 172, 64) - 26 * bump(x, 305, 52) - 14 * bump(x, 55, 38) + 2 * Math.sin(x / 7)
  const near = (x: number) => 150 - 14 * bump(x, 115, 70) - 12 * bump(x, 330, 60) + 1.5 * Math.sin(x / 5)
  const peakTop = Math.round(far(172))
  const lookout = R(166, peakTop - 4, 13, 2, '#2c2350') + R(168, peakTop - 2, 9, 3, '#211a40') + R(167, peakTop - 4, 11, 1, '#ffd98a', ' opacity=".7"')
  let slope = ''
  for (let i = 0; i < 70; i++) {
    const x = Math.floor(r() * GW)
    const y = Math.round(near(x)) + 2 + Math.floor(r() * 18)
    if (y < SHORE - 30) slope += cell(x, y)
  }
  const mist = `<g class="mist"><rect x="${-40 * P}" y="${118 * P}" width="${260 * P}" height="${10 * P}" fill="#c9b8ff" opacity=".09"/><rect x="${200 * P}" y="${126 * P}" width="${240 * P}" height="${7 * P}" fill="#c9b8ff" opacity=".07"/></g>`

  // Far towers on the slope, then the island's waterfront towers.
  let farLayer = ''
  for (let x = 0; x < GW; ) {
    const w = 5 + Math.floor(r() * 7)
    const top = Math.round(near(x)) - 2 - Math.floor(r() * 14)
    const b = { x, w, top, fill: '#110d27' }
    farLayer += R(x, top, w, SHORE - top, b.fill)
    lightUp(b, 0.16, ['#ffd98a', '#e9cf9a', '#b9d4f2'], false)
    x += w + 1
  }
  const HEROES: [number, number][] = [[88, 108], [144, 160], [204, 218], [278, 300]]
  let front = ''
  const tall: number[][] = []
  for (let x = 0; x < GW; ) {
    const w = 6 + Math.floor(r() * 11)
    const isHero = HEROES.some(([a, b]) => x + w > a && x < b)
    const top = isHero ? SHORE - 30 : 122 + Math.floor(r() * 36)
    const b = { x, w, top, fill: pick(r, ['#151131', '#181434', '#1b1638', '#13102b']) }
    front += R(x, top, w, SHORE - top, b.fill)
    if (r() < 0.35) front += R(x + 1, top - 2, w - 2, 2, b.fill)
    lightUp(b, 0.3)
    if (top < 134) tall.push([x + Math.floor(w / 2), top - (r() < 0.5 ? 6 : 1)])
    if (top < 134 && r() < 0.6) front += R(x + Math.floor(w / 2), top - 6, 1, 6, '#2a2346')
    x += w + (r() < 0.3 ? 1 : 0)
  }
  const aircraft = tall.map(([x, y], i) => R(x!, y!, 1, 1, '#ff3b3b', ` class="blink" style="animation-delay:-${(i * 0.7) % 2.6}s"`)).join('')

  // Hero A: a tall tower with a crown of fins, lit at its edges.
  let heroA = R(90, 64, 16, SHORE - 64, '#1b2544') + R(92, 52, 12, 12, '#1d2a4c')
  heroA += [47, 45, 43, 43, 45, 47].map((top, i) => R(92 + i * 2, top, 1, 52 - top, '#bfe0ff')).join('')
  heroA += R(90, 64, 1, SHORE - 64, '#6fa8ff', ' opacity=".85"') + R(105, 64, 1, SHORE - 64, '#6fa8ff', ' opacity=".85"') + R(92, 52, 12, 1, '#9fcbff')
  lightUp({ x: 91, w: 14, top: 64, fill: '' }, 0.5, ['#cfe8ff', '#e8f4ff', '#a9d0ff'])
  heroA += R(97, 41, 1, 2, '#ff3b3b', ' class="blink"')

  // Hero B: an angular tower in white crossed bracing, with twin masts.
  const bShape: [number, number][] = [[280, SHORE], [280, 104], [289, 95], [289, 86], [298, 72], [298, SHORE]]
  let bracing = ''
  for (let k = 0; k < 5; k++) {
    const y0 = (SHORE - k * 22) * P
    const y1 = (SHORE - (k + 1) * 22) * P
    bracing += `M${280 * P} ${y0}L${298 * P} ${y1}M${298 * P} ${y0}L${280 * P} ${y1}`
  }
  const heroB =
    `<polygon points="${pts(bShape)}" fill="#1a1e36"/>` +
    `<path d="${bracing}" stroke="#e8eeff" stroke-width="3" opacity=".75" clip-path="url(#bclip)"/>` +
    `<polyline points="${pts(bShape)}" fill="none" stroke="#a9c4ff" stroke-width="3" opacity=".7"/>` +
    R(296, 58, 1, 14, '#c9d6ff') + R(293, 63, 1, 12, '#c9d6ff') + R(296, 57, 1, 1, '#ff3b3b', ' class="blink"') + R(293, 62, 1, 1, '#ff3b3b', ' class="blink" style="animation-delay:-1.3s"')

  // Hero C: a pyramid-topped tower whose crown changes colour.
  const crown = ['#ffcf6b', '#ff6fb5', '#5fe3ff'].map((c, i) => R(146, 74, 12, 4, c, ` class="cycle" style="animation-delay:-${i * 3}s"`)).join('')
  let heroC = R(146, 78, 12, SHORE - 78, '#1c1733') + `<polygon points="${pts([[146, 78], [152, 67], [158, 78]])}" fill="#2a2244"/>` + R(146, 74, 12, 4, '#ffcf6b') + crown
  heroC += R(152, 56, 1, 12, '#ffe9b8') + R(146, 78, 1, SHORE - 78, '#ffcf6b', ' opacity=".6"') + R(157, 78, 1, SHORE - 78, '#ffcf6b', ' opacity=".6"')
  lightUp({ x: 147, w: 10, top: 80, fill: '' }, 0.45, ['#ffd98a', '#ffe9b8'])

  // Hero D: a slim tower in rainbow neon bands that chase up it.
  const BANDS = ['#ff4f6d', '#ffcf4d', '#4fe38a', '#4fc8ff', '#b06bff']
  let heroD = R(206, 86, 10, SHORE - 86, '#171332') + R(207, 82, 8, 4, '#211b40')
  for (let i = 0; i < 15; i++) {
    heroD += R(206, 88 + i * 6, 10, 1, BANDS[i % BANDS.length]!, ' opacity=".55"')
    BANDS.forEach((c, k) => {
      heroD += R(206, 88 + i * 6, 10, 1, c, ` class="band" style="animation-delay:-${((i * 0.3 + k * 2) % 10).toFixed(1)}s"`)
    })
  }

  // The laser show, from the hero towers' tops.
  const beam = (x: number, y: number, angle: number, color: string, i: number) =>
    `<g transform="translate(${x * P} ${y * P}) rotate(${angle})"><g class="las" style="animation-delay:-${i * 3.7}s;animation-duration:${16 + i * 2.5}s">` +
    `<line x1="0" y1="0" x2="0" y2="-1500" stroke="${color}" stroke-width="10" opacity=".1"/><line class="lp" x1="0" y1="0" x2="0" y2="-1500" stroke="${color}" stroke-width="2.5" opacity=".7"/></g></g>`
  const lasers = [
    beam(98, 43, -34, '#3dffb0', 0), beam(98, 43, 18, '#4fd8ff', 1), beam(296, 57, -20, '#ff4fd8', 2),
    beam(296, 57, 36, '#3dffb0', 3), beam(152, 56, -6, '#b26bff', 4), beam(211, 82, 26, '#4fd8ff', 5),
  ].join('')

  // Fireworks over the harbour, one at a time.
  const burst = (cx: number, cy: number, colors: readonly string[], delay: number) => {
    let d = ''
    let inner = ''
    for (let k = 0; k < 22; k++) {
      const a = (k / 22) * Math.PI * 2
      d += cell(Math.round(cx + Math.cos(a) * 16), Math.round(cy + Math.sin(a) * 16))
      if (k % 2 === 0) inner += cell(Math.round(cx + Math.cos(a + 0.2) * 9), Math.round(cy + Math.sin(a + 0.2) * 9))
    }
    return `<g class="fw" style="animation-delay:-${delay}s"><path fill="${colors[0]}" d="${d}"/><path fill="${colors[1]}" d="${inner}"/>${R(cx, cy, 1, 1, '#fff6e0')}</g>`
  }
  const fireworks = burst(128, 30, ['#ffcf4d', '#fff1b8'], 0) + burst(338, 44, ['#ff6fb5', '#ffd0e6'], 5.5)

  // The harbour: water, the island's lit waterfront, reflections that shimmer.
  const shoreLights = Array.from({ length: Math.floor(GW / 3) }, (_, i) => cell(i * 3 + 1, SHORE - 1)).join('')
  const asPaths = (m: Map<string, string>) => [...m].map(([c, d]) => `<path fill="${c}" d="${d}"/>`).join('')
  let streaks = ''
  for (let y = SHORE + 2; y < 226; y += 2) {
    streaks += cell(90 + Math.round(r() * 2), y) + cell(104 + Math.round(r() * 2), y)
  }
  let rainbow = ''
  for (let y = SHORE + 2; y < 222; y += 3) rainbow += R(206 + Math.round(r() * 3), y, 3 + Math.floor(r() * 4), 1, pick(r, BANDS))
  let moonPath = ''
  for (let y = SHORE + 3; y < 234; y += 3) {
    const w = 2 + Math.floor(r() * 6)
    moonPath += cell(248 - Math.floor(w / 2) + Math.round(r() * 2 - 1), y, w)
  }

  // The junk: red batten sails, a lantern at the stern.
  const junkArt =
    `<polygon points="${pts([[0, 20], [35, 20], [31, 25], [4, 25]])}" fill="#3b2116"/>` + R(1, 20, 34, 1, '#5a3422') + R(26, 17, 6, 3, '#4a2a1c') +
    R(10, 3, 1, 17, '#2a1810') + R(20, 0, 1, 20, '#2a1810') + R(29, 9, 1, 11, '#2a1810') +
    `<polygon points="${pts([[11, 3], [19, 1], [21, 18], [11, 18]])}" fill="#c23a3a"/>` +
    `<polygon points="${pts([[2, 8], [9, 6], [10, 18], [3, 18]])}" fill="#b8343a"/>` +
    `<polygon points="${pts([[26, 10], [29, 9], [31, 17], [26, 17]])}" fill="#a82f36"/>` +
    `<path fill="#7d1f24" d="${[5, 8, 11, 14, 17].map(y => cell(12, y, 8)).join('')}${[10, 13, 16].map(y => cell(3, y, 6)).join('')}"/>` +
    R(34, 18, 1, 1, '#ffcf6b') + `<circle cx="${34.5 * P}" cy="${18.5 * P}" r="${5 * P}" fill="url(#warm)"/>`
  const junk = `<g transform="translate(${236 * P} ${186 * P})"><g class="junk"><g class="bob">${junkArt}</g></g></g>`

  // The ferry: green hull, white upper deck with lit windows.
  let ferryWindows = ''
  for (let x = 4; x < 40; x += 2) ferryWindows += cell(x, 4)
  const ferryArt =
    R(2, 1, 40, 1, '#2d6b4f') + R(1, 2, 42, 4, '#e6eaee') + `<path fill="#ffd98a" d="${ferryWindows}"/>` + R(0, 6, 44, 1, '#f4f6f8') +
    R(0, 7, 44, 3, '#2d6b4f') + `<polygon points="${pts([[0, 10], [44, 10], [41, 12], [3, 12]])}" fill="#1f4d39"/>` + R(21, -3, 1, 4, '#c9d0d6') + R(22, -3, 2, 1, '#ff4f6d') +
    R(0, 8, 1, 1, '#ff3b3b') + R(43, 8, 1, 1, '#4fe38a')
  const ferry = `<g transform="translate(${60 * P} ${212 * P})"><g class="ferry"><g class="bob b2">${ferryArt}</g></g></g>`

  // Kowloon in front: two dark buildings at the edges with their neon, the promenade with its lamps.
  let left = R(0, 112, 32, GH - 112, '#0a0814') + R(32, 112, 1, GH - 112, '#1c1630')
  let right = R(372, 124, 28, GH - 124, '#0a0814') + R(371, 124, 1, GH - 124, '#1c1630')
  const ac = (x0: number, x1: number, y0: number) => {
    let s = ''
    for (let y = y0; y < 232; y += 7)
      for (let x = x0; x < x1; x += 6) {
        if (r() < 0.5) s += R(x, y, 2, 2, pick(r, ['#ffd98a', '#7fe9ff', '#ffb38a', '#2a2240']), ' opacity=".85"')
        if (r() < 0.4) s += R(x + 2, y + 2, 2, 1, '#2a2638')
      }
    return s
  }
  left += ac(2, 30, 116)
  right += ac(375, 398, 128)
  const signs =
    R(32, 130, 4, 1, '#3a3350') + sign(36, 124, 15, 30, '#ff3b5c', '#ffd0dc', glyph('香', 38, 126) + glyph('港', 38, 140), 'gRed', 0) +
    sign(12, 160, 13, 25, '#3fe6ff', '#d6fbff', glyph('牛', 14, 162) + glyph('丸', 14, 173), 'gCyan', 3) +
    R(369, 141, 3, 1, '#3a3350') + sign(346, 136, 24, 13, '#ffb84d', '#fff0c8', glyph('大', 348, 138) + glyph('王', 359, 138), 'gAmber', 6)
  let promenade = R(0, 238, GW, 12, '#07060e') + R(0, 234, GW, 1, '#2c2542')
  for (let x = 0; x < GW; x += 10) promenade += R(x, 234, 1, 4, '#2c2542')
  for (const x of [80, 160, 240, 320])
    promenade += `<circle cx="${(x + 0.5) * P}" cy="${213 * P}" r="${16 * P}" fill="url(#warm)"/>` + R(x, 214, 1, 20, '#2c2542') + R(x - 1, 212, 3, 2, '#ffe2a8')

  const glow = (id: string, color: string, opacity: number) =>
    `<radialGradient id="${id}"><stop offset="0" stop-color="${color}" stop-opacity="${opacity}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`

  const css =
    `.tw{animation:tw 5s ease-in-out infinite alternate}@keyframes tw{from{opacity:.2}to{opacity:1}}` +
    `.las{transform-box:fill-box;transform-origin:50% 100%;animation:las 18s ease-in-out infinite alternate}@keyframes las{from{transform:rotate(-9deg)}to{transform:rotate(9deg)}}` +
    `.lp{animation:lp 7s ease-in-out infinite alternate}@keyframes lp{from{opacity:.35}to{opacity:.85}}` +
    `.blink{animation:blink 2.6s ease-in-out infinite}@keyframes blink{0%,60%{opacity:1}75%,90%{opacity:.15}100%{opacity:1}}` +
    `.flick{animation:flick 11s linear infinite}@keyframes flick{0%,84%,89%,100%{opacity:1}86%{opacity:.55}}` +
    `.band{opacity:0;animation:band 10s linear infinite}@keyframes band{0%,30%,100%{opacity:0}8%,20%{opacity:1}}` +
    `.cycle{opacity:0;animation:cycle 9s linear infinite}@keyframes cycle{0%,40%,100%{opacity:0}10%,30%{opacity:1}}` +
    `.shA{animation:sh 4s ease-in-out infinite alternate}.shB{animation:sh 4s ease-in-out infinite alternate-reverse}@keyframes sh{from{opacity:.12}to{opacity:.6}}` +
    `.junk{animation:junk 210s linear infinite;animation-delay:-100s}@keyframes junk{from{transform:translateX(-1100px)}to{transform:translateX(800px)}}` +
    `.ferry{animation:ferry 150s linear infinite;animation-delay:-60s}@keyframes ferry{from{transform:translateX(1500px)}to{transform:translateX(-500px)}}` +
    `.bob{animation:bob 5s ease-in-out infinite alternate}.b2{animation-duration:6.5s}@keyframes bob{from{transform:translateY(0)}to{transform:translateY(3px)}}` +
    `.mist{animation:mist 80s ease-in-out infinite alternate}@keyframes mist{from{transform:translateX(-120px)}to{transform:translateX(160px)}}` +
    `.cloud{animation:cloud 120s ease-in-out infinite alternate}.c2{animation-duration:150s;animation-direction:alternate-reverse}@keyframes cloud{from{transform:translateX(-80px)}to{transform:translateX(80px)}}` +
    `.fw{opacity:0;transform-box:fill-box;transform-origin:center;animation:fw 11s ease-out infinite}@keyframes fw{0%,62%{opacity:0;transform:scale(.15)}66%{opacity:1;transform:scale(.55)}80%{opacity:.85;transform:scale(1)}92%,100%{opacity:0;transform:scale(1.1)}}`

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${GW * P} ${GH * P}" preserveAspectRatio="xMidYMid slice" shape-rendering="crispEdges"><style>${css}</style>` +
    `<defs>${glow('halo', '#f6eed6', 0.28)}${glow('warm', '#ffcf7a', 0.4)}${glow('gRed', '#ff3b5c', 0.4)}${glow('gCyan', '#3fe6ff', 0.35)}${glow('gAmber', '#ffb84d', 0.35)}` +
    `<linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d0a24"/><stop offset="1" stop-color="#040309"/></linearGradient>` +
    `<clipPath id="bclip"><polygon points="${pts(bShape)}"/></clipPath></defs>` +
    sky + `<path fill="#e9e3ff" opacity=".75" d="${stars}"/>${twinkles}${moon}${clouds}${fireworks}` +
    ridge((x: number) => far(x) - 1, '#4a3a86') + ridge(far, '#251a4d') + lookout + mist + ridge(near, '#171238') + `<path fill="#ffd98a" opacity=".55" d="${slope}"/>` +
    lasers + farLayer + front + heroA + heroB + heroC + heroD + asPaths(windows) + aircraft +
    R(0, SHORE, GW, GH - SHORE, 'url(#sea)') + `<path fill="#ffcf7a" opacity=".75" d="${shoreLights}"/>` +
    `<g class="shA" opacity=".5">${asPaths(reflA)}</g><g class="shB" opacity=".5">${asPaths(reflB)}</g>` +
    `<g class="shA"><path fill="#6fa8ff" d="${streaks}"/>${rainbow}</g><path class="shB" fill="#f6eed6" d="${moonPath}"/>` +
    junk + ferry + left + right + signs + promenade +
    `</svg>`
  )
}

const { theme, problems } = makeColors({
  label: 'Hong Kong',
  only: 'dark',
  roles: { accent: '#41d6ff', danger: '#ff5a4f', success: '#4fe0a0', warning: '#ffbf4d', pro: '#c37bff' },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#0a0918',
        'surface-1': '#0f0d20',
        'surface-2': '#141128',
        'surface-3': '#18152e',
        'text-primary': '#f2effa',
        'text-secondary': '#c9c3dc',
        'text-muted': '#a39cb8',
      },
    },
  },
})

export const hongKong = {
  colors: theme,
  problems,
  scene,
  alt: 'Pixel art of Victoria Harbour at night: the Peak in mist, island towers with a laser show and a rainbow-banded tower, a red-sailed junk and a ferry crossing, fireworks, and neon signs over the Kowloon promenade',
}
