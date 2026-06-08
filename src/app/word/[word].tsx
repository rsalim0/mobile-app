import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AudioButton } from '@/components/word/audio-button';
import { MeaningCard } from '@/components/word/meaning-card';
import { StateView } from '@/components/state-view';
import { Font, WW } from '@/constants/wordwise';
import { useFavorites } from '@/context/favorites';
import { useSearchHistory } from '@/context/search-history';
import { lookupWord } from '@/services/dictionary';
import { fetchSpellingSuggestions } from '@/services/suggestions';
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
  return collectField(result, 'synonyms');
}

/** Collect up to 12 distinct antonyms across all meanings/definitions. */
function collectAntonyms(result: WordResult): string[] {
  return collectField(result, 'antonyms');
}

function collectField(result: WordResult, field: 'synonyms' | 'antonyms'): string[] {
  const set = new Set<string>();
  for (const entry of result.entries) {
    for (const meaning of entry.meanings) {
      meaning[field]?.forEach((s) => set.add(s));
      meaning.definitions.forEach((d) => d[field]?.forEach((s) => set.add(s)));
    }
  }
  return [...set].slice(0, 12);
}

/** A copy/share-friendly summary of the word. */
function buildShareText(result: WordResult): string {
  const groups = groupByPronunciation(result.entries);
  const phon = groups[0]?.phonetic;
  const firstDef =
    result.entries[0]?.meanings[0]?.definitions[0]?.definition;
  const lines = [result.word + (phon ? `  ${phon}` : '')];
  if (firstDef) lines.push(firstDef);
  lines.push('— via WordWise');
  return lines.join('\n\n');
}

export default function WordDetailsScreen() {
  const { word } = useLocalSearchParams<{ word: string }>();
  const term = decodeURIComponent(word ?? '');
  const { addWord } = useSearchHistory();
  const [status, setStatus] = useState<Status>({ kind: 'loading' });
  const [didYouMean, setDidYouMean] = useState<string[]>([]);

  const fetchWord = useCallback(async () => {
    setStatus({ kind: 'loading' });
    setDidYouMean([]);
    try {
      const result = await lookupWord(term);
      setStatus({ kind: 'success', result });
      // Activity 4.3 — record successful searches (de-duped in the store).
      addWord(result.word || term);
    } catch (err) {
      const e = err as LookupError;
      const kind = e.kind ?? 'api';
      setStatus({
        kind: 'error',
        errorKind: kind,
        message: e.message ?? 'Something went wrong. Please try again.',
      });
      // "Did you mean?" — offer close spellings when a word isn't found.
      if (kind === 'not_found') {
        fetchSpellingSuggestions(term).then(setDidYouMean);
      }
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

  const result = status.kind === 'success' ? status.result : null;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Go back"
          hitSlop={12}
          onPress={goBack}
          style={({ pressed }) => [styles.iconBtn, pressed && styles.actionPressed]}>
          <Ionicons name="chevron-back" size={28} color={WW.text} />
        </Pressable>
        {result ? <WordActions result={result} /> : null}
      </View>

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
          extra={
            didYouMean.length > 0 ? (
              <View style={styles.didYouMean}>
                <Text style={styles.didYouMeanLabel}>Did you mean?</Text>
                <View style={styles.didYouMeanChips}>
                  {didYouMean.map((w) => (
                    <Pressable
                      key={w}
                      onPress={() => router.replace(`/word/${encodeURIComponent(w)}` as never)}
                      style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}>
                      <Text style={styles.chipText}>{w}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : undefined
          }
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

      {result ? <SuccessState result={result} /> : null}
    </SafeAreaView>
  );
}

/** Bookmark / copy / share actions for the current word. */
function WordActions({ result }: { result: WordResult }) {
  const { isFavorite, toggle } = useFavorites();
  const [copied, setCopied] = useState(false);
  const fav = isFavorite(result.word);

  async function onShare() {
    try {
      await Share.share({ message: buildShareText(result) });
    } catch {
      // user cancelled or platform has no share sheet — ignore
    }
  }

  async function onCopy() {
    await Clipboard.setStringAsync(buildShareText(result));
    setCopied(true);
    setTimeout(() => setCopied(false), 1300);
  }

  return (
    <View style={styles.headerActions}>
      <Pressable
        accessibilityLabel={fav ? 'Remove bookmark' : 'Bookmark word'}
        hitSlop={10}
        onPress={() => toggle(result.word)}
        style={({ pressed }) => pressed && styles.actionPressed}>
        <Ionicons
          name={fav ? 'bookmark' : 'bookmark-outline'}
          size={24}
          color={fav ? WW.primary : WW.text}
        />
      </Pressable>
      <Pressable
        accessibilityLabel="Copy definition"
        hitSlop={10}
        onPress={onCopy}
        style={({ pressed }) => pressed && styles.actionPressed}>
        <Ionicons
          name={copied ? 'checkmark' : 'copy-outline'}
          size={24}
          color={copied ? WW.primary : WW.text}
        />
      </Pressable>
      <Pressable
        accessibilityLabel="Share word"
        hitSlop={10}
        onPress={onShare}
        style={({ pressed }) => pressed && styles.actionPressed}>
        <Ionicons name="share-social-outline" size={24} color={WW.text} />
      </Pressable>
    </View>
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

/** One distinct pronunciation and all the meanings that share it. */
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
        {audioUrls.length === 1 ? <AudioButton url={audioUrls[0]} /> : null}
      </View>

      {audioUrls.length > 1 ? <PronunciationRow audioUrls={audioUrls} /> : null}

      {meanings.map((meaning, mi) => (
        <MeaningCard key={mi} meaning={meaning} />
      ))}
    </View>
  );
}

/** A tappable label + chip list (synonyms / antonyms). */
function ChipSection({ label, words }: { label: string; words: string[] }) {
  if (words.length === 0) return null;
  return (
    <View style={styles.synonyms}>
      <Text style={styles.synLabel}>{label}</Text>
      <View style={styles.chips}>
        {words.map((w) => (
          <Pressable
            key={w}
            onPress={() => router.push(`/word/${encodeURIComponent(w)}` as never)}
            style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}>
            <Text style={styles.chipText}>{w}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function SuccessState({ result }: { result: WordResult }) {
  const groups = groupByPronunciation(result.entries);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.word}>{result.word}</Text>

      {groups.map((group, gi) => (
        <PronGroupBlock key={gi} group={group} showRule={gi > 0} />
      ))}

      <ChipSection label="SYNONYMS" words={collectSynonyms(result)} />
      <ChipSection label="ANTONYMS" words={collectAntonyms(result)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: WW.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 4,
  },
  iconBtn: { padding: 4 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  actionPressed: { opacity: 0.5 },

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

  didYouMean: { alignItems: 'center', gap: 12, marginTop: 8 },
  didYouMeanLabel: { fontSize: 15, fontFamily: Font.semibold, color: WW.textSecondary },
  didYouMeanChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
});
