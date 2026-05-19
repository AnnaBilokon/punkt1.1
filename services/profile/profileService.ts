import { supabase } from '@/services/supabase';

export const profileService = {
  getMemberSinceYear: async (): Promise<number> => {
    const { data } = await supabase.auth.getSession();
    const createdAt = data.session?.user?.created_at;
    return createdAt
      ? new Date(createdAt).getFullYear()
      : new Date().getFullYear();
  },

  getReviewsCount: async (userId: string): Promise<number> => {
    const { count, error } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    if (error) return 0;
    return count ?? 0;
  },
};
