import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { TouchableOpacity } from 'react-native';

import { Text } from '@/components/atoms/Text';

export type Genre = {
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  id: string;
  label: string;
};

export const GENRES: Genre[] = [
  { color: '#7851A9', icon: 'book-outline', id: 'fiction', label: 'Fiction' },
  { color: '#3D7EAA', icon: 'newspaper-outline', id: 'non-fiction', label: 'Non-Fiction' },
  { color: '#2E7D5E', icon: 'search-outline', id: 'mystery', label: 'Mystery' },
  { color: '#6436A3', icon: 'star-outline', id: 'fantasy', label: 'Fantasy' },
  { color: '#0277BD', icon: 'planet-outline', id: 'sci-fi', label: 'Sci-Fi' },
  { color: '#C2185B', icon: 'heart-outline', id: 'romance', label: 'Romance' },
  { color: '#C62828', icon: 'warning-outline', id: 'thriller', label: 'Thriller' },
  { color: '#6D4C41', icon: 'time-outline', id: 'historical', label: 'Historical' },
  { color: '#2E7B32', icon: 'bulb-outline', id: 'self-help', label: 'Self Help' },
  { color: '#E65100', icon: 'person-outline', id: 'biography', label: 'Biography' },
  { color: '#00838F', icon: 'flask-outline', id: 'science', label: 'Science' },
  { color: '#AD1457', icon: 'pencil-outline', id: 'poetry', label: 'Poetry' },
];

export const GenreChip = memo(
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
