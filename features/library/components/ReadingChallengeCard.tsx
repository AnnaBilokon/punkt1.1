import { memo } from 'react';
import { View } from 'react-native';

import { Card, Text } from '@/components';
import { getChallengeProgress } from '@/entities/challenge';
import type { ReadingChallenge } from '@/types';

import { ProgressCircle } from './ProgressCircle';

type ReadingChallengeCardProps = {
  challenge: ReadingChallenge;
};

export const ReadingChallengeCard = memo(
  ({ challenge }: ReadingChallengeCardProps) => {
    const progress = getChallengeProgress(challenge);

    return (
      <Card className="overflow-hidden bg-[#F8F5FF] dark:bg-[#171328]">
        <View className="absolute -right-8 -top-6 h-28 w-28 rounded-full bg-brand/10" />
        <View className="flex-row items-center justify-between gap-5">
          <View className="max-w-[65%] gap-3">
            <Text variant="caption">{challenge.year} Reading Challenge</Text>
            <Text variant="title">
              {challenge.completed}/{challenge.goal} books
            </Text>
            <Text className="text-textMuted dark:text-textMutedDark">
              {challenge.label}
            </Text>
          </View>
          <ProgressCircle progress={progress} />
        </View>
      </Card>
    );
  },
);

ReadingChallengeCard.displayName = 'ReadingChallengeCard';
