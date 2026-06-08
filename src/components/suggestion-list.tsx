import { Feather, Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Font, WW } from '@/constants/wordwise';

interface SuggestionListProps {
  suggestions: string[];
  /** The current input text, used to bold the matched prefix. */
  query: string;
  /** Tap a row → look the word up. */
  onSelect: (word: string) => void;
  /** Tap the ↖ affordance → fill the input with the word (refine, don't search). */
  onFill: (word: string) => void;
}

/** Splits a word into its matched prefix and the remainder (case-insensitive). */
function splitPrefix(word: string, query: string): [string, string] {
  const q = query.trim().toLowerCase();
  if (q && word.toLowerCase().startsWith(q)) {
    return [word.slice(0, q.length), word.slice(q.length)];
  }
  return ['', word];
}

/**
 * Live autocomplete dropdown shown under the search bar (Daisy "Search
 * Autocomplete" screen). The first row is highlighted as the default choice.
 * The row and the fill (↖) control are sibling Pressables — never nested, so
 * react-native-web doesn't render a <button> inside a <button>.
 */
export function SuggestionList({
  suggestions,
  query,
  onSelect,
  onFill,
}: SuggestionListProps) {
  return (
    <View style={styles.list}>
      {suggestions.map((word, i) => {
        const [matched, rest] = splitPrefix(word, query);
        const highlighted = i === 0;
        return (
          <View
            key={word}
            style={[
              styles.row,
              highlighted ? styles.rowHighlighted : styles.rowDivider,
            ]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Search ${word}`}
              onPress={() => onSelect(word)}
              style={({ pressed }) => [styles.main, pressed && styles.pressed]}>
              <Ionicons name="search" size={18} color={WW.textSecondary} />
              <Text style={styles.word} numberOfLines={1}>
                {matched ? <Text style={styles.matched}>{matched}</Text> : null}
                <Text style={styles.rest}>{rest}</Text>
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Use ${word}`}
              hitSlop={10}
              onPress={() => onFill(word)}
              style={({ pressed }) => [styles.fill, pressed && styles.pressed]}>
              <Feather name="arrow-up-left" size={18} color={WW.textSecondary} />
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { marginTop: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  rowHighlighted: { backgroundColor: WW.chip },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: WW.divider, borderRadius: 0 },
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 18,
  },
  fill: { padding: 8 },
  word: { flex: 1, fontSize: 18 },
  matched: { fontFamily: Font.bold, color: WW.text },
  rest: { fontFamily: Font.medium, color: WW.textSecondary },
  pressed: { opacity: 0.5 },
});
