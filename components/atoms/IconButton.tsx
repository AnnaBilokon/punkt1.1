import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { minimumTouchTarget } from '@/shared/lib/accessibility';
import { motion } from '@/shared/lib/animations';
import { cn } from '@/shared/lib/cn';

type IconName = keyof typeof Ionicons.glyphMap;

type IconButtonProps = {
  accessibilityLabel: string;
  className?: string;
  icon: IconName;
  onPress?: () => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const IconButton = memo(
  ({ accessibilityLabel, className, icon, onPress }: IconButtonProps) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    return (
      <AnimatedPressable
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        className={cn(
          'h-12 w-12 items-center justify-center rounded-full bg-white/80 dark:bg-surfaceDark/80',
          className,
        )}
        hitSlop={minimumTouchTarget}
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.94, motion.spring);
        }}
        onPressOut={() => {
          scale.value = withSpring(1, motion.spring);
        }}
        style={animatedStyle}
      >
        <Ionicons color="#6E56CF" name={icon} size={20} />
      </AnimatedPressable>
    );
  },
);

IconButton.displayName = 'IconButton';
