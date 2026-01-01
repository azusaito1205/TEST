import type { Plan } from '../types/plan';

export function generatePlan(goal: string): Plan {
  return {
    goal,
    phases: [
      { id: 'P1', title: '課題の確認', minutes: 10, anchors: ['課題', '前提', '事実', '定義'] },
      { id: 'P2', title: '優先度づけ', minutes: 10, anchors: ['優先', 'インパクト', '頻度', '実現性', '上位'] },
      { id: 'P3', title: '打ち手の発散', minutes: 15, anchors: ['打ち手', '施策', 'アイデア', '案', '仮説'] },
      { id: 'P4', title: '収束と次アクション', minutes: 10, anchors: ['決める', '次', '担当', '期限', 'TODO'] },
    ],
    outputs: ['上位課題3つ', '各課題の打ち手案3つ', '次アクション（担当/期限）'],
  };
}
