import { supabase } from '@/services/supabase';
import type {
  FriendActivity,
  PublicProfile,
  UserPublicBook,
  UserPublicStats,
} from '@/types';

export const socialService = {
  follow: async (followerId: string, followingId: string): Promise<void> => {
    const { error } = await supabase
      .from('follows')
      .insert({ follower_id: followerId, following_id: followingId });
    if (error) throw new Error(error.message);
  },

  unfollow: async (followerId: string, followingId: string): Promise<void> => {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);
    if (error) throw new Error(error.message);
  },

  isFollowing: async (followerId: string, followingId: string): Promise<boolean> => {
    const { data } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .maybeSingle();
    return !!data;
  },

  getFollowers: async (userId: string): Promise<PublicProfile[]> => {
    const { data: followsData, error: followsError } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('following_id', userId);
    if (followsError) throw new Error(followsError.message);
    if (!followsData?.length) return [];

    const ids = followsData.map((f) => f.follower_id as string);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url')
      .in('id', ids);
    if (error) throw new Error(error.message);

    return (data ?? []).map((p) => ({
      id: p.id as string,
      displayName: (p.display_name as string) || 'Reader',
      avatarUrl: (p.avatar_url as string | null) ?? null,
    }));
  },

  getFollowing: async (userId: string): Promise<PublicProfile[]> => {
    const { data: followsData, error: followsError } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);
    if (followsError) throw new Error(followsError.message);
    if (!followsData?.length) return [];

    const ids = followsData.map((f) => f.following_id as string);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url')
      .in('id', ids);
    if (error) throw new Error(error.message);

    return (data ?? []).map((p) => ({
      id: p.id as string,
      displayName: (p.display_name as string) || 'Reader',
      avatarUrl: (p.avatar_url as string | null) ?? null,
    }));
  },

  searchUsers: async (query: string, currentUserId: string): Promise<PublicProfile[]> => {
    if (query.trim().length < 2) return [];
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url')
      .ilike('display_name', `%${query.trim()}%`)
      .neq('id', currentUserId)
      .limit(20);
    if (error) throw new Error(error.message);
    return (data ?? []).map((p) => ({
      id: p.id as string,
      displayName: (p.display_name as string) || 'Reader',
      avatarUrl: (p.avatar_url as string | null) ?? null,
    }));
  },

  getFriendActivity: async (userId: string): Promise<FriendActivity[]> => {
    const { data: followsData } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);
    if (!followsData?.length) return [];

    const ids = followsData.map((f) => f.following_id as string);

    const [booksRes, profilesRes] = await Promise.all([
      supabase
        .from('user_books')
        .select('user_id, book_api_id, title, author, cover_image, status, started_at, finished_at, created_at')
        .in('user_id', ids)
        .in('status', ['reading', 'completed', 'want-to-read']),
      supabase.from('profiles').select('id, display_name, avatar_url').in('id', ids),
    ]);

    const profileMap = new Map(
      (profilesRes.data ?? []).map((p) => [p.id as string, p]),
    );

    const now = new Date().toISOString();

    return (booksRes.data ?? [])
      .map((row) => {
        const profile = profileMap.get(row.user_id as string);
        const date =
          (row.status === 'completed' ? (row.finished_at as string | null) : null) ??
          (row.started_at as string | null) ??
          (row.created_at as string | null) ??
          now;
        return {
          userId: row.user_id as string,
          displayName: (profile?.display_name as string) || 'Reader',
          avatarUrl: (profile?.avatar_url as string | null) ?? null,
          bookApiId: row.book_api_id as string,
          bookTitle: row.title as string,
          bookAuthor: row.author as string,
          bookCover: (row.cover_image as string | null) ?? null,
          action: row.status as 'completed' | 'reading' | 'want-to-read',
          date,
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 50);
  },

  getPublicProfile: async (userId: string): Promise<UserPublicStats> => {
    const [profileRes, booksRes, followersRes, followingRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .eq('id', userId)
        .maybeSingle(),
      supabase
        .from('user_books')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'completed'),
      supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId),
      supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId),
    ]);

    const p = profileRes.data;
    return {
      id: userId,
      displayName: (p?.display_name as string) || 'Reader',
      avatarUrl: (p?.avatar_url as string | null) ?? null,
      booksRead: booksRes.count ?? 0,
      followersCount: followersRes.count ?? 0,
      followingCount: followingRes.count ?? 0,
    };
  },

  getUserBooks: async (userId: string): Promise<UserPublicBook[]> => {
    const { data, error } = await supabase
      .from('user_books')
      .select('book_api_id, title, author, cover_image, status, my_rating, finished_at, progress')
      .eq('user_id', userId)
      .in('status', ['reading', 'completed']);
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => ({
      bookApiId: row.book_api_id as string,
      title: row.title as string,
      author: row.author as string,
      coverImage: (row.cover_image as string | null) ?? null,
      status: row.status as 'reading' | 'completed',
      myRating: (row.my_rating as number | null) ?? null,
      finishedAt: (row.finished_at as string | null) ?? null,
      progress: (row.progress as number) ?? 0,
    }));
  },
};
