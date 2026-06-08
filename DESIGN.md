# Dictionary Mobile App — Design Document

**Lexitech Solutions Ltd** · Cross-platform (Android + iOS) · Expo SDK 56 · React Native 0.85 · Expo Router

---

## 1. Overview

A cross-platform dictionary app that lets users search English words and view
definitions, phonetics, parts of speech, example sentences, and audio
pronunciation. Data comes from the free Dictionary API. Networking is done with
**Axios**; UI screens are designed with **Daisy** and implemented in React
Native via **Expo Router**.

---

## 2. Required API Endpoints

| Purpose | Method | URL | Notes |
|---|---|---|---|
| Look up a word | `GET` | `https://api.dictionaryapi.dev/api/v2/entries/en/{word}` | `{word}` is URL-encoded user input |
| Audio pronunciation | `GET` | `phonetics[].audio` (absolute `.mp3` URL from the response) | Streamed/played with `expo-audio` |

**Success (HTTP 200)** — returns an array of entries:

```jsonc
[
  {
    "word": "hello",
    "phonetic": "/həˈləʊ/",
    "phonetics": [
      { "text": "/həˈləʊ/", "audio": "" },
      { "text": "/həˈloʊ/", "audio": ".../hello-us.mp3" }
    ],
    "meanings": [
      {
        "partOfSpeech": "noun",
        "definitions": [
          { "definition": "...", "example": "...", "synonyms": [], "antonyms": [] }
        ],
        "synonyms": [], "antonyms": []
      }
    ],
    "sourceUrls": ["https://en.wiktionary.org/wiki/hello"]
  }
]
```

**Not found (HTTP 404)** — returns an error object:

```jsonc
{ "title": "No Definitions Found", "message": "...", "resolution": "..." }
```

---

## 3. Application Architecture

Layered architecture — UI screens are thin; all data work lives in a service +
state layer so screens stay declarative and testable.

```
┌──────────────────────────────────────────────────────────────┐
│  PRESENTATION (Expo Router screens + components)               │
│   • Search screen      • Word details      • Drawer content    │
│   • Loading / Error / Not-found / Empty states                 │
└───────────────▲───────────────────────────────┬───────────────┘
                │ reads state / dispatches        │ renders
┌───────────────┴───────────────────────────────▼───────────────┐
│  STATE  (React Context)                                         │
│   • SearchHistoryContext  — history list, add/select, no dupes  │
│   • Per-screen state       — query, status, result, error       │
└───────────────▲───────────────────────────────┬───────────────┘
                │ calls                            │ returns data
┌───────────────┴───────────────────────────────▼───────────────┐
│  SERVICE  (src/services/dictionary.ts)                          │
│   • Axios instance (baseURL, timeout)                           │
│   • lookupWord(word) → normalized result | typed error          │
│   • Error mapping: 404 → NotFound, network → Network, else Api  │
└───────────────▲───────────────────────────────┬───────────────┘
                │ HTTP GET                         │ JSON
┌───────────────┴───────────────────────────────▼───────────────┐
│  EXTERNAL  Dictionary API  (api.dictionaryapi.dev)              │
└────────────────────────────────────────────────────────────────┘

Audio: expo-audio  ──plays──▶  phonetics[].audio (.mp3)
```

**Folder layout**

```
src/
  app/
    _layout.tsx          # Drawer navigator + SearchHistoryProvider
    index.tsx            # Search screen
    word/[word].tsx      # Word details screen (dynamic route)
  components/
    drawer-content.tsx   # Custom drawer: search history list
    word/                # presentational pieces (meaning, phonetics, etc.)
  context/
    search-history.tsx   # SearchHistoryProvider + useSearchHistory
  services/
    dictionary.ts        # Axios service + error mapping
  types/
    dictionary.ts        # API response types + app result/error types
```

---

## 4. Data Flow Diagram (DFD)

**Level 0 (context)**

```
   ┌──────┐   word query    ┌─────────────────┐   GET /entries/en/{word}   ┌──────────────┐
   │ User │ ──────────────▶ │  Dictionary App │ ─────────────────────────▶ │ Dictionary   │
   │      │ ◀────────────── │  (process 0)    │ ◀───────────────────────── │ API          │
   └──────┘  results/audio  └─────────────────┘    JSON entries / 404      └──────────────┘
```

**Level 1**

```
 User
  │  1. enter + submit word
  ▼
 [1.0 Validate & capture input] ──invalid──▶ inline "enter a word" message
  │ valid (trimmed word)
  ▼
 [2.0 Fetch word]  ──build URL, axios GET──▶  Dictionary API
  │      ▲ loading=true                          │
  │      └──────────── JSON / error ◀────────────┘
  ▼
 [3.0 Parse & normalize response]
  │   ├─ ok    ─▶ [4.0 Store in history]──(D1: history list, de-duped)
  │   │              │
  │   │              ▼
  │   │         [5.0 Render details]  ─▶ word, phonetics, meanings, examples
  │   │              │
  │   │              ▼
  │   │         [6.0 Play audio] ◀── tap speaker ── expo-audio ──▶ .mp3
  │   └─ 404 ─▶ [E1 Not-found state]
  │      net  ─▶ [E2 Network-error state + Retry]
  │      other─▶ [E3 Generic-error state + Retry]
  ▼
 (D1) Search history ──renders──▶ Drawer menu ──tap word──▶ back to [2.0]
```

**Data store**

- **D1 — Search history**: ordered, de-duplicated list of successfully searched
  words, held in `SearchHistoryContext` (in-memory for the session).

---

## 5. Screens / Pages

| # | Screen | Route | Responsibilities |
|---|---|---|---|
| 1 | **Search** | `index.tsx` | Input + search icon, validation, loading indicator, recent searches, empty state |
| 2 | **Word details** | `word/[word].tsx` | Word, phonetics, pronunciation speaker, parts of speech, definitions, examples; supports multiple meanings + long text |
| 3 | **Drawer / History** | `drawer-content.tsx` | List of previously searched words; tap re-runs the search |
| 4 | **States** | (within 1 & 2) | Loading spinner, Word-not-found, Network error + Retry, Empty state |

---

## 6. Activity → Implementation Map

| Activity | Where it lives |
|---|---|
| 1. Search & API integration | `index.tsx` (input/validation/loading) + `services/dictionary.ts` (axios GET) |
| 2. Display word details | `word/[word].tsx` + `components/word/*` |
| 3. Audio pronunciation | `word/[word].tsx` via `expo-audio` `useAudioPlayer` |
| 4. Drawer + history | `_layout.tsx` (Drawer) + `context/search-history.tsx` + `components/drawer-content.tsx` |
| 5. Error handling & feedback | `services/dictionary.ts` error mapping + state UI in both screens |

---

## 7. Key Technical Decisions

- **Axios** with a pre-configured instance (`baseURL`, `timeout`) and a single
  `lookupWord()` that returns either a normalized result or a **typed** error
  (`not_found | network | api`) so the UI never branches on raw HTTP codes.
- **Expo Router Drawer** (`expo-router/drawer`) with a custom `drawerContent`
  for the history list — file-based routing, dynamic `word/[word]` route.
- **expo-audio** `useAudioPlayer` for pronunciation (SDK 56; `expo-av` removed).
- **Search history** in React Context: de-duplicated, most-recent-first.
```