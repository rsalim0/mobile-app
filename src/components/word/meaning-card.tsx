import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Font } from '@/constants/wordwise';
import { useThemeColors, type Palette } from '@/context/theme';
import { Meaning } from '@/types/dictionary';

/**
 * One part-of-speech card: a pill label, then a numbered list of definitions,
 * each with an optional italicised example sentence (Activity 2).
 */
export function MeaningCard({ meaning }: { meaning: Meaning }) {
  const WW = useThemeColors();
  const styles = useMemo(() => makeStyles(WW), [WW]);

  return (
    <View style={styles.card}>
      <View style={styles.posPill}>
        <Text style={styles.posText}>{meaning.partOfSpeech}</Text>
      </View>

      {meaning.definitions.map((def, i) => (
        <View key={i} style={styles.defRow}>
          <Text style={styles.index}>{i + 1}</Text>
          <View style={styles.defBody}>
            <Text style={styles.definition}>{def.definition}</Text>
            {def.example ? (
              <Text style={styles.example}>&ldquo;{def.example}&rdquo;</Text>
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
}

const makeStyles = (WW: Palette) =>
  StyleSheet.create({
    card: {
      backgroundColor: WW.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: WW.cardBorder,
      padding: 20,
      gap: 18,
    },
    posPill: {
      alignSelf: 'flex-start',
      backgroundColor: WW.chip,
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 6,
    },
    posText: {
      color: WW.chipText,
      fontStyle: 'italic',
      fontFamily: Font.semibold,
      fontSize: 14,
    },
    defRow: { flexDirection: 'row', gap: 14 },
    index: {
      color: WW.primary,
      fontFamily: Font.extrabold,
      fontSize: 16,
      width: 18,
      textAlign: 'center',
      lineHeight: 24,
    },
    defBody: { flex: 1, gap: 8 },
    definition: { color: WW.text, fontFamily: Font.regular, fontSize: 16, lineHeight: 24 },
    example: {
      color: WW.textSecondary,
      fontSize: 15,
      lineHeight: 22,
      fontStyle: 'italic',
      fontFamily: Font.regular,
    },
  });
