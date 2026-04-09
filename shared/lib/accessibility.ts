import type { AccessibilityRole } from 'react-native';

export const minimumTouchTarget = {
  bottom: 12,
  left: 12,
  right: 12,
  top: 12,
} as const;

export const createA11yProps = (
  label: string,
  role: AccessibilityRole,
  hint?: string,
) => ({
  accessibilityHint: hint,
  accessibilityLabel: label,
  accessibilityRole: role,
});
