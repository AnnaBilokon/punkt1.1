import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { Text } from '@/components/atoms/Text';
import { BookDetailScreen } from '@/features/books/screens/BookDetailScreen';
import { useUserBooks } from '@/features/library/hooks/useUserBooks';
import { getGoogleBookById } from '@/services/books/googleBooks';
import { useAuthStore } from '@/store/authStore';
import type { Book } from '@/types';

export default function BookDetailRoute() {
  const { id, tab } = useLocalSearchParams<{ id: string; tab?: string }>();
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  // Check user's saved books first (covers NYT books and any saved book)
  const { data: userBooks = [] } = useUserBooks(user?.id ?? null);
  const savedBook = userBooks.find((b) => b.id === id);

  // Check the pre-populated search cache (covers community + OL books)
  const cachedBook =
    savedBook ?? queryClient.getQueryData<Book>(['book', id!]) ?? undefined;

  // Only fetch from Google Books if not found anywhere and it's a Google-style id
  const isNytId = id?.startsWith('nyt-');
  const isCommunityId = id?.startsWith('custom-');
  const isOlId = id?.startsWith('OL') || id?.startsWith('ol-');
  const needsGoogleFetch =
    !!id && !cachedBook && !isNytId && !isCommunityId && !isOlId;

  const { data: fetchedBook, isPending } = useQuery({
    enabled: needsGoogleFetch,
    queryFn: () => getGoogleBookById(id!),
    queryKey: ['book', id],
    staleTime: 1000 * 60 * 10,
  });

  const book = cachedBook ?? fetchedBook;
  const isLoading = needsGoogleFetch && isPending;

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color="#7851A9" size="large" />
      </View>
    );
  }

  if (!book) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-center text-[14px] text-[#6d7a88]">
          Book not found.
        </Text>
      </View>
    );
  }

  return (
    <BookDetailScreen
      book={book}
      initialTab={tab === 'info' ? 'info' : 'my-reading'}
    />
  );
}
