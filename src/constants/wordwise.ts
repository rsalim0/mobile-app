/**
 * WordWise palette — mirrors the indigo Daisy design used for the mockups.
 * The Daisy designs are light-themed, so these are fixed light tokens.
 */
export const WW = {
  primary: '#4f46e5',
  primaryDark: '#4338ca',
  onPrimary: '#ffffff',

  bg: '#ffffff',
  card: '#f8fafc',
  cardBorder: '#eef0f4',

  chip: '#eef2ff',
  chipText: '#3730a3',

  text: '#0f172a',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',

  destructive: '#dc2626',
  divider: '#eef0f4',
} as const;

/**
 * Plus Jakarta Sans weights (the font Daisy used). React Native picks a font
 * file by family name, not by `fontWeight`, so each weight is its own family.
 * Use these via `fontFamily` instead of `fontWeight`.
 */
export const Font = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
} as const;

/** A few friendly suggestions for the empty search state. */
export const SUGGESTED_WORDS = ['eloquent', 'serendipity', 'ephemeral'];
