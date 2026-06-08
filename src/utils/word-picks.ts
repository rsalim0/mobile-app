import { WORD_OF_THE_DAY_BLURBS, WORD_POOL } from '@/constants/wordwise';

/** A deterministic Word of the Day — same word for everyone on a given date. */
export function wordOfTheDay(): { word: string; blurb?: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor(
    (now.getTime() - start.getTime()) / 86_400_000,
  );
  // Prefer words that have a blurb so the card always reads nicely.
  const withBlurb = WORD_POOL.filter((w) => WORD_OF_THE_DAY_BLURBS[w]);
  const pool = withBlurb.length ? withBlurb : WORD_POOL;
  const word = pool[dayOfYear % pool.length];
  return { word, blurb: WORD_OF_THE_DAY_BLURBS[word] };
}

/** A random word from the pool, optionally avoiding one (e.g. the current). */
export function randomWord(exclude?: string): string {
  const pool = [...new Set(WORD_POOL)].filter(
    (w) => w.toLowerCase() !== exclude?.toLowerCase(),
  );
  return pool[Math.floor(Math.random() * pool.length)];
}
