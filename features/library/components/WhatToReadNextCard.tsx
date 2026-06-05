import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { memo, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';

import { Button, Card, Text } from '@/components';
import { useShelfBooks } from '@/features/library/hooks/useShelfBooks';
import { useAuthStore } from '@/store/authStore';
import { useBookStore } from '@/store/bookStore';
import type { Book, CustomShelf } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const bookHref = (id: string) => `/book/${id}` as any;

type Props = {
  customShelves?: CustomShelf[];
  wantToRead: Book[];
};

const pickRandom = (books: Book[], exclude?: string): Book | null => {
  const pool = exclude ? books.filter((b) => b.id !== exclude) : books;
  if (pool.length === 0) return books[Math.floor(Math.random() * books.length)] ?? null;
  return pool[Math.floor(Math.random() * pool.length)] ?? null;
};

// ─── Shelf chip ────────────────────────────────────────────────────────────────

const ShelfChip = memo(
  ({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={{
        backgroundColor: active ? '#7851A9' : '#f0f0f0',
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 6,
      }}
    >
      <Text
        style={{ color: active ? '#fff' : '#6d6d6d', fontSize: 13, fontWeight: active ? '600' : '400' }}
        variant="body"
      >
        {label}
      </Text>
    </TouchableOpacity>
  ),
);
ShelfChip.displayName = 'ShelfChip';

// ─── Card ──────────────────────────────────────────────────────────────────────

export const WhatToReadNextCard = memo(({ customShelves = [], wantToRead }: Props) => {
  const router = useRouter();
  const userId = useAuthStore((s) => s.user?.id);
  const updateBookStatus = useBookStore((s) => s.updateBookStatus);

  const [selectedShelfId, setSelectedShelfId] = useState<string | null>(null);
  const [pickedBook, setPickedBook] = useState<Book | null>(null);
  const [shuffled, setShuffled] = useState(false);

  const { data: shelfBooks = [], isFetching: loadingShelf } = useShelfBooks(selectedShelfId);

  const activePool = selectedShelfId ? shelfBooks : wantToRead;
  const isLoading = selectedShelfId !== null && loadingShelf && shelfBooks.length === 0;

  const handleShelfSelect = (id: string | null) => {
    setSelectedShelfId(id);
    setPickedBook(null);
    setShuffled(false);
  };

  const handleSurprise = () => {
    if (isLoading) return;
    const pick = pickRandom(activePool, pickedBook?.id);
    setPickedBook(pick);
    setShuffled(true);
  };

  const handleStartReading = async () => {
    if (!pickedBook || !userId) return;
    await updateBookStatus(userId, pickedBook.id, 'reading');
    router.push(bookHref(pickedBook.id));
  };

  const hasBooks = activePool.length > 0;

  return (
    <Card className="gap-4 rounded-[17px] border-[#d9d9d9] bg-[#f9f9f9] px-5 py-5">
      {/* Header */}
      <View className="flex-row items-center gap-2">
        <Ionicons color="#7851A9" name="sparkles-outline" size={20} />
        <View className="flex-1">
          <Text className="text-[16px] font-semibold text-black" variant="body">
            What to Read Next
          </Text>
          <Text className="text-[12px] text-[#9b9b9b]" variant="caption">
            Can&apos;t decide what to read next?
          </Text>
        </View>
      </View>

      {/* Shelf picker */}
      {customShelves.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          <ShelfChip
            active={selectedShelfId === null}
            label="TBR"
            onPress={() => handleShelfSelect(null)}
          />
          {customShelves.map((shelf) => (
            <ShelfChip
              key={shelf.id}
              active={selectedShelfId === shelf.id}
              label={shelf.name}
              onPress={() => handleShelfSelect(shelf.id)}
            />
          ))}
        </ScrollView>
      )}

      {/* Picked book */}
      {pickedBook && (
        <View className="gap-3">
          <View className="flex-row items-center gap-3">
            <Image
              className="h-[76px] w-[52px] rounded-[10px] bg-[#e0e0e0]"
              source={{ uri: pickedBook.coverImage }}
            />
            <View className="flex-1 gap-1">
              <Text
                className="text-[14px] font-semibold text-black"
                numberOfLines={2}
                variant="body"
              >
                {pickedBook.title}
              </Text>
              <Text className="text-[12px] text-[#6d6d6d]" variant="caption">
                {pickedBook.author}
              </Text>
            </View>
          </View>
          <Button label="Start reading →" onPress={handleStartReading} />
        </View>
      )}

      {/* Surprise me button */}
      <TouchableOpacity
        activeOpacity={0.7}
        className="items-center rounded-full border border-[#d0d0e8] py-3"
        disabled={!hasBooks || isLoading}
        onPress={handleSurprise}
        style={{ opacity: !hasBooks ? 0.4 : 1 }}
      >
        {isLoading ? (
          <ActivityIndicator color="#7851A9" size="small" />
        ) : (
          <Text className="text-[14px] font-medium text-[#7851A9]" variant="body">
            {shuffled ? 'Shuffle again' : 'Surprise me'}
          </Text>
        )}
      </TouchableOpacity>

      {/* Coming soon stub */}
      <View className="gap-1.5 opacity-40">
        <TextInput
          editable={false}
          placeholder="Ask for a vibe…"
          placeholderTextColor="#9b9b9b"
          className="rounded-[10px] border border-[#d9d9d9] bg-white px-4 py-3 text-[14px] text-[#9b9b9b]"
        />
        <Text className="text-center text-[11px] text-[#9b9b9b]" variant="caption">
          Coming in Phase 1
        </Text>
      </View>
    </Card>
  );
});

WhatToReadNextCard.displayName = 'WhatToReadNextCard';
