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
