import type { Plan } from '../types/plan';

function keywordSimilarity(text: string, keywords: string[]) {
  const t = text.toLowerCase();
  const hits = keywords.filter(k => t.includes(k.toLowerCase())).length;
  return keywords.length ? hits / keywords.length : 0;
}

export function deviationScore(text: string, plan: Plan, phaseIndex: number) {
  const phase = plan.phases[phaseIndex] ?? plan.phases[0];

  const goalTokens = plan.goal.split(/\s+/).filter(Boolean);
  const simGoal = keywordSimilarity(text, goalTokens);
  const simPhase = keywordSimilarity(text, phase.anchors);

  const sim = Math.min(1, simGoal * 0.3 + simPhase * 0.7);
  const deviation = Math.round((1 - sim) * 100);

  return { deviation, phaseTitle: phase.title };
}
