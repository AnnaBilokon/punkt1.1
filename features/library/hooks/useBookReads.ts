import { useQuery, useQueryClient } from '@tanstack/react-query';

import { bookReadsService } from '@/services/books/bookReadsService';
import type { BookRead } from '@/types';

export const bookReadsQueryKey = (bookApiId: string | null, userId: string | null) =>
  ['book-reads', bookApiId, userId] as const;

export const useBookReads = (bookApiId: string | null, userId: string | null) =>
  useQuery<BookRead[]>({
    queryKey: bookReadsQueryKey(bookApiId, userId),
    queryFn: () => bookReadsService.getReads(userId!, bookApiId!),
    enabled: !!bookApiId && !!userId,
  });

export const useBookReadsActions = (bookApiId: string | null, userId: string | null) => {
  const queryClient = useQueryClient();

  const invalidate = () =>
    void queryClient.invalidateQueries({
      queryKey: bookReadsQueryKey(bookApiId, userId),
    });

  const addRead = async (input: {
    finishedAt?: string;
    rating?: number;
    review?: string;
    startedAt?: string;
  }) => {
    if (!userId || !bookApiId) return;
    const nextNum = await bookReadsService.getNextReadNumber(userId, bookApiId);
    await bookReadsService.addRead(userId, bookApiId, { ...input, readNumber: nextNum });
    invalidate();
  };

  const updateRead = async (
    id: string,
    input: { finishedAt?: string; rating?: number; review?: string; startedAt?: string },
  ) => {
    await bookReadsService.updateRead(id, input);
    invalidate();
  };

  const deleteRead = async (id: string) => {
    await bookReadsService.deleteRead(id);
    invalidate();
  };

  return { addRead, deleteRead, updateRead };
};
