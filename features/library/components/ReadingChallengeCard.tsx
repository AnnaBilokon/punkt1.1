import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { memo } from 'react';
import { TouchableOpacity, View } from 'react-native';

import { Card, Text } from '@/components';
import { getChallengeProgress } from '@/entities/challenge';
import type { ReadingChallenge } from '@/types';

import { ProgressCircle } from './ProgressCircle';

type ReadingChallengeCardProps = {
  challenge: ReadingChallenge;
};

export const ReadingChallengeCard = memo(
  ({ challenge }: ReadingChallengeCardProps) => {
    const router = useRouter();
    const progress = getChallengeProgress(challenge);

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push('/challenge' as any)}
      >
        <Card className="rounded-[17px] border-[#d9d9d9] bg-[#f9f9f9] px-6 py-4">
          <View className="mb-3 flex-row items-start justify-between gap-4">
            <Text
              className="text-[16px] font-semibold text-black"
              variant="body"
            >
              {challenge.year} Reading Challenge
            </Text>
            <Ionicons color="#9b9b9b" name="create-outline" size={18} />
          </View>
          <View className="flex-row items-center justify-between gap-4">
            <View className="max-w-[62%] gap-2">
              <Text
                className="text-[26px] font-semibold text-[#7851A9]"
                variant="body"
              >
                {challenge.completed}/{challenge.goal} books
              </Text>
              <Text className="text-[18px] text-black" variant="body">
                {challenge.label}
              </Text>
            </View>
            <ProgressCircle progress={progress} />
          </View>
        </Card>
      </TouchableOpacity>
    );
  },
);

ReadingChallengeCard.displayName = 'ReadingChallengeCard';
