#!/bin/sh
# Adds Neon Tokyo, Marina Bay and Bat Cave to the screensaver. Their makers' repos have no license file,
# so the repo can't ship them: this fetches them, at pinned commits, into your own copy only.
#   markimoo09/claude-code-themes  hooks/looks/  (Neon Tokyo, Marina Bay)
#   Sumit189/bat-cave              hooks/register.tsx, lines 13-151 (the palette and bat scene, no widgets)
set -eu
cd "$(dirname "$0")/hooks"
CITY=https://raw.githubusercontent.com/markimoo09/claude-code-themes/d8e9dffc9e8aa9cd829951af105d8753c9f46685/hooks/looks
BAT=https://raw.githubusercontent.com/Sumit189/bat-cave/a4eaeb8efaef82ad504cb11b52ef037087666c68/hooks/register.tsx

# Download everything first, so a failed fetch leaves the mod as it was (18 scenes, still loading).
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
for f in neon-tokyo marina-bay pixel types; do curl -fsSL -o "$tmp/$f.ts" "$CITY/$f.ts"; done
curl -fsSL -o "$tmp/bat.tsx" "$BAT"

mkdir -p vendor/city-looks vendor/bat-cave
for f in neon-tokyo marina-bay pixel types; do
  sed "s#'../make-colors.js'#'../../make-colors.js'#" "$tmp/$f.ts" > "vendor/city-looks/$f.ts"
done
{
  echo "// From github.com/Sumit189/bat-cave, hooks/register.tsx: the palette and bat scene only. No license: personal use."
  echo "import { makeColors } from '../../make-colors.js'"
  sed -n '13,151p' "$tmp/bat.tsx"
  echo 'export { theme, problems, sceneOf }'
} > vendor/bat-cave/bat.ts

cat > extras.ts <<'EOF'
// Written by add-extras.sh: the three scenes it fetched into hooks/vendor/.
import type { ThemeBackdropGlass, ThemeScene } from 'claude-code'

import type { Theme } from './themes'
import * as bat from './vendor/bat-cave/bat'
import { marinaBay } from './vendor/city-looks/marina-bay'
import { neonTokyo } from './vendor/city-looks/neon-tokyo'
import type { Look } from './vendor/city-looks/types'

// The looks ship with clear glass (blur 0, 30%); their lit windows then sit sharp behind the text,
// so the screensaver veils them more to keep muted text at 4.5:1.
const fromLook = (look: Look, glass: ThemeBackdropGlass): Theme => {
  const backdrop = look.theme.backdrop as ThemeScene
  const drawn = look.scenes[backdrop.scene]!
  return {
    id: look.id,
    name: look.label,
    alt: drawn.alt,
    glass: { ...(backdrop.glass || {}), ...glass },
    colors: look.theme.colors,
    problems: look.problems,
    scene: () => drawn.source,
  }
}

export const CITIES: readonly Theme[] = [fromLook(neonTokyo, { blur: 8, opacity: 0.62 }), fromLook(marinaBay, { blur: 4, opacity: 0.6 })]
export const BAT: readonly Theme[] = [
  { id: 'bat-cave', name: 'Bat Cave', alt: 'A block-character bat turning slowly on a dark terminal grid', glass: { blur: 10, tint: '#08090a', opacity: 0.62 }, colors: bat.theme, problems: bat.problems, scene: () => bat.sceneOf('', 0, 0, 0) },
]
EOF
echo "Added Neon Tokyo, Marina Bay and Bat Cave. Start a new session to see them."
