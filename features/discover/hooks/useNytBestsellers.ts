import { useQuery } from '@tanstack/react-query';

import { getNytBestSellers } from '@/services/books/nytBooks';

export const NYT_BESTSELLERS_QUERY_KEY = ['books', 'nyt-bestsellers'] as const;

export const useNytBestsellers = () =>
  useQuery({
    queryFn: getNytBestSellers,
    queryKey: NYT_BESTSELLERS_QUERY_KEY,
    staleTime: 1000 * 60 * 60, // 1 hour — NYT list updates weekly
  });
