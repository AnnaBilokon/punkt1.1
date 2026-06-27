import { supabase } from '@/services/supabase';
import type {
  ActivityComment,
  AppNotification,
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
    const [profilesRes, readingRes] = await Promise.all([
      supabase.from('profiles').select('id, display_name, avatar_url').in('id', ids),
      supabase.from('user_books').select('user_id, title').in('user_id', ids).eq('status', 'reading'),
    ]);
    if (profilesRes.error) throw new Error(profilesRes.error.message);

    const readingMap = new Map(
      (readingRes.data ?? []).map((r) => [r.user_id as string, r.title as string]),
    );

    return (profilesRes.data ?? []).map((p) => ({
      id: p.id as string,
      displayName: (p.display_name as string) || 'Reader',
      avatarUrl: (p.avatar_url as string | null) ?? null,
      currentlyReading: readingMap.get(p.id as string) ?? null,
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
    const [profilesRes, readingRes] = await Promise.all([
      supabase.from('profiles').select('id, display_name, avatar_url').in('id', ids),
      supabase.from('user_books').select('user_id, title').in('user_id', ids).eq('status', 'reading'),
    ]);
    if (profilesRes.error) throw new Error(profilesRes.error.message);

    const readingMap = new Map(
      (readingRes.data ?? []).map((r) => [r.user_id as string, r.title as string]),
    );

    return (profilesRes.data ?? []).map((p) => ({
      id: p.id as string,
      displayName: (p.display_name as string) || 'Reader',
      avatarUrl: (p.avatar_url as string | null) ?? null,
      currentlyReading: readingMap.get(p.id as string) ?? null,
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
      .select('following_id, created_at')
      .eq('follower_id', userId);
    if (!followsData?.length) return [];

    const ids = followsData.map((f) => f.following_id as string);

    // Map each followed user → when the current user started following them
    const followedAtMap = new Map(
      followsData.map((f) => [f.following_id as string, f.created_at as string]),
    );

    const [booksRes, profilesRes, commentsRes, shelfBooksRes] = await Promise.all([
      supabase
        .from('user_books')
        .select('user_id, book_api_id, title, author, cover_image, status, started_at, finished_at, created_at, my_rating')
        .in('user_id', ids)
        .in('status', ['reading', 'completed', 'want-to-read']),
      supabase.from('profiles').select('id, display_name, avatar_url').in('id', ids),
      supabase.from('activity_comments').select('activity_user_id, book_api_id').in('activity_user_id', ids),
      supabase.from('shelf_books').select('user_id, book_api_id, custom_shelves(is_private)').in('user_id', ids),
    ]);

    const profileMap = new Map(
      (profilesRes.data ?? []).map((p) => [p.id as string, p]),
    );

    const commentCountMap = new Map<string, number>();
    for (const c of commentsRes.data ?? []) {
      const key = `${c.activity_user_id as string}:${c.book_api_id as string}`;
      commentCountMap.set(key, (commentCountMap.get(key) ?? 0) + 1);
    }

    // Books on any private shelf should not appear in the feed
    const privateBookKeys = new Set<string>();
    for (const row of shelfBooksRes.data ?? []) {
      const shelf = row.custom_shelves as unknown as { is_private: boolean } | null;
      if (shelf?.is_private) {
        privateBookKeys.add(`${row.user_id as string}:${row.book_api_id as string}`);
      }
    }

    const now = new Date().toISOString();

    return (booksRes.data ?? [])
      .map((row) => {
        const profile = profileMap.get(row.user_id as string);
        const date =
          (row.status === 'completed' ? (row.finished_at as string | null) : null) ??
          (row.started_at as string | null) ??
          (row.created_at as string | null) ??
          now;

        // Only show activity that happened after the user started following this person
        const followedAt = followedAtMap.get(row.user_id as string);
        if (followedAt && date < followedAt) return null;

        // Hide books on private custom shelves
        if (privateBookKeys.has(`${row.user_id as string}:${row.book_api_id as string}`)) return null;
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
          commentCount: commentCountMap.get(`${row.user_id as string}:${row.book_api_id as string}`) ?? 0,
          ...(row.my_rating !== null ? { rating: row.my_rating as number } : {}),
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 50);
  },

  getPublicProfile: async (userId: string): Promise<UserPublicStats> => {
    const [profileRes, booksRes, followersRes, followingRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, display_name, avatar_url, bio')
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
      bio: (p?.bio as string | null) ?? null,
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

  getMyActivity: async (userId: string): Promise<FriendActivity[]> => {
    const [booksRes, commentsRes] = await Promise.all([
      supabase
        .from('user_books')
        .select('user_id, book_api_id, title, author, cover_image, status, started_at, finished_at, created_at, my_rating')
        .eq('user_id', userId)
        .in('status', ['reading', 'completed', 'want-to-read'])
        .order('created_at', { ascending: false })
        .limit(20),
      supabase.from('activity_comments').select('activity_user_id, book_api_id').eq('activity_user_id', userId),
    ]);

    const commentCountMap = new Map<string, number>();
    for (const c of commentsRes.data ?? []) {
      const key = `${c.activity_user_id as string}:${c.book_api_id as string}`;
      commentCountMap.set(key, (commentCountMap.get(key) ?? 0) + 1);
    }

    const profileRes = await supabase.from('profiles').select('display_name, avatar_url').eq('id', userId).maybeSingle();
    const profile = profileRes.data;
    const now = new Date().toISOString();

    return (booksRes.data ?? []).map((row) => {
      const date =
        (row.status === 'completed' ? (row.finished_at as string | null) : null) ??
        (row.started_at as string | null) ??
        (row.created_at as string | null) ??
        now;
      return {
        userId,
        displayName: (profile?.display_name as string) || 'You',
        avatarUrl: (profile?.avatar_url as string | null) ?? null,
        bookApiId: row.book_api_id as string,
        bookTitle: row.title as string,
        bookAuthor: row.author as string,
        bookCover: (row.cover_image as string | null) ?? null,
        action: row.status as 'completed' | 'reading' | 'want-to-read',
        date,
        commentCount: commentCountMap.get(`${userId}:${row.book_api_id as string}`) ?? 0,
        ...(row.my_rating !== null ? { rating: row.my_rating as number } : {}),
      };
    });
  },

  getComments: async (activityUserId: string, bookApiId: string): Promise<ActivityComment[]> => {
    const { data, error } = await supabase
      .from('activity_comments')
      .select('id, user_id, text, created_at, profiles(display_name, avatar_url)')
      .eq('activity_user_id', activityUserId)
      .eq('book_api_id', bookApiId)
      .order('created_at', { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => {
      const profile = row.profiles as unknown as { display_name: string; avatar_url: string | null } | null;
      return {
        id: row.id as string,
        userId: row.user_id as string,
        displayName: profile?.display_name || 'Reader',
        avatarUrl: profile?.avatar_url ?? null,
        text: row.text as string,
        createdAt: row.created_at as string,
      };
    });
  },

  addComment: async (userId: string, activityUserId: string, bookApiId: string, text: string): Promise<void> => {
    const { error } = await supabase
      .from('activity_comments')
      .insert({ user_id: userId, activity_user_id: activityUserId, book_api_id: bookApiId, text: text.trim() });
    if (error) throw new Error(error.message);
  },

  deleteComment: async (commentId: string): Promise<void> => {
    const { error } = await supabase
      .from('activity_comments')
      .delete()
      .eq('id', commentId);
    if (error) throw new Error(error.message);
  },

  getNotifications: async (userId: string): Promise<AppNotification[]> => {
    // Comments on my activity from others + new followers, in parallel
    const [commentRes, followRes] = await Promise.all([
      supabase
        .from('activity_comments')
        .select('id, created_at, text, user_id, book_api_id, profiles(display_name, avatar_url)')
        .eq('activity_user_id', userId)
        .neq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('follows')
        .select('follower_id, created_at')
        .eq('following_id', userId)
        .order('created_at', { ascending: false })
        .limit(50),
    ]);

    // Book titles for comment notifications
    const bookApiIds = [...new Set((commentRes.data ?? []).map(r => r.book_api_id as string))];
    const followerIds = (followRes.data ?? []).map(r => r.follower_id as string);

    const [booksRes, followerProfilesRes] = await Promise.all([
      bookApiIds.length > 0
        ? supabase.from('user_books').select('book_api_id, title').eq('user_id', userId).in('book_api_id', bookApiIds)
        : Promise.resolve({ data: [] }),
      followerIds.length > 0
        ? supabase.from('profiles').select('id, display_name, avatar_url').in('id', followerIds)
        : Promise.resolve({ data: [] }),
    ]);

    const bookTitleMap = new Map(
      ((booksRes.data ?? []) as { book_api_id: string; title: string }[]).map(b => [b.book_api_id, b.title]),
    );
    const followerProfileMap = new Map(
      ((followerProfilesRes.data ?? []) as { id: string; display_name: string; avatar_url: string | null }[]).map(p => [p.id, p]),
    );

    const commentNotifs: AppNotification[] = (commentRes.data ?? []).map(row => {
      const profile = row.profiles as unknown as { display_name: string; avatar_url: string | null } | null;
      return {
        id: `comment-${row.id as string}`,
        type: 'comment' as const,
        fromUserId: row.user_id as string,
        fromDisplayName: profile?.display_name || 'Reader',
        fromAvatarUrl: profile?.avatar_url ?? null,
        bookTitle: bookTitleMap.get(row.book_api_id as string),
        bookApiId: row.book_api_id as string,
        commentText: row.text as string,
        createdAt: row.created_at as string,
      };
    });

    const followNotifs: AppNotification[] = (followRes.data ?? []).map(row => {
      const profile = followerProfileMap.get(row.follower_id as string);
      return {
        id: `follow-${row.follower_id as string}`,
        type: 'follow' as const,
        fromUserId: row.follower_id as string,
        fromDisplayName: profile?.display_name || 'Reader',
        fromAvatarUrl: profile?.avatar_url ?? null,
        bookTitle: undefined,
        bookApiId: undefined,
        commentText: undefined,
        createdAt: row.created_at as string,
      };
    });

    return [...commentNotifs, ...followNotifs]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 50);
  },
};
