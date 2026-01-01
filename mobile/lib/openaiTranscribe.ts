export async function transcribeAudio(uri: string, opts?: { language?: string }) {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) throw new Error('EXPO_PUBLIC_OPENAI_API_KEY が未設定です（起動コマンドで渡してください）');

  const form = new FormData();
  form.append('file', { uri, name: 'chunk.m4a', type: 'audio/m4a' } as any);
  form.append('model', 'whisper-1');
  if (opts?.language) form.append('language', opts.language);

  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form as any,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`transcription failed: ${res.status} ${text}`);
  }

  const json = await res.json();
  return (json?.text ?? '') as string;
}
