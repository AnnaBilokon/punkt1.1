import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { searchCommunityBooks } from '@/services/books/communityBooks';
import { searchGoogleBooks } from '@/services/books/googleBooks';
import { searchOpenLibrary } from '@/services/books/openLibrary';
import type { Book } from '@/types';

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

const normalize = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9\u0400-\u04ff]/g, '');

/** Deduplicate by title+author similarity — keeps the first occurrence */
const deduplicateBooks = (books: Book[]): Book[] => {
  const seen = new Set<string>();
  return books.filter((book) => {
    const key = `${normalize(book.title)}-${normalize(book.author).slice(0, 8)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const searchAllSources = async (query: string): Promise<Book[]> => {
  const [googleResults, olResults, communityResults] = await Promise.allSettled(
    [
      searchGoogleBooks(query),
      searchOpenLibrary(query),
      searchCommunityBooks(query),
    ],
  );

  const google =
    googleResults.status === 'fulfilled' ? googleResults.value : [];
  const ol = olResults.status === 'fulfilled' ? olResults.value : [];
  const community =
    communityResults.status === 'fulfilled' ? communityResults.value : [];

  // Community books first (exact match priority), then google, then OL
  const merged = deduplicateBooks([...community, ...google, ...ol]);
  return merged.sort((a, b) => (b.publishedYear ?? 0) - (a.publishedYear ?? 0));
};

export const bookSearchQueryKey = (query: string) =>
  ['books', 'search', query] as const;

export const useBookSearch = (query: string) => {
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const queryClient = useQueryClient();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const enabled = debouncedQuery.trim().length >= MIN_QUERY_LENGTH;

  return useQuery({
    enabled,
    queryFn: async () => {
      const books = await searchAllSources(debouncedQuery.trim());
      // Pre-populate the cache so BookDetailRoute can find any book by id
      books.forEach((book) => {
        queryClient.setQueryData(['book', book.id], book);
      });
      return books;
    },
    queryKey: bookSearchQueryKey(debouncedQuery.trim()),
    staleTime: 1000 * 60 * 5, // 5 min
  });
};
