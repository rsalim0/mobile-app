import axios from 'axios';

/**
 * Autocomplete suggestions from the Datamuse API (free, no key).
 * The Dictionary API has no prefix search, so we use Datamuse's `/sug`
 * endpoint, which is built for as-you-type word completion.
 */
// eslint-disable-next-line import/no-named-as-default-member -- axios.create is the canonical factory
const datamuse = axios.create({
  baseURL: 'https://api.datamuse.com',
  timeout: 8000,
});

interface DatamuseWord {
  word: string;
  score?: number;
}

/**
 * Warm up the connection (DNS + TLS handshake) so the user's first real
 * keystroke isn't paying cold-start latency. Fire-and-forget; ignore result.
 */
export function warmUpSuggestions(): void {
  datamuse.get('/sug', { params: { s: 'a', max: 1 } }).catch(() => {});
}

/**
 * Fetch up to 8 completions for `prefix`. Best-effort: any failure (network,
 * cancel) resolves to an empty list so suggestions never block the search.
 * Pass an AbortSignal to cancel a stale in-flight request as the user types.
 */
export async function fetchSuggestions(
  prefix: string,
  signal?: AbortSignal,
): Promise<string[]> {
  const q = prefix.trim();
  if (!q) return [];
  try {
    const { data } = await datamuse.get<DatamuseWord[]>('/sug', {
      params: { s: q, max: 8 },
      signal,
    });
    if (!Array.isArray(data)) return [];
    // Drop multi-word phrases — this is a single-word dictionary.
    return data.map((d) => d.word).filter((w) => w && !w.includes(' '));
  } catch {
    return [];
  }
}

/**
 * Spelling suggestions for a misspelled word ("did you mean?") via Datamuse's
 * `sp` (spelled-like) query. Best-effort; excludes the original word itself.
 */
export async function fetchSpellingSuggestions(
  word: string,
  signal?: AbortSignal,
): Promise<string[]> {
  const q = word.trim();
  if (!q) return [];
  try {
    const { data } = await datamuse.get<DatamuseWord[]>('/words', {
      params: { sp: q, max: 6 },
      signal,
    });
    if (!Array.isArray(data)) return [];
    return data
      .map((d) => d.word)
      .filter((w) => w && !w.includes(' ') && w.toLowerCase() !== q.toLowerCase());
  } catch {
    return [];
  }
}
