import { create } from 'zustand';

import { profileService } from '@/services/profile/profileService';
import { queryClient } from '@/shared/lib/queryClient';
import type { HomeWidgets, WidgetItem } from '@/types';
import { DEFAULT_HOME_WIDGETS } from '@/types';

const mergeWithDefaults = (stored: HomeWidgets): HomeWidgets => {
  const result: WidgetItem[] = stored.map((w) => ({ ...w }));
  for (const def of DEFAULT_HOME_WIDGETS) {
    if (!result.some((w) => w.id === def.id)) {
      result.push({ ...def });
    }
  }
  return result;
};

export const profileQueryKey = (userId: string) => ['profile', userId] as const;

type ProfileStoreState = {
  homeWidgets: HomeWidgets;
  setHomeWidgets: (widgets: HomeWidgets) => void;
  updateHomeWidgets: (userId: string, widgets: HomeWidgets) => Promise<void>;
  tbrOrder: string[];
  setTbrOrder: (order: string[]) => void;
  updateTbrOrder: (userId: string, order: string[]) => Promise<void>;
  updateProfile: (
    userId: string,
    updates: { avatarUrl: string | null; bio: string | null; displayName: string },
  ) => Promise<void>;
};

export const useProfileStore = create<ProfileStoreState>()((set) => ({
  homeWidgets: DEFAULT_HOME_WIDGETS,
  tbrOrder: [],

  setHomeWidgets: (widgets) => set({ homeWidgets: mergeWithDefaults(widgets) }),
  setTbrOrder: (order) => set({ tbrOrder: order }),

  updateProfile: async (userId, updates) => {
    await profileService.upsertProfile(userId, updates);
    void queryClient.invalidateQueries({ queryKey: profileQueryKey(userId) });
  },

  updateHomeWidgets: async (userId, widgets) => {
    set({ homeWidgets: widgets });
    try {
      await profileService.updateHomeWidgets(userId, widgets);
    } catch {
      // optimistic update stays visible; not critical to revert
    }
  },

  updateTbrOrder: async (userId, order) => {
    set({ tbrOrder: order });
    try {
      await profileService.updateTbrOrder(userId, order);
    } catch {
      // optimistic update stays visible
    }
  },
}));
