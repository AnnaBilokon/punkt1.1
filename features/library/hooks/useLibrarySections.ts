import { useMemo } from 'react';

import { useUserBooks } from '@/features/library/hooks/useUserBooks';
import { useAuthStore } from '@/store/authStore';

export const useLibrarySections = () => {
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const { data: books = [], isFetching } = useUserBooks(userId);

  return useMemo(
    () => ({
      dnf: books.filter((book) => book.status === 'dnf'),
      finished: books.filter((book) => book.status === 'completed'),
      isFetching,
      keepReading: books.filter((book) => book.status === 'reading'),
      wantToRead: books.filter((book) => book.status === 'want-to-read'),
    }),
    [books, isFetching],
  );
};
