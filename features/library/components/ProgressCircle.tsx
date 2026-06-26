import { View } from 'react-native';

import { ProgressRing } from '@/components';

type ProgressCircleProps = {
  progress: number;
};

export const ProgressCircle = ({ progress }: ProgressCircleProps) => (
  <View className="items-center justify-center">
    <ProgressRing
      progress={progress}
      progressColor="#c1eeff"
      size={100}
      strokeWidth={15}
      textClassName="text-[#28231c]"
      trackColor="#655356"
    />
  </View>
);
