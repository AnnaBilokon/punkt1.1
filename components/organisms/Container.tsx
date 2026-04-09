import type { PropsWithChildren } from 'react';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';

type ContainerProps = PropsWithChildren<{
  className?: string;
}>;

export const Container = ({ children, className }: ContainerProps) => (
  <View className={cn('mx-auto w-full max-w-screen-md px-5', className)}>
    {children}
  </View>
);
