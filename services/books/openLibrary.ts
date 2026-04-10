import { env } from '@/constants/env';
import { ApiClient } from '@/services/apiClient';
import type { Book } from '@/types';

const openLibraryClient = new ApiClient(env.openLibraryBaseUrl);

type OLDoc = {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  subject?: string[];
  first_publish_year?: number;
  number_of_pages_median?: number;
  ratings_average?: number;
};

type OLResponse = {
  docs?: OLDoc[];
};

const mapOLDoc = (doc: OLDoc): Book => ({
  author: doc.author_name?.join(', ') ?? 'Unknown Author',
  coverImage: doc.cover_i
    ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
    : '',
  description: '',
  genres: doc.subject?.slice(0, 3) ?? ['General'],
  id: `ol-${doc.key.replace('/works/', '')}`,
  pages: doc.number_of_pages_median ?? 0,
  progress: 0,
  publishedYear: doc.first_publish_year ?? 0,
  rating: doc.ratings_average ? Math.round(doc.ratings_average * 10) / 10 : 0,
  status: 'want-to-read',
  title: doc.title,
});

export const searchOpenLibrary = async (query: string): Promise<Book[]> => {
  const data = await openLibraryClient.get<OLResponse>('/search.json', {
    params: { limit: 20, q: query },
  });
  return (data.docs ?? []).map(mapOLDoc);
};
