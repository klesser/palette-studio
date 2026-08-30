import { describe, expect, it } from 'vitest'
import {
  contrastRatio,
  generatePalette,
  hashString,
  PALETTE_ROLES,
  tokenize,
  toCssVariables,
  toTailwindTheme,
  type Palette,
  type PaletteRole,
} from './palette'

const HEX = /^#[0-9a-f]{6}$/

function hueDelta(a: number, b: number): number {
  const d = Math.abs(a - b) % 360
  return Math.min(d, 360 - d)
}

function assertNamedHexPalette(palette: Palette) {
  for (const role of PALETTE_ROLES) {
    const color = palette[role]
    expect(color.hex).toMatch(HEX)
    expect(color.name.trim().length).toBeGreaterThan(2)
    expect(color.hsl.h).toBeGreaterThanOrEqual(0)
    expect(color.hsl.h).toBeLessThan(360)
    expect(color.hsl.s).toBeGreaterThanOrEqual(0)
    expect(color.hsl.s).toBeLessThanOrEqual(100)
    expect(color.hsl.l).toBeGreaterThanOrEqual(0)
    expect(color.hsl.l).toBeLessThanOrEqual(100)
  }
}

describe('tokenize', () => {
  it('splits on punctuation and includes bigrams', () => {
    const tokens = tokenize('White walls + light oak, calm.')
    expect(tokens).toContain('white')
    expect(tokens).toContain('oak')
    expect(tokens).toContain('light oak')
    expect(tokens).toContain('calm')
  })
})

describe('generatePalette', () => {
  it('returns six named hex colors for a calm oak room', () => {
    const palette = generatePalette('White walls + light oak, calm.')
    expect(Object.keys(palette).sort()).toEqual([...PALETTE_ROLES].sort())
    assertNamedHexPalette(palette)
  })

  it('returns six named hex colors for every built-in preset', () => {
    const prompts = [
      'White walls + light oak, calm.',
      'Moody charcoal + linen.',
      'Coastal blue + sand.',
      'Warm terracotta + cream.',
    ]
    for (const prompt of prompts) {
      assertNamedHexPalette(generatePalette(prompt))
    }
  })

  it('gives coastal blue and terracotta distinctly different hues', () => {
    const coastal = generatePalette('Coastal blue + sand.')
    const terracotta = generatePalette('Warm terracotta + cream.')

    expect(hueDelta(coastal.accent.hsl.h, terracotta.accent.hsl.h)).toBeGreaterThan(40)

    // Coastal sits in the blue-cyan band; terracotta in the red-orange band.
    const coastalHue = coastal.accent.hsl.h
    const terraHue = terracotta.accent.hsl.h
    expect(coastalHue).toBeGreaterThan(170)
    expect(coastalHue).toBeLessThan(230)
    expect(terraHue < 40 || terraHue > 340).toBe(true)
  })

  it('keeps text readable on both background and surface', () => {
    const prompts = [
      'White walls + light oak, calm.',
      'Moody charcoal + linen.',
      'Coastal blue + sand.',
      'Warm terracotta + cream.',
      'Sage green bedroom with blush pillows',
      'Navy walls and gold lamps',
      'a quiet room',
    ]
    for (const prompt of prompts) {
      const p = generatePalette(prompt)
      const onBg = contrastRatio(p.text.hex, p.bg.hex)
      const onSurface = contrastRatio(p.text.hex, p.surface.hex)
      expect(onBg, `${prompt} text on bg`).toBeGreaterThanOrEqual(4.5)
      expect(onSurface, `${prompt} text on surface`).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('is deterministic for the same input', () => {
    const a = generatePalette('Coastal blue + sand.')
    const b = generatePalette('Coastal blue + sand.')
    expect(a).toEqual(b)
    expect(hashString('Coastal blue + sand.')).toBe(hashString('Coastal blue + sand.'))
  })

  it('maps additional keywords onto distinct families', () => {
    const sage = generatePalette('sage linen sitting room')
    const blush = generatePalette('blush walls with cream trim')
    const navy = generatePalette('navy and gold library')
    const green = generatePalette('green forest cabin')

    expect(sage.accent.hsl.h).toBeGreaterThan(100)
    expect(sage.accent.hsl.h).toBeLessThan(140)
    expect(blush.accent.hsl.h > 320 || blush.accent.hsl.h < 20).toBe(true)
    expect(navy.accent.hsl.h).toBeGreaterThan(210)
    expect(navy.accent.hsl.h).toBeLessThan(245)
    expect(green.accent.hsl.h).toBeGreaterThan(125)
    expect(green.accent.hsl.h).toBeLessThan(160)
  })

  it('treats charcoal + linen as a dark palette with light text', () => {
    const p = generatePalette('Moody charcoal + linen.')
    expect(p.bg.hsl.l).toBeLessThan(30)
    expect(p.text.hsl.l).toBeGreaterThan(70)
  })

  it('treats white oak as a light palette with dark text', () => {
    const p = generatePalette('White walls + light oak, calm.')
    expect(p.bg.hsl.l).toBeGreaterThan(85)
    expect(p.text.hsl.l).toBeLessThan(35)
    expect(p.surface.hsl.h).toBeGreaterThan(20)
    expect(p.surface.hsl.h).toBeLessThan(45)
  })
})

describe('export snippets', () => {
  it('emits CSS variables and a Tailwind theme snippet', () => {
    const p = generatePalette('Coastal blue + sand.')
    const css = toCssVariables(p)
    const tw = toTailwindTheme(p)
    for (const role of PALETTE_ROLES) {
      expect(css).toContain(`--color-${role}: ${p[role as PaletteRole].hex};`)
      expect(tw).toContain(`${role}: '${p[role as PaletteRole].hex}'`)
    }
    expect(css.startsWith(':root')).toBe(true)
    expect(tw).toContain('theme:')
    expect(tw).toContain('extend:')
  })
})
