export type PhaseId = 'P1' | 'P2' | 'P3' | 'P4';

export type Phase = {
  id: PhaseId;
  title: string;
  minutes: number;
  anchors: string[];
};

export type Plan = {
  goal: string;
  phases: Phase[];
  outputs: string[];
};
