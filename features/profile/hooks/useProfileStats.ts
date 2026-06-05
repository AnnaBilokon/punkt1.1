import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useUserBooks } from '@/features/library/hooks/useUserBooks';
import { profileService } from '@/services/profile/profileService';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/store/authStore';
import type { Book } from '@/types';

export const useProfileStats = () => {
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const { data: books = [], isFetching } = useUserBooks(userId);

  const { data: memberSince = new Date().getFullYear() } = useQuery({
    queryFn: profileService.getMemberSinceYear,
    queryKey: ['profile-member-since'],
    staleTime: Infinity,
  });

  const { data: journalCount = 0 } = useQuery({
    queryKey: ['journal-count', userId],
    queryFn: async () => {
      const { count } = await supabase
        .from('journal_entries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId!);
      return count ?? 0;
    },
    enabled: !!userId,
  });

  const { data: reReadsCount = 0 } = useQuery({
    queryKey: ['rereads-count', userId],
    queryFn: async () => {
      const { count } = await supabase
        .from('book_reads')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId!)
        .gte('read_number', 2);
      return count ?? 0;
    },
    enabled: !!userId,
  });

  const { booksRead, reviewsCount, xp } = useMemo(() => {
    const completed: Book[] = books.filter((b) => b.status === 'completed');
    const totalPages = completed.reduce((sum, b) => sum + (b.pages ?? 0), 0);
    return {
      booksRead: completed.length,
      reviewsCount: books.filter((b) => b.review).length,
      xp: completed.length * 100 + Math.floor(totalPages / 10),
    };
  }, [books]);

  return { books, booksRead, isFetching, journalCount, memberSince, reReadsCount, reviewsCount, xp };
};
