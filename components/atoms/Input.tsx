import { memo } from 'react';
import type { TextInputProps } from 'react-native';
import { TextInput, View } from 'react-native';

import { Text } from '@/components/atoms/Text';
import { cn } from '@/shared/lib/cn';

type InputProps = TextInputProps & {
  error?: string | undefined;
  label?: string | undefined;
};

export const Input = memo(
  ({ error, label, className, ...props }: InputProps) => (
    <View className="gap-1.5">
      {label ? (
        <Text variant="label" className="text-text dark:text-textDark">
          {label}
        </Text>
      ) : null}
      <TextInput
        className={cn(
          'h-12 rounded-xl border border-border bg-white px-4 text-base text-text dark:border-borderDark dark:bg-surfaceDark dark:text-textDark',
          error && 'border-danger',
          className,
        )}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
      {error ? (
        <Text
          variant="caption"
          className="normal-case tracking-normal text-danger"
        >
          {error}
        </Text>
      ) : null}
    </View>
  ),
);

Input.displayName = 'Input';
