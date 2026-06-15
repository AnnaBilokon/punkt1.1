import { memo, useCallback } from 'react';
import { Alert, Pressable } from 'react-native';

import { Text } from '@/components/atoms/Text';
import type { Achievement } from '@/features/profile/hooks/useAchievements';

export const BadgeCard = memo(({ badge }: { badge: Achievement }) => {
  const onPress = useCallback(() => {
    if (badge.earned) {
      Alert.alert(badge.emoji + ' ' + badge.label, 'Achievement earned! 🎉');
    } else {
      Alert.alert('Locked', badge.hint || 'Keep reading to unlock this badge.');
    }
  }, [badge]);

  return (
    <Pressable
      className="w-[30%] items-center gap-2 rounded-[16px] border py-4"
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: badge.earned ? '#faf7ff' : '#f5f5f5',
        borderColor: badge.earned ? '#d4bfed' : '#e8e8e8',
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text
        className="text-[28px]"
        style={{ opacity: badge.earned ? 1 : 0.35 }}
        variant="body"
      >
        {badge.emoji}
      </Text>
      <Text
        className="px-1 text-center text-[11px] font-medium"
        numberOfLines={2}
        style={{ color: badge.earned ? '#313C5D' : '#b0b0b0' }}
        variant="caption"
      >
        {badge.label}
      </Text>
    </Pressable>
  );
});
BadgeCard.displayName = 'BadgeCard';
