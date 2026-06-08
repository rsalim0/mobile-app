# 📖 WordWise — Dictionary Mobile App

A clean, cross-platform (Android · iOS · Web) English dictionary app built for
**Lexitech Solutions Ltd**. Search any word and get its pronunciation,
phonetics, parts of speech, definitions, examples, synonyms and antonyms — in a
cozy book-novel theme.

Built with **Expo SDK 56**, **Expo Router**, **TypeScript**, and **Axios**.
Data comes from the free [Dictionary API](https://dictionaryapi.dev), with
[Datamuse](https://www.datamuse.com/api/) powering autocomplete and spelling
suggestions. Screen designs were created with [Daisy](https://www.daisy.now)
(mockups in [`designs/`](./designs)).

---

## ✨ Features

- **Word search** with input validation and a loading state.
- **Realtime autocomplete** under the search bar (debounced, request-cancelling).
- **Word details** — word, phonetics, parts of speech, numbered definitions,
  example sentences, synonyms and antonyms.
- **Pronunciation audio** with full play / pause / resume / stop handling, plus
  separate UK/US/AU regional variants (e.g. `route` → /ɹuːt/ vs /ɹaʊt/).
- **Text-to-speech fallback** for words the API has no audio for (e.g. `insane`).
- **Heteronyms** (`lead`, `bass`) shown as separate pronunciation blocks;
  homonyms with the same sound are merged so pronunciations never duplicate.
- **Drawer navigation** with persistent **search history** and **saved words**.
- **Favorites / bookmarks**, **share** and **copy** a word + definition.
- **"Did you mean?"** spelling suggestions on the not-found screen.
- **"Surprise me"** random word and a rotating daily **Word of the Day**.
- **Robust error handling** — empty/sentence/number/symbol validation,
  timeout / offline / 404 / 429 / 5xx mapping, and an app-wide crash boundary.
- **Book-novel theme** — parchment palette, Lora body serif, Instrument Serif
  display headings, vector icons.

---

## 🚀 Getting started

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npx expo start        # then press a (Android), i (iOS), or w (web)

# Or target a platform directly
npm run android
npm run ios
npm run web
```

> Requires Node 18+ and the Expo toolchain. See the
> [Expo SDK 56 docs](https://docs.expo.dev/versions/v56.0.0/).

---

## 🔌 API endpoints

| Purpose | Method | URL |
|---|---|---|
| Look up a word | `GET` | `https://api.dictionaryapi.dev/api/v2/entries/en/{word}` |
| Pronunciation audio | `GET` | `phonetics[].audio` (absolute `.mp3` from the response) |
| Autocomplete | `GET` | `https://api.datamuse.com/sug?s={prefix}` |
| "Did you mean?" | `GET` | `https://api.datamuse.com/words?sp={word}` |

A 404 from the dictionary API means the word was not found.

---

## 🏗️ Architecture

A layered design keeps screens thin and all data work in a service + state layer.
See [`DESIGN.md`](./DESIGN.md) for the full Data Flow Diagram and architecture.

```
Presentation (Expo Router screens + components)
        │
State (React Context: search history, favorites — persisted)
        │
Service (Axios dictionary client, Datamuse suggestions, storage)
        │
External APIs (Dictionary API, Datamuse)
```

### Project structure

```
src/
  app/
    _layout.tsx          # Drawer + providers + fonts + error boundary
    index.tsx            # Search screen (autocomplete, surprise, WOTD)
    word/[word].tsx      # Word details + loading/not-found/error states
  components/
    drawer-content.tsx   # History + saved words
    suggestion-list.tsx  # Autocomplete dropdown
    state-view.tsx       # Shared empty/error layout
    error-boundary.tsx   # App-wide crash fallback
    word/                # audio-button, speak-button, meaning-card
  context/
    search-history.tsx   # Persisted history
    favorites.tsx        # Persisted bookmarks
  services/
    dictionary.ts        # Axios client + typed error mapping
    suggestions.ts       # Datamuse autocomplete + spelling
    storage.ts           # AsyncStorage JSON helper
  constants/wordwise.ts  # Theme tokens (colors + fonts) + word pools
  utils/                 # validate-word, word-picks
  types/dictionary.ts    # API + app types
```

---

## ✅ Activity coverage

| Activity | Where |
|---|---|
| 1 · Search & API integration | `app/index.tsx` + `services/dictionary.ts` |
| 2 · Display word details | `app/word/[word].tsx` + `components/word/*` |
| 3 · Audio pronunciation | `components/word/audio-button.tsx`, `speak-button.tsx` |
| 4 · Drawer navigation & history | `app/_layout.tsx`, `context/*`, `components/drawer-content.tsx` |
| 5 · Error handling & feedback | `services/dictionary.ts`, `utils/validate-word.ts`, `components/state-view.tsx` |

---

## 🧰 Tech stack

Expo SDK 56 · React Native 0.85 · Expo Router · TypeScript · Axios ·
expo-audio · expo-speech · AsyncStorage · @expo/vector-icons ·
Lora + Instrument Serif (Google Fonts).

## 📝 License

See [`LICENSE`](./LICENSE).
