import { supabase } from '@/services/supabase';
import type { Book } from '@/types';

export type CommunityBookInput = {
  author: string;
  coverImage?: string | undefined;
  description?: string | undefined;
  genres?: string[] | undefined;
  pages?: number | undefined;
  publishedYear?: number | undefined;
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
  pages: number;
  published_year: number | null;
  rating: number;
  title: string;
};

const rowToBook = (row: CommunityBookRow): Book => ({
  author: row.author,
  coverImage: row.cover_image ?? '',
  description: row.description ?? '',
  genres: row.genres?.length ? row.genres : ['General'],
  id: `custom-${row.id}`,
  pages: row.pages ?? 0,
  progress: 0,
  publishedYear: row.published_year ?? 0,
  rating: row.rating ?? 0,
  status: 'want-to-read',
  title: row.title,
});

export const searchCommunityBooks = async (query: string): Promise<Book[]> => {
  const term = query.trim();
  if (!term) return [];

  const { data, error } = await supabase
    .from('community_books')
    .select('*')
    .or(`title.ilike.%${term}%,author.ilike.%${term}%`)
    .limit(20);

  if (error || !data) return [];

  return (data as CommunityBookRow[]).map(rowToBook);
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
      pages: input.pages ?? 0,
      published_year: input.publishedYear ?? null,
      rating: input.rating ?? 0,
      title: input.title,
    })
    .eq('id', rawId)
    .select()
    .single();

  if (error || !data)
    throw new Error(error?.message ?? 'Failed to update book');

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
      pages: input.pages ?? 0,
      published_year: input.publishedYear ?? null,
      rating: input.rating ?? 0,
      title: input.title,
    })
    .select()
    .single();

  if (error || !data) throw new Error(error?.message ?? 'Failed to save book');

  return rowToBook(data as CommunityBookRow);
};
