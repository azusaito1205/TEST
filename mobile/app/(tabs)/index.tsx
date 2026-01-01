import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { generatePlan } from '../../lib/planGenerator';
import { sessionStore } from '../../lib/sessionStore';

export default function Home() {
  const [goal, setGoal] = useState('リサーチで抽出した課題に対する打ち手を考える');

  const onNext = () => {
    const plan = generatePlan(goal.trim());
    sessionStore.setPlan(plan);
    router.push('/confirm' as any);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: '700' }}>目的を入力</Text>

      <TextInput
        value={goal}
        onChangeText={setGoal}
        placeholder="例：リサーチ課題に対する打ち手を考える"
        style={{ borderWidth: 1, borderRadius: 12, padding: 12 }}
      />

      <Pressable onPress={onNext} style={{ padding: 12, borderRadius: 12, borderWidth: 1 }}>
        <Text>自動で4分解して確認する</Text>
      </Pressable>
    </ScrollView>
  );
}
