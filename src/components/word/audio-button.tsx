import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useEffect, useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { useThemeColors, type Palette } from '@/context/theme';

/**
 * Circular pronunciation button (Activity 3) with full playback-state
 * management: play, pause/resume, and stop (auto-reset to the start when a
 * clip finishes). Only rendered when a real audio URL exists — there is never
 * a disabled/broken audio button (Activity 3.6).
 */
export function AudioButton({ url }: { url: string }) {
  const WW = useThemeColors();
  const styles = useMemo(() => makeStyles(WW), [WW]);
  const player = useAudioPlayer({ uri: url }, { updateInterval: 200 });
  const status = useAudioPlayerStatus(player);

  const isLoading = !status.isLoaded;
  const isPlaying = status.playing;

  // Stop state: when the clip finishes, rewind so the next tap plays from 0.
  useEffect(() => {
    if (status.didJustFinish) player.seekTo(0);
  }, [status.didJustFinish, player]);

  // Stop playback if the button unmounts (navigating away).
  useEffect(() => () => {
    player.pause();
  }, [player]);

  function onPress() {
    if (isPlaying) {
      player.pause(); // pause — keeps position so the next tap resumes
      return;
    }
    const atEnd =
      status.duration > 0 && status.currentTime >= status.duration - 0.05;
    if (atEnd) player.seekTo(0);
    player.play();
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={isPlaying ? 'Pause pronunciation' : 'Play pronunciation'}
      onPress={onPress}
      disabled={isLoading}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      {isLoading ? (
        <ActivityIndicator size="small" color={WW.onPrimary} />
      ) : (
        <Ionicons
          name={isPlaying ? 'pause' : 'volume-high'}
          size={22}
          color={WW.onPrimary}
        />
      )}
    </Pressable>
  );
}

const makeStyles = (WW: Palette) =>
  StyleSheet.create({
    button: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: WW.primary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: WW.primary,
      shadowOpacity: 0.35,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
    pressed: { opacity: 0.85, transform: [{ scale: 0.96 }] },
  });
