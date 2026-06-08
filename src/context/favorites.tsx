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

interface FavoritesValue {
  /** Saved words, most-recent-first. */
  favorites: string[];
  isFavorite: (word: string) => boolean;
  /** Add the word if absent, remove it if present. Returns the new state. */
  toggle: (word: string) => void;
  remove: (word: string) => void;
}

const FavoritesContext = createContext<FavoritesValue | undefined>(undefined);

const STORAGE_KEY = 'wordwise.favorites';

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const hydrated = useRef(false);

  useEffect(() => {
    loadJSON<string[]>(STORAGE_KEY, []).then((stored) => {
      setFavorites(stored);
      hydrated.current = true;
    });
  }, []);

  useEffect(() => {
    if (hydrated.current) saveJSON(STORAGE_KEY, favorites);
  }, [favorites]);

  const isFavorite = useCallback(
    (word: string) =>
      favorites.some((w) => w.toLowerCase() === word.trim().toLowerCase()),
    [favorites],
  );

  const toggle = useCallback((raw: string) => {
    const word = raw.trim();
    if (!word) return;
    setFavorites((prev) => {
      const exists = prev.some((w) => w.toLowerCase() === word.toLowerCase());
      return exists
        ? prev.filter((w) => w.toLowerCase() !== word.toLowerCase())
        : [word, ...prev];
    });
  }, []);

  const remove = useCallback((raw: string) => {
    const word = raw.trim().toLowerCase();
    setFavorites((prev) => prev.filter((w) => w.toLowerCase() !== word));
  }, []);

  const value = useMemo(
    () => ({ favorites, isFavorite, toggle, remove }),
    [favorites, isFavorite, toggle, remove],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return ctx;
}
