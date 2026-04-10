import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/atoms/Text';
import { mockBooks } from '@/mocks/books';
import type { Book } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const bookHref = (id: string) => `/book/${id}` as any;

type DiscoverTab = 'trending' | 'genres' | 'people';

const ALL_GENRES = Array.from(
  new Set(mockBooks.flatMap((b) => b.genres)),
).sort();

function BookGenreCard({ book }: { book: Book }) {
  const router = useRouter();
  return (
    <Pressable
      accessibilityLabel={`${book.title} by ${book.author}`}
      accessibilityRole="button"
      className="mr-4"
      onPress={() => router.push(bookHref(book.id))}
    >
      <View className="relative h-[87px] w-[114px] overflow-hidden rounded-[10px] border border-[#d9d9d9]">
        <Image
          className="absolute inset-0 h-full w-full"
          source={{ uri: book.coverImage }}
        />
        <View className="absolute bottom-1.5 left-1.5 rounded-[5px] bg-white px-1.5 py-0.5">
          <Text className="text-[11px] text-black">{book.genres[0]}</Text>
        </View>
      </View>
    </Pressable>
  );
}

function BookListRow({ book }: { book: Book }) {
  const router = useRouter();
  return (
    <Pressable
      accessibilityLabel={`${book.title} by ${book.author}`}
      accessibilityRole="button"
      className="flex-row items-center gap-3 py-2"
      onPress={() => router.push(bookHref(book.id))}
    >
      <Image
        className="h-[60px] w-[44px] rounded-[8px]"
        source={{ uri: book.coverImage }}
      />
      <View className="flex-1 gap-0.5">
        <Text
          className="text-[13px] font-semibold text-black"
          numberOfLines={1}
        >
          {book.title}
        </Text>
        <Text className="text-[12px] text-[#6d7a88]">{book.author}</Text>
        <View className="flex-row items-center gap-1">
          <Ionicons color="#F5C518" name="star" size={11} />
          <Text className="text-[11px] text-[#6d7a88]">
            {book.rating.toFixed(1)}
          </Text>
        </View>
      </View>
      <View className="rounded-[5px] bg-[#f1edf8] px-2 py-0.5">
        <Text className="text-[11px] text-[#7D5BA6]">{book.genres[0]}</Text>
      </View>
    </Pressable>
  );
}

export const DiscoverScreen = () => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<DiscoverTab>('genres');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  const filteredBooks = useMemo(() => {
    const q = query.toLowerCase();
    return mockBooks.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.genres.some((g) => g.toLowerCase().includes(q)),
    );
  }, [query]);

  const genreBooks = useMemo(() => {
    if (!selectedGenre) return filteredBooks;
    return filteredBooks.filter((b) => b.genres.includes(selectedGenre));
  }, [filteredBooks, selectedGenre]);

  const trendingBooks = useMemo(
    () => [...filteredBooks].sort((a, b) => b.rating - a.rating),
    [filteredBooks],
  );

  const tabs: { id: DiscoverTab; label: string }[] = [
    { id: 'trending', label: 'Trending' },
    { id: 'genres', label: 'Genres' },
    { id: 'people', label: 'People' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#fdfdfd]" edges={['top']}>
      <ScrollView
        bounces={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Search bar */}
        <View className="px-5 pb-3 pt-4">
          <View
            className="flex-row items-center gap-2 rounded-[10px] border border-[#d9d9d9] bg-[#f9f9f9] px-4"
            style={{ height: 45 }}
          >
            <Ionicons color="#6d7a88" name="search-outline" size={20} />
            <TextInput
              className="flex-1 text-[14px] text-black"
              onChangeText={setQuery}
              placeholder="Search books, authors or genres"
              placeholderTextColor="rgba(109,122,136,0.6)"
              value={query}
            />
            {query.length > 0 && (
              <Pressable
                accessibilityLabel="Clear search"
                onPress={() => setQuery('')}
              >
                <Ionicons color="#6d7a88" name="close-circle" size={18} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Tabs */}
        <View
          className="mx-5 mb-4 flex-row rounded-[8px] border border-[#d9d9d9] bg-[#f9f9f9]"
          style={{ height: 41 }}
        >
          {tabs.map((tab, index) => {
            const isActive = activeTab === tab.id;
            return (
              <Pressable
                key={tab.id}
                accessibilityLabel={tab.label}
                accessibilityRole="tab"
                className="flex-1 items-center justify-center"
                onPress={() => {
                  setActiveTab(tab.id);
                  setSelectedGenre(null);
                }}
                style={isActive && {
                    backgroundColor: '#a0c4a7',
                    borderTopLeftRadius: index === 0 ? 7 : 0,
                    borderBottomLeftRadius: index === 0 ? 7 : 0,
                    borderTopRightRadius: index === 2 ? 7 : 0,
                    borderBottomRightRadius: index === 2 ? 7 : 0,
                  }}
              >
                <Text
                  className={`text-[14px] ${isActive ? 'text-white' : 'text-black'}`}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Trending tab */}
        {activeTab === 'trending' && (
          <View className="gap-1 px-5">
            {trendingBooks.length === 0 ? (
              <Text className="py-6 text-center text-[14px] text-[#6d7a88]">
                No results found.
              </Text>
            ) : (
              trendingBooks.map((book) => (
                <BookListRow key={book.id} book={book} />
              ))
            )}
          </View>
        )}

        {/* Genres tab */}
        {activeTab === 'genres' && (
          <View className="gap-4 px-5">
            {/* Genre filter chips */}
            <ScrollView
              contentContainerStyle={{ gap: 8 }}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              <Pressable
                accessibilityLabel="All genres"
                className="rounded-full px-3 py-1"
                onPress={() => setSelectedGenre(null)}
                style={{
                  backgroundColor: !selectedGenre ? '#7D5BA6' : '#f1edf8',
                }}
              >
                <Text
                  className={`text-[12px] ${!selectedGenre ? 'text-white' : 'text-[#7D5BA6]'}`}
                >
                  All
                </Text>
              </Pressable>
              {ALL_GENRES.map((genre) => (
                <Pressable
                  key={genre}
                  accessibilityLabel={genre}
                  className="rounded-full px-3 py-1"
                  onPress={() =>
                    setSelectedGenre(selectedGenre === genre ? null : genre)
                  }
                  style={{
                    backgroundColor:
                      selectedGenre === genre ? '#7D5BA6' : '#f1edf8',
                  }}
                >
                  <Text
                    className={`text-[12px] ${selectedGenre === genre ? 'text-white' : 'text-[#7D5BA6]'}`}
                  >
                    {genre}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Book cards horizontal scroll */}
            {genreBooks.length === 0 ? (
              <Text className="py-6 text-center text-[14px] text-[#6d7a88]">
                No books in this genre.
              </Text>
            ) : (
              <ScrollView
                contentContainerStyle={{ gap: 12 }}
                horizontal
                showsHorizontalScrollIndicator={false}
              >
                {genreBooks.map((book) => (
                  <BookGenreCard key={book.id} book={book} />
                ))}
              </ScrollView>
            )}

            {/* Full list below */}
            <View className="mt-2 gap-1">
              {genreBooks.map((book) => (
                <BookListRow key={book.id} book={book} />
              ))}
            </View>
          </View>
        )}

        {/* People tab */}
        {activeTab === 'people' && (
          <View className="items-center px-5 py-10">
            <Ionicons color="#d9d9d9" name="people-outline" size={48} />
            <Text className="mt-3 text-[14px] text-[#6d7a88]">
              People discovery coming soon.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
