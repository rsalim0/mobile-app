import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Font } from '@/constants/wordwise';
import { useFavorites } from '@/context/favorites';
import { useSearchHistory } from '@/context/search-history';
import { useTheme, type Palette, type ThemePref } from '@/context/theme';

const THEME_OPTIONS: { value: ThemePref; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'light', label: 'Light', icon: 'sunny-outline' },
  { value: 'dark', label: 'Dark', icon: 'moon-outline' },
  { value: 'system', label: 'System', icon: 'phone-portrait-outline' },
];

export default function SettingsScreen() {
  const { colors: WW, pref, setPref } = useTheme();
  const styles = useMemo(() => makeStyles(WW), [WW]);
  const { history, clear } = useSearchHistory();
  const { favorites, clearAll } = useFavorites();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settings</Text>

        {/* Appearance */}
        <Text style={styles.sectionLabel}>APPEARANCE</Text>
        <View style={styles.card}>
          {THEME_OPTIONS.map((opt, i) => {
            const selected = pref === opt.value;
            return (
              <Pressable
                key={opt.value}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => setPref(opt.value)}
                style={({ pressed }) => [
                  styles.row,
                  i < THEME_OPTIONS.length - 1 && styles.rowDivider,
                  pressed && styles.pressed,
                ]}>
                <Ionicons name={opt.icon} size={20} color={WW.primary} />
                <Text style={styles.rowText}>{opt.label}</Text>
                {selected ? (
                  <Ionicons name="checkmark-circle" size={22} color={WW.primary} />
                ) : (
                  <View style={styles.radioEmpty} />
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Data */}
        <Text style={styles.sectionLabel}>DATA</Text>
        <View style={styles.card}>
          <Pressable
            disabled={history.length === 0}
            onPress={clear}
            style={({ pressed }) => [styles.row, styles.rowDivider, pressed && styles.pressed]}>
            <Ionicons name="time-outline" size={20} color={WW.textSecondary} />
            <Text style={[styles.rowText, history.length === 0 && styles.disabled]}>
              Clear search history
            </Text>
            <Text style={styles.count}>{history.length}</Text>
          </Pressable>
          <Pressable
            disabled={favorites.length === 0}
            onPress={clearAll}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
            <Ionicons name="bookmark-outline" size={20} color={WW.textSecondary} />
            <Text style={[styles.rowText, favorites.length === 0 && styles.disabled]}>
              Clear saved words
            </Text>
            <Text style={styles.count}>{favorites.length}</Text>
          </Pressable>
        </View>

        {/* About */}
        <Text style={styles.sectionLabel}>ABOUT</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="book" size={20} color={WW.primary} />
            <Text style={styles.rowText}>WordWise</Text>
            <Text style={styles.count}>v1.0.0</Text>
          </View>
        </View>
        <Text style={styles.footer}>
          Definitions from dictionaryapi.dev · Built with Expo
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (WW: Palette) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: WW.bg },
    content: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 },
    title: { fontSize: 40, fontFamily: Font.display, color: WW.text, marginBottom: 12 },
    sectionLabel: {
      fontSize: 13,
      fontFamily: Font.bold,
      letterSpacing: 1,
      color: WW.textSecondary,
      marginTop: 28,
      marginBottom: 10,
    },
    card: {
      backgroundColor: WW.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: WW.cardBorder,
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingHorizontal: 20,
      paddingVertical: 18,
    },
    rowDivider: { borderBottomWidth: 1, borderBottomColor: WW.cardBorder },
    rowText: { flex: 1, fontSize: 17, fontFamily: Font.medium, color: WW.text },
    disabled: { color: WW.textMuted },
    count: { fontSize: 15, fontFamily: Font.regular, color: WW.textMuted },
    radioEmpty: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: WW.cardBorder,
    },
    pressed: { opacity: 0.6 },
    footer: {
      fontSize: 13,
      fontFamily: Font.regular,
      color: WW.textMuted,
      textAlign: 'center',
      marginTop: 24,
    },
  });
