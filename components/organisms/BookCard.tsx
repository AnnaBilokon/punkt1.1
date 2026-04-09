import { memo } from 'react';
import { Image, Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Text } from '@/components/atoms/Text';
import type { Book } from '@/types';

type BookCardProps = {
  book: Book;
  onPress?: (book: Book) => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const BookCard = memo(({ book, onPress }: BookCardProps) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      accessibilityLabel={`${book.title} by ${book.author}`}
      accessibilityRole="button"
      className="w-40"
      onPress={() => {
        onPress?.(book);
      }}
      onPressIn={() => {
        scale.value = withSpring(0.97);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
      style={animatedStyle}
    >
      <Image
        className="h-56 w-40 rounded-[22px] bg-border"
        source={{ uri: book.coverImage }}
      />
      <View className="mt-3 gap-1 pr-2">
        <Text numberOfLines={1} variant="label">
          {book.title}
        </Text>
        <Text
          className="text-textMuted dark:text-textMutedDark"
          numberOfLines={1}
        >
          {book.author}
        </Text>
      </View>
    </AnimatedPressable>
  );
});

BookCard.displayName = 'BookCard';
