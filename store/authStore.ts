import { create } from 'zustand';

import { authService } from '@/services/auth/authService';
import type { User } from '@/types';

type AuthState = {
  initAuth: () => Promise<void>;
  isAuthenticated: boolean;
  isInitialized: boolean;
  setUser: (user: User | null) => void;
  signOut: () => Promise<void>;
  user: User | null;
};

export const useAuthStore = create<AuthState>()((set) => ({
  initAuth: async () => {
    const { data } = await authService.getSession();
    const session = data.session;
    if (session?.user) {
      set({
        isAuthenticated: true,
        isInitialized: true,
        user: {
          avatarUrl: '',
          booksReadThisYear: 0,
          id: session.user.id,
          name: session.user.user_metadata?.['name'] ?? '',
          readingGoal: 0,
          username: session.user.email ?? '',
        },
      });
    } else {
      set({ isInitialized: true });
    }
  },
  isAuthenticated: false,
  isInitialized: false,
  setUser: (user) => set({ isAuthenticated: Boolean(user), user }),
  signOut: async () => {
    await authService.signOut();
    set({ isAuthenticated: false, user: null });
  },
  user: null,
}));
