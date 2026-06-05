import { env } from '@/constants/env';
import { ApiClient } from '@/services/apiClient';
import type { Book } from '@/types';

const isbndbClient = new ApiClient(env.isbndbBaseUrl, {
  Authorization: env.isbndbApiKey,
});

type IsbndbBook = {
  authors?: string[];
  date_published?: string;
  edition?: string;
  image?: string;
  isbn?: string;
  isbn13?: string;
  language?: string;
  pages?: number;
  publisher?: string;
  subjects?: string[];
  synopsis?: string;
  title: string;
};

type IsbndbBookResponse = {
  book: IsbndbBook;
};

type IsbndbSearchResponse = {
  books?: IsbndbBook[];
  total?: number;
};

const mapIsbndbBook = (book: IsbndbBook): Book => {
  const year = book.date_published
    ? parseInt(book.date_published.slice(0, 4), 10)
    : 0;

  return {
    author: book.authors?.join(', ') ?? 'Unknown Author',
    coverImage: book.image ?? '',
    description: book.synopsis ?? '',
    genres: book.subjects ?? [],
    id: `isbndb-${book.isbn13 ?? book.isbn ?? book.title}`,
    ...(book.isbn13 ?? book.isbn ? { isbn: book.isbn13 ?? book.isbn } : {}),
    ...(book.language ? { language: book.language } : {}),
    pages: book.pages ?? 0,
    progress: 0,
    publishedYear: isNaN(year) ? 0 : year,
    ...(book.publisher ? { publisher: book.publisher } : {}),
    rating: 0,
    status: null,
    title: book.title,
  };
};

export const searchIsbndb = async (query: string): Promise<Book[]> => {
  try {
    const data = await isbndbClient.get(`/books/${encodeURIComponent(query)}`, {
      params: { page: 1, pageSize: 20 },
    });
    const response = data as IsbndbSearchResponse;
    return (response.books ?? []).map(mapIsbndbBook).filter((b) => b.title !== '');
  } catch {
    return [];
  }
};

export const getIsbndbBookByIsbn = async (isbn: string): Promise<Book | null> => {
  try {
    const data = await isbndbClient.get(`/book/${isbn}`);
    const response = data as IsbndbBookResponse;
    if (!response.book) return null;
    return mapIsbndbBook(response.book);
  } catch {
    return null;
  }
};
