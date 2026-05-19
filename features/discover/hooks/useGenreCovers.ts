import { useQuery } from '@tanstack/react-query';

import { searchGoogleBooks } from '@/services/books/googleBooks';

type CoverMap = Record<string, string>;

export const useGenreCovers = (queries: string[]) =>
  useQuery({
    enabled: queries.length > 0,
    queryFn: async () => {
      const results = await Promise.allSettled(
        queries.map((q) => searchGoogleBooks(`subject:${q} bestseller`)),
      );
      const map: CoverMap = {};
      results.forEach((result, i) => {
        if (result.status === 'fulfilled') {
          const cover = result.value.find((b) => b.coverImage)?.coverImage;
          if (cover && queries[i]) map[queries[i]!] = cover;
        }
      });
      return map;
    },
    queryKey: ['books', 'genre-covers'],
    staleTime: 1000 * 60 * 60 * 24, // 24 h — covers rarely need refreshing
  });
