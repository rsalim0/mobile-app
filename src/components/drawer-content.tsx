import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from 'expo-router/build/react-navigation/drawer';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Font, WW } from '@/constants/wordwise';
import { useSearchHistory } from '@/context/search-history';

/**
 * Custom drawer: WordWise header, a Search shortcut, the SEARCH HISTORY list,
 * and a Clear history action (Activity 4). Tapping a history word re-runs the
 * search by navigating to its detail route.
 */
export function DrawerContent(props: DrawerContentComponentProps) {
  const { history, clear } = useSearchHistory();

  function go(path: string) {
    props.navigation.closeDrawer();
    router.push(path as never);
  }

  return (
    <View style={styles.root}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.logo}>
            <Ionicons name="book" size={22} color={WW.primary} />
          </View>
          <Text style={styles.brand}>WordWise</Text>
        </View>

        <Pressable
          onPress={() => go('/')}
          style={({ pressed }) => [styles.searchItem, pressed && styles.pressed]}>
          <Ionicons name="search" size={18} color={WW.chipText} />
          <Text style={styles.searchLabel}>Search</Text>
        </Pressable>

        <Text style={styles.sectionLabel}>SEARCH HISTORY</Text>

        {history.length === 0 ? (
          <Text style={styles.empty}>No searches yet.</Text>
        ) : (
          history.map((word) => (
            <Pressable
              key={word}
              onPress={() => go(`/word/${encodeURIComponent(word)}`)}
              style={({ pressed }) => [styles.historyItem, pressed && styles.pressed]}>
              <Ionicons name="time-outline" size={18} color={WW.textSecondary} />
              <Text style={styles.historyWord} numberOfLines={1}>
                {word}
              </Text>
            </Pressable>
          ))
        )}
      </DrawerContentScrollView>

      {history.length > 0 ? (
        <Pressable
          onPress={clear}
          style={({ pressed }) => [styles.clearRow, pressed && styles.pressed]}>
          <Ionicons name="trash-outline" size={18} color={WW.destructive} />
          <Text style={styles.clearText}>Clear history</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: WW.bg },
  scrollContent: { paddingTop: 8, paddingHorizontal: 8 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: WW.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: { fontSize: 24, fontFamily: Font.extrabold, color: WW.text },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: WW.chip,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginTop: 4,
  },
  searchLabel: { color: WW.chipText, fontFamily: Font.bold, fontSize: 16 },
  sectionLabel: {
    color: WW.textSecondary,
    fontFamily: Font.bold,
    fontSize: 13,
    letterSpacing: 1,
    paddingHorizontal: 14,
    marginTop: 24,
    marginBottom: 8,
  },
  empty: {
    color: WW.textMuted,
    fontFamily: Font.regular,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
  },
  historyWord: { color: WW.text, fontFamily: Font.medium, fontSize: 16, flex: 1 },
  clearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 22,
    paddingVertical: 18,
    borderTopWidth: 1,
    borderTopColor: WW.divider,
  },
  clearText: { color: WW.destructive, fontFamily: Font.bold, fontSize: 16 },
  pressed: { opacity: 0.6 },
});
