import { useQuery, useQueryClient } from '@tanstack/react-query';

import { journalService } from '@/services/books/journalService';
import type { JournalEntry } from '@/types';

export const journalQueryKey = (bookApiId: string | null, userId: string | null) =>
  ['journal', bookApiId, userId] as const;

export const useJournal = (bookApiId: string | null, userId: string | null) =>
  useQuery<JournalEntry[]>({
    queryKey: journalQueryKey(bookApiId, userId),
    queryFn: () => journalService.getEntries(userId!, bookApiId!),
    enabled: !!bookApiId && !!userId,
  });

export const useJournalActions = (bookApiId: string | null, userId: string | null) => {
  const queryClient = useQueryClient();

  const invalidate = () =>
    void queryClient.invalidateQueries({ queryKey: journalQueryKey(bookApiId, userId) });

  const addEntry = async (body: string, prompt?: string) => {
    if (!userId || !bookApiId) return;
    await journalService.addEntry(userId, bookApiId, body, prompt);
    invalidate();
  };

  const updateEntry = async (id: string, body: string) => {
    await journalService.updateEntry(id, body);
    invalidate();
  };

  const deleteEntry = async (id: string) => {
    await journalService.deleteEntry(id);
    invalidate();
  };

  return { addEntry, deleteEntry, updateEntry };
};
