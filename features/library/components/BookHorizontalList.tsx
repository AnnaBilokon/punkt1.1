import { memo, useCallback } from 'react';
import { FlatList, View } from 'react-native';

import { Text } from '@/components';
import type { Book } from '@/types';

import { BookItem } from './BookItem';

type BookHorizontalListProps = {
  cardVariant?: 'compact' | 'default';
  books: Book[];
  emptyLabel: string;
  showCaption?: boolean;
};

const ITEM_WIDTH = 172;
const horizontalListContentStyle = { gap: 16, paddingRight: 20 };
const compactListContentStyle = { gap: 16, paddingRight: 8 };

export const BookHorizontalList = memo(
  ({
    books,
    cardVariant = 'default',
    emptyLabel,
    showCaption = true,
  }: BookHorizontalListProps) => {
    const itemWidth = cardVariant === 'compact' ? 98 : ITEM_WIDTH;
    const contentStyle =
      cardVariant === 'compact'
        ? compactListContentStyle
        : horizontalListContentStyle;
    const keyExtractor = useCallback((item: Book) => item.id, []);
    const renderItem = useCallback(
      ({ item }: { item: Book }) => (
        <BookItem book={item} showCaption={showCaption} variant={cardVariant} />
      ),
      [cardVariant, showCaption],
    );
    const getItemLayout = useCallback(
      (_: ArrayLike<Book> | null | undefined, index: number) => ({
        index,
        length: itemWidth,
        offset: itemWidth * index,
      }),
      [itemWidth],
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
        contentContainerStyle={contentStyle}
        data={books}
        getItemLayout={getItemLayout}
        horizontal
        initialNumToRender={4}
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
