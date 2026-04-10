import { useQuery } from '@tanstack/react-query';

import { bookRepository } from '@/services/books/bookRepository';

export const userBooksQueryKey = (userId: string) =>
  ['books', 'user', userId] as const;

export const useUserBooks = (userId: string | null) =>
  useQuery({
    enabled: Boolean(userId),
    queryFn: () => bookRepository.getUserBooks(userId!),
    queryKey: userBooksQueryKey(userId ?? ''),
    staleTime: 1000 * 30,
  });
