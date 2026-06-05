import { env } from '@/constants/env';
import { ApiClient } from '@/services/apiClient';
import type { Book } from '@/types';

const nytBooksClient = new ApiClient(env.nytBooksBaseUrl);

type NytBook = {
  author: string;
  book_image?: string;
  description?: string;
  primary_isbn13?: string;
  rank: number;
  title: string;
};

type NytResponse = {
  results?: {
    books?: NytBook[];
  };
};

const mapNytBook = (nytBook: NytBook): Book => ({
  author: nytBook.author,
  coverImage: nytBook.book_image ?? '',
  description: nytBook.description ?? '',
  genres: ['Bestseller'],
  id: `nyt-${nytBook.primary_isbn13 ?? String(nytBook.rank)}`,
  pages: 0,
  progress: 0,
  publishedYear: new Date().getFullYear(),
  rating: 0,
  status: null,
  title: nytBook.title,
});

export const getNytBestSellers = async (): Promise<Book[]> => {
  if (!env.nytBooksApiKey) return [];
  const data: NytResponse = await nytBooksClient.get(
    '/lists/current/hardcover-fiction.json',
    { params: { 'api-key': env.nytBooksApiKey } },
  );
  return (data.results?.books ?? []).map(mapNytBook);
};
