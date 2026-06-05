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
  publisher?: string[];
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
  ...(doc.publisher?.[0] ? { publisher: doc.publisher[0] } : {}),
  rating: doc.ratings_average ? Math.round(doc.ratings_average * 10) / 10 : 0,
  status: null,
  title: doc.title,
});

const FIELDS =
  'key,title,author_name,cover_i,subject,first_publish_year,number_of_pages_median,ratings_average,publisher';

export const searchOpenLibrary = async (query: string): Promise<Book[]> => {
  const data = await openLibraryClient.get<OLResponse>('/search.json', {
    params: { fields: FIELDS, limit: 20, q: query },
  });
  return (data.docs ?? []).map(mapOLDoc);
};

export const searchOpenLibraryByPublisher = async (publisher: string): Promise<Book[]> => {
  // Three strategies hit different indexes / result sets
  const [exactQ, directParam, unquotedNew] = await Promise.allSettled([
    openLibraryClient.get<OLResponse>('/search.json', {
      params: { fields: FIELDS, limit: 100, q: `publisher:"${publisher}"` },
    }),
    openLibraryClient.get<OLResponse>('/search.json', {
      params: { fields: FIELDS, limit: 100, publisher },
    }),
    openLibraryClient.get<OLResponse>('/search.json', {
      params: { fields: FIELDS, limit: 100, q: `publisher:${publisher}`, sort: 'new' },
    }),
  ]);
  const r1 = exactQ.status === 'fulfilled' ? (exactQ.value.docs ?? []).map(mapOLDoc) : [];
  const r2 = directParam.status === 'fulfilled' ? (directParam.value.docs ?? []).map(mapOLDoc) : [];
  const r3 = unquotedNew.status === 'fulfilled' ? (unquotedNew.value.docs ?? []).map(mapOLDoc) : [];
  const seen = new Set<string>();
  return [...r1, ...r2, ...r3].filter((b) => {
    if (seen.has(b.id)) return false;
    seen.add(b.id);
    return true;
  });
};

export const searchOpenLibraryByIsbn = async (isbn: string): Promise<Book[]> => {
  const data = await openLibraryClient.get<OLResponse>('/search.json', {
    params: { fields: FIELDS, q: `isbn:${isbn}`, limit: 3 },
  });
  return (data.docs ?? []).map(mapOLDoc);
};
