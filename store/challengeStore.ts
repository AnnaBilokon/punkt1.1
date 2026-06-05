import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mockChallenge, mockMonthlyBooks } from '@/mocks/challenge';
import type { Book, ReadingChallenge } from '@/types';

type PersistedState = { goal: number };

type ChallengeState = {
  challenge: ReadingChallenge;
  monthlyBooks: Record<number, Book[]>;
  setChallenge: (challenge: ReadingChallenge) => void;
  updateGoal: (goal: number) => void;
};

export const useChallengeStore = create<ChallengeState>()(
  persist(
    (set) => ({
      challenge: mockChallenge,
      monthlyBooks: mockMonthlyBooks,
      setChallenge: (challenge) => set({ challenge }),
      updateGoal: (goal) =>
        set((state) => ({ challenge: { ...state.challenge, goal } })),
    }),
    {
      name: 'challenge-goal',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state): PersistedState => ({ goal: state.challenge.goal }),
      merge: (persisted, current) => ({
        ...current,
        challenge: {
          ...current.challenge,
          goal: (persisted as PersistedState).goal ?? current.challenge.goal,
        },
      }),
    },
  ),
);
