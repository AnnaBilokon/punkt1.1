import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { memo, useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/atoms/Text';
import { AddBookModal } from '@/features/discover/components/AddBookModal';
import { useShelfBooks } from '@/features/library/hooks/useShelfBooks';
import { useAuthStore } from '@/store/authStore';
import { useShelfStore } from '@/store/shelfStore';
import type { Book, CustomShelf } from '@/types';

const HORIZONTAL_PADDING = 16;
const COLUMN_GAP = 12;
const NUM_COLUMNS = 3;

type GridItem =
  | { type: 'book'; book: Book }
  | { type: 'add' }
  | { type: 'spacer' };

const BookGridItem = memo(
  ({
    book,
    itemWidth,
    onLongPress,
    onPress,
  }: {
    book: Book;
    itemWidth: number;
    onLongPress: (id: string) => void;
    onPress: (id: string) => void;
  }) => (
    <Pressable
      delayLongPress={400}
      onLongPress={() => onLongPress(book.id)}
      onPress={() => onPress(book.id)}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, width: itemWidth })}
    >
      <View style={{ height: itemWidth * 1.5, width: itemWidth }}>
        <Image
          className="rounded-[12px] bg-[#e0e0e0]"
          source={{ uri: book.coverImage }}
          style={{ height: itemWidth * 1.5, width: itemWidth }}
        />
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

type RenameModalProps = {
  currentName: string;
  onClose: () => void;
  onSave: (name: string) => void;
  visible: boolean;
};

const RenameModal = memo(
  ({ currentName, onClose, onSave, visible }: RenameModalProps) => {
    const [name, setName] = useState(currentName);
    return (
      <Modal animationType="fade" transparent visible={visible}>
        <Pressable
          className="flex-1 items-center justify-center bg-black/40"
          onPress={onClose}
        >
          <Pressable
            className="mx-6 w-full rounded-[18px] bg-white px-6 py-6"
            onPress={() => {}}
          >
            <Text className="mb-4 text-[18px] font-semibold text-black" variant="body">
              Rename shelf
            </Text>
            <TextInput
              autoFocus
              className="rounded-[10px] border border-[#d9d9d9] bg-[#f9f9f9] px-4 text-[15px] text-black"
              maxLength={50}
              onChangeText={setName}
              onSubmitEditing={() => onSave(name)}
              placeholder="Shelf name"
              placeholderTextColor="#aaa"
              returnKeyType="done"
              style={{ height: 48 }}
              value={name}
            />
            <View className="mt-5 flex-row gap-3">
              <Pressable
                className="flex-1 items-center justify-center rounded-[10px] border border-[#d9d9d9] py-3"
                onPress={onClose}
              >
                <Text className="text-[14px] font-medium text-[#6d7a88]" variant="body">
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                className="flex-[2] items-center justify-center rounded-[10px] py-3"
                disabled={!name.trim()}
                onPress={() => onSave(name)}
                style={{
                  backgroundColor: '#7D5BA6',
                  opacity: !name.trim() ? 0.5 : 1,
                }}
              >
                <Text className="text-[14px] font-semibold text-white" variant="body">
                  Save
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    );
  },
);
RenameModal.displayName = 'RenameModal';

export const CustomShelfScreen = memo(
  ({ shelf }: { shelf: CustomShelf }) => {
    const router = useRouter();
    const user = useAuthStore((s) => s.user);
    const { width: screenWidth } = useWindowDimensions();
    const { data: books = [], isFetching } = useShelfBooks(shelf.id);
    const removeBookFromShelf = useShelfStore((s) => s.removeBookFromShelf);
    const deleteShelf = useShelfStore((s) => s.deleteShelf);
    const renameShelf = useShelfStore((s) => s.renameShelf);
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [renameVisible, setRenameVisible] = useState(false);

    const itemWidth = Math.floor(
      (screenWidth - HORIZONTAL_PADDING * 2 - COLUMN_GAP * (NUM_COLUMNS - 1)) /
        NUM_COLUMNS,
    );

    const handleBookPress = useCallback(
      (id: string) => router.push(`/book/${id}` as any),
      [router],
    );

    const handleLongPress = useCallback(
      (bookId: string) => {
        if (!user) return;
        Alert.alert('Remove from shelf', 'Remove this book from the shelf?', [
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => void removeBookFromShelf(shelf.id, bookId, user.id),
          },
          { style: 'cancel', text: 'Cancel' },
        ]);
      },
      [shelf.id, removeBookFromShelf, user],
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

    const handleMenuPress = useCallback(() => {
      Alert.alert(shelf.name, undefined, [
        { text: 'Rename', onPress: () => setRenameVisible(true) },
        {
          text: 'Delete shelf',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Delete shelf',
              `Delete "${shelf.name}"? Books won't be removed from your library.`,
              [
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: async () => {
                    if (!user) return;
                    await deleteShelf(user.id, shelf.id);
                    router.back();
                  },
                },
                { style: 'cancel', text: 'Cancel' },
              ],
            );
          },
        },
        { style: 'cancel', text: 'Cancel' },
      ]);
    }, [shelf, deleteShelf, user, router]);

    const handleRename = useCallback(
      async (name: string) => {
        if (!user || !name.trim()) return;
        setRenameVisible(false);
        await renameShelf(user.id, shelf.id, name.trim());
      },
      [user, shelf.id, renameShelf],
    );

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
            <Text
              className="flex-1 text-[24px] font-bold text-black"
              numberOfLines={1}
              variant="body"
            >
              {shelf.name}
            </Text>
            <View className="flex-row items-center gap-3">
              <Text className="mb-0.5 text-[13px] text-[#9b9b9b]" variant="body">
                {books.length} book{books.length !== 1 ? 's' : ''}
              </Text>
              <Pressable
                hitSlop={10}
                onPress={handleMenuPress}
                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
              >
                <Ionicons color="#6d6d6d" name="ellipsis-horizontal" size={20} />
              </Pressable>
            </View>
          </View>
        </View>

        {isFetching && books.length === 0 ? (
          <ActivityIndicator className="mt-10" color="#7851A9" />
        ) : (
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
                      onLongPress={handleLongPress}
                      onPress={handleBookPress}
                    />
                  );
                })}
              </View>
            ))}
          </ScrollView>
        )}

        {user && (
          <AddBookModal
            userId={user.id}
            visible={addModalVisible}
            onClose={() => setAddModalVisible(false)}
            onBookSaved={(book) => {
              router.push(`/book/${book.id}` as any);
            }}
          />
        )}

        <RenameModal
          currentName={shelf.name}
          visible={renameVisible}
          onClose={() => setRenameVisible(false)}
          onSave={(name) => void handleRename(name)}
        />
      </SafeAreaView>
    );
  },
);

CustomShelfScreen.displayName = 'CustomShelfScreen';
