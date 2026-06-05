import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type AppState = {
  _hasHydrated: boolean;
  onboardingCompleted: boolean;
  setHasHydrated: (v: boolean) => void;
  setOnboardingCompleted: () => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      _hasHydrated: false,
      onboardingCompleted: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),
      setOnboardingCompleted: () => set({ onboardingCompleted: true }),
    }),
    {
      name: 'app-state',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({ onboardingCompleted: state.onboardingCompleted }),
    },
  ),
);
