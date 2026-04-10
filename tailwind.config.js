/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './features/**/*.{ts,tsx}',
    './shared/**/*.{ts,tsx}',
  ],
  darkMode: 'media',
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#7851A9',
          soft: '#9B6FC8',
          deep: '#5C3D85',
        },
        accent: {
          DEFAULT: '#3B82F6',
          soft: '#60A5FA',
          deep: '#1D4ED8',
        },
        success: '#18B47B',
        danger: '#E5484D',
        surface: '#F7F8FC',
        surfaceDark: '#111827',
        border: '#E5E7EB',
        borderDark: '#374151',
        text: '#111827',
        textMuted: '#6B7280',
        textDark: '#F9FAFB',
        textMutedDark: '#9CA3AF',
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
      },
      borderRadius: {
        xl2: '1.5rem',
      },
      boxShadow: {
        soft: '0px 10px 30px rgba(17, 24, 39, 0.08)',
        strong: '0px 20px 40px rgba(75, 55, 154, 0.18)',
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
