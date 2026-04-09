import type { PropsWithChildren } from 'react';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';

type CardProps = PropsWithChildren<{
  className?: string;
}>;

export const Card = ({ children, className }: CardProps) => (
  <View
    className={cn(
      'rounded-[28px] border border-border bg-white p-5 dark:border-borderDark dark:bg-surfaceDark',
      className,
    )}
  >
    {children}
  </View>
);
