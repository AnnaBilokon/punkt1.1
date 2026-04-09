import { useMemo } from 'react';

import { useBookStore } from '@/store/bookStore';

export const useLibrarySections = () => {
  const books = useBookStore((state) => state.books);

  return useMemo(
    () => ({
      keepReading: books.filter((book) => book.status !== 'want-to-read'),
      wantToRead: books.filter((book) => book.status === 'want-to-read'),
    }),
    [books],
  );
};
