import { Feather, Ionicons } from '@expo/vector-icons';
import { router, useNavigation } from 'expo-router';
import { DrawerActions } from 'expo-router/build/react-navigation/routers';
import { useEffect, useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SuggestionList } from '@/components/suggestion-list';
import { Font, SUGGESTED_WORDS } from '@/constants/wordwise';
import { useSearchHistory } from '@/context/search-history';
import { useThemeColors, type Palette } from '@/context/theme';
import { fetchSuggestions, warmUpSuggestions } from '@/services/suggestions';
import { validateWord } from '@/utils/validate-word';
import { randomWord, wordOfTheDay } from '@/utils/word-picks';

// On web, kill the default blue focus outline — we show a focused border instead.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const noOutline: any =
  Platform.OS === 'web' ? { outlineStyle: 'none' } : undefined;

export default function SearchScreen() {
  const WW = useThemeColors();
  const styles = useMemo(() => makeStyles(WW), [WW]);
  const navigation = useNavigation();
  const { history } = useSearchHistory();
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [focused, setFocused] = useState(false);

  // Warm the suggestions connection on mount so the first keystroke is snappy.
  useEffect(() => {
    warmUpSuggestions();
  }, []);

  // Realtime autocomplete: refetch as the user types (120ms debounce), and
  // abort any in-flight request so only the latest prefix wins.
  useEffect(() => {
    const q = query.trim();
    if (!q) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetchSuggestions(q, controller.signal).then(setSuggestions);
    }, 120);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  function goToWord(term: string) {
    router.push(`/word/${encodeURIComponent(term)}` as never);
  }

  function submit(word?: string) {
    const term = (word ?? query).trim();
    // Activity 1.2 — validate input (empty / sentence / numbers / symbols).
    const validationError = validateWord(term);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    goToWord(term);
  }

  const typing = query.trim().length > 0;
  const recent = history.length > 0;
  const list = recent ? history.slice(0, 8) : SUGGESTED_WORDS;
  const wotd = wordOfTheDay();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        {/* Header */}
        <Pressable
          accessibilityLabel="Open menu"
          hitSlop={12}
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          style={styles.menuBtn}>
          <Ionicons name="menu" size={28} color={WW.text} />
        </Pressable>

        <View style={styles.logo}>
          <Ionicons name="book" size={24} color={WW.onPrimary} />
        </View>
        <Text style={styles.title}>WordWise</Text>
        <Text style={styles.subtitle}>Look up any English word.</Text>

        {/* Search bar */}
        <View style={[styles.searchBar, focused && styles.searchBarFocused]}>
          <TextInput
            style={[styles.input, noOutline]}
            value={query}
            onChangeText={(t) => {
              setQuery(t);
              if (error) setError(null);
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Search a word..."
            placeholderTextColor={WW.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={() => submit()}
          />
          <Pressable
            accessibilityLabel="Search"
            onPress={() => submit()}
            style={({ pressed }) => [styles.searchBtn, noOutline, pressed && styles.pressed]}>
            <Ionicons name="search" size={20} color={WW.onPrimary} />
          </Pressable>
        </View>

        {/* A validation error always wins; else autocomplete while typing;
            else the helper + recents + Word of the Day. */}
        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : typing ? (
          <SuggestionList
            suggestions={suggestions}
            query={query}
            onSelect={(w) => submit(w)}
            onFill={(w) => setQuery(w)}
          />
        ) : (
          <>
            <Text style={styles.helper}>
              Try words like{' '}
              <Text style={styles.helperBold}>eloquent</Text>,{' '}
              <Text style={styles.helperBold}>serendipity</Text>, or{' '}
              <Text style={styles.helperBold}>ephemeral</Text>.
            </Text>

            {/* Surprise me — look up a random interesting word. */}
            <Pressable
              accessibilityLabel="Surprise me with a random word"
              onPress={() => goToWord(randomWord())}
              style={({ pressed }) => [styles.surprise, pressed && styles.pressed]}>
              <Ionicons name="shuffle" size={18} color={WW.primary} />
              <Text style={styles.surpriseText}>Surprise me</Text>
            </Pressable>

            <Text style={styles.sectionLabel}>
              {recent ? 'RECENT SEARCHES' : 'SUGGESTIONS'}
            </Text>
            <View style={styles.listCard}>
              {list.map((word, i) => (
                <Pressable
                  key={word}
                  onPress={() => submit(word)}
                  style={({ pressed }) => [
                    styles.row,
                    i < list.length - 1 && styles.rowDivider,
                    pressed && styles.rowPressed,
                  ]}>
                  <Ionicons name="time-outline" size={18} color={WW.textSecondary} />
                  <Text style={styles.rowWord}>{word}</Text>
                  <Feather name="arrow-up-right" size={18} color={WW.primary} />
                </Pressable>
              ))}
            </View>

            {/* Word of the day — rotates daily; tap to look it up. */}
            <Pressable
              accessibilityLabel={`Word of the day: ${wotd.word}`}
              onPress={() => goToWord(wotd.word)}
              style={({ pressed }) => [styles.wotd, pressed && styles.pressed]}>
              <Text style={styles.wotdLabel}>WORD OF THE DAY</Text>
              <Text style={styles.wotdWord}>{wotd.word}</Text>
              {wotd.blurb ? <Text style={styles.wotdDef}>{wotd.blurb}</Text> : null}
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (WW: Palette) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: WW.bg },
    content: { paddingHorizontal: 24, paddingBottom: 40, gap: 0 },
    menuBtn: { paddingVertical: 12, marginBottom: 8, alignSelf: 'flex-start' },
    logo: {
      width: 52,
      height: 52,
      borderRadius: 16,
      backgroundColor: WW.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: { fontSize: 48, fontFamily: Font.display, color: WW.text, marginTop: 16 },
    subtitle: { fontSize: 18, fontFamily: Font.regular, color: WW.textSecondary, marginTop: 4 },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: WW.card,
      borderRadius: 999,
      borderWidth: 2,
      borderColor: 'transparent',
      paddingLeft: 24,
      paddingRight: 6,
      paddingVertical: 6,
      marginTop: 28,
    },
    searchBarFocused: { borderColor: WW.primary, backgroundColor: WW.bg },
    input: { flex: 1, fontSize: 18, fontFamily: Font.regular, color: WW.text, paddingVertical: 12 },
    searchBtn: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: WW.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    helper: { fontSize: 15, fontFamily: Font.regular, color: WW.textSecondary, marginTop: 16 },
    helperBold: { fontFamily: Font.bold, color: WW.text },
    surprise: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: 8,
      marginTop: 16,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: WW.cardBorder,
      backgroundColor: WW.card,
    },
    surpriseText: { fontSize: 15, fontFamily: Font.semibold, color: WW.primary },
    error: { fontSize: 15, fontFamily: Font.semibold, color: WW.destructive, marginTop: 16 },
    sectionLabel: {
      fontSize: 13,
      fontFamily: Font.bold,
      letterSpacing: 1,
      color: WW.textSecondary,
      marginTop: 32,
      marginBottom: 12,
    },
    listCard: {
      backgroundColor: WW.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: WW.cardBorder,
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      paddingHorizontal: 20,
      paddingVertical: 20,
    },
    rowDivider: { borderBottomWidth: 1, borderBottomColor: WW.cardBorder },
    rowPressed: { backgroundColor: WW.chip },
    rowWord: { flex: 1, fontSize: 18, fontFamily: Font.medium, color: WW.text },
    pressed: { opacity: 0.85 },
    wotd: {
      backgroundColor: WW.primary,
      borderRadius: 24,
      padding: 24,
      marginTop: 28,
      gap: 6,
    },
    wotdLabel: {
      color: '#dcc7a3',
      fontSize: 13,
      fontFamily: Font.bold,
      letterSpacing: 1,
    },
    wotdWord: { color: WW.onPrimary, fontSize: 32, fontFamily: Font.display },
    wotdDef: { color: '#f1e7d4', fontSize: 16, fontFamily: Font.regular },
  });
