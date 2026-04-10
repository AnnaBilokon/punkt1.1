import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Text } from '@/components/atoms/Text';
import { BookDetailScreen } from '@/features/books/screens/BookDetailScreen';
import { mockBooks } from '@/mocks/books';

export default function BookDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const book = mockBooks.find((b) => b.id === id) ?? mockBooks[0];

  if (!book) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Book not found</Text>
      </View>
    );
  }

  return <BookDetailScreen book={book} />;
}
