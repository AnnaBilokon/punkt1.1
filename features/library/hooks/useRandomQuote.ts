import { useQuery } from '@tanstack/react-query';

import { bookQuotesService } from '@/services/books/bookQuotesService';

export const useRandomQuote = (userId: string | null) =>
  useQuery({
    queryKey: ['random-quote', userId],
    queryFn: () => bookQuotesService.getRandomQuote(userId!),
    enabled: !!userId,
    staleTime: 60 * 60 * 1000, // refresh at most once per hour
  });
