import { Container, Screen, SectionHeader, Text } from '@/components';

export const ProfileScreen = () => (
  <Screen contentClassName="pt-6">
    <Container className="gap-4">
      <SectionHeader eyebrow="Profile" title="Your reading identity" />
      <Text className="text-textMuted dark:text-textMutedDark">
        Preferences, account settings, achievements, and AI personalization will
        land here.
      </Text>
    </Container>
  </Screen>
);
