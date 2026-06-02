import { View } from 'react-native';

import { ProgressRing } from '@/components';

type ProgressCircleProps = {
  progress: number;
};

export const ProgressCircle = ({ progress }: ProgressCircleProps) => (
  <View className="items-center justify-center">
    <ProgressRing
      progress={progress}
      progressColor="#CC76D8"
      size={100}
      strokeWidth={15}
      textClassName="text-[#313C5D]"
      trackColor="#7851A9"
    />
  </View>
);
