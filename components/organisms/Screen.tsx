import type { PropsWithChildren } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { cn } from '@/shared/lib/cn';

type ScreenProps = PropsWithChildren<{
  className?: string;
  contentClassName?: string;
  scrollable?: boolean;
}>;

export const Screen = ({
  children,
  className,
  contentClassName,
  scrollable = true,
}: ScreenProps) => {
  if (!scrollable) {
    return (
      <SafeAreaView
        className={cn('flex-1 bg-surface dark:bg-surfaceDark', className)}
        edges={['top']}
      >
        <View className={cn('flex-1', contentClassName)}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className={cn('flex-1 bg-surface dark:bg-surfaceDark', className)}
      edges={['top']}
    >
      <ScrollView
        bounces={false}
        className="flex-1"
        contentContainerClassName={cn('pb-32', contentClassName)}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
};
