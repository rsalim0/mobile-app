import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Font } from '@/constants/wordwise';
import { useThemeColors, type Palette } from '@/context/theme';

/**
 * A book-themed loading animation: a spinning accent ring around a gently
 * breathing book icon, with three bouncing dots under "Looking it up…".
 */
export function WordLoader({ term }: { term: string }) {
  const WW = useThemeColors();
  const styles = useMemo(() => makeStyles(WW), [WW]);

  const spin = useSharedValue(0);
  const pulse = useSharedValue(0);
  const d1 = useSharedValue(0.3);
  const d2 = useSharedValue(0.3);
  const d3 = useSharedValue(0.3);

  useEffect(() => {
    spin.value = withRepeat(
      withTiming(1, { duration: 1100, easing: Easing.linear }),
      -1,
      false,
    );
    pulse.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    const bounce = (sv: typeof d1, delay: number) => {
      sv.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 350 }),
            withTiming(0.3, { duration: 350 }),
          ),
          -1,
          false,
        ),
      );
    };
    bounce(d1, 0);
    bounce(d2, 160);
    bounce(d3, 320);

    return () => {
      cancelAnimation(spin);
      cancelAnimation(pulse);
      cancelAnimation(d1);
      cancelAnimation(d2);
      cancelAnimation(d3);
    };
  }, [spin, pulse, d1, d2, d3]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value * 360}deg` }],
  }));
  const bookStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.9 + pulse.value * 0.18 }],
  }));
  const dot1 = useAnimatedStyle(() => ({ opacity: d1.value }));
  const dot2 = useAnimatedStyle(() => ({ opacity: d2.value }));
  const dot3 = useAnimatedStyle(() => ({ opacity: d3.value }));

  return (
    <View style={styles.root}>
      <View style={styles.badge}>
        <Animated.View style={[styles.ring, ringStyle]} />
        <Animated.View style={bookStyle}>
          <Ionicons name="book" size={40} color={WW.primary} />
        </Animated.View>
      </View>

      <View style={styles.labelRow}>
        <Text style={styles.label}>Looking it up</Text>
        <Animated.Text style={[styles.dot, dot1]}>.</Animated.Text>
        <Animated.Text style={[styles.dot, dot2]}>.</Animated.Text>
        <Animated.Text style={[styles.dot, dot3]}>.</Animated.Text>
      </View>
      <Text style={styles.word}>&ldquo;{term}&rdquo;</Text>
    </View>
  );
}

const makeStyles = (WW: Palette) =>
  StyleSheet.create({
    root: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18 },
    badge: {
      width: 104,
      height: 104,
      borderRadius: 52,
      backgroundColor: WW.chip,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ring: {
      position: 'absolute',
      width: 104,
      height: 104,
      borderRadius: 52,
      borderWidth: 3,
      borderColor: 'transparent',
      borderTopColor: WW.primary,
      borderRightColor: WW.primary,
    },
    labelRow: { flexDirection: 'row', alignItems: 'flex-end' },
    label: { fontSize: 20, fontFamily: Font.semibold, color: WW.text },
    dot: { fontSize: 20, fontFamily: Font.bold, color: WW.text },
    word: { fontSize: 16, fontFamily: Font.regular, color: WW.textMuted },
  });
