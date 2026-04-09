import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { minimumTouchTarget } from '@/shared/lib/accessibility';

type FloatingActionButtonProps = {
  accessibilityLabel: string;
  onPress?: () => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const FloatingActionButton = memo(
  ({ accessibilityLabel, onPress }: FloatingActionButtonProps) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    return (
      <AnimatedPressable
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        className="absolute bottom-28 right-5 h-16 w-16 items-center justify-center rounded-full bg-brand shadow-strong"
        hitSlop={minimumTouchTarget}
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.94);
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
        style={animatedStyle}
      >
        <Ionicons color="#FFFFFF" name="add" size={28} />
      </AnimatedPressable>
    );
  },
);

FloatingActionButton.displayName = 'FloatingActionButton';
