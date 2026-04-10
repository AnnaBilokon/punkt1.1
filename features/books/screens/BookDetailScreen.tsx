import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/atoms/Text';
import { useBookStore } from '@/store/bookStore';
import type { Book } from '@/types';

type Tab = 'about' | 'reviews' | 'similar';

type BookDetailScreenProps = {
  book: Book;
};

const BRAND = '#7D5BA6';

function StarRow({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <View className="flex-row items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Ionicons
          key={i}
          color={i < full ? '#F5C518' : '#D9D9D9'}
          name="star"
          size={16}
        />
      ))}
      <Text className="ml-1 text-[14px] text-black">{rating.toFixed(1)}</Text>
    </View>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="gap-0.5">
      <Text className="text-[12px] font-bold text-[#15151e]">{label}</Text>
      <Text className="text-[12px] text-[#15151e]">{value}</Text>
    </View>
  );
}

export function BookDetailScreen({ book }: BookDetailScreenProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('about');
  const { addBook, books } = useBookStore();
  const isInLibrary = books.some((b) => b.id === book.id);

  return (
    <SafeAreaView className="flex-1 bg-[#fdfdfd]" edges={['top']}>
      <ScrollView
        bounces={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Back */}
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          className="flex-row items-center gap-1 px-5 py-3"
          onPress={() => router.back()}
        >
          <Ionicons color="#212121" name="chevron-back" size={18} />
          <Text className="text-[11px] text-black">back</Text>
        </Pressable>

        {/* Book header */}
        <View className="flex-row gap-4 px-5 pb-4">
          <Image
            className="h-[190px] w-[139px] rounded-[12px]"
            source={{ uri: book.coverImage }}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
            }}
          />
          <View className="flex-1 justify-start gap-2 pt-1">
            <Text className="text-[16px] font-semibold leading-tight text-black">
              {book.title}
            </Text>
            <Text className="text-[14px] text-[#6d7a88]">by {book.author}</Text>
            <StarRow rating={book.rating} />
            <Text className="text-[12px] text-[#212121]">
              {book.pages} pages
            </Text>
            <Text className="text-[12px] text-[#212121]">
              {book.genres.join(', ')}
            </Text>
          </View>
        </View>

        {/* Action buttons */}
        <View className="flex-row gap-3 px-5 pb-5">
          <Pressable
            accessibilityLabel="Find Bookstore"
            accessibilityRole="button"
            className="flex-1 items-center justify-center rounded-[7px] border py-2"
            style={{ borderColor: BRAND }}
          >
            <Text className="text-[12px] font-semibold text-[#7D5BA6]">
              Find Bookstore
            </Text>
          </Pressable>
          <Pressable
            accessibilityLabel={isInLibrary ? 'In Library' : 'Add to Library'}
            accessibilityRole="button"
            className="flex-1 items-center justify-center rounded-[7px] py-2"
            onPress={() => !isInLibrary && addBook(book)}
            style={{ backgroundColor: isInLibrary ? '#a0c4a7' : BRAND }}
          >
            <Text className="text-[12px] font-semibold text-white">
              {isInLibrary ? '✓ In Library' : 'Add to Library'}
            </Text>
          </Pressable>
        </View>

        {/* Tabs */}
        <View
          className="mx-5 mb-4 flex-row rounded-[8px] border border-[#d9d9d9] bg-[#f9f9f9]"
          style={{ height: 41 }}
        >
          {(['about', 'reviews', 'similar'] as Tab[]).map((tab, index) => {
            const isActive = activeTab === tab;
            const label = tab.charAt(0).toUpperCase() + tab.slice(1);
            return (
              <Pressable
                key={tab}
                accessibilityLabel={label}
                accessibilityRole="tab"
                className="flex-1 items-center justify-center"
                onPress={() => setActiveTab(tab)}
                style={isActive && {
                    backgroundColor: '#a0c4a7',
                    borderTopLeftRadius: index === 0 ? 7 : 0,
                    borderBottomLeftRadius: index === 0 ? 7 : 0,
                    borderTopRightRadius: index === 2 ? 7 : 0,
                    borderBottomRightRadius: index === 2 ? 7 : 0,
                  }}
              >
                <Text
                  className={`text-[14px] ${isActive ? 'text-white' : 'text-[#212121]'}`}
                >
                  {label}
                  {tab === 'similar' ? ' ✨' : ''}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* About tab content */}
        {activeTab === 'about' && (
          <>
            {/* Description card */}
            <View
              className="mx-5 mb-4 rounded-[10px] border border-[#d9d9d9] bg-[#f9f9f9] p-5"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.16,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <Text className="mb-2 text-[14px] font-semibold text-[#15151e]">
                Description
              </Text>
              <Text className="mb-4 text-[12px] leading-[16px] text-[#15151e]">
                {book.description}
              </Text>
              <View className="flex-row gap-8">
                <View className="flex-1 gap-3">
                  <MetaRow label="Publisher" value="Viking" />
                  <MetaRow label="ISBN" value="9780525559474" />
                  <MetaRow
                    label="Publish date"
                    value={`1 January ${book.publishedYear}`}
                  />
                </View>
                <View className="flex-1 gap-3">
                  <MetaRow label="Language" value="English" />
                  <MetaRow label="Categories" value={book.genres.join(', ')} />
                </View>
              </View>
            </View>

            {/* Reading Groups card */}
            <View
              className="mx-5 rounded-[10px] border border-[#d9d9d9] bg-[#f9f9f9] px-5 py-4"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.16,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-[14px] font-semibold text-[#15151e]">
                  Reading Groups
                </Text>
                <Pressable
                  accessibilityLabel="Join reading group"
                  accessibilityRole="button"
                  className="items-center justify-center rounded-[8px] px-4 py-1.5"
                  style={{ backgroundColor: BRAND }}
                >
                  <Text className="text-[12px] text-white">Join ✨</Text>
                </Pressable>
              </View>
              <View className="mt-3 flex-row items-center gap-3">
                <View className="h-[30px] w-[30px] rounded-full bg-[#d9d9d9]" />
                <View>
                  <Text className="text-[12px] font-bold text-[#15151e]">
                    Fiction Lovers Club
                  </Text>
                  <Text className="text-[12px] text-[#15151e]">
                    32 members reading this book
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}

        {activeTab === 'reviews' && (
          <View className="mx-5 items-center py-10">
            <Text className="text-[14px] text-[#6d7a88]">No reviews yet.</Text>
          </View>
        )}

        {activeTab === 'similar' && (
          <View className="mx-5 items-center py-10">
            <Text className="text-[14px] text-[#6d7a88]">
              Similar books coming soon.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
