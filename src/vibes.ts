/** Room lines for Surprise me. Distinct from the four Compose presets. */
export const SURPRISE_VIBES = [
  'Mid-century walnut + olive.',
  'Japanese tatami + cedar.',
  'Desert dusk + clay.',
  'Greenhouse glass + moss.',
  'Loft concrete + brass.',
  'Alpine lodge + pine.',
  'Blush plaster + lilac.',
  'Indigo night + gold.',
] as const

export type SurpriseVibe = (typeof SURPRISE_VIBES)[number]

/**
 * Pick a curated vibe, skipping the text already in the field when another
 * choice exists so a second click still changes the room.
 */
export function pickSurpriseVibe(
  current: string,
  random: () => number = Math.random,
): SurpriseVibe {
  const trimmed = current.trim()
  const pool = SURPRISE_VIBES.filter((vibe) => vibe !== trimmed)
  const choices = pool.length > 0 ? pool : SURPRISE_VIBES
  const roll = random()
  const index = Math.min(
    choices.length - 1,
    Math.max(0, Math.floor(roll * choices.length)),
  )
  return choices[index]
}
