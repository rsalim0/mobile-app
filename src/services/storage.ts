import AsyncStorage from '@react-native-async-storage/async-storage';

/** Read and JSON-parse a value, returning `fallback` on miss or error. */
export async function loadJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/** JSON-stringify and persist a value. Best-effort; swallows errors. */
export async function saveJSON(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore write failures — persistence is a nice-to-have, not critical
  }
}
