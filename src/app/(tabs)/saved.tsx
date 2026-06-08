import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Font } from '@/constants/wordwise';
import { useFavorites } from '@/context/favorites';
import { useThemeColors, type Palette } from '@/context/theme';

export default function SavedScreen() {
  const WW = useThemeColors();
  const styles = useMemo(() => makeStyles(WW), [WW]);
  const { favorites, remove } = useFavorites();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Saved</Text>
        <Text style={styles.subtitle}>Words you've bookmarked.</Text>

        {favorites.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyBadge}>
              <Ionicons name="bookmark-outline" size={36} color={WW.primary} />
            </View>
            <Text style={styles.emptyTitle}>No saved words yet</Text>
            <Text style={styles.emptyText}>
              Tap the bookmark on any word to keep it here.
            </Text>
          </View>
        ) : (
          <View style={styles.listCard}>
            {favorites.map((word, i) => (
              <View
                key={word}
                style={[styles.row, i < favorites.length - 1 && styles.rowDivider]}>
                <Pressable
                  accessibilityLabel={`Open ${word}`}
                  onPress={() => router.push(`/word/${encodeURIComponent(word)}` as never)}
                  style={({ pressed }) => [styles.rowMain, pressed && styles.pressed]}>
                  <Ionicons name="bookmark" size={18} color={WW.primary} />
                  <Text style={styles.rowWord}>{word}</Text>
                </Pressable>
                <Pressable
                  accessibilityLabel={`Remove ${word}`}
                  hitSlop={10}
                  onPress={() => remove(word)}
                  style={({ pressed }) => [styles.removeBtn, pressed && styles.pressed]}>
                  <Ionicons name="close" size={20} color={WW.textMuted} />
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (WW: Palette) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: WW.bg },
    content: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 110 },
    title: { fontSize: 40, fontFamily: Font.display, color: WW.text },
    subtitle: {
      fontSize: 16,
      fontFamily: Font.regular,
      color: WW.textSecondary,
      marginTop: 2,
      marginBottom: 24,
    },
    listCard: {
      backgroundColor: WW.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: WW.cardBorder,
      overflow: 'hidden',
    },
    row: { flexDirection: 'row', alignItems: 'center' },
    rowDivider: { borderBottomWidth: 1, borderBottomColor: WW.cardBorder },
    rowMain: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      paddingHorizontal: 20,
      paddingVertical: 20,
    },
    rowWord: { flex: 1, fontSize: 18, fontFamily: Font.medium, color: WW.text },
    removeBtn: { padding: 18 },
    pressed: { opacity: 0.6 },
    empty: { alignItems: 'center', gap: 14, paddingTop: 64 },
    emptyBadge: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: WW.chip,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyTitle: { fontSize: 20, fontFamily: Font.bold, color: WW.text },
    emptyText: {
      fontSize: 15,
      fontFamily: Font.regular,
      color: WW.textSecondary,
      textAlign: 'center',
      paddingHorizontal: 24,
    },
  });
