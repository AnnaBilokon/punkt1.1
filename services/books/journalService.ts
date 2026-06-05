import { supabase } from '@/services/supabase';
import type { JournalEntry } from '@/types';

type JournalRow = {
  book_api_id: string;
  body: string;
  created_at: string;
  id: string;
  prompt: string | null;
  updated_at: string;
};

const rowToEntry = (row: JournalRow): JournalEntry => ({
  bookApiId: row.book_api_id,
  body: row.body,
  createdAt: row.created_at,
  id: row.id,
  ...(row.prompt ? { prompt: row.prompt } : {}),
  updatedAt: row.updated_at,
});

export const journalService = {
  getEntries: async (userId: string, bookApiId: string): Promise<JournalEntry[]> => {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('book_api_id', bookApiId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data as JournalRow[]).map(rowToEntry);
  },

  addEntry: async (
    userId: string,
    bookApiId: string,
    body: string,
    prompt?: string,
  ): Promise<JournalEntry> => {
    const { data, error } = await supabase
      .from('journal_entries')
      .insert({
        book_api_id: bookApiId,
        body: body.trim(),
        ...(prompt ? { prompt } : {}),
        user_id: userId,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return rowToEntry(data as JournalRow);
  },

  updateEntry: async (id: string, body: string): Promise<void> => {
    const { error } = await supabase
      .from('journal_entries')
      .update({ body: body.trim(), updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw new Error(error.message);
  },

  deleteEntry: async (id: string): Promise<void> => {
    const { error } = await supabase.from('journal_entries').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};
