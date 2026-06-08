// Types for the Free Dictionary API (https://api.dictionaryapi.dev)
// Endpoint: GET /api/v2/entries/en/{word}

/** A single phonetic entry — may carry IPA text and/or an audio URL. */
export interface Phonetic {
  text?: string;
  audio?: string;
  sourceUrl?: string;
}

/** One definition under a part of speech. */
export interface Definition {
  definition: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
}

/** A part of speech (noun, verb, …) with its definitions. */
export interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
  synonyms?: string[];
  antonyms?: string[];
}

/** A full entry as returned by the API (the API returns an array of these). */
export interface DictionaryEntry {
  word: string;
  phonetic?: string;
  phonetics?: Phonetic[];
  meanings: Meaning[];
  sourceUrls?: string[];
}

/** Shape of the API's 404 "not found" body. */
export interface NotFoundResponse {
  title: string;
  message: string;
  resolution: string;
}

// --- App-level normalized result ----------------------------------------

/** What the UI consumes: the raw entries plus a flattened best audio URL. */
export interface WordResult {
  word: string;
  /** First non-empty IPA string found, if any. */
  phoneticText?: string;
  /** All distinct pronunciation audio URLs (may be empty). */
  audioUrls: string[];
  entries: DictionaryEntry[];
}

/** Typed error categories so the UI never branches on raw HTTP codes. */
export type LookupErrorKind = 'not_found' | 'network' | 'api';

export class LookupError extends Error {
  kind: LookupErrorKind;
  constructor(kind: LookupErrorKind, message: string) {
    super(message);
    this.name = 'LookupError';
    this.kind = kind;
  }
}
