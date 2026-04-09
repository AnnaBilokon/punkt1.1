import { memo } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/atoms/Text';

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
};

export const SectionHeader = memo(({ eyebrow, title }: SectionHeaderProps) => (
  <View className="gap-1">
    {eyebrow ? <Text variant="caption">{eyebrow}</Text> : null}
    <Text variant="title">{title}</Text>
  </View>
));

SectionHeader.displayName = 'SectionHeader';
