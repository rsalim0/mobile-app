import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Font, WW } from '@/constants/wordwise';

interface StateViewProps {
  /** Icon element shown in the circular badge (e.g. an <Ionicons />). */
  icon: React.ReactNode;
  title: string;
  message: string;
  /** Optional context pill above the icon, e.g. `You searched "x"`. */
  contextLabel?: React.ReactNode;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  /** Optional footnote under the primary button. */
  footnote?: string;
}

/**
 * Shared centered empty/error layout used by the not-found, network-error,
 * and generic-error states (Activity 5). Mirrors the Daisy state screens.
 */
export function StateView({
  icon,
  title,
  message,
  contextLabel,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  footnote,
}: StateViewProps) {
  return (
    <View style={styles.root}>
      <View style={styles.center}>
        {contextLabel ? <View style={styles.contextPill}>{contextLabel}</View> : null}
        <View style={styles.iconBadge}>{icon}</View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>

      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          onPress={onPrimary}
          style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}>
          <Text style={styles.primaryText}>{primaryLabel}</Text>
        </Pressable>

        {secondaryLabel && onSecondary ? (
          <Pressable
            accessibilityRole="button"
            onPress={onSecondary}
            style={({ pressed }) => pressed && styles.pressed}>
            <Text style={styles.secondaryText}>{secondaryLabel}</Text>
          </Pressable>
        ) : null}

        {footnote ? <Text style={styles.footnote}>{footnote}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 24, paddingBottom: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18 },
  contextPill: {
    backgroundColor: WW.card,
    borderWidth: 1,
    borderColor: WW.cardBorder,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginBottom: 6,
  },
  iconBadge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: WW.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 30, fontFamily: Font.display, color: WW.text, textAlign: 'center' },
  message: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Font.regular,
    color: WW.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  footer: { gap: 16, alignItems: 'center' },
  primaryBtn: {
    alignSelf: 'stretch',
    backgroundColor: WW.primary,
    borderRadius: 999,
    paddingVertical: 18,
    alignItems: 'center',
  },
  primaryText: { color: WW.onPrimary, fontSize: 17, fontFamily: Font.bold },
  secondaryText: { color: WW.primary, fontSize: 16, fontFamily: Font.semibold },
  footnote: { color: WW.textMuted, fontSize: 14, fontFamily: Font.regular, textAlign: 'center' },
  pressed: { opacity: 0.85 },
});
