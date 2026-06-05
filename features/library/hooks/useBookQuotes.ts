import { useQuery, useQueryClient } from '@tanstack/react-query';

import { bookQuotesService } from '@/services/books/bookQuotesService';
import type { BookQuote } from '@/types';

export const bookQuotesQueryKey = (bookApiId: string | null, userId: string | null) =>
  ['book-quotes', bookApiId, userId] as const;

export const useBookQuotes = (bookApiId: string | null, userId: string | null) =>
  useQuery<BookQuote[]>({
    queryKey: bookQuotesQueryKey(bookApiId, userId),
    queryFn: () => bookQuotesService.getQuotes(userId!, bookApiId!),
    enabled: !!bookApiId && !!userId,
  });

export const useBookQuotesActions = (bookApiId: string | null, userId: string | null) => {
  const queryClient = useQueryClient();

  const invalidate = () =>
    void queryClient.invalidateQueries({ queryKey: bookQuotesQueryKey(bookApiId, userId) });

  const addQuote = async (text: string, pageNumber?: number) => {
    if (!userId || !bookApiId) return;
    await bookQuotesService.addQuote(userId, bookApiId, text, pageNumber);
    invalidate();
  };

  const deleteQuote = async (id: string) => {
    await bookQuotesService.deleteQuote(id);
    invalidate();
  };

  return { addQuote, deleteQuote };
};
