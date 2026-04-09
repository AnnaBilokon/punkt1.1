import { memo } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/atoms/Text';
import {
  createA11yProps,
  minimumTouchTarget,
} from '@/shared/lib/accessibility';
import { cn } from '@/shared/lib/cn';

export type TabOption<T extends string> = {
  label: string;
  value: T;
};

type TabsProps<T extends string> = {
  onValueChange: (value: T) => void;
  options: TabOption<T>[];
  value: T;
};

function TabsComponent<T extends string>({
  onValueChange,
  options,
  value,
}: TabsProps<T>) {
  return (
    <View
      accessibilityRole="tablist"
      className="bg-tab dark:bg-tab flex-row rounded-full p-1"
    >
      {options.map((option) => {
        const isActive = option.value === value;

        return (
          <Pressable
            key={option.value}
            className={cn(
              'min-h-12 flex-1 items-center justify-center rounded-full px-4 py-3',
              isActive ? 'bg-white dark:bg-surfaceDark' : '',
            )}
            hitSlop={minimumTouchTarget}
            onPress={() => {
              onValueChange(option.value);
            }}
            {...createA11yProps(
              option.label,
              'tab',
              `Switch to ${option.label}`,
            )}
            accessibilityState={{ selected: isActive }}
          >
            <Text
              className={isActive ? 'text-brand dark:text-brand-soft' : ''}
              variant="label"
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export const Tabs = memo(TabsComponent) as typeof TabsComponent;
