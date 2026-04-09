import { Container, Screen, SectionHeader, Text } from '@/components';

export const MessagesScreen = () => (
  <Screen contentClassName="pt-6">
    <Container className="gap-4">
      <SectionHeader eyebrow="Social" title="Messages" />
      <Text className="text-textMuted dark:text-textMutedDark">
        Direct messaging, book reactions, and notification inbox threads will
        live in this feature.
      </Text>
    </Container>
  </Screen>
);
