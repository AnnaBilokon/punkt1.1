import { supabase } from '@/services/supabase';
import type { Book, BookStatus, ReadingDataUpdate } from '@/types';

type UserBookRow = {
  author: string;
  book_api_id: string;
  cover_image: string | null;
  description: string | null;
  finished_at: string | null;
  genres: string[];
  my_rating: number | null;
  note: string | null;
  pages: number;
  progress: number;
  published_year: number | null;
  rating: number;
  review: string | null;
  started_at: string | null;
  status: BookStatus;
  title: string;
  user_id: string;
};

const rowToBook = (row: UserBookRow): Book => ({
  author: row.author,
  coverImage: row.cover_image ?? '',
  description: row.description ?? '',
  genres: row.genres ?? [],
  id: row.book_api_id,
  pages: row.pages,
  progress: row.progress,
  publishedYear: row.published_year ?? 0,
  rating: row.rating,
  status: row.status,
  title: row.title,
  ...(row.finished_at ? { finishedAt: row.finished_at } : {}),
  ...(row.my_rating !== null ? { myRating: row.my_rating } : {}),
  ...(row.note ? { note: row.note } : {}),
  ...(row.review ? { review: row.review } : {}),
  ...(row.started_at ? { startedAt: row.started_at } : {}),
});

export const bookRepository = {
  addBook: async (
    userId: string,
    book: Book,
    status: BookStatus,
  ): Promise<Book> => {
    const { data, error } = await supabase
      .from('user_books')
      .upsert(
        {
          author: book.author,
          book_api_id: book.id,
          cover_image: book.coverImage,
          description: book.description,
          genres: book.genres,
          pages: book.pages,
          progress: 0,
          published_year: book.publishedYear,
          rating: book.rating,
          status,
          title: book.title,
          user_id: userId,
        },
        { onConflict: 'user_id,book_api_id' },
      )
      .select()
      .single();

    if (error) throw new Error(error.message);
    return rowToBook(data as UserBookRow);
  },

  getUserBooks: async (userId: string): Promise<Book[]> => {
    const { data, error } = await supabase
      .from('user_books')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data as UserBookRow[]).map(rowToBook);
  },

  removeBook: async (userId: string, bookApiId: string): Promise<void> => {
    const { error } = await supabase
      .from('user_books')
      .delete()
      .eq('user_id', userId)
      .eq('book_api_id', bookApiId);

    if (error) throw new Error(error.message);
  },

  updateBook: async (
    userId: string,
    bookApiId: string,
    updates: Partial<Pick<Book, 'status' | 'progress'>>,
  ): Promise<void> => {
    const row: Record<string, unknown> = {};
    if (updates.status !== undefined) row['status'] = updates.status;
    if (updates.progress !== undefined) row['progress'] = updates.progress;

    const { error } = await supabase
      .from('user_books')
      .update(row)
      .eq('user_id', userId)
      .eq('book_api_id', bookApiId);

    if (error) throw new Error(error.message);
  },

  saveReadingData: async (
    userId: string,
    bookApiId: string,
    updates: ReadingDataUpdate,
  ): Promise<void> => {
    const row: Record<string, unknown> = {};
    if ('status' in updates) row['status'] = updates.status;
    if ('progress' in updates) row['progress'] = updates.progress;
    if ('myRating' in updates) row['my_rating'] = updates.myRating;
    if ('startedAt' in updates) row['started_at'] = updates.startedAt;
    if ('finishedAt' in updates) row['finished_at'] = updates.finishedAt;
    if ('review' in updates) row['review'] = updates.review;
    if ('note' in updates) row['note'] = updates.note;

    if (Object.keys(row).length === 0) return;

    const { error } = await supabase
      .from('user_books')
      .update(row)
      .eq('user_id', userId)
      .eq('book_api_id', bookApiId);

    if (error) throw new Error(error.message);
  },
};
