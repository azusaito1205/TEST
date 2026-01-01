import type { Plan } from '../types/plan';

let _plan: Plan | null = null;
let _phaseIndex = 0;

export const sessionStore = {
  setPlan(p: Plan) {
    _plan = p;
    _phaseIndex = 0;
  },
  getPlan() {
    return _plan;
  },
  setPhaseIndex(i: number) {
    _phaseIndex = i;
  },
  getPhaseIndex() {
    return _phaseIndex;
  },
};
