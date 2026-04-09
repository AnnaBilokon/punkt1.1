import { create } from 'zustand';

import { mockChallenge } from '@/mocks/challenge';
import type { ReadingChallenge } from '@/types';

type ChallengeState = {
  challenge: ReadingChallenge;
  setChallenge: (challenge: ReadingChallenge) => void;
};

export const useChallengeStore = create<ChallengeState>()((set) => ({
  challenge: mockChallenge,
  setChallenge: (challenge) => set({ challenge }),
}));
