import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { Text } from '@/components';

const selectedTabState = { selected: true } as const;
const unselectedTabState = { selected: false } as const;

type LibraryTabsProps = {
  onChange: (value: 'book-clubs' | 'bookshelves') => void;
  value: 'book-clubs' | 'bookshelves';
};

export const LibraryTabs = ({ onChange, value }: LibraryTabsProps) => (
  <View className="h-10 flex-row rounded-[8px] border border-[#d9d9d9] bg-[#f9f9f9]">
    <Pressable
      accessibilityLabel="Show bookshelves"
      accessibilityRole="tab"
      accessibilityState={
        value === 'bookshelves' ? selectedTabState : unselectedTabState
      }
      className={
        value === 'bookshelves'
          ? 'flex-1 flex-row items-center justify-center gap-2 rounded-l-[8px] bg-[#A0C4A7]'
          : 'flex-1 flex-row items-center justify-center gap-2 rounded-l-[8px] bg-[#F9F9F9]'
      }
      onPress={() => {
        onChange('bookshelves');
      }}
    >
      <Ionicons
        color={value === 'bookshelves' ? '#8285EC' : '#6d6d6d'}
        name="book-outline"
        size={15}
      />
      <Text
        className={
          value === 'bookshelves'
            ? 'text-[13px] text-white'
            : 'text-[13px] text-[#212121]'
        }
        variant="body"
      >
        Bookshelves
      </Text>
    </Pressable>
    <Pressable
      accessibilityLabel="Show book clubs"
      accessibilityRole="tab"
      accessibilityState={
        value === 'book-clubs' ? selectedTabState : unselectedTabState
      }
      className={
        value === 'book-clubs'
          ? 'flex-1 items-center justify-center rounded-r-[8px] bg-[#A0C4A7]'
          : 'flex-1 items-center justify-center rounded-r-[8px] bg-[#F9F9F9]'
      }
      onPress={() => {
        onChange('book-clubs');
      }}
    >
      <Text
        className={
          value === 'book-clubs'
            ? 'text-[13px] text-white'
            : 'text-[13px] text-[#212121]'
        }
        variant="body"
      >
        Book Clubs
      </Text>
    </Pressable>
  </View>
);
