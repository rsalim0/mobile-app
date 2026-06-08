import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { WW } from '@/constants/wordwise';

/**
 * Circular indigo pronunciation button (Activity 3).
 * Only render this when a real audio URL exists — the parent decides that, so
 * the `useAudioPlayer` hook here always receives a valid source.
 */
export function AudioButton({ url }: { url: string }) {
  const player = useAudioPlayer({ uri: url }, { updateInterval: 300 });
  const status = useAudioPlayerStatus(player);

  const isLoading = !status.isLoaded;
  const isPlaying = status.playing;

  function onPress() {
    if (isPlaying) {
      player.pause();
      return;
    }
    // Restart from the beginning each time, then play.
    player.seekTo(0);
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

const styles = StyleSheet.create({
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
