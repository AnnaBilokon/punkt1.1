import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { memo, useCallback, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/atoms/Text';
import { AddBookModal } from '@/features/discover/components/AddBookModal';
import { useAuthStore } from '@/store/authStore';
import type { Book } from '@/types';

const SHELF_LABELS: Record<string, string> = {
  completed: 'Finished',
  reading: 'Currently Reading',
  'want-to-read': 'TBR',
};

const HORIZONTAL_PADDING = 16;
const COLUMN_GAP = 12;
const NUM_COLUMNS = 3;

const BookGridItem = memo(
  ({
    book,
    itemWidth,
    onLongPress,
    onPress,
  }: {
    book: Book;
    itemWidth: number;
    onLongPress?: (id: string) => void;
    onPress: (id: string) => void;
  }) => (
    <Pressable
      delayLongPress={400}
      onLongPress={onLongPress ? () => onLongPress(book.id) : undefined}
      onPress={() => onPress(book.id)}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, width: itemWidth })}
    >
      <View style={{ height: itemWidth * 1.5, width: itemWidth }}>
        <Image
          className="rounded-[12px] bg-[#e0e0e0]"
          source={{ uri: book.coverImage }}
          style={{ height: itemWidth * 1.5, width: itemWidth }}
        />
        {book.status === 'reading' && book.progress > 0 && (
          <View
            className="absolute bottom-0 left-0 right-0 h-[4px] overflow-hidden rounded-b-[12px] bg-black/20"
          >
            <View
              className="h-full bg-[#797DEA]"
              style={{ width: `${book.progress}%` }}
            />
          </View>
        )}
      </View>
      <Text
        className="mt-1.5 text-[11px] font-medium leading-[14px] text-black"
        numberOfLines={2}
        variant="body"
      >
        {book.title}
      </Text>
      <Text
        className="text-[10px] text-[#9b9b9b]"
        numberOfLines={1}
        variant="body"
      >
        {book.author}
      </Text>
    </Pressable>
  ),
);
BookGridItem.displayName = 'BookGridItem';

const AddBookTile = memo(
  ({ itemWidth, onPress }: { itemWidth: number; onPress: () => void }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, width: itemWidth })}
    >
      <View
        className="items-center justify-center rounded-[12px]"
        style={{
          borderColor: '#d0d0e8',
          borderStyle: 'dashed',
          borderWidth: 1.5,
          height: itemWidth * 1.5,
          width: itemWidth,
        }}
      >
        <View className="h-9 w-9 items-center justify-center rounded-full bg-[#ede9f7]">
          <Ionicons color="#797DEA" name="add" size={22} />
        </View>
      </View>
      <Text
        className="mt-1.5 text-center text-[11px] text-[#9b9b9b]"
        variant="body"
      >
        Add book
      </Text>
    </Pressable>
  ),
);
AddBookTile.displayName = 'AddBookTile';

type GridItem = { type: 'book'; book: Book } | { type: 'add' } | { type: 'spacer' };

export const ShelfScreen = memo(
  ({
    books,
    onLongPressBook,
    status,
  }: {
    books: Book[];
    onLongPressBook?: (bookId: string) => void;
    status: string;
  }) => {
    const router = useRouter();
    const user = useAuthStore((s) => s.user);
    const { width: screenWidth } = useWindowDimensions();
    const [addModalVisible, setAddModalVisible] = useState(false);

    const title = SHELF_LABELS[status] ?? 'Books';
    const itemWidth = Math.floor(
      (screenWidth - HORIZONTAL_PADDING * 2 - COLUMN_GAP * (NUM_COLUMNS - 1)) /
        NUM_COLUMNS,
    );

    const handleBookPress = useCallback(
      (id: string) => router.push(`/book/${id}` as any),
      [router],
    );

    const handleAddPress = useCallback(() => {
      Alert.alert('Add a book', 'How would you like to add a book?', [
        {
          text: 'Search / Discover',
          onPress: () => router.push('/(tabs)/discover' as any),
        },
        { text: 'Enter manually', onPress: () => setAddModalVisible(true) },
        { style: 'cancel', text: 'Cancel' },
      ]);
    }, [router]);

    const allItems: GridItem[] = [
      ...books.map((book): GridItem => ({ type: 'book', book })),
      { type: 'add' },
    ];
    const rem = allItems.length % NUM_COLUMNS;
    if (rem !== 0) {
      for (let i = 0; i < NUM_COLUMNS - rem; i++) allItems.push({ type: 'spacer' });
    }
    const rows: GridItem[][] = [];
    for (let i = 0; i < allItems.length; i += NUM_COLUMNS) {
      rows.push(allItems.slice(i, i + NUM_COLUMNS));
    }

    return (
      <SafeAreaView className="flex-1 bg-[#fdfdfd]" edges={['top']}>
        <View className="px-5 pb-2 pt-2">
          <Pressable
            className="mb-3 flex-row items-center gap-1 self-start"
            onPress={() => router.back()}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <Ionicons color="#6d6d6d" name="chevron-back" size={20} />
            <Text className="text-[14px] text-[#6d6d6d]" variant="body">
              Library
            </Text>
          </Pressable>
          <View className="flex-row items-end justify-between">
            <Text className="text-[24px] font-bold text-black" variant="body">
              {title}
            </Text>
            <Text className="mb-0.5 text-[13px] text-[#9b9b9b]" variant="body">
              {books.length} book{books.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{
            paddingBottom: 100,
            paddingHorizontal: HORIZONTAL_PADDING,
            paddingTop: 12,
          }}
          showsVerticalScrollIndicator={false}
        >
          {rows.map((row, rowIdx) => (
            <View
              key={rowIdx}
              style={{
                flexDirection: 'row',
                gap: COLUMN_GAP,
                marginBottom: rowIdx < rows.length - 1 ? COLUMN_GAP : 0,
              }}
            >
              {row.map((item, colIdx) => {
                if (item.type === 'spacer') {
                  return <View key={`spacer-${colIdx}`} style={{ width: itemWidth }} />;
                }
                if (item.type === 'add') {
                  return (
                    <AddBookTile
                      key="add"
                      itemWidth={itemWidth}
                      onPress={handleAddPress}
                    />
                  );
                }
                return (
                  <BookGridItem
                    key={item.book.id}
                    book={item.book}
                    itemWidth={itemWidth}
                    {...(onLongPressBook !== undefined
                      ? { onLongPress: onLongPressBook }
                      : {})}
                    onPress={handleBookPress}
                  />
                );
              })}
            </View>
          ))}
        </ScrollView>

        {user && (
          <AddBookModal
            userId={user.id}
            visible={addModalVisible}
            onClose={() => setAddModalVisible(false)}
            onBookSaved={(book, shelfStatus) => {
              router.push(
                `/book/${book.id}?tab=my-reading&shelf=${shelfStatus ?? status}` as any,
              );
            }}
          />
        )}
      </SafeAreaView>
    );
  },
);

ShelfScreen.displayName = 'ShelfScreen';
