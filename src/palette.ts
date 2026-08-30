export type Hsl = {
  h: number
  s: number
  l: number
}

export type PaletteColor = {
  hex: string
  name: string
  hsl: Hsl
}

export type PaletteRole = 'bg' | 'surface' | 'accent' | 'text' | 'muted' | 'highlight'

export type Palette = Record<PaletteRole, PaletteColor>

const ROLES: PaletteRole[] = ['bg', 'surface', 'accent', 'text', 'muted', 'highlight']

/** Explicit chromatic keywords → hue. Weights collected later. */
const COLOR_HUES: Record<string, { h: number; w: number }> = {
  coastal: { h: 200, w: 5 },
  blue: { h: 202, w: 4 },
  ocean: { h: 198, w: 3 },
  sea: { h: 196, w: 3 },
  sky: { h: 208, w: 2 },
  navy: { h: 222, w: 4 },
  indigo: { h: 232, w: 3 },
  teal: { h: 178, w: 3 },
  aqua: { h: 174, w: 2 },
  cyan: { h: 186, w: 2 },
  turquoise: { h: 174, w: 2 },
  terracotta: { h: 18, w: 5 },
  warm: { h: 22, w: 3 },
  clay: { h: 16, w: 3 },
  adobe: { h: 20, w: 3 },
  rust: { h: 14, w: 3 },
  copper: { h: 28, w: 2 },
  coral: { h: 12, w: 3 },
  brick: { h: 12, w: 2 },
  red: { h: 6, w: 3 },
  blush: { h: 352, w: 4 },
  pink: { h: 340, w: 3 },
  rose: { h: 348, w: 3 },
  mauve: { h: 318, w: 2 },
  green: { h: 142, w: 4 },
  sage: { h: 118, w: 5 },
  forest: { h: 138, w: 3 },
  olive: { h: 78, w: 3 },
  mint: { h: 160, w: 3 },
  emerald: { h: 152, w: 2 },
  moss: { h: 122, w: 2 },
  gold: { h: 43, w: 4 },
  honey: { h: 40, w: 2 },
  yellow: { h: 48, w: 3 },
  mustard: { h: 46, w: 2 },
  sun: { h: 44, w: 1 },
  lavender: { h: 270, w: 4 },
  purple: { h: 282, w: 3 },
  lilac: { h: 292, w: 2 },
  violet: { h: 274, w: 2 },
  plum: { h: 310, w: 2 },
}

type Material = {
  kind: 'wall' | 'floor' | 'fabric' | 'dark'
  h: number
  s: number
  l: number
  w: number
}

const MATERIALS: Record<string, Material> = {
  white: { kind: 'wall', h: 40, s: 8, l: 96, w: 4 },
  cream: { kind: 'wall', h: 42, s: 28, l: 93, w: 4 },
  ivory: { kind: 'wall', h: 44, s: 22, l: 94, w: 3 },
  chalk: { kind: 'wall', h: 40, s: 6, l: 95, w: 2 },
  linen: { kind: 'fabric', h: 40, s: 22, l: 88, w: 4 },
  charcoal: { kind: 'dark', h: 220, s: 8, l: 16, w: 5 },
  graphite: { kind: 'dark', h: 220, s: 6, l: 18, w: 3 },
  ink: { kind: 'dark', h: 230, s: 10, l: 12, w: 2 },
  black: { kind: 'dark', h: 0, s: 0, l: 10, w: 3 },
  slate: { kind: 'dark', h: 215, s: 12, l: 28, w: 2 },
  oak: { kind: 'floor', h: 33, s: 34, l: 68, w: 4 },
  wood: { kind: 'floor', h: 32, s: 32, l: 52, w: 3 },
  wooden: { kind: 'floor', h: 32, s: 32, l: 52, w: 3 },
  walnut: { kind: 'floor', h: 28, s: 36, l: 38, w: 3 },
  timber: { kind: 'floor', h: 34, s: 30, l: 48, w: 2 },
  sand: { kind: 'floor', h: 38, s: 32, l: 78, w: 4 },
  beige: { kind: 'floor', h: 36, s: 24, l: 82, w: 2 },
  stone: { kind: 'floor', h: 30, s: 8, l: 70, w: 2 },
}

const DARK_WORDS = new Set([
  'moody',
  'charcoal',
  'dark',
  'night',
  'midnight',
  'ink',
  'black',
  'storm',
  'graphite',
  'shadow',
])

/** Metals and sunlight tint highlight, not the accent, when another hue is present. */
const HIGHLIGHT_ONLY = new Set(['gold', 'honey', 'sun'])

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

function round(n: number): number {
  return Math.round(n)
}

function normalizeHue(h: number): number {
  return ((h % 360) + 360) % 360
}

export function hashString(input: string): number {
  let h = 2166136261
  const s = input.trim().toLowerCase()
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function tokenize(input: string): string[] {
  const raw = input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
  const grams = [...raw]
  for (let i = 0; i < raw.length - 1; i += 1) {
    grams.push(`${raw[i]} ${raw[i + 1]}`)
  }
  return grams
}

function hueDelta(a: number, b: number): number {
  const d = Math.abs(normalizeHue(a) - normalizeHue(b)) % 360
  return Math.min(d, 360 - d)
}

function circularMean(votes: { h: number; w: number }[]): number | null {
  if (votes.length === 0) return null
  let x = 0
  let y = 0
  let wsum = 0
  for (const v of votes) {
    const rad = (v.h * Math.PI) / 180
    x += Math.cos(rad) * v.w
    y += Math.sin(rad) * v.w
    wsum += v.w
  }
  if (wsum === 0) return null
  return normalizeHue((Math.atan2(y, x) * 180) / Math.PI)
}

function resolveAccentHue(votes: { h: number; w: number }[]): number | null {
  if (votes.length === 0) return null
  let maxDelta = 0
  for (let i = 0; i < votes.length; i += 1) {
    for (let j = i + 1; j < votes.length; j += 1) {
      maxDelta = Math.max(maxDelta, hueDelta(votes[i].h, votes[j].h))
    }
  }
  if (maxDelta > 50) {
    return votes.reduce((best, v) => (v.w > best.w ? v : best)).h
  }
  return circularMean(votes)
}

export function hslToHex(h: number, s: number, l: number): string {
  const hue = normalizeHue(h)
  const sat = clamp(s, 0, 100) / 100
  const lig = clamp(l, 0, 100) / 100
  const a = sat * Math.min(lig, 1 - lig)
  const f = (n: number) => {
    const k = (n + hue / 30) % 12
    const color = lig - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color)
  }
  return `#${[f(0), f(8), f(4)].map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

function linearize(c: number): number {
  const s = c / 255
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex)
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b)
}

export function contrastRatio(a: string, b: string): number {
  const L1 = relativeLuminance(a)
  const L2 = relativeLuminance(b)
  const hi = Math.max(L1, L2)
  const lo = Math.min(L1, L2)
  return (hi + 0.05) / (lo + 0.05)
}

function hueFamily(h: number): string {
  const hue = normalizeHue(h)
  if (hue < 12 || hue >= 348) return 'Terracotta'
  if (hue < 22) return 'Clay'
  if (hue < 30) return 'Copper'
  if (hue < 38) return 'Oak'
  if (hue < 46) return 'Sand'
  if (hue < 58) return 'Gold'
  if (hue < 72) return 'Olive'
  if (hue < 100) return 'Moss'
  if (hue < 130) return 'Sage'
  if (hue < 150) return 'Fern'
  if (hue < 168) return 'Mint'
  if (hue < 186) return 'Teal'
  if (hue < 205) return 'Coastal'
  if (hue < 220) return 'Horizon'
  if (hue < 236) return 'Navy'
  if (hue < 258) return 'Indigo'
  if (hue < 278) return 'Lavender'
  if (hue < 300) return 'Lilac'
  if (hue < 325) return 'Mauve'
  return 'Blush'
}

function nameFromHsl(hsl: Hsl): string {
  const { h, s, l } = hsl
  if (s < 10) {
    if (l >= 95) return 'Gallery White'
    if (l >= 90) return 'Porcelain'
    if (l >= 84) return 'Warm Paper'
    if (l >= 74) return 'Pebble'
    if (l >= 62) return 'Light Stone'
    if (l >= 48) return 'Dove Grey'
    if (l >= 34) return 'Taupe Grey'
    if (l >= 22) return 'Graphite'
    if (l >= 14) return 'Charcoal'
    return 'India Ink'
  }

  const family = hueFamily(h)

  if (s < 18) {
    if (l >= 90) return `Mist ${family}`
    if (l >= 70) return `Dusty ${family}`
    if (l >= 40) return `Stone ${family}`
    return `Ink ${family}`
  }

  if (l >= 92) return `Porcelain ${family}`
  if (l >= 84) return `Pale ${family}`
  if (l >= 74) return `Sunlit ${family}`
  if (l >= 62) return family === 'Oak' ? 'Light Oak' : `Soft ${family}`
  if (l >= 48) return family
  if (l >= 34) return `Deep ${family}`
  if (l >= 20) return `Dark ${family}`
  return `Night ${family}`
}

function makeColor(h: number, s: number, l: number): PaletteColor {
  const hsl: Hsl = {
    h: round(normalizeHue(h)),
    s: round(clamp(s, 0, 100)),
    l: round(clamp(l, 0, 100)),
  }
  return {
    hex: hslToHex(hsl.h, hsl.s, hsl.l),
    name: nameFromHsl(hsl),
    hsl,
  }
}

function pickMaterial(
  tokens: string[],
  kind: Material['kind'],
): Material | null {
  let best: Material | null = null
  let bestW = 0
  for (const t of tokens) {
    const m = MATERIALS[t]
    if (m && m.kind === kind && m.w >= bestW) {
      best = m
      bestW = m.w
    }
  }
  return best
}

function anyMaterial(tokens: string[], kind: Material['kind']): boolean {
  return pickMaterial(tokens, kind) !== null
}

function ensureUniqueNames(palette: Palette): Palette {
  const seen = new Map<string, PaletteRole>()
  const next = { ...palette }
  for (const role of ROLES) {
    const color = next[role]
    const existing = seen.get(color.name)
    if (existing && existing !== role) {
      const titled = role.charAt(0).toUpperCase() + role.slice(1)
      next[role] = { ...color, name: `${color.name} ${titled}` }
    }
    seen.set(next[role].name, role)
  }
  return next
}

function fitText(
  hue: number,
  sat: number,
  darkBg: boolean,
  bgHex: string,
  surfaceHex: string,
): PaletteColor {
  const startL = darkBg ? 94 : 14
  const step = darkBg ? -2 : 2
  let l = startL
  let s = sat
  for (let i = 0; i < 50; i += 1) {
    const candidate = makeColor(hue, s, l)
    if (
      contrastRatio(candidate.hex, bgHex) >= 4.5 &&
      contrastRatio(candidate.hex, surfaceHex) >= 4.5
    ) {
      return candidate
    }
    l = clamp(l + step, 0, 100)
  }
  // Last resort: near-black or near-white, then walk L until both pass.
  s = darkBg ? 6 : 10
  l = darkBg ? 98 : 6
  const direction = darkBg ? -1 : 1
  for (let i = 0; i < 40; i += 1) {
    const candidate = makeColor(hue, s, l)
    if (
      contrastRatio(candidate.hex, bgHex) >= 4.5 &&
      contrastRatio(candidate.hex, surfaceHex) >= 4.5
    ) {
      return candidate
    }
    l = clamp(l + direction, 0, 100)
  }
  return makeColor(hue, 0, darkBg ? 98 : 8)
}

/**
 * Compose a six-role interior palette from a free-text room or vibe description.
 * Fully deterministic: same string always yields the same colors.
 */
export function generatePalette(description: string): Palette {
  const tokens = tokenize(description)
  const tokenSet = new Set(tokens)
  const seed = hashString(description)

  type HueVote = { h: number; w: number; token: string }
  const colorVotes: HueVote[] = []
  for (const t of tokens) {
    const vote = COLOR_HUES[t]
    if (vote) colorVotes.push({ ...vote, token: t })
  }
  const hasNonMetal = colorVotes.some((v) => !HIGHLIGHT_ONLY.has(v.token))
  const accentVotes = hasNonMetal
    ? colorVotes.filter((v) => !HIGHLIGHT_ONLY.has(v.token))
    : colorVotes
  const accentHueVote = resolveAccentHue(accentVotes)

  const wantsDark =
    [...tokenSet].some((t) => DARK_WORDS.has(t)) &&
    !tokenSet.has('white') &&
    !(tokenSet.has('cream') && !tokenSet.has('charcoal') && !tokenSet.has('moody'))

  // Navy as the only strong color, without light walls, reads as dark walls.
  const navyAsWall =
    tokenSet.has('navy') &&
    !tokenSet.has('white') &&
    !tokenSet.has('cream') &&
    !tokenSet.has('linen') &&
    !anyMaterial(tokens, 'wall')

  const dark = wantsDark || navyAsWall

  const wallMat = pickMaterial(tokens, 'wall')
  const floorMat = pickMaterial(tokens, 'floor')
  const fabricMat = pickMaterial(tokens, 'fabric')
  const darkMat = pickMaterial(tokens, 'dark')

  const jitter = (seed % 7) - 3
  const calm = tokenSet.has('calm') || tokenSet.has('airy') || tokenSet.has('soft')

  let accentHue: number
  if (accentHueVote !== null) {
    accentHue = normalizeHue(accentHueVote + jitter * 0.4)
  } else if (calm) {
    accentHue = 118 // sage — a classic calm interior companion
  } else {
    const companions = [200, 18, 155, 43]
    accentHue = companions[seed % companions.length]
  }

  // Walls
  let bgH: number
  let bgS: number
  let bgL: number
  if (dark) {
    bgH = darkMat?.h ?? (navyAsWall ? 222 : accentHue)
    bgS = clamp((darkMat?.s ?? 10) + (navyAsWall ? 18 : 0), 4, 28)
    bgL = clamp((darkMat?.l ?? 15) + (calm ? 4 : 0), 10, 22)
  } else if (wallMat) {
    bgH = wallMat.h
    bgS = wallMat.s
    bgL = wallMat.l
  } else if (tokenSet.has('sand') && accentHueVote !== null) {
    // Coastal sand rooms: pale, slightly tinted walls
    bgH = accentHue
    bgS = 10
    bgL = 95
  } else {
    bgH = accentHue
    bgS = calm ? 8 : 12
    bgL = 95
  }

  if (tokenSet.has('white')) {
    bgS = Math.min(bgS, 8)
    bgL = Math.max(bgL, 95)
    if (!dark) bgH = 40
  }

  // Floor / furniture plane
  let surfH: number
  let surfS: number
  let surfL: number
  if (floorMat) {
    surfH = floorMat.h
    surfS = floorMat.s
    surfL = floorMat.l
    if (tokenSet.has('light') && (tokenSet.has('oak') || tokenSet.has('wood'))) {
      surfL = Math.max(surfL, 70)
      surfS = Math.min(surfS, 32)
    }
  } else if (dark) {
    surfH = bgH
    surfS = clamp(bgS + 4, 6, 24)
    surfL = clamp(bgL + 10, 20, 32)
  } else {
    surfH = fabricMat?.h ?? 36
    surfS = fabricMat ? fabricMat.s : 18
    surfL = fabricMat ? Math.min(fabricMat.l, 82) : 82
  }

  // Keep surface in the same value family as walls so body text can sit on both.
  if (dark) {
    surfL = clamp(surfL, 18, 34)
  } else {
    surfL = clamp(surfL, 62, 90)
  }

  const bg = makeColor(bgH, bgS, bgL)
  const surface = makeColor(surfH, surfS, surfL)

  // Accent: the named color, vivid enough to read as a pillow or object.
  const accentS = dark ? (calm ? 32 : 42) : tokenSet.has('gold') ? 48 : calm ? 28 : 44
  const accentL = dark ? 62 : tokenSet.has('navy') && !dark ? 38 : 42
  const accent = makeColor(accentHue, accentS, accentL)

  // Highlight: linen, cream, gold, or a sunlit analog of the accent.
  let hiH = accentHue
  let hiS = 28
  let hiL = dark ? 78 : 78
  if (fabricMat) {
    hiH = fabricMat.h
    hiS = fabricMat.s
    hiL = dark ? Math.min(fabricMat.l, 86) : fabricMat.l
  } else if (tokenSet.has('cream') && !dark) {
    hiH = 42
    hiS = 32
    hiL = 90
  } else if (tokenSet.has('gold')) {
    hiH = 43
    hiS = 46
    hiL = 72
  } else if (tokenSet.has('sand')) {
    hiH = 38
    hiS = 36
    hiL = 84
  } else {
    hiH = normalizeHue(accentHue + (dark ? 28 : 18))
    hiS = dark ? 22 : 30
    hiL = dark ? 76 : 80
  }
  if (dark) hiL = clamp(hiL, 68, 88)
  const highlight = makeColor(hiH, hiS, hiL)

  const textHue = dark ? bgH : accentHue
  const textSat = dark ? 8 : 18
  const text = fitText(textHue, textSat, dark, bg.hex, surface.hex)

  const mutedL = dark ? 62 : 46
  const mutedS = dark ? 8 : 10
  const muted = makeColor(textHue, mutedS, mutedL)

  return ensureUniqueNames({
    bg,
    surface,
    accent,
    text,
    muted,
    highlight,
  })
}

export function toCssVariables(palette: Palette): string {
  const lines = ROLES.map((role) => `  --color-${role}: ${palette[role].hex};`)
  return `:root {\n${lines.join('\n')}\n}\n`
}

export function toTailwindTheme(palette: Palette): string {
  const lines = ROLES.map((role) => `        ${role}: '${palette[role].hex}',`)
  return `theme: {
  extend: {
    colors: {
      studio: {
${lines.join('\n')}
      },
    },
  },
}
`
}

export const PALETTE_ROLES = ROLES
