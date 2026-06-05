import { supabase } from '@/services/supabase';
import type { BookRead } from '@/types';

type BookReadRow = {
  book_api_id: string;
  created_at: string;
  finished_at: string | null;
  id: string;
  rating: number | null;
  read_number: number;
  review: string | null;
  started_at: string | null;
  user_id: string;
};

type AddReadInput = {
  finishedAt?: string;
  rating?: number;
  readNumber: number;
  review?: string;
  startedAt?: string;
};

const rowToRead = (row: BookReadRow): BookRead => ({
  bookApiId: row.book_api_id,
  createdAt: row.created_at,
  ...(row.finished_at ? { finishedAt: row.finished_at } : {}),
  id: row.id,
  ...(row.rating !== null ? { rating: row.rating } : {}),
  readNumber: row.read_number,
  ...(row.review ? { review: row.review } : {}),
  ...(row.started_at ? { startedAt: row.started_at } : {}),
});

export const bookReadsService = {
  getReads: async (userId: string, bookApiId: string): Promise<BookRead[]> => {
    const { data, error } = await supabase
      .from('book_reads')
      .select('*')
      .eq('user_id', userId)
      .eq('book_api_id', bookApiId)
      .order('read_number', { ascending: true });

    if (error) throw new Error(error.message);
    return (data as BookReadRow[]).map(rowToRead);
  },

  addRead: async (
    userId: string,
    bookApiId: string,
    input: AddReadInput,
  ): Promise<BookRead> => {
    const { data, error } = await supabase
      .from('book_reads')
      .insert({
        book_api_id: bookApiId,
        finished_at: input.finishedAt ?? null,
        rating: input.rating ?? null,
        read_number: input.readNumber,
        review: input.review ?? null,
        started_at: input.startedAt ?? null,
        user_id: userId,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return rowToRead(data as BookReadRow);
  },

  updateRead: async (
    id: string,
    input: Omit<AddReadInput, 'readNumber'>,
  ): Promise<void> => {
    const { error } = await supabase
      .from('book_reads')
      .update({
        finished_at: input.finishedAt ?? null,
        rating: input.rating ?? null,
        review: input.review ?? null,
        started_at: input.startedAt ?? null,
      })
      .eq('id', id);

    if (error) throw new Error(error.message);
  },

  deleteRead: async (id: string): Promise<void> => {
    const { error } = await supabase.from('book_reads').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  getNextReadNumber: async (userId: string, bookApiId: string): Promise<number> => {
    const { data } = await supabase
      .from('book_reads')
      .select('read_number')
      .eq('user_id', userId)
      .eq('book_api_id', bookApiId)
      .order('read_number', { ascending: false })
      .limit(1);

    const rows = data as { read_number: number }[] | null;
    return (rows?.[0]?.read_number ?? 1) + 1;
  },
};
