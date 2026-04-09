import { memo } from 'react';
import { Image, View } from 'react-native';

import { Text } from '@/components/atoms/Text';
import { cn } from '@/shared/lib/cn';

type AvatarProps = {
  className?: string;
  fallback: string;
  size?: 'lg' | 'md' | 'sm';
  uri?: string | undefined;
};

const sizeClasses = {
  lg: 'h-16 w-16',
  md: 'h-12 w-12',
  sm: 'h-10 w-10',
} as const;

export const Avatar = memo(
  ({ className, fallback, size = 'md', uri }: AvatarProps) => {
    const resolvedClassName = cn(
      'items-center justify-center overflow-hidden rounded-full bg-brand/15',
      sizeClasses[size],
      className,
    );

    if (uri) {
      return (
        <Image
          accessibilityIgnoresInvertColors
          className={resolvedClassName}
          source={{ uri }}
        />
      );
    }

    return (
      <View className={resolvedClassName}>
        <Text className="text-brand dark:text-brand-soft" variant="label">
          {fallback}
        </Text>
      </View>
    );
  },
);

Avatar.displayName = 'Avatar';
