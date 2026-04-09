import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mockUsers } from '@/mocks/users';
import type { User } from '@/types';

type AuthState = {
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  signOut: () => void;
  user: User | null;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: true,
      setUser: (user) => set({ isAuthenticated: Boolean(user), user }),
      signOut: () => set({ isAuthenticated: false, user: null }),
      user: mockUsers[0] ?? null,
    }),
    {
      name: 'punkt-auth-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
