import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { View } from 'react-native';

import { Container, Screen, Text } from '@/components';
import { useLibrarySections } from '@/features/library/hooks/useLibrarySections';
import { useChallengeStore } from '@/store/challengeStore';
import { useUiStore } from '@/store/uiStore';

import { LibraryShelfCard } from '../components/LibraryShelfCard';
import { LibraryTabs } from '../components/LibraryTabs';
import { ReadingChallengeCard } from '../components/ReadingChallengeCard';

export const LibraryScreen = memo(() => {
  const challenge = useChallengeStore((state) => state.challenge);
  const libraryTab = useUiStore((state) => state.libraryTab);
  const setLibraryTab = useUiStore((state) => state.setLibraryTab);
  const { keepReading, wantToRead } = useLibrarySections();

  return (
    <Screen className="bg-[#fdfdfd]" contentClassName="gap-6 pt-2" scrollable>
      <Container className="gap-6 pb-6">
        <View className="gap-6">
          <Ionicons color="#6d6d6d" name="notifications-outline" size={28} />
          <Text
            className="text-[30px] font-semibold text-black"
            variant="display"
          >
            My library
          </Text>
        </View>

        <ReadingChallengeCard challenge={challenge} />

        <LibraryTabs onChange={setLibraryTab} value={libraryTab} />

        <LibraryShelfCard
          books={keepReading}
          countLabel="4 books"
          showCaption={false}
          title="My library"
        />

        <LibraryShelfCard
          books={wantToRead}
          countLabel="2 books"
          showCaption
          title="Want to read"
        />
      </Container>
    </Screen>
  );
});

LibraryScreen.displayName = 'LibraryScreen';
