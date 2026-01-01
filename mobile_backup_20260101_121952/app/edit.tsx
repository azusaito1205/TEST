import { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { sessionStore } from '../lib/sessionStore';

export default function Edit() {
  const plan = sessionStore.getPlan();

  if (!plan) {
    router.replace('/' as any);
    return null;
  }

  const [mins, setMins] = useState(plan.phases.map(p => String(p.minutes)));

  const nextPlan = useMemo(() => {
    return {
      ...plan,
      phases: plan.phases.map((p, i) => ({
        ...p,
        minutes: Number(mins[i] || p.minutes),
      })),
    };
  }, [plan, mins]);

  const onSave = () => {
    sessionStore.setPlan(nextPlan);
    router.push('/live' as any);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: '700' }}>変更（まずは時間だけ）</Text>

      {nextPlan.phases.map((p, i) => (
        <View key={p.id} style={{ borderWidth: 1, borderRadius: 12, padding: 12, gap: 8 }}>
          <Text style={{ fontWeight: '700' }}>{p.title}</Text>
          <TextInput
            value={mins[i]}
            onChangeText={(v) => setMins(prev => prev.map((x, idx) => (idx === i ? v : x)))}
            keyboardType="number-pad"
            style={{ borderWidth: 1, borderRadius: 12, padding: 10 }}
            placeholder="分"
          />
        </View>
      ))}

      <Pressable onPress={onSave} style={{ padding: 12, borderRadius: 12, borderWidth: 1 }}>
        <Text>保存して開始</Text>
      </Pressable>
    </ScrollView>
  );
}
