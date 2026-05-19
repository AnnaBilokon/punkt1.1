import { useQuery } from '@tanstack/react-query';

import { searchGenreBooks } from '@/services/books/googleBooks';

export const useGenreBooks = (genre: string | null) =>
  useQuery({
    enabled: !!genre,
    queryFn: async () => {
      const books = await searchGenreBooks(genre ?? '');
      return books.sort((a, b) => {
        if (a.publishedYear === 0 && b.publishedYear === 0) return 0;
        if (a.publishedYear === 0) return 1;
        if (b.publishedYear === 0) return -1;
        return b.publishedYear - a.publishedYear;
      });
    },
    queryKey: ['books', 'genre', genre],
    staleTime: 1000 * 60 * 10,
  });
