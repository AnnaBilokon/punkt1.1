import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { ActivityIndicator, View } from 'react-native';

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
  const {
    keepReading = [],
    wantToRead = [],
    finished = [],
    isFetching,
  } = useLibrarySections();

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

        {isFetching ? (
          <ActivityIndicator color="#7851A9" />
        ) : (
          <>
            <LibraryShelfCard
              books={keepReading}
              countLabel={`${keepReading.length} book${keepReading.length !== 1 ? 's' : ''}`}
              showCaption={false}
              title="Currently Reading"
            />

            <LibraryShelfCard
              books={wantToRead}
              countLabel={`${wantToRead.length} book${wantToRead.length !== 1 ? 's' : ''}`}
              showCaption
              title="Want to Read"
            />

            <LibraryShelfCard
              books={finished}
              countLabel={`${finished.length} book${finished.length !== 1 ? 's' : ''}`}
              showCaption
              title="Finished"
            />
          </>
        )}
      </Container>
    </Screen>
  );
});

LibraryScreen.displayName = 'LibraryScreen';
