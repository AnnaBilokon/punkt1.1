import { supabase } from '@/services/supabase';
import type { BookQuote } from '@/types';

type BookQuoteRow = {
  book_api_id: string;
  created_at: string;
  id: string;
  page_number: number | null;
  text: string;
};

const rowToQuote = (row: BookQuoteRow): BookQuote => ({
  bookApiId: row.book_api_id,
  createdAt: row.created_at,
  id: row.id,
  ...(row.page_number !== null ? { pageNumber: row.page_number } : {}),
  text: row.text,
});

export const bookQuotesService = {
  getQuotes: async (userId: string, bookApiId: string): Promise<BookQuote[]> => {
    const { data, error } = await supabase
      .from('book_quotes')
      .select('*')
      .eq('user_id', userId)
      .eq('book_api_id', bookApiId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data as BookQuoteRow[]).map(rowToQuote);
  },

  addQuote: async (
    userId: string,
    bookApiId: string,
    text: string,
    pageNumber?: number,
  ): Promise<BookQuote> => {
    const { data, error } = await supabase
      .from('book_quotes')
      .insert({
        book_api_id: bookApiId,
        ...(pageNumber !== undefined ? { page_number: pageNumber } : {}),
        text: text.trim(),
        user_id: userId,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return rowToQuote(data as BookQuoteRow);
  },

  deleteQuote: async (id: string): Promise<void> => {
    const { error } = await supabase.from('book_quotes').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  getRandomQuote: async (userId: string): Promise<BookQuote | null> => {
    const { data, error } = await supabase
      .from('book_quotes')
      .select('*')
      .eq('user_id', userId);
    if (error) throw new Error(error.message);
    const rows = data as BookQuoteRow[];
    if (rows.length === 0) return null;
    const row = rows[Math.floor(Math.random() * rows.length)];
    return row ? rowToQuote(row) : null;
  },
};
