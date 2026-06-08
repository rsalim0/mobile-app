import axios, { AxiosError } from 'axios';

import {
  DictionaryEntry,
  LookupError,
  WordResult,
} from '@/types/dictionary';

/**
 * Pre-configured Axios instance for the Free Dictionary API.
 * All requests share this baseURL + timeout.
 */
// eslint-disable-next-line import/no-named-as-default-member -- axios.create is the canonical factory
const api = axios.create({
  baseURL: 'https://api.dictionaryapi.dev/api/v2/entries/en',
  timeout: 12000,
  headers: { Accept: 'application/json' },
});

/** Collect distinct, non-empty audio URLs across all phonetics of all entries. */
function extractAudioUrls(entries: DictionaryEntry[]): string[] {
  const urls = new Set<string>();
  for (const entry of entries) {
    for (const p of entry.phonetics ?? []) {
      if (p.audio && p.audio.trim().length > 0) {
        urls.add(p.audio.startsWith('//') ? `https:${p.audio}` : p.audio);
      }
    }
  }
  return [...urls];
}

/** Find the first usable IPA string. */
function extractPhoneticText(entries: DictionaryEntry[]): string | undefined {
  for (const entry of entries) {
    if (entry.phonetic) return entry.phonetic;
    for (const p of entry.phonetics ?? []) {
      if (p.text && p.text.trim().length > 0) return p.text;
    }
  }
  return undefined;
}

/**
 * Look up a word and return a normalized result.
 * Throws a typed {@link LookupError} on any failure so the UI can branch on
 * `error.kind` ('not_found' | 'network' | 'api') instead of raw HTTP codes.
 */
export async function lookupWord(rawWord: string): Promise<WordResult> {
  const word = rawWord.trim();
  if (!word) {
    throw new LookupError('api', 'Please enter a word to search.');
  }

  try {
    // Construct the request URL dynamically from the entered word.
    const { data } = await api.get<DictionaryEntry[]>(
      `/${encodeURIComponent(word)}`,
    );

    // Guard against malformed / empty responses.
    if (!Array.isArray(data) || data.length === 0) {
      throw new LookupError('not_found', `No definitions found for "${word}".`);
    }

    return {
      word: data[0]?.word ?? word,
      phoneticText: extractPhoneticText(data),
      audioUrls: extractAudioUrls(data),
      entries: data,
    };
  } catch (err) {
    if (err instanceof LookupError) throw err;

    const axErr = err as AxiosError;
    if (axErr.isAxiosError) {
      // Request timed out (slow or unreachable network).
      if (axErr.code === 'ECONNABORTED' || /timeout/i.test(axErr.message)) {
        throw new LookupError(
          'network',
          'The request timed out. Please check your connection and try again.',
        );
      }
      // No response at all → offline / DNS / connection refused.
      if (!axErr.response) {
        throw new LookupError(
          'network',
          'Network error. Please check your internet connection and try again.',
        );
      }
      const httpStatus = axErr.response.status;
      // 404 → word not found.
      if (httpStatus === 404) {
        throw new LookupError(
          'not_found',
          `Sorry, we couldn't find "${word}". Please check the spelling and try again.`,
        );
      }
      // 429 → rate limited.
      if (httpStatus === 429) {
        throw new LookupError(
          'api',
          "You're searching too fast. Please wait a moment and try again.",
        );
      }
      // 5xx → the dictionary service is down.
      if (httpStatus >= 500) {
        throw new LookupError(
          'api',
          'The dictionary service is temporarily unavailable. Please try again later.',
        );
      }
      // 400 / other client errors.
      if (httpStatus === 400) {
        throw new LookupError(
          'api',
          "That search couldn't be processed. Try a different spelling.",
        );
      }
      // Any other HTTP status.
      throw new LookupError(
        'api',
        `The dictionary service returned an error (${httpStatus}). Please try again.`,
      );
    }

    // Anything unexpected (e.g. JSON parse) — never crash the app.
    throw new LookupError('api', 'Something went wrong. Please try again.');
  }
}
