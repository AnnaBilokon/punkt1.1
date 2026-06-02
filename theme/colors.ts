export type ThemeMode = 'light' | 'dark';

export const palette = {
  primary: {
    900: '#3B2C78',
    700: '#4B379A',
    500: '#7851A9',
    400: '#8C7AE6',
    300: '#B2A4F3',
  },
  secondary: {
    800: '#1E3A8A',
    600: '#2563EB',
    500: '#3B82F6',
    300: '#93C5FD',
  },
  neutral: {
    950: '#0B1120',
    900: '#111827',
    800: '#1F2937',
    700: '#374151',
    600: '#4B5563',
    500: '#6B7280',
    400: '#9CA3AF',
    300: '#D1D5DB',
    200: '#E5E7EB',
    100: '#F3F4F6',
    50: '#F9FAFB',
  },
  success: '#18B47B',
  error: '#E5484D',
} as const;

export const colors = {
  dark: {
    accent: palette.secondary[500],
    background: palette.neutral[950],
    backgroundAlt: '#111827',
    border: palette.neutral[700],
    card: '#141B2D',
    danger: palette.error,
    muted: palette.neutral[400],
    overlay: 'rgba(11, 17, 32, 0.7)',
    primary: palette.primary[400],
    primaryMuted: 'rgba(140, 122, 230, 0.16)',
    ringTrack: 'rgba(255, 255, 255, 0.12)',
    success: palette.success,
    tab: '#182033',
    text: '#F9FAFB',
    textInverse: '#111827',
  },
  light: {
    accent: palette.secondary[500],
    background: '#F5F7FC',
    backgroundAlt: '#FFFFFF',
    border: palette.neutral[200],
    card: '#FFFFFF',
    danger: palette.error,
    muted: palette.neutral[500],
    overlay: 'rgba(17, 24, 39, 0.28)',
    primary: palette.primary[500],
    primaryMuted: 'rgba(110, 86, 207, 0.1)',
    ringTrack: 'rgba(17, 24, 39, 0.08)',
    success: palette.success,
    tab: '#EEF1F7',
    text: palette.neutral[900],
    textInverse: '#FFFFFF',
  },
} as const;

export const getColors = (mode: ThemeMode) => colors[mode];
