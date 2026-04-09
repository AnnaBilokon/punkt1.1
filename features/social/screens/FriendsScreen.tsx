import { Container, Screen, SectionHeader, Text } from '@/components';

export const FriendsScreen = () => (
  <Screen contentClassName="pt-6">
    <Container className="gap-4">
      <SectionHeader eyebrow="Social" title="Friends" />
      <Text className="text-textMuted dark:text-textMutedDark">
        Friend activity, shared shelves, and book clubs will be composed here.
      </Text>
    </Container>
  </Screen>
);
