import { env } from '@/constants/env';
import { ApiClient } from '@/services/apiClient';

const nytBooksClient = new ApiClient(env.nytBooksBaseUrl);

export const getNytBestSellers = async () => {
  // TODO: Move this call behind a secure backend proxy before production API usage.
  return nytBooksClient.get('/lists/current/hardcover-fiction.json', {
    params: {
      'api-key': env.nytBooksApiKey,
    },
  });
};
