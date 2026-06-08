/**
 * WordWise palette — a cozy book-novel / wood theme: aged parchment
 * backgrounds, walnut-brown accents, espresso text. Mirrors the Daisy theme.
 */
export const WW = {
  primary: '#855a32', // walnut
  primaryDark: '#5e3a1e',
  onPrimary: '#fbf4e6', // cream

  bg: '#f6ecd9', // parchment
  card: '#efe2cb', // soft tan paper
  cardBorder: '#ddcaa9',

  chip: '#e8d8bd', // tan
  chipText: '#5a4023', // deep brown

  text: '#3a2c20', // espresso
  textSecondary: '#8a755b',
  textMuted: '#b3a489',

  destructive: '#a23b2e', // brick red
  divider: '#e3d6c0',
} as const;

/**
 * Lora (a classic literary book serif) — the font Daisy uses for this theme.
 * React Native picks a font file by family name, not by `fontWeight`, so each
 * weight is its own family. Use these via `fontFamily` instead of `fontWeight`.
 * Lora tops out at 700, so `extrabold` reuses the bold file.
 */
export const Font = {
  regular: 'Lora_400Regular',
  medium: 'Lora_500Medium',
  semibold: 'Lora_600SemiBold',
  bold: 'Lora_700Bold',
  extrabold: 'Lora_700Bold',
  /** Instrument Serif — an elegant display serif for large headings/titles. */
  display: 'InstrumentSerif_400Regular',
} as const;

/** A few friendly suggestions for the empty search state. */
export const SUGGESTED_WORDS = ['eloquent', 'serendipity', 'ephemeral'];

/**
 * A curated pool of interesting words for "Surprise me" and Word of the Day.
 * All are real entries in the dictionary API.
 */
export const WORD_POOL = [
  'serendipity', 'ephemeral', 'petrichor', 'eloquent', 'luminous',
  'mellifluous', 'ineffable', 'sonder', 'halcyon', 'limerence',
  'effervescent', 'quintessential', 'ethereal', 'epiphany', 'wanderlust',
  'solitude', 'nostalgia', 'resilience', 'euphoria', 'labyrinth',
  'aurora', 'cascade', 'ember', 'lucid', 'meander',
  'nebulous', 'oblivion', 'paradox', 'reverie', 'sublime',
  'tranquil', 'vivid', 'whimsical', 'zephyr', 'aesthetic',
  'benevolent', 'cathartic', 'ineffable', 'plethora', 'ubiquitous',
];

/** A short, evocative blurb for the Word of the Day card (best-effort flavor). */
export const WORD_OF_THE_DAY_BLURBS: Record<string, string> = {
  petrichor: 'the smell of rain on dry earth',
  serendipity: 'a happy accident of discovery',
  ephemeral: 'lasting for a very short time',
  mellifluous: 'sweet or musical; pleasant to hear',
  halcyon: 'denoting a peaceful, golden time',
  sonder: 'the realization each passerby has a vivid life',
  zephyr: 'a soft, gentle breeze',
  aurora: 'the dawn; a natural light display',
  reverie: 'a state of being pleasantly lost in thought',
  limerence: 'the state of being infatuated',
};
