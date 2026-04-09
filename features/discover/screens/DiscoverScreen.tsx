import { Container, Screen, SectionHeader, Text } from '@/components';

export const DiscoverScreen = () => (
  <Screen contentClassName="pt-6">
    <Container className="gap-4">
      <SectionHeader eyebrow="Discover" title="Explore books" />
      <Text className="text-textMuted dark:text-textMutedDark">
        Search, AI recommendations, and external API-powered discovery will plug
        into this tab.
      </Text>
    </Container>
  </Screen>
);
