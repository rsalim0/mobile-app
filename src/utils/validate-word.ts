/**
 * Validate a single search term before looking it up.
 * Returns a user-facing error message, or `null` when the input is valid.
 *
 * Allowed: Latin letters (including accents like café/naïve), plus hyphen and
 * apostrophe so real entries like "mother-in-law" and "o'clock" still route.
 * Everything else is rejected with a specific, friendly message.
 */
export function validateWord(raw: string): string | null {
  const word = raw.trim();

  // 1. Empty / whitespace only.
  if (!word) {
    return 'Please enter a word to search.';
  }

  // 2. More than one word (any internal whitespace).
  if (/\s/.test(word)) {
    return 'Please search for one word, not a sentence.';
  }

  // 3. Unreasonably long (longest real English word is ~45 letters).
  if (word.length > 45) {
    return 'That looks too long to be a word.';
  }

  // 4. Contains digits (any script: 42, hello123, ٤٢).
  if (/\p{N}/u.test(word)) {
    return 'Please search for a word instead of numbers.';
  }

  // 5. Contains letters from a non-Latin script (Cyrillic, Greek, CJK…).
  if ([...word].some((ch) => /\p{L}/u.test(ch) && !/\p{Script=Latin}/u.test(ch))) {
    return 'Please search for an English word.';
  }

  // 6. Contains symbols — anything that isn't a Latin letter, hyphen or apostrophe.
  if (/[^\p{Script=Latin}'-]/u.test(word)) {
    return 'Please search for a word instead of numbers.';
  }

  // 7. No actual letters (e.g. "--", "''", "-'-").
  if (!/\p{Script=Latin}/u.test(word)) {
    return 'Please enter a word with letters.';
  }

  // 8. Starts or ends with a hyphen/apostrophe ("-cat", "dog'").
  if (/^['-]|['-]$/.test(word)) {
    return 'Please enter a valid word.';
  }

  // 9. Doubled-up punctuation ("a--b", "it''s").
  if (/['-]{2,}/.test(word)) {
    return 'Please enter a valid word.';
  }

  // 10. The same letter four+ times in a row ("brrrr", "aaaaah") — not a real word.
  if (/(\p{L})\1\1\1/u.test(word)) {
    return 'Please enter a real word.';
  }

  return null;
}
