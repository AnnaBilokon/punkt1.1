import { env } from '@/constants/env';
import { ApiClient } from '@/services/apiClient';
import type { Book } from '@/types';

import type { GoogleBooksResponse, GoogleVolume } from './googleBooksMapper';
import { mapGoogleBooksResponse, mapGoogleVolume } from './googleBooksMapper';

const googleBooksClient = new ApiClient(env.googleBooksBaseUrl);

const apiKeyParam = env.googleBooksApiKey ? { key: env.googleBooksApiKey } : {};

export const searchGoogleBooks = async (query: string): Promise<Book[]> => {
  const data = await googleBooksClient.get('/volumes', {
    params: {
      maxResults: 20,
      q: query,
      ...apiKeyParam,
    },
  });
  return mapGoogleBooksResponse(data as GoogleBooksResponse);
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
