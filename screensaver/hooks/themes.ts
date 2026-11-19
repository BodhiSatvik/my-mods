// The scenes the screensaver rotates through, in the order picked from buildwithclaude.com/themes.
// Each one keeps its maker's scene and glass; where its plugin set app colours, those come along too.
// Credits and licenses: hooks/vendor/*/ (Anthropic theme-examples: Apache-2.0; rainy-window, garden: MIT).
// Neon Tokyo, Marina Bay and Bat Cave come from repos with no license file, so they aren't shipped here:
// add-extras.sh fetches them into your own copy and fills in hooks/extras.ts.

import type { ThemeBackdropGlass, ThemeColors } from 'claude-code'

import { makeColors } from './make-colors.js'
import { BAT, CITIES } from './extras'
import { hongKong } from './hongkong'
import { sceneSvg as gardenSvg } from './vendor/garden/scene'
import type { Figures } from './vendor/garden/scene/instruments'
import { SCENE_ALT as RAINY_ALT, sceneSvg as rainySvg } from './vendor/rainy-window/scene'
import { blueprintSvg } from './vendor/theme-examples/blueprint'
import { brailleStarsSvg } from './vendor/theme-examples/braille-stars'
import { departureBoardSvg } from './vendor/theme-examples/departure-board'
import { ditherDunesNightSvg, ditherDunesSvg } from './vendor/theme-examples/dither-dunes'
import { halftoneDawnSvg, halftoneDuskSvg } from './vendor/theme-examples/halftone-dawn'
import { honuLagoonSvg } from './vendor/theme-examples/honu-lagoon'
import { koiMosaicSvg } from './vendor/theme-examples/koi-mosaic'
import { nightReefSvg } from './vendor/theme-examples/night-reef'
import { plotterTideNightSvg, plotterTideSvg } from './vendor/theme-examples/plotter-tide'
import { snowPinesSvg } from './vendor/theme-examples/snow-pines'
import { teletextCloudsSvg } from './vendor/theme-examples/teletext-clouds'
import { vectorRangeSvg } from './vendor/theme-examples/vector-range'

export type Theme = {
  id: string
  name: string
  alt: string
  glass: ThemeBackdropGlass
  /** App colours that come with the scene, where its maker set some. */
  colors?: ThemeColors
  /** The kind of window a scene without colours is made for. */
  scheme?: 'light' | 'dark'
  problems?: readonly string[]
  scene: () => string
  /** The garden's maker drew it for the desktop app only. */
  isDesktopOnly?: boolean
}

// Anthropic's theme-examples set no colours, only the kind of window each scene is made for.
const example = (id: string, name: string, scheme: 'light' | 'dark', glass: ThemeBackdropGlass, scene: () => string, alt: string): Theme => ({
  id, name, scheme, glass, scene, alt,
})

const rainy = makeColors({
  label: 'Rainy window',
  roles: { accent: '#5562C9', danger: '#C9553E', success: '#4E8B62', warning: '#D9892F', pro: '#7E5FC0' },
  light: { gray: { anchors: { 'surface-0': '#E9E3D6', 'surface-1': '#F0EBE1', 'surface-2': '#F6F2EA', 'text-primary': '#1F1F26', 'text-secondary': '#45444F', 'text-muted': '#5F5D68' } } },
  dark: { gray: { anchors: { 'surface-0': '#12142A', 'surface-1': '#181B33', 'surface-2': '#1D2140', 'surface-3': '#22264A', 'text-primary': '#EDE6D6', 'text-secondary': '#CBC3B3', 'text-muted': '#A8A192' } } },
})

const gardenColors = makeColors({
  label: 'Garden',
  only: 'light',
  roles: { accent: '#2f5d8c', danger: '#b3392f', success: '#4e7d3a', warning: '#a86f14', pro: '#6d4f94' },
  light: { gray: { anchors: { 'surface-0': '#efe6d3', 'surface-1': '#f4ecdc', 'surface-2': '#faf5e9', 'text-primary': '#2a241d', 'text-secondary': '#544a3d', 'text-muted': '#6a5f50' } } },
})

/** What the garden grows from: turns finished this session, and the usage dials, filled in by register.tsx. */
export const garden: { turns: number; seed: number; figures: Figures } = {
  turns: 0,
  seed: 1 + Math.floor(Math.random() * 99_999),
  figures: { contextPercent: null, limits: [], usd: null },
}

function gardenScene(): string {
  const now = new Date()
  const daySeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()
  return gardenSvg(
    { now: now.getTime() / 1000, daySeconds, lastTurnSeconds: 0, turnSeconds: 0, phase: 'standby', total: 0, seed: garden.seed, turns: garden.turns },
    garden.figures,
    { contextPercent: null, usd: null },
  )
}

export const THEMES: readonly Theme[] = [
  example('honu-lagoon', 'Honu Lagoon', 'light', { blur: 7, tint: '#e6fbff', opacity: 0.42 }, honuLagoonSvg, 'An ASCII lagoon from above: a tile turtle swims by a sand island'),
  example('koi-mosaic', 'Koi Mosaic', 'light', { blur: 12, tint: '#eef8f1', opacity: 0.36 }, koiMosaicSvg, 'A tiled koi pond from above: two koi, lily pads, slow ripples'),
  example('halftone-dawn', 'Halftone Dawn', 'light', { blur: 14, tint: '#f6ead9', opacity: 0.55 }, halftoneDawnSvg, 'A two-ink riso sunrise: halftone dots that breathe outward'),
  example('halftone-dusk', 'Halftone Dusk', 'dark', { blur: 14, tint: '#1f2336', opacity: 0.5 }, halftoneDuskSvg, 'The riso sunrise on night-blue stock: an ember sun in breathing dots'),
  example('plotter-tide', 'Plotter Tide', 'light', { blur: 0, tint: '#f4efe4', opacity: 0.32 }, plotterTideSvg, 'Pen-plotter tide lines drawing themselves on warm paper'),
  example('plotter-tide-night', 'Plotter Tide, Night', 'dark', { blur: 0, tint: '#141a27', opacity: 0.32 }, plotterTideNightSvg, 'The tide chart in pale ink on blue-black night paper'),
  example('dither-dunes', 'Dither Dunes', 'light', { blur: 18, tint: '#f1e8d6', opacity: 0.34 }, ditherDunesSvg, 'One-bit dunes on sand paper, shaded in dots, under a terracotta sun'),
  example('dither-dunes-night', 'Dither Dunes Night', 'dark', { blur: 18, tint: '#1c1712', opacity: 0.4 }, ditherDunesNightSvg, 'The same dunes after dark: pale dots on umber, an ember sun'),
  example('night-reef', 'Night Reef', 'dark', { blur: 14, tint: '#0a1430', opacity: 0.4 }, nightReefSvg, 'The lagoon after dark: a turtle and a ray that glow as they swim'),
  example('snow-pines', 'Snow Pines', 'dark', { blur: 16, tint: '#14143a', opacity: 0.5 }, snowPinesSvg, 'An ASCII pine forest at dusk, snow drifting down through the trees'),
  example('braille-stars', 'Braille Stars', 'dark', { blur: 20, tint: '#0a1430', opacity: 0.3 }, brailleStarsSvg, 'A slow night sky drawn dot by dot on a braille grid'),
  example('block-clouds', 'Block Clouds', 'dark', { blur: 12, tint: '#0d173f', opacity: 0.34 }, teletextCloudsSvg, 'Night clouds built from blocks on a teletext grid, drifting in'),
  example('vector-range', 'Vector Range', 'dark', { blur: 22, tint: '#0e2f27', opacity: 0.42 }, vectorRangeSvg, 'Phosphor mountains on black; an amber beam keeps retracing them'),
  example('departure-board', 'Departure Board', 'dark', { blur: 14, tint: '#1a120b', opacity: 0.34 }, departureBoardSvg, 'An amber LED board re-lettering itself, row by row'),
  example('blueprint', 'Blueprint', 'dark', { blur: 14, tint: '#0c2444', opacity: 0.42 }, blueprintSvg, 'A cyanotype sheet; a comet goes round its plotted orbit in the corner'),
  { id: 'rainy-window', name: 'Rainy Window', alt: RAINY_ALT, glass: { blur: 18, opacity: 0.62 }, colors: rainy.theme, problems: rainy.problems, scene: rainySvg },
  ...CITIES,
  { id: 'hong-kong', name: 'Hong Kong', alt: hongKong.alt, glass: { blur: 0, tint: '#0a0918', opacity: 0.3 }, colors: hongKong.colors, problems: hongKong.problems, scene: hongKong.scene },
  {
    id: 'garden',
    name: 'Garden',
    alt: 'A sheet of warm paper with pencil-sketched dials, a paper plane, a tree and a pencil garden that grows with the session',
    glass: { blur: 4, tint: '#f6f1e6', opacity: 0.6 },
    colors: gardenColors.theme,
    problems: gardenColors.problems,
    scene: gardenScene,
    isDesktopOnly: true,
  },
  ...BAT,
]
