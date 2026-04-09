import { View } from 'react-native';

import { ProgressRing, Text } from '@/components';

type ProgressCircleProps = {
  progress: number;
};

export const ProgressCircle = ({ progress }: ProgressCircleProps) => (
  <View className="items-center justify-center">
    <ProgressRing label="Progress" progress={progress} />
    <Text
      className="mt-3 text-textMuted dark:text-textMutedDark"
      variant="caption"
    >
      45%
    </Text>
  </View>
);
