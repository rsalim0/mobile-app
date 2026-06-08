import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { loadJSON, saveJSON } from '@/services/storage';

interface SearchHistoryValue {
  /** Most-recent-first list of successfully searched words. */
  history: string[];
  /** Add a word; de-duplicated (case-insensitive) and moved to the front. */
  addWord: (word: string) => void;
  /** Clear the entire history. */
  clear: () => void;
}

const SearchHistoryContext = createContext<SearchHistoryValue | undefined>(
  undefined,
);

const STORAGE_KEY = 'wordwise.history';
const MAX_HISTORY = 50;

export function SearchHistoryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [history, setHistory] = useState<string[]>([]);
  const hydrated = useRef(false);

  // Load persisted history once on mount.
  useEffect(() => {
    loadJSON<string[]>(STORAGE_KEY, []).then((stored) => {
      setHistory(stored);
      hydrated.current = true;
    });
  }, []);

  // Persist on change (after the initial hydration).
  useEffect(() => {
    if (hydrated.current) saveJSON(STORAGE_KEY, history);
  }, [history]);

  const addWord = useCallback((raw: string) => {
    const word = raw.trim();
    if (!word) return;
    setHistory((prev) => {
      const filtered = prev.filter(
        (w) => w.toLowerCase() !== word.toLowerCase(),
      );
      return [word, ...filtered].slice(0, MAX_HISTORY);
    });
  }, []);

  const clear = useCallback(() => setHistory([]), []);

  const value = useMemo(
    () => ({ history, addWord, clear }),
    [history, addWord, clear],
  );

  return (
    <SearchHistoryContext.Provider value={value}>
      {children}
    </SearchHistoryContext.Provider>
  );
}

export function useSearchHistory(): SearchHistoryValue {
  const ctx = useContext(SearchHistoryContext);
  if (!ctx) {
    throw new Error(
      'useSearchHistory must be used within a SearchHistoryProvider',
    );
  }
  return ctx;
}
