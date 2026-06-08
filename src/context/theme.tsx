import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';

import { WW } from '@/constants/wordwise';
import { loadJSON, saveJSON } from '@/services/storage';

/** The set of color tokens every screen reads from. */
export interface Palette {
  primary: string;
  primaryDark: string;
  onPrimary: string;
  bg: string;
  card: string;
  cardBorder: string;
  chip: string;
  chipText: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  destructive: string;
  divider: string;
}

/** Light "old book" wood theme (the existing palette). */
export const lightColors: Palette = WW;

/** Dark "night library" wood theme. */
export const darkColors: Palette = {
  primary: '#b07a44',
  primaryDark: '#8a5e34',
  onPrimary: '#fbf4e6',
  bg: '#1b1510',
  card: '#261f18',
  cardBorder: '#3a2f24',
  chip: '#332a20',
  chipText: '#e3c99e',
  text: '#f1e7d6',
  textSecondary: '#b6a187',
  textMuted: '#857359',
  destructive: '#e0816f',
  divider: '#352b21',
};

export type ThemePref = 'light' | 'dark' | 'system';

interface ThemeValue {
  colors: Palette;
  /** The resolved scheme actually in use. */
  scheme: 'light' | 'dark';
  /** The user's preference ('system' follows the device). */
  pref: ThemePref;
  setPref: (pref: ThemePref) => void;
  /** Flip between light and dark explicitly. */
  toggle: () => void;
}

const ThemeContext = createContext<ThemeValue | undefined>(undefined);
const STORAGE_KEY = 'wordwise.theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [pref, setPrefState] = useState<ThemePref>('system');
  const hydrated = useRef(false);

  useEffect(() => {
    loadJSON<ThemePref>(STORAGE_KEY, 'system').then((stored) => {
      setPrefState(stored);
      hydrated.current = true;
    });
  }, []);

  useEffect(() => {
    if (hydrated.current) saveJSON(STORAGE_KEY, pref);
  }, [pref]);

  const scheme: 'light' | 'dark' =
    pref === 'system' ? (system === 'dark' ? 'dark' : 'light') : pref;
  const colors = scheme === 'dark' ? darkColors : lightColors;

  const setPref = useCallback((p: ThemePref) => setPrefState(p), []);
  const toggle = useCallback(
    () => setPrefState((p) => {
      const current = p === 'system' ? (system === 'dark' ? 'dark' : 'light') : p;
      return current === 'dark' ? 'light' : 'dark';
    }),
    [system],
  );

  const value = useMemo(
    () => ({ colors, scheme, pref, setPref, toggle }),
    [colors, scheme, pref, setPref, toggle],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}

/** Convenience hook for components that only need the colors. */
export function useThemeColors(): Palette {
  return useTheme().colors;
}
