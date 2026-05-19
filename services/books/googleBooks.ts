import { env } from '@/constants/env';
import { ApiClient } from '@/services/apiClient';
import type { Book } from '@/types';

import type { GoogleBooksResponse, GoogleVolume } from './googleBooksMapper';
import { mapGoogleBooksResponse, mapGoogleVolume } from './googleBooksMapper';

const googleBooksClient = new ApiClient(env.googleBooksBaseUrl);

const apiKeyParam = env.googleBooksApiKey ? { key: env.googleBooksApiKey } : {};

export const searchGoogleBooks = async (
  query: string,
  maxResults = 20,
): Promise<Book[]> => {
  const data = await googleBooksClient.get('/volumes', {
    params: {
      langRestrict: 'en',
      maxResults,
      orderBy: 'newest',
      printType: 'books',
      q: query,
      ...apiKeyParam,
    },
  });
  return mapGoogleBooksResponse(data as GoogleBooksResponse);
};

export const searchGenreBooks = async (genre: string): Promise<Book[]> => {
  const [bestsellers, newReleases] = await Promise.allSettled([
    googleBooksClient.get('/volumes', {
      params: {
        langRestrict: 'en',
        maxResults: 20,
        orderBy: 'relevance',
        printType: 'books',
        q: `subject:${genre} bestseller`,
        ...apiKeyParam,
      },
    }),
    googleBooksClient.get('/volumes', {
      params: {
        langRestrict: 'en',
        maxResults: 20,
        orderBy: 'newest',
        printType: 'books',
        q: `subject:${genre} 2023 OR 2024 OR 2025`,
        ...apiKeyParam,
      },
    }),
  ]);

  const a =
    bestsellers.status === 'fulfilled'
      ? mapGoogleBooksResponse(bestsellers.value as GoogleBooksResponse)
      : [];
  const b =
    newReleases.status === 'fulfilled'
      ? mapGoogleBooksResponse(newReleases.value as GoogleBooksResponse)
      : [];

  // Deduplicate by id, bestsellers first
  const seen = new Set<string>();
  return [...a, ...b].filter((book) => {
    if (seen.has(book.id)) return false;
    seen.add(book.id);
    return true;
  });
};

export const getGoogleBookById = async (id: string): Promise<Book | null> => {
  try {
    const data = await googleBooksClient.get(`/volumes/${id}`, {
      params: apiKeyParam,
    });
    return mapGoogleVolume(data as GoogleVolume);
  } catch {
    return null;
  }
};
