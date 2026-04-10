import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { View } from 'react-native';

import { Card, Text } from '@/components';
import type { Book } from '@/types';

import { BookHorizontalList } from './BookHorizontalList';

type LibraryShelfCardProps = {
  books: Book[];
  countLabel: string;
  showCaption?: boolean;
  title: string;
};

export const LibraryShelfCard = memo(
  ({
    books,
    countLabel,
    showCaption = false,
    title,
  }: LibraryShelfCardProps) => (
    <Card className="rounded-[17px] border-[#d9d9d9] bg-[#f9f9f9] px-5 py-5">
      <View className="mb-5 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <Ionicons color="#8285EC" name="book-outline" size={24} />
          <Text className="text-[18px] font-medium text-black" variant="body">
            {title}
          </Text>
        </View>
        <Text className="text-[12px] font-medium text-[#6d7a88]" variant="body">
          {countLabel}
        </Text>
      </View>
      <BookHorizontalList
        books={books}
        cardVariant="compact"
        emptyLabel="No books yet."
        showCaption={showCaption}
      />
    </Card>
  ),
);

LibraryShelfCard.displayName = 'LibraryShelfCard';
