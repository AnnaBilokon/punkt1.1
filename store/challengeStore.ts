import { create } from 'zustand';

import { mockChallenge, mockMonthlyBooks, mockStreak } from '@/mocks/challenge';
import type { Book, ReadingChallenge } from '@/types';

type ChallengeState = {
  challenge: ReadingChallenge;
  monthlyBooks: Record<number, Book[]>;
  streak: number;
  setChallenge: (challenge: ReadingChallenge) => void;
  updateGoal: (goal: number) => void;
};

export const useChallengeStore = create<ChallengeState>()((set) => ({
  challenge: mockChallenge,
  monthlyBooks: mockMonthlyBooks,
  setChallenge: (challenge) => set({ challenge }),
  streak: mockStreak,
  updateGoal: (goal) =>
    set((state) => ({ challenge: { ...state.challenge, goal } })),
}));
