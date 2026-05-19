import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/atoms/Text';
import { AppDialog, type DialogButton } from '@/components/molecules/AppDialog';
import { AddBookModal } from '@/features/discover/components/AddBookModal';
import { useBookSearch } from '@/features/discover/hooks/useBookSearch';
import { useGenreBooks } from '@/features/discover/hooks/useGenreBooks';
import { useNytBestsellers } from '@/features/discover/hooks/useNytBestsellers';
import { useAuthStore } from '@/store/authStore';
import { useBookStore } from '@/store/bookStore';
import type { Book, BookStatus } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const bookHref = (id: string) => `/book/${id}` as any;

type DiscoverTab = 'trending' | 'genres' | 'people';

type GenreCard = { color: string; icon: string; label: string; query: string };

const GENRE_CARDS: GenreCard[] = [
  {
    color: '#7D5BA6',
    icon: 'book-outline',
    label: 'Fiction',
    query: 'Fiction',
  },
  {
    color: '#3D7EAA',
    icon: 'newspaper-outline',
    label: 'Non-Fiction',
    query: 'Non-Fiction',
  },
  {
    color: '#2E7D5E',
    icon: 'search-outline',
    label: 'Mystery',
    query: 'Mystery',
  },
  {
    color: '#6436A3',
    icon: 'star-outline',
    label: 'Fantasy',
    query: 'Fantasy',
  },
  {
    color: '#0277BD',
    icon: 'planet-outline',
    label: 'Sci-Fi',
    query: 'Science Fiction',
  },
  {
    color: '#C2185B',
    icon: 'heart-outline',
    label: 'Romance',
    query: 'Romance',
  },
  {
    color: '#C62828',
    icon: 'warning-outline',
    label: 'Thriller',
    query: 'Thriller',
  },
  {
    color: '#6D4C41',
    icon: 'time-outline',
    label: 'Historical',
    query: 'Historical Fiction',
  },
  {
    color: '#2E7B32',
    icon: 'bulb-outline',
    label: 'Self Help',
    query: 'Self Help',
  },
  {
    color: '#E65100',
    icon: 'person-outline',
    label: 'Biography',
    query: 'Biography',
  },
  {
    color: '#00838F',
    icon: 'flask-outline',
    label: 'Science',
    query: 'Popular Science',
  },
  {
    color: '#AD1457',
    icon: 'color-palette-outline',
    label: 'Art & Design',
    query: 'Art Design',
  },
];

function TrendingBookCard({
  book,
  onAdd,
}: {
  book: Book;
  onAdd: (book: Book) => void;
}) {
  const router = useRouter();
  const fullStars = Math.round(book.rating);
  return (
    <Pressable
      accessibilityLabel={`${book.title} by ${book.author}`}
      accessibilityRole="button"
      className="flex-1 overflow-hidden rounded-[10px] border border-[#e8e8e8] bg-white"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
      }}
      onPress={() => router.push(bookHref(book.id))}
    >
      {/* Cover — portrait, fills card width */}
      {book.coverImage ? (
        <Image
          resizeMode="cover"
          source={{ uri: book.coverImage }}
          style={{ width: '100%', aspectRatio: 0.75 }}
        />
      ) : (
        <View
          className="w-full items-center justify-center bg-[#f1edf8]"
          style={{ aspectRatio: 0.75 }}
        >
          <Ionicons color="#7D5BA6" name="book-outline" size={36} />
        </View>
      )}

      {/* Info */}
      <View className="gap-0.5 p-2 pb-2.5">
        <Text
          className="text-[12px] font-semibold leading-tight text-black"
          numberOfLines={2}
        >
          {book.title}
        </Text>
        <Text className="text-[10px] text-[#6d7a88]" numberOfLines={1}>
          by {book.author}
        </Text>

        {/* Stars + rating + genre */}
        <View className="flex-row flex-wrap items-center gap-x-0.5 pt-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Ionicons
              key={i}
              color={i < fullStars ? '#F5C518' : '#D9D9D9'}
              name="star"
              size={10}
            />
          ))}
          {book.rating > 0 && (
            <Text className="text-[10px] text-[#6d7a88]">
              {book.rating.toFixed(1)}
            </Text>
          )}
          <Text className="text-[10px] text-[#6d7a88]">{book.genres[0]}</Text>
        </View>

        {/* Add button */}
        <Pressable
          accessibilityLabel={`Add ${book.title} to library`}
          accessibilityRole="button"
          className="mt-1 items-center rounded-[6px] bg-[#7851A9] py-1.5"
          onPress={(e) => {
            e.stopPropagation();
            onAdd(book);
          }}
        >
          <Text className="text-[11px] font-semibold text-white">+ Add</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

function BookListRow({
  book,
  onAdd,
  onEdit,
}: {
  book: Book;
  onAdd?: (book: Book) => void;
  onEdit?: (book: Book) => void;
}) {
  const router = useRouter();
  return (
    <Pressable
      accessibilityLabel={`${book.title} by ${book.author}`}
      accessibilityRole="button"
      className="flex-row items-center gap-3 py-2"
      onPress={() => router.push(bookHref(book.id))}
    >
      {book.coverImage ? (
        <Image
          className="h-[60px] w-[44px] rounded-[8px]"
          source={{ uri: book.coverImage }}
        />
      ) : (
        <View className="h-[60px] w-[44px] items-center justify-center rounded-[8px] bg-[#f1edf8]">
          <Ionicons color="#7D5BA6" name="book-outline" size={20} />
        </View>
      )}
      <View className="flex-1 gap-0.5">
        <Text
          className="text-[13px] font-semibold text-black"
          numberOfLines={1}
        >
          {book.title}
        </Text>
        <Text className="text-[12px] text-[#6d7a88]">{book.author}</Text>
        {book.rating > 0 && (
          <View className="flex-row items-center gap-1">
            <Ionicons color="#F5C518" name="star" size={11} />
            <Text className="text-[11px] text-[#6d7a88]">
              {book.rating.toFixed(1)}
            </Text>
          </View>
        )}
      </View>
      <View className="flex-row items-center gap-2">
        <View className="rounded-[5px] bg-[#f1edf8] px-2 py-0.5">
          <Text className="text-[11px] text-[#7D5BA6]">{book.genres[0]}</Text>
        </View>
        {onEdit && book.id.startsWith('custom-') && (
          <Pressable
            accessibilityLabel={`Edit ${book.title}`}
            className="rounded-full bg-[#f1edf8] p-1"
            hitSlop={8}
            onPress={(e) => {
              e.stopPropagation();
              onEdit(book);
            }}
          >
            <Ionicons color="#7D5BA6" name="pencil" size={14} />
          </Pressable>
        )}
        {onAdd && (
          <Pressable
            accessibilityLabel={`Add ${book.title} to library`}
            className="rounded-full bg-[#7851A9] p-1"
            hitSlop={8}
            onPress={(e) => {
              e.stopPropagation();
              onAdd(book);
            }}
          >
            <Ionicons color="white" name="add" size={14} />
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

export const DiscoverScreen = () => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<DiscoverTab>('genres');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | undefined>(undefined);
  const [dialog, setDialog] = useState<{
    buttons: DialogButton[];
    message?: string;
    title: string;
  } | null>(null);

  const user = useAuthStore((s) => s.user);
  const addBook = useBookStore((s) => s.addBook);

  const { data: searchResults = [], isFetching: isSearching } =
    useBookSearch(query);
  const { data: trendingBooks = [], isFetching: isTrendingLoading } =
    useNytBestsellers();
  const { data: genreBooks = [], isFetching: isGenreLoading } =
    useGenreBooks(selectedGenre);

  const isSearchMode = query.trim().length >= 2;

  const handleAddBook = (book: Book) => {
    if (!user) return;
    setDialog({
      title: `Add "${book.title}"`,
      message: 'Choose a shelf:',
      buttons: [
        {
          label: 'Want to Read',
          onPress: () =>
            void addBook(user.id, book, 'want-to-read' as BookStatus),
        },
        {
          label: 'Currently Reading',
          onPress: () => void addBook(user.id, book, 'reading' as BookStatus),
        },
        {
          label: 'Finished',
          onPress: () => void addBook(user.id, book, 'completed' as BookStatus),
        },
        { label: 'Cancel', type: 'cancel', onPress: () => {} },
      ],
    });
  };

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
          <View className="flex-row items-center gap-2">
            <View
              className="flex-1 flex-row items-center gap-2 rounded-[10px] border border-[#d9d9d9] bg-[#f9f9f9] px-4"
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
              {isSearching && (
                <ActivityIndicator color="#7851A9" size="small" />
              )}
              {query.length > 0 && !isSearching && (
                <Pressable
                  accessibilityLabel="Clear search"
                  onPress={() => setQuery('')}
                >
                  <Ionicons color="#6d7a88" name="close-circle" size={18} />
                </Pressable>
              )}
            </View>
            {/* Add book button */}
            <Pressable
              accessibilityLabel="Add a book to database"
              accessibilityRole="button"
              className="items-center justify-center rounded-[10px] bg-[#7851A9]"
              hitSlop={4}
              onPress={() => setAddModalVisible(true)}
              style={{ width: 45, height: 45 }}
            >
              <Ionicons color="white" name="add" size={24} />
            </Pressable>
          </View>
        </View>

        {/* Search results */}
        {isSearchMode && (
          <View className="gap-1 px-5">
            {searchResults.length === 0 && !isSearching && (
              <Text className="py-6 text-center text-[14px] text-[#6d7a88]">
                No results found.
              </Text>
            )}
            {searchResults.map((book) => (
              <BookListRow
                key={book.id}
                book={book}
                onAdd={handleAddBook}
                onEdit={setEditingBook}
              />
            ))}
          </View>
        )}

        {/* Tabs — only shown when not searching */}
        {!isSearchMode && (
          <>
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
                    style={
                      isActive && {
                        backgroundColor: '#a0c4a7',
                        borderTopLeftRadius: index === 0 ? 7 : 0,
                        borderBottomLeftRadius: index === 0 ? 7 : 0,
                        borderTopRightRadius: index === 2 ? 7 : 0,
                        borderBottomRightRadius: index === 2 ? 7 : 0,
                      }
                    }
                  >
                    <View className="flex-row items-center gap-1">
                      <Text
                        className={`text-[14px] ${isActive ? 'text-white' : 'text-black'}`}
                      >
                        {tab.label}
                      </Text>
                      {isActive && (
                        <Ionicons color="white" name="chevron-down" size={14} />
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {/* Trending tab */}
            {activeTab === 'trending' && (
              <View className="px-4">
                {isTrendingLoading && (
                  <ActivityIndicator className="py-6" color="#7851A9" />
                )}
                {!isTrendingLoading && trendingBooks.length === 0 && (
                  <Text className="py-6 text-center text-[14px] text-[#6d7a88]">
                    Trending books unavailable. Add an NYT API key to enable
                    this.
                  </Text>
                )}
                {trendingBooks
                  .reduce<Book[][]>((rows, book, i) => {
                    if (i % 2 === 0) rows.push([book]);
                    else rows[rows.length - 1]!.push(book);
                    return rows;
                  }, [])
                  .map((pair, rowIdx) => (
                    <View key={rowIdx} className="mb-3 flex-row gap-3">
                      {pair.map((book) => (
                        <TrendingBookCard
                          key={book.id}
                          book={book}
                          onAdd={handleAddBook}
                        />
                      ))}
                      {pair.length === 1 && <View className="flex-1" />}
                    </View>
                  ))}
              </View>
            )}

            {/* Genres tab */}
            {activeTab === 'genres' && (
              <View className="gap-4 px-5">
                {/* Genre pills */}
                <ScrollView
                  contentContainerStyle={{ gap: 8 }}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                >
                  <Pressable
                    accessibilityLabel="All genres"
                    className="rounded-full px-5 py-2.5"
                    onPress={() => setSelectedGenre(null)}
                    style={{
                      backgroundColor: !selectedGenre ? '#7851A9' : '#f1edf8',
                    }}
                  >
                    <Text
                      className={`text-[14px] ${
                        !selectedGenre ? 'text-white' : 'text-[#7D5BA6]'
                      }`}
                    >
                      All
                    </Text>
                  </Pressable>
                  {GENRE_CARDS.map((genre) => (
                    <Pressable
                      key={genre.query}
                      accessibilityLabel={genre.label}
                      className="rounded-full px-5 py-2.5"
                      onPress={() =>
                        setSelectedGenre(
                          selectedGenre === genre.query ? null : genre.query,
                        )
                      }
                      style={{
                        backgroundColor:
                          selectedGenre === genre.query ? '#7851A9' : '#f1edf8',
                      }}
                    >
                      <Text
                        className={`text-[14px] ${
                          selectedGenre === genre.query
                            ? 'text-white'
                            : 'text-[#7D5BA6]'
                        }`}
                      >
                        {genre.label}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>

                {/* Books */}
                {isGenreLoading && <ActivityIndicator color="#7851A9" />}
                {!isGenreLoading && !selectedGenre && (
                  <Text className="py-6 text-center text-[14px] text-[#6d7a88]">
                    Choose a genre to explore books.
                  </Text>
                )}
                {!isGenreLoading &&
                  selectedGenre &&
                  genreBooks.length === 0 && (
                    <Text className="py-6 text-center text-[14px] text-[#6d7a88]">
                      No books found for this genre.
                    </Text>
                  )}
                {!isGenreLoading &&
                  selectedGenre &&
                  genreBooks
                    .reduce<Book[][]>((rows, book, i) => {
                      if (i % 2 === 0) rows.push([book]);
                      else rows[rows.length - 1]!.push(book);
                      return rows;
                    }, [])
                    .map((pair, rowIdx) => (
                      <View key={rowIdx} className="mb-1 flex-row gap-3">
                        {pair.map((book) => (
                          <TrendingBookCard
                            key={book.id}
                            book={book}
                            onAdd={handleAddBook}
                          />
                        ))}
                        {pair.length === 1 && <View className="flex-1" />}
                      </View>
                    ))}
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
          </>
        )}
      </ScrollView>
      {user && (
        <AddBookModal
          editBook={editingBook}
          userId={user.id}
          visible={addModalVisible || !!editingBook}
          onBookSaved={(book, status) => addBook(user.id, book, status)}
          onClose={() => {
            setAddModalVisible(false);
            setEditingBook(undefined);
          }}
        />
      )}
      <AppDialog
        buttons={dialog?.buttons ?? []}
        message={dialog?.message}
        onClose={() => setDialog(null)}
        title={dialog?.title ?? ''}
        visible={!!dialog}
      />
    </SafeAreaView>
  );
};
