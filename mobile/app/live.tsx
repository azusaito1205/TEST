import { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { sessionStore } from '../lib/sessionStore';
import { deviationScore } from '../lib/deviation';

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

export default function Live() {
  const plan = sessionStore.getPlan();
  const [phaseIndex, setPhaseIndex] = useState(sessionStore.getPhaseIndex());
  const [text, setText] = useState('');

  if (!plan) {
    router.replace('/' as any);
    return null;
  }

  const result = useMemo(() => deviationScore(text, plan, phaseIndex), [text, plan, phaseIndex]);

  const returnLine = useMemo(() => {
    const lines = [
      'いまの話、課題文にすると何ですか？',
      '優先度の観点（インパクト/頻度/実現性）でどれに当たります？',
      'その話を打ち手候補として整理すると、何案目に入ります？',
      '次アクションに落とすと、誰がいつまでに何をします？',
    ];
    return lines[phaseIndex] ?? lines[0];
  }, [phaseIndex]);

  const setPhase = (i: number) => {
    setPhaseIndex(i);
    sessionStore.setPhaseIndex(i);
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

      <Meter value={result.deviation} />

      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="いま話してる内容（仮：手入力）"
        style={{ borderWidth: 1, borderRadius: 12, padding: 12, minHeight: 100 }}
        multiline
      />

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Pressable onPress={() => setText('')} style={{ flex: 1, padding: 12, borderRadius: 12, borderWidth: 1 }}>
          <Text>入力クリア</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/confirm' as any)} style={{ flex: 1, padding: 12, borderRadius: 12, borderWidth: 1 }}>
          <Text>プラン確認へ</Text>
        </Pressable>
      </View>

      <View style={{ borderWidth: 1, borderRadius: 12, padding: 12, gap: 6 }}>
        <Text style={{ fontWeight: '700' }}>戻す一言</Text>
        <Text>{returnLine}</Text>
      </View>
    </ScrollView>
  );
}
