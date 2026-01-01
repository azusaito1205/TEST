import { View, Text, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { sessionStore } from '../lib/sessionStore';

export default function Confirm() {
  const plan = sessionStore.getPlan();

  if (!plan) {
    router.replace('/' as any);
    return null;
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: '700' }}>目的を4つのステップに分けました</Text>
      <Text style={{ opacity: 0.8 }}>目的：{plan.goal}</Text>

      <View style={{ gap: 8 }}>
        {plan.phases.map(p => (
          <View key={p.id} style={{ borderWidth: 1, borderRadius: 12, padding: 12, gap: 6 }}>
            <Text style={{ fontWeight: '700' }}>{p.title}（{p.minutes}分）</Text>
            <Text style={{ opacity: 0.7 }}>アンカー：{p.anchors.join(' / ')}</Text>
          </View>
        ))}
      </View>

      <Text style={{ marginTop: 6 }}>このままスタートしますか？それとも変えますか？</Text>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Pressable onPress={() => router.push('/live' as any)} style={{ flex: 1, padding: 12, borderRadius: 12, borderWidth: 1 }}>
          <Text>✅ このまま開始</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/edit' as any)} style={{ flex: 1, padding: 12, borderRadius: 12, borderWidth: 1 }}>
          <Text>✏️ 変える</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
