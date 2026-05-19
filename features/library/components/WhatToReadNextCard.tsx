import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { memo, useState } from 'react';
import { Image, TextInput, TouchableOpacity, View } from 'react-native';

import { Button, Card, Text } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { useBookStore } from '@/store/bookStore';
import type { Book } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const bookHref = (id: string) => `/book/${id}` as any;

type Props = {
  wantToRead: Book[];
};

const pickRandom = (books: Book[]): Book | null => {
  if (books.length === 0) return null;
  return books[Math.floor(Math.random() * books.length)] ?? null;
};

export const WhatToReadNextCard = memo(({ wantToRead }: Props) => {
  const router = useRouter();
  const userId = useAuthStore((s) => s.user?.id);
  const updateBookStatus = useBookStore((s) => s.updateBookStatus);
  const [pickedBook, setPickedBook] = useState<Book | null>(null);
  const [shuffled, setShuffled] = useState(false);

  const handleSurprise = () => {
    const pick = pickRandom(wantToRead.filter((b) => b.id !== pickedBook?.id));
    setPickedBook(pick ?? pickRandom(wantToRead));
    setShuffled(true);
  };

  const handleStartReading = async () => {
    if (!pickedBook || !userId) return;
    await updateBookStatus(userId, pickedBook.id, 'reading');
    router.push(bookHref(pickedBook.id));
  };

  return (
    <Card className="gap-4 rounded-[17px] border-[#d9d9d9] bg-[#f9f9f9] px-5 py-5">
      <View className="flex-row items-center gap-2">
        <Ionicons color="#797DEA" name="sparkles-outline" size={20} />
        <View className="flex-1">
          <Text className="text-[16px] font-semibold text-black" variant="body">
            What to Read Next
          </Text>
          <Text className="text-[12px] text-[#9b9b9b]" variant="caption">
            Can&apos;t decide what to read next?
          </Text>
        </View>
      </View>

      {pickedBook ? (
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
      ) : null}

      <TouchableOpacity
        activeOpacity={0.7}
        className="items-center rounded-full border border-[#d0d0e8] py-3"
        onPress={handleSurprise}
        disabled={wantToRead.length === 0}
      >
        <Text className="text-[14px] font-medium text-[#797DEA]" variant="body">
          {shuffled ? 'Shuffle again' : 'Surprise me'}
        </Text>
      </TouchableOpacity>

      <View className="gap-1.5 opacity-40">
        <TextInput
          editable={false}
          placeholder="Ask for a vibe…"
          placeholderTextColor="#9b9b9b"
          className="rounded-[10px] border border-[#d9d9d9] bg-white px-4 py-3 text-[14px] text-[#9b9b9b]"
        />
        <Text
          className="text-center text-[11px] text-[#9b9b9b]"
          variant="caption"
        >
          Coming in Phase 1
        </Text>
      </View>
    </Card>
  );
});

WhatToReadNextCard.displayName = 'WhatToReadNextCard';
