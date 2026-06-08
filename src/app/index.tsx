import { Feather, Ionicons } from '@expo/vector-icons';
import { router, useNavigation } from 'expo-router';
import { DrawerActions } from 'expo-router/build/react-navigation/routers';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Font, SUGGESTED_WORDS, WW } from '@/constants/wordwise';
import { useSearchHistory } from '@/context/search-history';

export default function SearchScreen() {
  const navigation = useNavigation();
  const { history } = useSearchHistory();
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  function submit(word?: string) {
    const term = (word ?? query).trim();
    // Activity 1.2 — validate that the search field is not empty.
    if (!term) {
      setError('Please enter a word to search.');
      return;
    }
    setError(null);
    router.push(`/word/${encodeURIComponent(term)}` as never);
  }

  const recent = history.length > 0;
  const list = recent ? history.slice(0, 8) : SUGGESTED_WORDS;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
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
        <View style={styles.searchBar}>
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={(t) => {
              setQuery(t);
              if (error) setError(null);
            }}
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
            style={({ pressed }) => [styles.searchBtn, pressed && styles.pressed]}>
            <Ionicons name="search" size={20} color={WW.onPrimary} />
          </Pressable>
        </View>

        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          <Text style={styles.helper}>
            Try words like{' '}
            <Text style={styles.helperBold}>eloquent</Text>,{' '}
            <Text style={styles.helperBold}>serendipity</Text>, or{' '}
            <Text style={styles.helperBold}>ephemeral</Text>.
          </Text>
        )}

        {/* Recent / suggestions */}
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

        {/* Word of the day (decorative, from the Daisy design) */}
        <View style={styles.wotd}>
          <Text style={styles.wotdLabel}>WORD OF THE DAY</Text>
          <Text style={styles.wotdWord}>petrichor</Text>
          <Text style={styles.wotdDef}>the smell of rain on dry earth</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  title: { fontSize: 42, fontFamily: Font.extrabold, color: WW.text, marginTop: 16 },
  subtitle: { fontSize: 18, fontFamily: Font.regular, color: WW.textSecondary, marginTop: 4 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WW.card,
    borderRadius: 999,
    paddingLeft: 24,
    paddingRight: 6,
    paddingVertical: 6,
    marginTop: 28,
  },
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
    color: '#c7d2fe',
    fontSize: 13,
    fontFamily: Font.bold,
    letterSpacing: 1,
  },
  wotdWord: { color: WW.onPrimary, fontSize: 28, fontFamily: Font.extrabold },
  wotdDef: { color: '#e0e7ff', fontSize: 16, fontFamily: Font.regular },
});
