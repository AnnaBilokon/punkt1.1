import { supabase } from '@/services/supabase';
import type { Book } from '@/types';

export type CommunityBookInput = {
  author: string;
  coverImage?: string | undefined;
  description?: string | undefined;
  genres?: string[] | undefined;
  isbn?: string | undefined;
  language?: string | undefined;
  pages?: number | undefined;
  publishedYear?: number | undefined;
  publisher?: string | undefined;
  rating?: number | undefined;
  title: string;
};

type CommunityBookRow = {
  added_by: string | null;
  author: string;
  cover_image: string | null;
  created_at: string;
  description: string | null;
  genres: string[];
  id: string;
  isbn: string | null;
  language: string | null;
  pages: number;
  published_year: number | null;
  publisher: string | null;
  rating: number;
  title: string;
};

const rowToBook = (row: CommunityBookRow): Book => ({
  author: row.author,
  coverImage: row.cover_image ?? '',
  description: row.description ?? '',
  genres: row.genres?.length ? row.genres : ['General'],
  id: `custom-${row.id}`,
  ...(row.isbn ? { isbn: row.isbn } : {}),
  ...(row.language ? { language: row.language } : {}),
  pages: row.pages ?? 0,
  progress: 0,
  publishedYear: row.published_year ?? 0,
  ...(row.publisher ? { publisher: row.publisher } : {}),
  rating: row.rating ?? 0,
  status: null,
  title: row.title,
});

export const searchCommunityBooks = async (
  query: string,
  mode: 'default' | 'publisher' = 'default',
): Promise<Book[]> => {
  const term = query.trim();
  if (!term) return [];

  const filter =
    mode === 'publisher'
      ? `publisher.ilike.%${term}%`
      : `title.ilike.%${term}%,author.ilike.%${term}%`;

  const { data, error } = await supabase
    .from('community_books')
    .select('*')
    .or(filter)
    .limit(20);

  if (error || !data) return [];

  return (data as CommunityBookRow[]).map(rowToBook);
};

export const findCommunityBookByTitleAuthor = async (
  title: string,
  author: string,
  excludeRawId?: string,
): Promise<Book | null> => {
  const normalizedTitle = title.trim();
  const normalizedAuthor = author.trim();

  if (!normalizedTitle || !normalizedAuthor) return null;

  let query = supabase
    .from('community_books')
    .select('*')
    .ilike('title', normalizedTitle)
    .ilike('author', normalizedAuthor)
    .limit(1);

  if (excludeRawId) {
    query = query.neq('id', excludeRawId);
  }

  const { data, error } = await query.maybeSingle();

  if (error || !data) return null;

  return rowToBook(data as CommunityBookRow);
};

export const deleteCommunityBook = async (rawId: string): Promise<void> => {
  const { error } = await supabase
    .from('community_books')
    .delete()
    .eq('id', rawId);
  if (error) throw new Error(error.message);
  // Remove all user_books rows referencing this book (handles missing FK cascade)
  await supabase
    .from('user_books')
    .delete()
    .eq('book_api_id', `custom-${rawId}`);
};

export const updateCommunityBook = async (
  rawId: string,
  input: CommunityBookInput,
): Promise<Book> => {
  const { data, error } = await supabase
    .from('community_books')
    .update({
      author: input.author,
      cover_image: input.coverImage ?? null,
      description: input.description ?? null,
      genres: input.genres?.length ? input.genres : ['General'],
      isbn: input.isbn ?? null,
      language: input.language ?? null,
      pages: input.pages ?? 0,
      published_year: input.publishedYear ?? null,
      publisher: input.publisher ?? null,
      rating: input.rating ?? 0,
      title: input.title,
    })
    .eq('id', rawId)
    .select()
    .single();

  if (error || !data)
    throw new Error(error?.message ?? 'Failed to update book');

  // Keep user_books in sync so the library and detail screen reflect the edit
  await supabase
    .from('user_books')
    .update({
      author: input.author,
      cover_image: input.coverImage ?? null,
      description: input.description ?? null,
      genres: input.genres?.length ? input.genres : ['General'],
      isbn: input.isbn ?? null,
      language: input.language ?? null,
      pages: input.pages ?? 0,
      published_year: input.publishedYear ?? null,
      publisher: input.publisher ?? null,
      title: input.title,
    })
    .eq('book_api_id', `custom-${rawId}`);

  return rowToBook(data as CommunityBookRow);
};

export const submitCommunityBook = async (
  userId: string,
  input: CommunityBookInput,
): Promise<Book> => {
  const { data, error } = await supabase
    .from('community_books')
    .insert({
      added_by: userId,
      author: input.author,
      cover_image: input.coverImage ?? null,
      description: input.description ?? null,
      genres: input.genres?.length ? input.genres : ['General'],
      isbn: input.isbn ?? null,
      language: input.language ?? null,
      pages: input.pages ?? 0,
      published_year: input.publishedYear ?? null,
      publisher: input.publisher ?? null,
      rating: input.rating ?? 0,
      title: input.title,
    })
    .select()
    .single();

  if (error || !data) throw new Error(error?.message ?? 'Failed to save book');

  return rowToBook(data as CommunityBookRow);
};
