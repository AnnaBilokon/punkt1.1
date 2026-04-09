import { memo, useCallback } from 'react';
import { FlatList, View } from 'react-native';

import { Text } from '@/components';
import type { Book } from '@/types';

import { BookItem } from './BookItem';

type BookHorizontalListProps = {
  books: Book[];
  emptyLabel: string;
};

const ITEM_WIDTH = 172;

export const BookHorizontalList = memo(
  ({ books, emptyLabel }: BookHorizontalListProps) => {
    const keyExtractor = useCallback((item: Book) => item.id, []);
    const renderItem = useCallback(
      ({ item }: { item: Book }) => <BookItem book={item} />,
      [],
    );
    const getItemLayout = useCallback(
      (_: ArrayLike<Book> | null | undefined, index: number) => ({
        index,
        length: ITEM_WIDTH,
        offset: ITEM_WIDTH * index,
      }),
      [],
    );

    if (books.length === 0) {
      return (
        <View className="rounded-[24px] border border-dashed border-border p-6 dark:border-borderDark">
          <Text>{emptyLabel}</Text>
        </View>
      );
    }

    return (
      <FlatList
        contentContainerStyle={{ gap: 16, paddingRight: 20 }}
        data={books}
        getItemLayout={getItemLayout}
        horizontal
        initialNumToRender={3}
        keyExtractor={keyExtractor}
        maxToRenderPerBatch={4}
        removeClippedSubviews
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        windowSize={5}
      />
    );
  },
);

BookHorizontalList.displayName = 'BookHorizontalList';
