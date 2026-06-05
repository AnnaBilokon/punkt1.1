import { supabase } from '@/services/supabase';
import type { Book, BookStatus, CustomShelf } from '@/types';

type ShelfRow = {
  id: string;
  is_archived: boolean;
  is_private: boolean;
  name: string;
  shelf_books: [{ count: number }];
};

type UserBookRow = {
  author: string;
  book_api_id: string;
  cover_image: string | null;
  description: string | null;
  finished_at: string | null;
  genres: string[];
  isbn: string | null;
  language: string | null;
  my_rating: number | null;
  note: string | null;
  pages: number;
  progress: number;
  published_year: number | null;
  publisher: string | null;
  rating: number;
  review: string | null;
  started_at: string | null;
  status: BookStatus;
  title: string;
};

const rowToShelf = (row: ShelfRow): CustomShelf => ({
  bookCount: row.shelf_books?.[0]?.count ?? 0,
  id: row.id,
  isArchived: row.is_archived,
  isPrivate: row.is_private,
  name: row.name,
});

const rowToBook = (row: UserBookRow): Book => ({
  author: row.author,
  coverImage: row.cover_image ?? '',
  description: row.description ?? '',
  genres: row.genres ?? [],
  id: row.book_api_id,
  ...(row.isbn ? { isbn: row.isbn } : {}),
  ...(row.language ? { language: row.language } : {}),
  pages: row.pages,
  progress: row.progress,
  publishedYear: row.published_year ?? 0,
  ...(row.publisher ? { publisher: row.publisher } : {}),
  rating: row.rating,
  status: row.status,
  title: row.title,
  ...(row.finished_at ? { finishedAt: row.finished_at } : {}),
  ...(row.my_rating !== null ? { myRating: row.my_rating } : {}),
  ...(row.note ? { note: row.note } : {}),
  ...(row.review ? { review: row.review } : {}),
  ...(row.started_at ? { startedAt: row.started_at } : {}),
});

export const shelfService = {
  getCustomShelves: async (userId: string): Promise<CustomShelf[]> => {
    const { data, error } = await supabase
      .from('custom_shelves')
      .select('id, name, is_archived, is_private, shelf_books(count)')
      .eq('user_id', userId)
      .eq('is_archived', false)
      .order('created_at', { ascending: true });
    if (error) throw new Error(error.message);
    return ((data ?? []) as unknown as ShelfRow[]).map(rowToShelf);
  },

  getArchivedShelves: async (userId: string): Promise<CustomShelf[]> => {
    const { data, error } = await supabase
      .from('custom_shelves')
      .select('id, name, is_archived, is_private, shelf_books(count)')
      .eq('user_id', userId)
      .eq('is_archived', true)
      .order('created_at', { ascending: true });
    if (error) throw new Error(error.message);
    return ((data ?? []) as unknown as ShelfRow[]).map(rowToShelf);
  },

  createShelf: async (userId: string, name: string, isPrivate = false): Promise<CustomShelf> => {
    const { data, error } = await supabase
      .from('custom_shelves')
      .insert({ is_private: isPrivate, name: name.trim(), user_id: userId })
      .select('id, name, is_archived, is_private, shelf_books(count)')
      .single();
    if (error) throw new Error(error.message);
    return rowToShelf(data as unknown as ShelfRow);
  },

  setPrivate: async (shelfId: string, isPrivate: boolean): Promise<void> => {
    const { error } = await supabase
      .from('custom_shelves')
      .update({ is_private: isPrivate })
      .eq('id', shelfId);
    if (error) throw new Error(error.message);
  },

  deleteShelf: async (shelfId: string): Promise<void> => {
    const { error } = await supabase
      .from('custom_shelves')
      .delete()
      .eq('id', shelfId);
    if (error) throw new Error(error.message);
  },

  renameShelf: async (shelfId: string, name: string): Promise<void> => {
    const { error } = await supabase
      .from('custom_shelves')
      .update({ name: name.trim() })
      .eq('id', shelfId);
    if (error) throw new Error(error.message);
  },

  archiveShelf: async (shelfId: string): Promise<void> => {
    const { error } = await supabase
      .from('custom_shelves')
      .update({ is_archived: true })
      .eq('id', shelfId);
    if (error) throw new Error(error.message);
  },

  unarchiveShelf: async (shelfId: string): Promise<void> => {
    const { error } = await supabase
      .from('custom_shelves')
      .update({ is_archived: false })
      .eq('id', shelfId);
    if (error) throw new Error(error.message);
  },

  getShelfBooks: async (shelfId: string, userId: string): Promise<Book[]> => {
    const { data: sbRows, error: sbError } = await supabase
      .from('shelf_books')
      .select('book_api_id')
      .eq('shelf_id', shelfId)
      .eq('user_id', userId);
    if (sbError) throw new Error(sbError.message);

    const ids = ((sbRows ?? []) as { book_api_id: string }[]).map(
      (r) => r.book_api_id,
    );
    if (ids.length === 0) return [];

    const { data, error } = await supabase
      .from('user_books')
      .select('*')
      .eq('user_id', userId)
      .in('book_api_id', ids);
    if (error) throw new Error(error.message);
    return ((data ?? []) as UserBookRow[]).map(rowToBook);
  },

  addBookToShelf: async (
    shelfId: string,
    bookApiId: string,
    userId: string,
  ): Promise<void> => {
    const { error } = await supabase
      .from('shelf_books')
      .upsert(
        { book_api_id: bookApiId, shelf_id: shelfId, user_id: userId },
        { onConflict: 'shelf_id,book_api_id' },
      );
    if (error) throw new Error(error.message);
  },

  removeBookFromShelf: async (
    shelfId: string,
    bookApiId: string,
  ): Promise<void> => {
    const { error } = await supabase
      .from('shelf_books')
      .delete()
      .eq('shelf_id', shelfId)
      .eq('book_api_id', bookApiId);
    if (error) throw new Error(error.message);
  },

  getBookShelfIds: async (
    bookApiId: string,
    userId: string,
  ): Promise<string[]> => {
    const { data, error } = await supabase
      .from('shelf_books')
      .select('shelf_id')
      .eq('book_api_id', bookApiId)
      .eq('user_id', userId);
    if (error) throw new Error(error.message);
    return ((data ?? []) as { shelf_id: string }[]).map((r) => r.shelf_id);
  },
};
