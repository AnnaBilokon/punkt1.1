import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type AppState = {
  _hasHydrated: boolean;
  onboardingCompleted: boolean;
  notificationsLastRead: string | null;
  setHasHydrated: (v: boolean) => void;
  setOnboardingCompleted: () => void;
  markNotificationsRead: () => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      _hasHydrated: false,
      onboardingCompleted: false,
      notificationsLastRead: null,
      setHasHydrated: (v) => set({ _hasHydrated: v }),
      setOnboardingCompleted: () => set({ onboardingCompleted: true }),
      markNotificationsRead: () => set({ notificationsLastRead: new Date().toISOString() }),
    }),
    {
      name: 'app-state',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        onboardingCompleted: state.onboardingCompleted,
        notificationsLastRead: state.notificationsLastRead,
      }),
    },
  ),
);
