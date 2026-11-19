// Nan Lian Garden at night: the golden Pavilion of Absolute Perfection on its lotus pond, reached by vermilion
// bridges, with Chi Lin Nunnery's timber hall, sculpted pines, and Diamond Hill's towers under Lion Rock behind.
// An original scene for this mod. Everything moves slowly: ripples, mist, lantern glow, koi, fireflies.
// The bright things (pavilion, moon) sit right of centre so the conversation column stays calm.

import { makeColors } from './make-colors.js'
import { rng } from './hongkong'

const W = 1600
const r1 = (n: number) => Math.round(n * 10) / 10
const DELAYS = 6 // .d1 to .d6 stagger the looping animations

const STYLE = `
.tw{animation:tw 6s ease-in-out infinite alternate}
@keyframes tw{from{opacity:.15}to{opacity:.85}}
.breathe{animation:breathe 12s ease-in-out infinite alternate}
@keyframes breathe{from{opacity:.7}to{opacity:1}}
.flick{animation:flick 5s ease-in-out infinite alternate}
@keyframes flick{0%{opacity:.7}40%{opacity:1}70%{opacity:.82}100%{opacity:.95}}
.blink{animation:blink 4s steps(1) infinite}
@keyframes blink{0%,60%{opacity:.9}61%,100%{opacity:.15}}
.mist{animation:mist 140s ease-in-out infinite alternate}
.mist2{animation:mist 110s ease-in-out infinite alternate-reverse}
@keyframes mist{from{transform:translateX(-160px)}to{transform:translateX(160px)}}
.shim{animation:shim 7s ease-in-out infinite alternate}
@keyframes shim{from{opacity:.24;transform:translateX(-3px)}to{opacity:.38;transform:translateX(3px)}}
.lines{animation:lines 9s ease-in-out infinite alternate}
@keyframes lines{from{transform:translateX(-8px)}to{transform:translateX(8px)}}
.ripple{transform-box:fill-box;transform-origin:center;opacity:0;animation:ripple 11s ease-out infinite}
@keyframes ripple{0%{transform:scale(.15);opacity:.55}100%{transform:scale(1.7);opacity:0}}
.koiA{animation:swimA 80s linear infinite}
.koiB{animation:swimB 100s linear infinite;animation-delay:-55s}
@keyframes swimA{from{transform:translateX(-140px)}to{transform:translateX(1740px)}}
@keyframes swimB{from{transform:translateX(1740px)}to{transform:translateX(-140px)}}
.wig{animation:wig 6s ease-in-out infinite alternate}
@keyframes wig{from{transform:translateY(-5px)}to{transform:translateY(5px)}}
.fly{animation:fly 11s ease-in-out infinite}
@keyframes fly{0%{transform:translate(0,0);opacity:.15}30%{opacity:1}50%{transform:translate(16px,-12px)}70%{opacity:.4}100%{transform:translate(0,0);opacity:.15}}
.sway{transform-origin:-40px 60px;animation:sway 16s ease-in-out infinite alternate}
@keyframes sway{from{transform:rotate(-.6deg)}to{transform:rotate(.8deg)}}
.d1{animation-delay:-1.5s}.d2{animation-delay:-3.7s}.d3{animation-delay:-5.2s}.d4{animation-delay:-7.9s}.d5{animation-delay:-9.4s}.d6{animation-delay:-2.6s}
`

const DEFS = `<defs>
<linearGradient id="nl-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#070a16"/><stop offset=".45" stop-color="#111930"/><stop offset=".78" stop-color="#212544"/><stop offset="1" stop-color="#2c2946"/></linearGradient>
<linearGradient id="nl-water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0f1a29"/><stop offset=".5" stop-color="#0a131e"/><stop offset="1" stop-color="#060b12"/></linearGradient>
<linearGradient id="nl-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6d27a"/><stop offset="1" stop-color="#c3832f"/></linearGradient>
<linearGradient id="nl-roof" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#272b3e"/><stop offset="1" stop-color="#161925"/></linearGradient>
<radialGradient id="nl-moon"><stop offset="0" stop-color="#efe6cc" stop-opacity=".22"/><stop offset="1" stop-color="#efe6cc" stop-opacity="0"/></radialGradient>
<radialGradient id="nl-halo"><stop offset="0" stop-color="#ffc56e" stop-opacity=".24"/><stop offset="1" stop-color="#ffc56e" stop-opacity="0"/></radialGradient>
<radialGradient id="nl-lamp"><stop offset="0" stop-color="#ffb85c" stop-opacity=".4"/><stop offset="1" stop-color="#ffb85c" stop-opacity="0"/></radialGradient>
<filter id="nl-soft" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="2.5"/></filter>
</defs>`

function sky(r: () => number): string {
  let stars = ''
  for (let i = 0; i < 70; i++) {
    const tw = i % 5 === 0 ? ` class="tw d${1 + (i % DELAYS)}"` : ''
    stars += `<circle cx="${r1(r() * W)}" cy="${r1(r() * 380)}" r="${r1(0.6 + r() * 1.1)}" fill="#dfe6ff" opacity="${(0.25 + r() * 0.5).toFixed(2)}"${tw}/>`
  }
  return `<rect width="1600" height="640" fill="url(#nl-sky)"/>${stars}
<circle cx="1370" cy="140" r="170" fill="url(#nl-moon)" class="breathe"/>
<circle cx="1370" cy="140" r="40" fill="#efe6cc"/>
<circle cx="1356" cy="130" r="9" fill="#d9cfb2" opacity=".5"/><circle cx="1384" cy="152" r="6" fill="#d9cfb2" opacity=".45"/><circle cx="1379" cy="123" r="4" fill="#d9cfb2" opacity=".4"/>`
}

// Lion Rock: the crouching lion's head is the crag on the left; the ridge runs east behind Diamond Hill.
const HILLS = `<path d="M-20 440C200 400 380 392 560 388S900 352 1100 336S1450 352 1620 330V600H-20Z" fill="#1a2040"/>
<path d="M-20 476C60 462 140 446 200 404C232 380 246 334 270 300C290 274 318 262 346 262C368 262 384 276 390 296C394 310 404 318 426 322C480 330 560 334 640 346C740 360 820 382 900 384C980 386 1040 356 1090 352C1150 348 1200 372 1270 394C1380 420 1500 432 1620 452V600H-20Z" fill="#141a2e"/>
<g class="mist"><ellipse cx="500" cy="470" rx="520" ry="26" fill="#aab6dc" opacity=".06"/><ellipse cx="1150" cy="440" rx="460" ry="22" fill="#aab6dc" opacity=".05"/></g>`

// Diamond Hill's housing towers, dim, with a few lit windows and red lights on the tallest.
function towers(r: () => number): string {
  let x = -10
  let body = ''
  let warm = ''
  let cool = ''
  let tops = ''
  while (x < 1610) {
    const w = 34 + Math.floor(r() * 38)
    const top = 372 + Math.floor(r() * 96)
    body += `<rect x="${x}" y="${top}" width="${w}" height="${600 - top}" fill="${r() < 0.5 ? '#10152a' : '#131a31'}"/>`
    for (let wy = top + 8; wy < 588; wy += 14)
      for (let wx = x + 5; wx < x + w - 6; wx += 10) {
        const k = r()
        if (k < 0.11) warm += `M${wx} ${wy}h4v6h-4z`
        else if (k < 0.16) cool += `M${wx} ${wy}h4v6h-4z`
      }
    if (top < 392) tops += `<circle cx="${x + w / 2}" cy="${top - 3}" r="2.2" fill="#ff4d4d" class="blink d${1 + Math.floor(r() * DELAYS)}"/>`
    x += w + 6 + Math.floor(r() * 16)
  }
  return `${body}<path d="${warm}" fill="#e9c27a" opacity=".5"/><path d="${cool}" fill="#a9c4e8" opacity=".35"/>${tops}`
}

// A Tang-style timber hall like Chi Lin's: a long low roof with upturned eave ends, lamplight between the columns.
function hall(x0: number, x1: number, eave: number): string {
  const lip = 22
  const roof = `M${x0 - lip} ${eave - 16}Q${x0} ${eave - 2} ${x0 + 40} ${eave}L${x1 - 40} ${eave}Q${x1} ${eave - 2} ${x1 + lip} ${eave - 16}L${x1 - 10} ${eave - 26}L${x1 - 66} ${eave - 62}Q${(x0 + x1) / 2} ${eave - 76} ${x0 + 66} ${eave - 62}L${x0 + 10} ${eave - 26}Z`
  const edge = `M${x0 - lip} ${eave - 16}Q${x0} ${eave - 2} ${x0 + 40} ${eave}L${x1 - 40} ${eave}Q${x1} ${eave - 2} ${x1 + lip} ${eave - 16}`
  let bays = ''
  let cols = ''
  for (let cx = x0 + 28; cx < x1 - 28; cx += 52) {
    cols += `<rect x="${cx - 4}" y="${eave}" width="8" height="${592 - eave}" fill="#3a241a"/>`
    if (cx + 52 < x1 - 20) {
      bays += `<rect x="${cx + 6}" y="${eave + 12}" width="40" height="${560 - eave}" fill="#e8a95c" opacity=".2"/>`
      for (let lx = cx + 12; lx < cx + 46; lx += 8) bays += `<rect x="${lx}" y="${eave + 12}" width="1.5" height="${560 - eave}" fill="#1b1411" opacity=".7"/>`
    }
  }
  const ridgeL = x0 + 70
  const ridgeR = x1 - 70
  return `<rect x="${x0 + 8}" y="${eave}" width="${x1 - x0 - 16}" height="${592 - eave}" fill="#1b1411"/>${bays}${cols}
<path d="${roof}" fill="url(#nl-roof)"/><path d="${edge}" fill="none" stroke="#4a5170" stroke-width="2" opacity=".6"/>
<rect x="${ridgeL}" y="${eave - 74}" width="${ridgeR - ridgeL}" height="9" fill="#262a39"/>
<path d="M${ridgeL} ${eave - 65}q-8-4-6-16q8 2 10 8zM${ridgeR} ${eave - 65}q8-4 6-16q-8 2-10 8z" fill="#262a39"/>
<rect x="${x0 - 4}" y="590" width="${x1 - x0 + 8}" height="14" fill="#262833"/>`
}

// A Luohan pine: a leaning trunk and flat cloud-pads of needles.
function pine(x: number, base: number, s: number): string {
  const pads: [number, number, number, number][] = [[-10, -140, 46, 16], [30, -110, 38, 13], [-40, -95, 34, 12], [-5, -172, 30, 11], [48, -150, 26, 9]]
  const limbs = pads.map(([dx, dy]) => `M${r1(x - 6 * s)} ${r1(base - 100 * s)}L${r1(x + dx * s)} ${r1(base + dy * s)}`).join('')
  const fol = pads.map(([dx, dy, rx, ry]) => `<ellipse cx="${r1(x + dx * s)}" cy="${r1(base + dy * s)}" rx="${r1(rx * s)}" ry="${r1(ry * s)}" fill="#122419"/><ellipse cx="${r1(x + dx * s)}" cy="${r1(base + dy * s - 3)}" rx="${r1(rx * s * 0.8)}" ry="${r1(ry * s * 0.55)}" fill="#1b3527"/>`).join('')
  return `<path d="M${x} ${base}C${r1(x + 10 * s)} ${r1(base - 60 * s)} ${r1(x - 30 * s)} ${r1(base - 90 * s)} ${r1(x - 10 * s)} ${r1(base - 140 * s)}" stroke="#1d1712" stroke-width="${r1(10 * s)}" fill="none" stroke-linecap="round"/>
<path d="${limbs}" stroke="#1d1712" stroke-width="${r1(4 * s)}" fill="none"/>${fol}`
}

function rock(x: number, y: number, s: number): string {
  return `<path d="M${x - 30 * s} ${y}C${x - 40 * s} ${y - 40 * s} ${x - 20 * s} ${y - 70 * s} ${x} ${y - 66 * s}C${x + 22 * s} ${y - 80 * s} ${x + 38 * s} ${y - 44 * s} ${x + 30 * s} ${y}Z" fill="#262b3a"/>
<ellipse cx="${x - 6 * s}" cy="${y - 40 * s}" rx="${7 * s}" ry="${9 * s}" fill="#151924"/><ellipse cx="${x + 14 * s}" cy="${y - 22 * s}" rx="${5 * s}" ry="${6 * s}" fill="#151924"/>`
}

function shrubs(r: () => number): string {
  let s = ''
  for (let x = -20; x < 1620; x += 40 + Math.floor(r() * 30))
    s += `<ellipse cx="${x}" cy="${594 + Math.floor(r() * 6)}" rx="${30 + Math.floor(r() * 26)}" ry="${14 + Math.floor(r() * 10)}" fill="${r() < 0.5 ? '#0f1f18' : '#13261d'}"/>`
  return s
}

function lantern(x: number, base: number, d: number): string {
  return `<circle cx="${x}" cy="${base - 34}" r="48" fill="url(#nl-lamp)" class="flick d${d}"/>
<rect x="${x - 9}" y="${base - 8}" width="18" height="8" fill="#3a3d4a"/><rect x="${x - 3}" y="${base - 26}" width="6" height="18" fill="#343744"/>
<rect x="${x - 10}" y="${base - 42}" width="20" height="16" fill="#3a3d4a"/><rect x="${x - 6}" y="${base - 39}" width="12" height="10" fill="#ffc675" class="flick d${d}"/>
<path d="M${x - 14} ${base - 42}L${x} ${base - 54}L${x + 14} ${base - 42}Z" fill="#2e313d"/>`
}

// Light laid on the water as broken streaks: the moon's and the lanterns'.
function streaks(r: () => number, x: number, from: number, to: number, color: string, width: number): string {
  let s = ''
  for (let y = from; y < to; y += 7 + Math.floor(r() * 6)) {
    const w = width * (1 - (y - from) / (to - from)) * (0.5 + r() * 0.6)
    s += `<rect x="${r1(x - w / 2 + (r() - 0.5) * 10)}" y="${y}" width="${r1(w)}" height="2.5" fill="${color}" opacity="${(0.1 + r() * 0.12).toFixed(2)}"/>`
  }
  return `<g class="shim">${s}</g>`
}

function bridge(x0: number, y0: number, x1: number, y1: number): string {
  const n = Math.round(Math.abs(x1 - x0) / 30)
  let posts = ''
  let legs = ''
  for (let i = 0; i <= n; i++) {
    const x = r1(x0 + ((x1 - x0) * i) / n)
    const y = r1(y0 + ((y1 - y0) * i) / n)
    posts += `M${x} ${r1(y - 22)}v22`
    if (i % 2 === 1) legs += `M${x} ${r1(y + 8)}v22`
  }
  return `<path d="${legs}" stroke="#1d1414" stroke-width="5"/>
<polygon points="${x0},${y0} ${x1},${y1} ${x1},${y1 + 9} ${x0},${y0 + 9}" fill="#4a2b22"/>
<path d="M${x0} ${y0}L${x1} ${y1}" stroke="#6b3a2c" stroke-width="2"/>
<path d="${posts}" stroke="#b9432c" stroke-width="3.5"/>
<path d="M${x0} ${y0 - 22}L${x1} ${y1 - 22}M${x0} ${y0 - 11}L${x1} ${y1 - 11}" stroke="#c84a30" stroke-width="3"/>`
}

// The Pavilion of Absolute Perfection: gilded, hexagonal, three faces seen, lit from within.
function pavilion(): string {
  let cols = ''
  for (const x of [1098, 1142, 1210, 1254]) cols += `<rect x="${x}" y="580" width="8" height="56" fill="#8a2f20"/><rect x="${x + 5}" y="580" width="3" height="56" fill="#b4492f"/>`
  let bal = ''
  for (let x = 1100; x < 1262; x += 12) bal += `M${x} 623h2.5v13h-2.5z`
  return `<rect x="1076" y="636" width="208" height="14" fill="#33343f"/><rect x="1076" y="636" width="208" height="2" fill="#4c4e5e"/>
<rect x="1100" y="580" width="160" height="56" fill="#ffcf86" opacity=".35"/>
<rect x="1172" y="588" width="16" height="20" rx="6" fill="#ff9a4a" opacity=".8" class="flick d3"/>
${cols}<rect x="1094" y="618" width="172" height="5" fill="#9a3826"/><path d="${bal}" fill="#7d2c1f"/>
<rect x="1088" y="572" width="184" height="10" fill="#8f3524"/><rect x="1088" y="580" width="184" height="2" fill="#e0b05a"/>
<path d="M1034 550Q1120 545 1180 466Q1240 545 1326 550Q1290 572 1248 578L1112 578Q1070 572 1034 550Z" fill="url(#nl-gold)"/>
<path d="M1180 468L1112 576M1180 468L1248 576" stroke="#ffe39a" stroke-width="2" opacity=".7"/>
<path d="M1034 550Q1070 572 1112 578L1248 578Q1290 572 1326 550" fill="none" stroke="#7a4a1c" stroke-width="3"/>
<path d="M1180 466V440" stroke="#e8b453" stroke-width="3"/><circle cx="1180" cy="458" r="7" fill="#f2c766"/><circle cx="1180" cy="444" r="4" fill="#f2c766"/>`
}

function lotus(r: () => number): string {
  let pads = ''
  let flowers = ''
  for (let i = 0; i < 46; i++) {
    let x = r() * W
    if (x > 560 && x < 1040 && r() < 0.7) x = r() < 0.5 ? x - 480 : x + 480 // keep the middle of the pond open
    const y = 700 + r() * 290
    const rx = 16 + r() * 26 * ((y - 640) / 360 + 0.4)
    pads += `<ellipse cx="${r1(x)}" cy="${r1(y)}" rx="${r1(rx)}" ry="${r1(rx * 0.3)}" fill="${r() < 0.5 ? '#16301f' : '#1c3a2c'}" stroke="#2b5541" stroke-width=".8" stroke-opacity=".5"/><path d="M${r1(x)} ${r1(y)}l${r1(rx * 0.8)} ${r1(-rx * 0.08)}" stroke="#0d1d14" stroke-width="1.4"/>`
    if (i % 7 === 3) {
      const fx = r1(x - rx * 0.3)
      const fy = r1(y - 4)
      flowers += [-28, 0, 28].map(a => `<ellipse cx="${fx}" cy="${r1(fy - 8)}" rx="4.5" ry="9" fill="#e7a0b6" opacity=".85" transform="rotate(${a} ${fx} ${fy})"/>`).join('') + `<circle cx="${fx}" cy="${r1(fy - 4)}" r="2.6" fill="#f3d27a"/>`
    }
  }
  return pads + flowers
}

function koi(cls: string, y: number, body: string, patch: string, flip: boolean): string {
  return `<g class="${cls}"><g class="wig"><g transform="translate(0 ${y})${flip ? ' scale(-1 1)' : ''}" opacity=".5">
<path d="M-24 0L-40-9L-36 0L-40 9Z" fill="${body}"/><ellipse cx="0" cy="0" rx="26" ry="8" fill="${body}"/><ellipse cx="6" cy="-1" rx="9" ry="5" fill="${patch}"/><ellipse cx="-10" cy="1" rx="6" ry="3.5" fill="${patch}"/></g></g></g>`
}

function scene(): string {
  const r = rng(2522) // fixed, so the towers and stars sit in the same places every time
  const ripples = [[760, 690], [940, 820], [640, 930], [1420, 760], [1060, 900]]
    .map(([x, y], i) => `<ellipse cx="${x}" cy="${y}" rx="64" ry="10" fill="none" stroke="#8fb3c7" stroke-width="1.2" class="ripple d${1 + i}"/>`)
    .join('')
  let lines = ''
  for (let i = 0; i < 40; i++) lines += `<rect x="${r1(800 + r() * 820)}" y="${r1(650 + r() * 200)}" width="${r1(30 + r() * 90)}" height="1.6" fill="#0b1520" opacity=".6"/>`
  let flies = ''
  for (let i = 0; i < 12; i++) {
    const x = r1(380 + r() * 1100)
    const y = r1(520 + r() * 200)
    flies += `<g class="fly d${1 + (i % DELAYS)}"><circle cx="${x}" cy="${y}" r="7" fill="#f6e7a1" opacity=".15"/><circle cx="${x}" cy="${y}" r="1.8" fill="#f6e7a1"/></g>`
  }
  const span = bridge(820, 606, 1080, 630) + bridge(1280, 630, 1620, 606)
  const pav = pavilion()

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice"><style>${STYLE}</style>${DEFS}
${sky(r)}${HILLS}${towers(r)}
${hall(40, 560, 508)}${hall(1430, 1700, 524)}
${shrubs(r)}${pine(600, 598, 1)}${pine(735, 600, 0.8)}${pine(960, 598, 0.9)}${pine(1350, 600, 0.75)}${pine(1470, 602, 1.1)}${rock(660, 604, 1)}${rock(1560, 606, 0.9)}
${lantern(470, 604, 2)}${lantern(790, 604, 4)}${lantern(1510, 606, 5)}
<rect x="0" y="598" width="1600" height="8" fill="#262a36"/><rect x="0" y="598" width="1600" height="1.5" fill="#3c4258" opacity=".7"/>
<rect x="0" y="606" width="1600" height="394" fill="url(#nl-water)"/><rect x="0" y="606" width="1600" height="40" fill="#1b2340" opacity=".35"/>
${streaks(r, 1370, 650, 940, '#efe6cc', 70)}${streaks(r, 470, 612, 760, '#ffc675', 26)}${streaks(r, 790, 612, 760, '#ffc675', 26)}
<circle cx="1180" cy="560" r="200" fill="url(#nl-halo)" class="breathe"/>
${span}${pav}
<g transform="matrix(1 0 0 -1 0 1284)"><g class="shim" filter="url(#nl-soft)">${span}${pav}</g></g>
<g class="lines">${lines}</g>${ripples}
${koi('koiA', 770, '#e2763c', '#efe5d6', false)}${koi('koiB', 880, '#efe5d6', '#d4533a', true)}
${lotus(r)}${flies}
<g class="mist2"><ellipse cx="800" cy="640" rx="620" ry="22" fill="#c9d4f0" opacity=".045"/></g>
<g class="sway"><path d="M-40 60C80 40 200 70 300 96C360 112 400 118 450 112M180 66C220 40 260 34 300 40" stroke="#0b1110" stroke-width="12" fill="none" stroke-linecap="round"/>
<ellipse cx="40" cy="42" rx="62" ry="20" fill="#0d1a14"/><ellipse cx="130" cy="60" rx="70" ry="22" fill="#12241b"/><ellipse cx="270" cy="44" rx="58" ry="17" fill="#0d1a14"/><ellipse cx="340" cy="98" rx="62" ry="19" fill="#12241b"/><ellipse cx="440" cy="110" rx="50" ry="15" fill="#0d1a14"/></g>
</svg>`
}

const { theme, problems } = makeColors({
  label: 'Nan Lian Garden',
  only: 'dark',
  roles: { accent: '#e2b25a', danger: '#e2675a', success: '#6cc59c', warning: '#f0a04b', pro: '#a990d8' },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#0a0e16',
        'surface-1': '#0e131c',
        'surface-2': '#121823',
        'surface-3': '#161c28',
        'text-primary': '#eef0ea',
        'text-secondary': '#c8cdc4',
        'text-muted': '#9ea69b',
      },
    },
  },
})

export const nanLian = {
  colors: theme,
  problems,
  scene,
  alt: "Nan Lian Garden at night: the golden Pavilion of Absolute Perfection on a lotus pond, reached by vermilion bridges, with Chi Lin Nunnery's timber hall, sculpted pines, and Diamond Hill's towers under Lion Rock; ripples, mist, koi and fireflies move slowly",
}
