import { memo, useMemo } from 'react';
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
  showCaption?: boolean;
  variant?: 'compact' | 'default';
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const BookCard = memo(
  ({
    book,
    onPress,
    showCaption = true,
    variant = 'default',
  }: BookCardProps) => {
    const scale = useSharedValue(1);
    const imageSource = useMemo(
      () => ({ uri: book.coverImage }),
      [book.coverImage],
    );
    const isCompact = variant === 'compact';

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    return (
      <AnimatedPressable
        accessibilityLabel={`${book.title} by ${book.author}`}
        accessibilityRole="button"
        className={isCompact ? 'w-[84px]' : 'w-40'}
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
          className={
            isCompact
              ? 'h-[105px] w-[81px] rounded-[12px] bg-border shadow-sm'
              : 'h-56 w-40 rounded-[22px] bg-border'
          }
          source={imageSource}
        />
        {showCaption ? (
          <View
            className={
              isCompact ? 'mt-2 w-[81px] items-center gap-1' : 'mt-3 gap-1 pr-2'
            }
          >
            <Text
              className={
                isCompact
                  ? 'text-center text-[11px] font-normal leading-[14px] text-black'
                  : ''
              }
              numberOfLines={isCompact ? 2 : 1}
              variant={isCompact ? 'body' : 'label'}
            >
              {book.title}
            </Text>
            {isCompact ? null : (
              <Text
                className="text-textMuted dark:text-textMutedDark"
                numberOfLines={1}
              >
                {book.author}
              </Text>
            )}
          </View>
        ) : null}
      </AnimatedPressable>
    );
  },
);

BookCard.displayName = 'BookCard';
