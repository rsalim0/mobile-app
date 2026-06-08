/**
 * Validate a single search term before looking it up.
 * Returns a user-facing error message, or `null` when the input is valid.
 *
 * Allowed: letters (including accents like café/naïve), plus hyphen and
 * apostrophe so real entries like "mother-in-law" and "o'clock" still route.
 */
export function validateWord(raw: string): string | null {
  const word = raw.trim();

  if (!word) {
    return 'Please enter a word to search.';
  }
  if (/\s/.test(word)) {
    return 'Please search for one word, not a sentence.';
  }
  if (/[0-9]/.test(word)) {
    return 'Please search for a word instead of numbers.';
  }
  if (!/^[\p{L}'-]+$/u.test(word)) {
    return 'Please search for a word without symbols.';
  }
  return null;
}
