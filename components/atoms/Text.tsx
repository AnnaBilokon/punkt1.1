import type { ReactNode } from 'react';
import { memo } from 'react';
import { Text as RNText } from 'react-native';

import { cn } from '@/shared/lib/cn';

type TextVariant = 'body' | 'caption' | 'display' | 'label' | 'title';

type AppTextProps = {
  children: ReactNode;
  className?: string;
  numberOfLines?: number;
  variant?: TextVariant;
};

const variantClasses: Record<TextVariant, string> = {
  body: 'text-base leading-6 font-normal text-text dark:text-textDark',
  caption:
    'text-xs leading-5 font-medium uppercase tracking-[0.16em] text-textMuted dark:text-textMutedDark',
  display: 'text-[32px] leading-[38px] font-bold text-text dark:text-textDark',
  label: 'text-sm leading-5 font-semibold text-text dark:text-textDark',
  title: 'text-xl leading-7 font-bold text-text dark:text-textDark',
};

export const Text = memo(
  ({ children, className, numberOfLines, variant = 'body' }: AppTextProps) => (
    <RNText
      className={cn(variantClasses[variant], className)}
      numberOfLines={numberOfLines}
    >
      {children}
    </RNText>
  ),
);

Text.displayName = 'Text';
