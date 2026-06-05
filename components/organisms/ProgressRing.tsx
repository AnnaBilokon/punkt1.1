import { memo, useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { Text as RNText } from 'react-native';

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
    const fontSize = Math.round((size - strokeWidth * 2) * 0.38);
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
        <View
          className="absolute items-center justify-center gap-0.5"
          style={{ width: size, height: size }}
        >
          <RNText
            adjustsFontSizeToFit
            numberOfLines={1}
            className={textClassName}
            style={{ fontSize, fontWeight: '600', maxWidth: size - strokeWidth * 2 - 4 }}
          >
            {normalizedProgress}%
          </RNText>
          {label ? (
            <Text
              numberOfLines={2}
              className="text-center text-[11px] text-textMuted dark:text-textMutedDark"
              style={{ maxWidth: size - strokeWidth * 2 - 4 }}
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
