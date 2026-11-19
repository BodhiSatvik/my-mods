// The scenes the screensaver rotates through, picked from buildwithclaude.com/themes: dark ones only.
// Each one keeps its maker's scene and glass; where its plugin set app colours, those come along too.
// Credits and licenses: hooks/vendor/theme-examples/ (Anthropic, Apache-2.0).
// Neon Tokyo, Marina Bay and Bat Cave come from repos with no license file, so they aren't shipped here:
// add-extras.sh fetches them into your own copy and fills in hooks/extras.ts.

import type { ThemeBackdropGlass, ThemeColors } from 'claude-code'

import { BAT, CITIES } from './extras'
import { hongKong } from './hongkong'
import { nanLian } from './nanlian'
import { blueprintSvg } from './vendor/theme-examples/blueprint'
import { brailleStarsSvg } from './vendor/theme-examples/braille-stars'
import { departureBoardSvg } from './vendor/theme-examples/departure-board'
import { ditherDunesNightSvg } from './vendor/theme-examples/dither-dunes'
import { halftoneDuskSvg } from './vendor/theme-examples/halftone-dawn'
import { nightReefSvg } from './vendor/theme-examples/night-reef'
import { plotterTideNightSvg } from './vendor/theme-examples/plotter-tide'
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
}

// Anthropic's theme-examples set no colours, only that the window goes dark.
const example = (id: string, name: string, glass: ThemeBackdropGlass, scene: () => string, alt: string): Theme => ({
  id, name, scheme: 'dark', glass, scene, alt,
})

export const THEMES: readonly Theme[] = [
  example('halftone-dusk', 'Halftone Dusk', { blur: 14, tint: '#1f2336', opacity: 0.5 }, halftoneDuskSvg, 'The riso sunrise on night-blue stock: an ember sun in breathing dots'),
  example('plotter-tide-night', 'Plotter Tide, Night', { blur: 0, tint: '#141a27', opacity: 0.32 }, plotterTideNightSvg, 'The tide chart in pale ink on blue-black night paper'),
  example('dither-dunes-night', 'Dither Dunes Night', { blur: 18, tint: '#1c1712', opacity: 0.4 }, ditherDunesNightSvg, 'The same dunes after dark: pale dots on umber, an ember sun'),
  example('night-reef', 'Night Reef', { blur: 14, tint: '#0a1430', opacity: 0.4 }, nightReefSvg, 'The lagoon after dark: a turtle and a ray that glow as they swim'),
  example('snow-pines', 'Snow Pines', { blur: 16, tint: '#14143a', opacity: 0.5 }, snowPinesSvg, 'An ASCII pine forest at dusk, snow drifting down through the trees'),
  example('braille-stars', 'Braille Stars', { blur: 20, tint: '#0a1430', opacity: 0.3 }, brailleStarsSvg, 'A slow night sky drawn dot by dot on a braille grid'),
  example('block-clouds', 'Block Clouds', { blur: 12, tint: '#0d173f', opacity: 0.34 }, teletextCloudsSvg, 'Night clouds built from blocks on a teletext grid, drifting in'),
  example('vector-range', 'Vector Range', { blur: 22, tint: '#0e2f27', opacity: 0.42 }, vectorRangeSvg, 'Phosphor mountains on black; an amber beam keeps retracing them'),
  example('departure-board', 'Departure Board', { blur: 14, tint: '#1a120b', opacity: 0.34 }, departureBoardSvg, 'An amber LED board re-lettering itself, row by row'),
  example('blueprint', 'Blueprint', { blur: 14, tint: '#0c2444', opacity: 0.42 }, blueprintSvg, 'A cyanotype sheet; a comet goes round its plotted orbit in the corner'),
  ...CITIES,
  // Lit windows and lasers sit right behind the text: this much veil keeps muted text at 4.5:1 over them.
  { id: 'hong-kong', name: 'Hong Kong', alt: hongKong.alt, glass: { blur: 4, tint: '#0a0918', opacity: 0.6 }, colors: hongKong.colors, problems: hongKong.problems, scene: hongKong.scene },
  { id: 'nan-lian', name: 'Nan Lian Garden', alt: nanLian.alt, glass: { blur: 6, tint: '#0a0e16', opacity: 0.5 }, colors: nanLian.colors, problems: nanLian.problems, scene: nanLian.scene },
  ...BAT,
]
