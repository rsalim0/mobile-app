import { Ionicons } from '@expo/vector-icons';
import type { ErrorBoundaryProps } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { WW } from '@/constants/wordwise';

/**
 * App-wide fallback for unexpected render-time crashes. Expo Router renders
 * this whenever a screen throws, instead of a white screen — and lets the
 * user recover with a single tap. Kept self-contained (no custom fonts/context)
 * so it works even if something upstream failed.
 */
export function AppErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View style={styles.root}>
      <View style={styles.badge}>
        <Ionicons name="bug-outline" size={40} color={WW.destructive} />
      </View>
      <Text style={styles.title}>Something broke</Text>
      <Text style={styles.message}>
        WordWise hit an unexpected error. You can try again.
      </Text>
      {__DEV__ ? <Text style={styles.detail}>{error.message}</Text> : null}
      <Pressable
        accessibilityRole="button"
        onPress={() => retry()}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <Text style={styles.buttonText}>Try again</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: WW.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  badge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: WW.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 26, fontWeight: '700', color: WW.text, textAlign: 'center' },
  message: {
    fontSize: 16,
    lineHeight: 24,
    color: WW.textSecondary,
    textAlign: 'center',
  },
  detail: {
    fontSize: 13,
    color: WW.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  button: {
    marginTop: 8,
    backgroundColor: WW.primary,
    borderRadius: 999,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  buttonText: { color: WW.onPrimary, fontSize: 17, fontWeight: '700' },
  pressed: { opacity: 0.85 },
});
