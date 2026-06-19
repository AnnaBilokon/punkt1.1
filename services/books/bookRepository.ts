import { supabase } from '@/services/supabase';
import type { Book, BookFormat, BookStatus, ReadingDataUpdate } from '@/types';

type UserBookRow = {
  author: string;
  book_api_id: string;
  bought_at: string | null;
  cover_image: string | null;
  description: string | null;
  dnf_page: number | null;
  dnf_reason: string | null;
  finished_at: string | null;
  format: string | null;
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
  review_spoiler: boolean | null;
  started_at: string | null;
  status: BookStatus | null;
  tags: string[] | null;
  title: string;
  user_id: string;
};

const rowToBook = (row: UserBookRow): Book => ({
  author: row.author,
  ...(row.bought_at ? { boughtAt: row.bought_at } : {}),
  coverImage: row.cover_image ?? '',
  description: row.description ?? '',
  ...(row.dnf_page !== null ? { dnfPage: row.dnf_page } : {}),
  ...(row.dnf_reason ? { dnfReason: row.dnf_reason } : {}),
  genres: row.genres ?? [],
  id: row.book_api_id,
  ...(row.finished_at ? { finishedAt: row.finished_at } : {}),
  ...(row.format ? { format: row.format as BookFormat } : {}),
  ...(row.isbn ? { isbn: row.isbn } : {}),
  ...(row.language ? { language: row.language } : {}),
  ...(row.my_rating !== null ? { myRating: row.my_rating } : {}),
  ...(row.note ? { note: row.note } : {}),
  pages: row.pages,
  progress: row.progress,
  publishedYear: row.published_year ?? 0,
  ...(row.publisher ? { publisher: row.publisher } : {}),
  ...(row.review ? { review: row.review } : {}),
  ...(row.review_spoiler ? { reviewSpoiler: row.review_spoiler } : {}),
  rating: row.rating,
  ...(row.started_at ? { startedAt: row.started_at } : {}),
  status: row.status,
  ...(row.tags?.length ? { tags: row.tags } : {}),
  title: row.title,
});

export const bookRepository = {
  addBook: async (
    userId: string,
    book: Book,
    status: BookStatus | null,
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
          isbn: book.isbn ?? null,
          language: book.language ?? null,
          pages: book.pages,
          progress: 0,
          published_year: book.publishedYear,
          publisher: book.publisher ?? null,
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

    await supabase
      .from('shelf_books')
      .delete()
      .eq('user_id', userId)
      .eq('book_api_id', bookApiId);
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

  updateBookMeta: async (
    userId: string,
    bookApiId: string,
    book: Book,
  ): Promise<void> => {
    const { error } = await supabase
      .from('user_books')
      .update({
        author: book.author,
        cover_image: book.coverImage,
        description: book.description,
        genres: book.genres,
        isbn: book.isbn ?? null,
        language: book.language ?? null,
        pages: book.pages,
        published_year: book.publishedYear,
        publisher: book.publisher ?? null,
        rating: book.rating,
        title: book.title,
      })
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
    if ('format' in updates) row['format'] = updates.format;
    if ('progress' in updates) row['progress'] = updates.progress;
    if ('myRating' in updates) row['my_rating'] = updates.myRating;
    if ('startedAt' in updates) row['started_at'] = updates.startedAt;
    if ('finishedAt' in updates) row['finished_at'] = updates.finishedAt;
    if ('review' in updates) row['review'] = updates.review;
    if ('reviewSpoiler' in updates) row['review_spoiler'] = updates.reviewSpoiler ?? false;
    if ('note' in updates) row['note'] = updates.note;
    if ('boughtAt' in updates) row['bought_at'] = updates.boughtAt;
    if ('dnfPage' in updates) row['dnf_page'] = updates.dnfPage ?? null;
    if ('dnfReason' in updates) row['dnf_reason'] = updates.dnfReason ?? null;
    if ('tags' in updates) row['tags'] = updates.tags ?? [];

    if (Object.keys(row).length === 0) return;

    const { error } = await supabase
      .from('user_books')
      .update(row)
      .eq('user_id', userId)
      .eq('book_api_id', bookApiId);

    if (error) throw new Error(error.message);
  },
};
