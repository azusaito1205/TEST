import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { Audio } from 'expo-av';
import { sessionStore } from '../lib/sessionStore';
import { deviationScore } from '../lib/deviation';
import { transcribeAudio } from '../lib/openaiTranscribe';

function Meter({ value }: { value: number }) {
  const w = Math.max(0, Math.min(100, value));
  return (
    <View style={{ borderWidth: 1, borderRadius: 12, padding: 12, gap: 8 }}>
      <Text style={{ fontWeight: '700' }}>逸脱度：{w}</Text>
      <View style={{ height: 10, borderWidth: 1, borderRadius: 999, overflow: 'hidden' }}>
        <View style={{ width: `${w}%`, height: '100%' }} />
      </View>
      <Text style={{ opacity: 0.7 }}>0-30: オン / 31-60: 寄り道 / 61-100: 脱線</Text>
    </View>
  );
}

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

export default function Live() {
  const plan = sessionStore.getPlan();
  const [phaseIndex, setPhaseIndex] = useState(sessionStore.getPhaseIndex());

  const [transcript, setTranscript] = useState('');
  const [manual, setManual] = useState('');

  const [isRunning, setIsRunning] = useState(false);
  const isRunningRef = useRef(false);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const [status, setStatus] = useState<'idle' | 'recording' | 'transcribing'>('idle');

  const [ema, setEma] = useState(0);

  if (!plan) {
    router.replace('/' as any);
    return null;
  }

  const observedText = useMemo(() => {
    const t = transcript.trim();
    if (t.length > 0) return t.slice(-800);
    return manual.trim();
  }, [transcript, manual]);

  const raw = useMemo(() => deviationScore(observedText, plan, phaseIndex), [observedText, plan, phaseIndex]);

  useEffect(() => {
    setEma(prev => Math.round(prev * 0.8 + raw.deviation * 0.2));
  }, [raw.deviation]);

  const setPhase = (i: number) => {
    setPhaseIndex(i);
    sessionStore.setPhaseIndex(i);
  };

  const stopLoop = async () => {
    isRunningRef.current = false;
    setIsRunning(false);
    setStatus('idle');

    try {
      const rec = recordingRef.current;
      recordingRef.current = null;
      if (rec) {
        try { await rec.stopAndUnloadAsync(); } catch {}
      }
    } catch {}
  };

  const recordChunkOnce = async (chunkMs: number) => {
    const { status: perm } = await Audio.requestPermissionsAsync();
    if (perm !== 'granted') throw new Error('マイク権限が必要です');

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const rec = new Audio.Recording();
    recordingRef.current = rec;

    await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    await rec.startAsync();
    setStatus('recording');

    await sleep(chunkMs);

    await rec.stopAndUnloadAsync();
    const uri = rec.getURI();
    recordingRef.current = null;
    if (!uri) return '';

    setStatus('transcribing');
    const text = await transcribeAudio(uri, { language: 'ja' });
    return text;
  };

  const startLoop = async () => {
    if (isRunningRef.current) return;

    isRunningRef.current = true;
    setIsRunning(true);

    try {
      while (isRunningRef.current) {
        const text = await recordChunkOnce(5000);
        if (text && text.trim()) {
          setTranscript(prev => (prev + (prev.length ? ' ' : '') + text.trim()).trim());
        }
        await sleep(250);
      }
    } catch (e: any) {
      Alert.alert('録音/文字起こしエラー', String(e?.message ?? e));
      await stopLoop();
    } finally {
      setStatus('idle');
      setIsRunning(false);
      isRunningRef.current = false;
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: '700' }}>ライブ</Text>
      <Text style={{ opacity: 0.8 }}>目的：{plan.goal}</Text>

      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        {plan.phases.map((p, i) => (
          <Pressable
            key={p.id}
            onPress={() => setPhase(i)}
            style={{ padding: 10, borderRadius: 12, borderWidth: 1, opacity: i === phaseIndex ? 1 : 0.6 }}
          >
            <Text>{i + 1}. {p.title}</Text>
          </Pressable>
        ))}
      </View>

      <Meter value={ema} />
      <Text style={{ opacity: 0.8 }}>状態：{status === 'idle' ? '待機' : status === 'recording' ? '録音中' : '文字起こし中'}</Text>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Pressable onPress={isRunning ? stopLoop : startLoop} style={{ flex: 1, padding: 12, borderRadius: 12, borderWidth: 1 }}>
          <Text>{isRunning ? '⏹ 録音停止' : '🎙 録音開始（5秒ごと文字起こし）'}</Text>
        </Pressable>
        <Pressable onPress={() => { setTranscript(''); setManual(''); }} style={{ padding: 12, borderRadius: 12, borderWidth: 1 }}>
          <Text>クリア</Text>
        </Pressable>
      </View>

      <View style={{ borderWidth: 1, borderRadius: 12, padding: 12, gap: 8 }}>
        <Text style={{ fontWeight: '700' }}>文字起こし（蓄積）</Text>
        <Text>{transcript.length ? transcript : '（まだありません）'}</Text>
      </View>

      <View style={{ borderWidth: 1, borderRadius: 12, padding: 12, gap: 8 }}>
        <Text style={{ fontWeight: '700' }}>手入力（フォールバック）</Text>
        <TextInput
          value={manual}
          onChangeText={setManual}
          placeholder="音声が使えない時はここに入力"
          style={{ borderWidth: 1, borderRadius: 12, padding: 12, minHeight: 90 }}
          multiline
        />
      </View>

      <Pressable onPress={() => router.push('/confirm' as any)} style={{ padding: 12, borderRadius: 12, borderWidth: 1 }}>
        <Text>プラン確認へ</Text>
      </Pressable>
    </ScrollView>
  );
}
