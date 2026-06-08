import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AudioButton } from '@/components/word/audio-button';
import { MeaningCard } from '@/components/word/meaning-card';
import { StateView } from '@/components/state-view';
import { Font, WW } from '@/constants/wordwise';
import { useSearchHistory } from '@/context/search-history';
import { lookupWord } from '@/services/dictionary';
import {
  DictionaryEntry,
  LookupError,
  LookupErrorKind,
  Meaning,
  WordResult,
} from '@/types/dictionary';

type Status =
  | { kind: 'loading' }
  | { kind: 'success'; result: WordResult }
  | { kind: 'error'; errorKind: LookupErrorKind; message: string };

/** Derive a human label (UK/US/AU…) from a Dictionary API audio filename. */
function accentLabel(url: string, index: number): string {
  const match = url.toLowerCase().match(/-([a-z]{2,3})\.mp3/);
  const code = match?.[1];
  const map: Record<string, string> = {
    uk: 'UK',
    us: 'US',
    au: 'AU',
    ca: 'CA',
    in: 'IN',
    nz: 'NZ',
  };
  return (code && map[code]) || `Audio ${index + 1}`;
}

/** This entry's IPA text, if any. */
function entryPhonetic(entry: DictionaryEntry): string | undefined {
  if (entry.phonetic) return entry.phonetic;
  for (const p of entry.phonetics ?? []) {
    if (p.text && p.text.trim()) return p.text;
  }
  return undefined;
}

/** Distinct, non-empty audio URLs for a single entry. */
function entryAudioUrls(entry: DictionaryEntry): string[] {
  const urls = new Set<string>();
  for (const p of entry.phonetics ?? []) {
    if (p.audio && p.audio.trim()) {
      urls.add(p.audio.startsWith('//') ? `https:${p.audio}` : p.audio);
    }
  }
  return [...urls];
}

/** A distinct pronunciation and every meaning that shares it. */
interface PronGroup {
  phonetic?: string;
  audioUrls: string[];
  meanings: Meaning[];
}

/**
 * Group the API's entries by pronunciation. Many words come back as several
 * entries that share the SAME phonetic (homonyms) — those merge into one
 * block. Only genuinely different pronunciations (heteronyms like "lead")
 * stay separate, so we never show a duplicated pronunciation.
 */
function groupByPronunciation(entries: DictionaryEntry[]): PronGroup[] {
  const groups: PronGroup[] = [];
  const byKey = new Map<string, PronGroup>();

  for (const entry of entries) {
    const phon = entryPhonetic(entry);
    const key = (phon ?? '').trim().toLowerCase();
    let group = byKey.get(key);
    if (!group) {
      group = { phonetic: phon, audioUrls: [], meanings: [] };
      byKey.set(key, group);
      groups.push(group);
    } else if (!group.phonetic && phon) {
      group.phonetic = phon;
    }
    for (const url of entryAudioUrls(entry)) {
      if (!group.audioUrls.includes(url)) group.audioUrls.push(url);
    }
    group.meanings.push(...entry.meanings);
  }
  return groups;
}

/** Collect up to 12 distinct synonyms across all meanings/definitions. */
function collectSynonyms(result: WordResult): string[] {
  const set = new Set<string>();
  for (const entry of result.entries) {
    for (const meaning of entry.meanings) {
      meaning.synonyms?.forEach((s) => set.add(s));
      meaning.definitions.forEach((d) => d.synonyms?.forEach((s) => set.add(s)));
    }
  }
  return [...set].slice(0, 12);
}

export default function WordDetailsScreen() {
  const { word } = useLocalSearchParams<{ word: string }>();
  const term = decodeURIComponent(word ?? '');
  const { addWord } = useSearchHistory();
  const [status, setStatus] = useState<Status>({ kind: 'loading' });

  const fetchWord = useCallback(async () => {
    setStatus({ kind: 'loading' });
    try {
      const result = await lookupWord(term);
      setStatus({ kind: 'success', result });
      // Activity 4.3 — record successful searches (de-duped in the store).
      addWord(result.word || term);
    } catch (err) {
      const e = err as LookupError;
      setStatus({
        kind: 'error',
        errorKind: e.kind ?? 'api',
        message: e.message ?? 'Something went wrong. Please try again.',
      });
    }
  }, [term, addWord]);

  useEffect(() => {
    // Fetch on mount / when the word changes. The setState happens after an
    // async network call (the documented exception to set-state-in-effect).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchWord();
  }, [fetchWord]);

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <Pressable
        accessibilityLabel="Go back"
        hitSlop={12}
        onPress={goBack}
        style={styles.backBtn}>
        <Ionicons name="chevron-back" size={28} color={WW.text} />
      </Pressable>

      {status.kind === 'loading' && <LoadingState term={term} />}

      {status.kind === 'error' && status.errorKind === 'not_found' && (
        <StateView
          icon={<MaterialCommunityIcons name="magnify-close" size={40} color={WW.primary} />}
          contextLabel={
            <Text style={styles.ctx}>
              You searched <Text style={styles.ctxBold}>&ldquo;{term}&rdquo;</Text>
            </Text>
          }
          title="Word not found"
          message="We couldn't find that word. Double-check the spelling or try another one."
          primaryLabel="Try again"
          onPrimary={goBack}
          secondaryLabel="Browse popular words"
          onSecondary={() => router.replace('/')}
        />
      )}

      {status.kind === 'error' && status.errorKind === 'network' && (
        <StateView
          icon={<MaterialCommunityIcons name="wifi-off" size={40} color={WW.textSecondary} />}
          title="No connection"
          message="You appear to be offline. Check your internet connection and try again."
          primaryLabel="Retry"
          onPrimary={fetchWord}
          footnote="WordWise needs a connection to look up words."
        />
      )}

      {status.kind === 'error' && status.errorKind === 'api' && (
        <StateView
          icon={<Ionicons name="warning-outline" size={40} color={WW.destructive} />}
          title="Something went wrong"
          message={status.message}
          primaryLabel="Retry"
          onPrimary={fetchWord}
          secondaryLabel="Back to search"
          onSecondary={() => router.replace('/')}
        />
      )}

      {status.kind === 'success' && <SuccessState result={status.result} />}
    </SafeAreaView>
  );
}

function LoadingState({ term }: { term: string }) {
  return (
    <View style={styles.loading}>
      <View style={styles.spinnerBadge}>
        <ActivityIndicator size="large" color={WW.primary} />
      </View>
      <Text style={styles.loadingText}>Looking it up…</Text>
      <Text style={styles.loadingWord}>&ldquo;{term}&rdquo;</Text>
    </View>
  );
}

function PronunciationRow({ audioUrls }: { audioUrls: string[] }) {
  // Multiple pronunciations (e.g. UK / US) — one labelled button each.
  return (
    <View style={styles.pronRow}>
      {audioUrls.map((url, i) => (
        <View key={url} style={styles.pronItem}>
          <AudioButton url={url} />
          <Text style={styles.pronLabel}>{accentLabel(url, i)}</Text>
        </View>
      ))}
    </View>
  );
}

/** One distinct pronunciation and all the meanings that share it. Heteronyms
 *  (same spelling, different sound/sense — e.g. "lead", "bass") render as
 *  separate groups; homonyms with the same sound are merged into one. */
function PronGroupBlock({
  group,
  showRule,
}: {
  group: PronGroup;
  showRule: boolean;
}) {
  const { phonetic, audioUrls, meanings } = group;

  return (
    <View style={[styles.entryBlock, showRule && styles.entryRule]}>
      <View style={styles.phoneticRow}>
        {phonetic ? <Text style={styles.phonetic}>{phonetic}</Text> : null}
        {/* Activity 3 — a single pronunciation sits inline with the phonetic. */}
        {audioUrls.length === 1 ? <AudioButton url={audioUrls[0]} /> : null}
      </View>

      {audioUrls.length > 1 ? <PronunciationRow audioUrls={audioUrls} /> : null}

      {meanings.map((meaning, mi) => (
        <MeaningCard key={mi} meaning={meaning} />
      ))}
    </View>
  );
}

function SuccessState({ result }: { result: WordResult }) {
  const synonyms = collectSynonyms(result);
  const groups = groupByPronunciation(result.entries);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.word}>{result.word}</Text>

      {groups.map((group, gi) => (
        <PronGroupBlock key={gi} group={group} showRule={gi > 0} />
      ))}

      {synonyms.length > 0 && (
        <View style={styles.synonyms}>
          <Text style={styles.synLabel}>SYNONYMS</Text>
          <View style={styles.chips}>
            {synonyms.map((s) => (
              <Pressable
                key={s}
                onPress={() => router.push(`/word/${encodeURIComponent(s)}` as never)}
                style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}>
                <Text style={styles.chipText}>{s}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: WW.bg },
  backBtn: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 4, alignSelf: 'flex-start' },

  content: { paddingHorizontal: 24, paddingBottom: 48, gap: 16 },
  word: { fontSize: 56, fontFamily: Font.display, color: WW.text, marginTop: 4 },
  entryBlock: { gap: 16 },
  entryRule: {
    borderTopWidth: 1,
    borderTopColor: WW.divider,
    paddingTop: 24,
    marginTop: 8,
  },
  phoneticRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  phonetic: { fontSize: 22, fontFamily: Font.regular, color: WW.textSecondary },
  pronRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 20, marginBottom: 8 },
  pronItem: { alignItems: 'center', gap: 6 },
  pronLabel: {
    fontSize: 13,
    fontFamily: Font.semibold,
    color: WW.textSecondary,
    letterSpacing: 1,
  },

  synonyms: { marginTop: 12, gap: 14 },
  synLabel: {
    fontSize: 13,
    fontFamily: Font.bold,
    letterSpacing: 1,
    color: WW.textSecondary,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  chip: {
    backgroundColor: WW.chip,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  chipPressed: { opacity: 0.7 },
  chipText: { color: WW.chipText, fontSize: 16, fontFamily: Font.medium },

  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  spinnerBadge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: WW.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: { fontSize: 20, fontFamily: Font.semibold, color: WW.text },
  loadingWord: { fontSize: 16, fontFamily: Font.regular, color: WW.textMuted },

  ctx: { fontSize: 16, fontFamily: Font.regular, color: WW.textSecondary },
  ctxBold: { color: WW.text, fontFamily: Font.bold },
});
