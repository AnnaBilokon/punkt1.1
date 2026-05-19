import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { memo, useState } from 'react';
import { Pressable, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/atoms/Text';

type Genre = {
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  id: string;
  label: string;
};

const GENRES: Genre[] = [
  { color: '#7D5BA6', icon: 'book-outline', id: 'fiction', label: 'Fiction' },
  {
    color: '#3D7EAA',
    icon: 'newspaper-outline',
    id: 'non-fiction',
    label: 'Non-Fiction',
  },
  { color: '#2E7D5E', icon: 'search-outline', id: 'mystery', label: 'Mystery' },
  { color: '#6436A3', icon: 'star-outline', id: 'fantasy', label: 'Fantasy' },
  { color: '#0277BD', icon: 'planet-outline', id: 'sci-fi', label: 'Sci-Fi' },
  { color: '#C2185B', icon: 'heart-outline', id: 'romance', label: 'Romance' },
  {
    color: '#C62828',
    icon: 'warning-outline',
    id: 'thriller',
    label: 'Thriller',
  },
  {
    color: '#6D4C41',
    icon: 'time-outline',
    id: 'historical',
    label: 'Historical',
  },
  {
    color: '#2E7B32',
    icon: 'bulb-outline',
    id: 'self-help',
    label: 'Self Help',
  },
  {
    color: '#E65100',
    icon: 'person-outline',
    id: 'biography',
    label: 'Biography',
  },
  { color: '#00838F', icon: 'flask-outline', id: 'science', label: 'Science' },
  { color: '#AD1457', icon: 'pencil-outline', id: 'poetry', label: 'Poetry' },
];

const GenreChip = memo(
  ({
    genre,
    onToggle,
    selected,
  }: {
    genre: Genre;
    onToggle: (id: string) => void;
    selected: boolean;
  }) => (
    <TouchableOpacity
      activeOpacity={0.75}
      className="mb-3 mr-2 flex-row items-center gap-2 rounded-full border px-4 py-2.5"
      onPress={() => onToggle(genre.id)}
      style={{
        backgroundColor: selected ? genre.color + '1A' : '#f9f9f9',
        borderColor: selected ? genre.color : '#e8e8e8',
      }}
    >
      <Ionicons
        color={selected ? genre.color : '#9b9b9b'}
        name={genre.icon}
        size={16}
      />
      <Text
        className="text-[14px] font-medium"
        style={{ color: selected ? genre.color : '#555' }}
        variant="body"
      >
        {genre.label}
      </Text>
      {selected && (
        <Ionicons color={genre.color} name="checkmark-circle" size={15} />
      )}
    </TouchableOpacity>
  ),
);
GenreChip.displayName = 'GenreChip';

export const GenresScreen = memo(() => {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <SafeAreaView className="flex-1 bg-[#fdfdfd]" edges={['top']}>
      <View className="flex-row items-center border-b border-[#f0f0f0] px-4 pb-4 pt-2">
        <Pressable
          className="h-9 w-9 items-center justify-center rounded-full"
          onPress={() => router.back()}
        >
          <Ionicons color="#313C5D" name="chevron-back" size={22} />
        </Pressable>
        <Text
          className="mr-9 flex-1 text-center text-[17px] font-semibold text-black"
          variant="body"
        >
          Preferences & genres
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingBottom: 48,
          paddingHorizontal: 16,
          paddingTop: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="mb-5 text-[15px] text-[#555]" variant="body">
          Select the genres you enjoy reading. We&apos;ll use this to
          personalise your recommendations.
        </Text>

        <View className="flex-row flex-wrap">
          {GENRES.map((genre) => (
            <GenreChip
              genre={genre}
              key={genre.id}
              onToggle={toggle}
              selected={selected.has(genre.id)}
            />
          ))}
        </View>

        {selected.size > 0 && (
          <Text
            className="mt-4 text-center text-[13px] text-[#9b9b9b]"
            variant="caption"
          >
            {selected.size} genre{selected.size !== 1 ? 's' : ''} selected
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
});

GenresScreen.displayName = 'GenresScreen';
