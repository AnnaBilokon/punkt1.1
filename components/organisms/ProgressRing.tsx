import { memo, useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { Text } from '@/components/atoms/Text';
import { motion } from '@/shared/lib/animations';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type ProgressRingProps = {
  label?: string;
  progress: number;
  progressColor?: string;
  size?: number;
  strokeWidth?: number;
  textClassName?: string;
  trackColor?: string;
};

export const ProgressRing = memo(
  ({
    label,
    progress,
    progressColor = '#7851A9',
    size = 92,
    strokeWidth = 10,
    textClassName = 'text-brand dark:text-brand-soft',
    trackColor = 'rgba(17, 24, 39, 0.08)',
  }: ProgressRingProps) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const normalizedProgress = Math.max(0, Math.min(100, progress));
    const progressValue = useSharedValue(0);

    useEffect(() => {
      progressValue.value = withTiming(normalizedProgress, {
        duration: motion.slow,
        easing: Easing.out(Easing.cubic),
      });
    }, [normalizedProgress, progressValue]);

    const animatedProps = useAnimatedProps(() => ({
      strokeDashoffset:
        circumference - (circumference * progressValue.value) / 100,
    }));

    return (
      <View className="items-center justify-center">
        <Svg height={size} width={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            fill="transparent"
            r={radius}
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />
          <AnimatedCircle
            animatedProps={animatedProps}
            cx={size / 2}
            cy={size / 2}
            fill="transparent"
            r={radius}
            rotation="-90"
            stroke={progressColor}
            strokeDasharray={circumference}
            strokeLinecap="round"
            strokeWidth={strokeWidth}
            originX={size / 2}
            originY={size / 2}
          />
        </Svg>
        <View className="absolute items-center gap-0.5">
          <Text
            className={`text-[28px] font-semibold ${textClassName}`}
            variant="title"
          >
            {normalizedProgress}%
          </Text>
          {label ? (
            <Text
              className="text-center text-[11px] text-textMuted dark:text-textMutedDark"
              variant="caption"
            >
              {label}
            </Text>
          ) : null}
        </View>
      </View>
    );
  },
);

ProgressRing.displayName = 'ProgressRing';
