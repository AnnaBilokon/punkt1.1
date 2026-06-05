import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { memo } from 'react';
import { Pressable, View } from 'react-native';

import { Card, Text } from '@/components';
import type { Book, BookStatus } from '@/types';

import { BookHorizontalList } from './BookHorizontalList';

type LibraryShelfCardProps = {
  books: Book[];
  showCaption?: boolean;
  status: BookStatus;
  title: string;
};

export const LibraryShelfCard = memo(
  ({
    books,
    showCaption = false,
    status,
    title,
  }: LibraryShelfCardProps) => {
    const router = useRouter();

    return (
      <Card className="rounded-[17px] border-[#d9d9d9] bg-[#f9f9f9] px-5 py-5">
        <View className="mb-5 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Ionicons color="#7851A9" name="book-outline" size={24} />
            <Text className="text-[18px] font-medium text-black" variant="body">
              {title}
            </Text>
            <View
              style={{
                backgroundColor: '#ede9f7',
                borderRadius: 20,
                paddingHorizontal: 8,
                paddingVertical: 2,
              }}
            >
              <Text className="text-[12px] font-semibold text-[#7851A9]" variant="caption">
                {books.length}
              </Text>
            </View>
          </View>
          <Pressable
            className="flex-row items-center gap-1"
            onPress={() => router.push(`/shelf/${status}` as any)}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Text
              className="text-[12px] font-medium text-[#7851A9]"
              variant="body"
            >
              See all
            </Text>
            <Ionicons color="#7851A9" name="chevron-forward" size={14} />
          </Pressable>
        </View>
        <BookHorizontalList
          books={books}
          cardVariant="compact"
          emptyLabel="No books yet."
          showCaption={showCaption}
        />
      </Card>
    );
  },
);

LibraryShelfCard.displayName = 'LibraryShelfCard';
