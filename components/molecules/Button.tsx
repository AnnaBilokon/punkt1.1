import { memo } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Text } from '@/components/atoms/Text';
import { minimumTouchTarget } from '@/shared/lib/accessibility';
import { motion } from '@/shared/lib/animations';
import { cn } from '@/shared/lib/cn';

type ButtonProps = {
  className?: string;
  disabled?: boolean;
  label: string;
  onPress?: () => void;
  tone?: 'primary' | 'secondary';
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Button = memo(
  ({ className, disabled, label, onPress, tone = 'primary' }: ButtonProps) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    return (
      <AnimatedPressable
        accessibilityLabel={label}
        accessibilityRole="button"
        className={cn(
          'min-h-12 items-center justify-center rounded-full px-5 py-3',
          tone === 'primary'
            ? 'bg-brand dark:bg-brand-soft'
            : 'border border-border bg-white dark:border-borderDark dark:bg-surfaceDark',
          disabled && 'opacity-40',
          className,
        )}
        disabled={disabled}
        hitSlop={minimumTouchTarget}
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.97, motion.spring);
        }}
        onPressOut={() => {
          scale.value = withSpring(1, motion.spring);
        }}
        style={animatedStyle}
      >
        <Text
          className={
            tone === 'primary'
              ? 'text-white'
              : 'text-brand dark:text-brand-soft'
          }
          variant="label"
        >
          {label}
        </Text>
      </AnimatedPressable>
    );
  },
);

Button.displayName = 'Button';
