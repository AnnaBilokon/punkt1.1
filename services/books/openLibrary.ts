import { env } from '@/constants/env';
import { ApiClient } from '@/services/apiClient';

const openLibraryClient = new ApiClient(env.openLibraryBaseUrl);

export const searchOpenLibrary = async (query: string) =>
  openLibraryClient.get('/search.json', {
    params: {
      q: query,
    },
  });
