import { authService } from '@/services/auth/authService';
import { supabase } from '@/services/supabase';
import type { HomeWidgets, Profile } from '@/types';
import { DEFAULT_HOME_WIDGETS } from '@/types';

type ProfileRow = {
  avatar_url: string | null;
  bio: string | null;
  display_name: string;
  home_widgets: HomeWidgets | null;
  id: string;
  preferred_genres: string[] | null;
  tbr_order: string[] | null;
};

const parseWidgets = (raw: unknown): HomeWidgets => {
  if (Array.isArray(raw) && raw.length > 0 && 'id' in (raw[0] as object)) {
    return raw as HomeWidgets;
  }
  // Legacy: boolean-object shape from before the array migration
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return DEFAULT_HOME_WIDGETS.map((w) => ({
      ...w,
      enabled: (raw as Record<string, boolean>)[w.id] ?? true,
    }));
  }
  return DEFAULT_HOME_WIDGETS;
};

const rowToProfile = (row: ProfileRow): Profile => ({
  avatarUrl: row.avatar_url,
  bio: row.bio,
  displayName: row.display_name,
  homeWidgets: parseWidgets(row.home_widgets),
  id: row.id,
  preferredGenres: Array.isArray(row.preferred_genres) ? row.preferred_genres : [],
  tbrOrder: Array.isArray(row.tbr_order) ? row.tbr_order : [],
});

export const profileService = {
  getMemberSinceYear: async (): Promise<number> => {
    const { data } = await supabase.auth.getSession();
    const createdAt = data.session?.user?.created_at;
    return createdAt ? new Date(createdAt).getFullYear() : new Date().getFullYear();
  },

  getReviewsCount: async (userId: string): Promise<number> => {
    const { count, error } = await supabase
      .from('user_books')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .not('review', 'is', null);
    if (error) return 0;
    return count ?? 0;
  },

  getProfile: async (userId: string, fallbackName?: string): Promise<Profile> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw new Error(error.message);

    if (!data) {
      return profileService.upsertProfile(userId, {
        displayName: fallbackName ?? '',
        bio: null,
        avatarUrl: null,
      });
    }

    // Backfill display_name if row exists but name is empty
    if (!data.display_name && fallbackName) {
      return profileService.upsertProfile(userId, {
        avatarUrl: (data as ProfileRow).avatar_url,
        bio: (data as ProfileRow).bio,
        displayName: fallbackName,
      });
    }

    return rowToProfile(data as ProfileRow);
  },

  upsertProfile: async (
    userId: string,
    updates: { avatarUrl: string | null; bio: string | null; displayName: string },
  ): Promise<Profile> => {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        {
          avatar_url: updates.avatarUrl,
          bio: updates.bio,
          display_name: updates.displayName,
          id: userId,
        },
        { onConflict: 'id' },
      )
      .select()
      .single();

    if (error || !data) throw new Error(error?.message ?? 'Failed to save profile');
    return rowToProfile(data as ProfileRow);
  },

  updateHomeWidgets: async (userId: string, widgets: HomeWidgets): Promise<void> => {
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: userId, home_widgets: widgets }, { onConflict: 'id' });
    if (error) throw new Error(error.message);
  },

  updateTbrOrder: async (userId: string, order: string[]): Promise<void> => {
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: userId, tbr_order: order }, { onConflict: 'id' });
    if (error) throw new Error(error.message);
  },

  uploadAvatar: async (userId: string, localUri: string): Promise<string> => {
    const ext = localUri.split('.').pop()?.toLowerCase() ?? 'jpg';
    const fileName = `${userId}/avatar.${ext}`;
    const mimeType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;

    const response = await fetch(localUri);
    const blob = await response.blob();

    const { error } = await supabase.storage
      .from('avatars')
      .upload(fileName, blob, { contentType: mimeType, upsert: true });

    if (error) throw new Error(error.message);

    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  },

  changePassword: async (newPassword: string): Promise<void> => {
    const { error } = await authService.changePassword(newPassword);
    if (error) throw new Error(error.message);
  },

  updateGenres: async (userId: string, genres: string[]): Promise<void> => {
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: userId, preferred_genres: genres }, { onConflict: 'id' });
    if (error) throw new Error(error.message);
  },

  initProfile: async (userId: string, displayName: string, genres: string[]): Promise<void> => {
    const { error } = await supabase
      .from('profiles')
      .upsert(
        { id: userId, display_name: displayName, preferred_genres: genres },
        { onConflict: 'id' },
      );
    if (error) throw new Error(error.message);
  },

  deleteAccount: async (): Promise<void> => {
    const { error } = await supabase.rpc('delete_account');
    if (error) throw new Error(error.message);
  },
};
