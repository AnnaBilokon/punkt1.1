import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useUserBooks } from '@/features/library/hooks/useUserBooks';
import { profileService } from '@/services/profile/profileService';
import { useAuthStore } from '@/store/authStore';
import type { Book } from '@/types';

export const useProfileStats = () => {
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const { data: books = [], isFetching } = useUserBooks(userId);

  const { data: reviewsCount = 0 } = useQuery({
    enabled: !!userId,
    queryFn: () => profileService.getReviewsCount(userId!),
    queryKey: ['profile-reviews-count', userId],
    staleTime: 1000 * 60 * 5,
  });

  const { data: memberSince = new Date().getFullYear() } = useQuery({
    queryFn: profileService.getMemberSinceYear,
    queryKey: ['profile-member-since'],
    staleTime: Infinity,
  });

  const { booksRead, xp } = useMemo(() => {
    const completed: Book[] = books.filter((b) => b.status === 'completed');
    const totalPages = completed.reduce((sum, b) => sum + (b.pages ?? 0), 0);
    return {
      booksRead: completed.length,
      xp: completed.length * 100 + Math.floor(totalPages / 10),
    };
  }, [books]);

  return { books, booksRead, isFetching, memberSince, reviewsCount, xp };
};
