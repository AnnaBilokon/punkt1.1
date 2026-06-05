import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { searchCommunityBooks } from '@/services/books/communityBooks';
import {
  searchGoogleBooks,
  searchGoogleBooksByIsbn,
  searchGoogleBooksByPublisher,
} from '@/services/books/googleBooks';
import { getIsbndbBookByIsbn, searchIsbndb } from '@/services/books/isbndb';
import {
  searchOpenLibrary,
  searchOpenLibraryByIsbn,
  searchOpenLibraryByPublisher,
} from '@/services/books/openLibrary';
import type { Book } from '@/types';

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

export type SearchMode = 'default' | 'publisher';

const extractIsbn = (query: string): string | null => {
  const clean = query.replace(/[-\s]/g, '');
  if (/^\d{13}$/.test(clean) || /^\d{9}[\dXx]$/.test(clean)) return clean;
  return null;
};

const normalize = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9Ѐ-ӿ]/g, '');

const deduplicateBooks = (books: Book[]): Book[] => {
  const seen = new Map<string, Book>();
  for (const book of books) {
    const key = `${normalize(book.title)}-${normalize(book.author).slice(0, 8)}`;
    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, book);
    } else if (existing.rating === 0 && book.rating > 0) {
      seen.set(key, { ...existing, rating: book.rating });
    }
  }
  return Array.from(seen.values());
};

const searchByIsbn = async (isbn: string): Promise<Book[]> => {
  const [googleResult, olResult, isbndbResult] = await Promise.allSettled([
    searchGoogleBooksByIsbn(isbn),
    searchOpenLibraryByIsbn(isbn),
    getIsbndbBookByIsbn(isbn),
  ]);
  const google = googleResult.status === 'fulfilled' ? googleResult.value : [];
  const ol = olResult.status === 'fulfilled' ? olResult.value : [];
  const isbndb =
    isbndbResult.status === 'fulfilled' && isbndbResult.value
      ? [isbndbResult.value]
      : [];
  return deduplicateBooks([...google, ...ol, ...isbndb]);
};

const searchAllSources = async (query: string, mode: SearchMode): Promise<Book[]> => {
  if (mode === 'publisher') {
    const [googleResults, olResults, communityResults] = await Promise.allSettled([
      searchGoogleBooksByPublisher(query),
      searchOpenLibraryByPublisher(query),
      searchCommunityBooks(query, 'publisher'),
    ]);
    const google = googleResults.status === 'fulfilled' ? googleResults.value : [];
    const ol = olResults.status === 'fulfilled' ? olResults.value : [];
    const community = communityResults.status === 'fulfilled' ? communityResults.value : [];
    return deduplicateBooks([...community, ...google, ...ol])
      .filter((b) => b.coverImage !== '' && b.title !== 'Untitled' && b.author !== 'Unknown Author');
  }

  const isbn = extractIsbn(query);
  if (isbn) return searchByIsbn(isbn);

  const [googleResults, olResults, communityResults, isbndbResults] = await Promise.allSettled([
    searchGoogleBooks(query),
    searchOpenLibrary(query),
    searchCommunityBooks(query),
    searchIsbndb(query),
  ]);

  const google = googleResults.status === 'fulfilled' ? googleResults.value : [];
  const ol = olResults.status === 'fulfilled' ? olResults.value : [];
  const community = communityResults.status === 'fulfilled' ? communityResults.value : [];
  const isbndb = isbndbResults.status === 'fulfilled' ? isbndbResults.value : [];

  return deduplicateBooks([...community, ...google, ...ol, ...isbndb])
    .filter((b) => b.coverImage !== '' && b.title !== 'Untitled' && b.author !== 'Unknown Author');
};

export const bookSearchQueryKey = (query: string, mode: SearchMode = 'default') =>
  ['books', 'search', query, mode] as const;

export const useBookSearch = (query: string, searchMode: SearchMode = 'default') => {
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
      const books = await searchAllSources(debouncedQuery.trim(), searchMode);
      books.forEach((book) => {
        queryClient.setQueryData(['book', book.id], book);
      });
      return books;
    },
    queryKey: bookSearchQueryKey(debouncedQuery.trim(), searchMode),
    staleTime: 1000 * 60 * 5,
  });
};
