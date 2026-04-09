import { env } from '@/constants/env';
import { ApiClient } from '@/services/apiClient';

const googleBooksClient = new ApiClient(env.googleBooksBaseUrl);

export const searchGoogleBooks = async (query: string) => {
  // TODO: Replace this lightweight contract with a typed repository once backend orchestration is introduced.
  return googleBooksClient.get('/volumes', {
    params: {
      maxResults: 20,
      q: query,
    },
  });
};
