import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { WW } from '@/constants/wordwise';

/**
 * Text-to-speech pronunciation fallback for words the dictionary API has no
 * recorded audio for (e.g. "insane"). Uses the device's speech engine
 * (Web Speech API on web), so there's always a way to hear a word.
 */
export function SpeakButton({ word }: { word: string }) {
  const [speaking, setSpeaking] = useState(false);

  // Stop any speech if this button unmounts.
  useEffect(() => () => {
    Speech.stop();
  }, []);

  function onPress() {
    if (speaking) {
      Speech.stop();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    Speech.speak(word, {
      language: 'en-US',
      rate: 0.9,
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={speaking ? 'Stop pronunciation' : 'Hear pronunciation'}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <Ionicons
        name={speaking ? 'stop' : 'volume-high'}
        size={22}
        color={WW.onPrimary}
      />
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
