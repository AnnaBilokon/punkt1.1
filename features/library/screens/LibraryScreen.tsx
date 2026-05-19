import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { Card, Container, Screen, Text } from '@/components';
import { useLibrarySections } from '@/features/library/hooks/useLibrarySections';
import { useChallengeStore } from '@/store/challengeStore';
import { useUiStore } from '@/store/uiStore';

import { LibraryShelfCard } from '../components/LibraryShelfCard';
import { LibraryTabs } from '../components/LibraryTabs';
import { ReadingChallengeCard } from '../components/ReadingChallengeCard';
import { WhatToReadNextCard } from '../components/WhatToReadNextCard';

const BookClubsPlaceholder = memo(() => (
  <Card className="items-center gap-4 rounded-[20px] border-[#e8e8e8] bg-[#f9f9f9] py-10">
    <View className="h-14 w-14 items-center justify-center rounded-full bg-[#ede9f7]">
      <Ionicons color="#797DEA" name="people-outline" size={28} />
    </View>
    <View className="items-center gap-2 px-4">
      <Text
        className="text-center text-[17px] font-semibold text-black"
        variant="body"
      >
        Book Clubs
      </Text>
      <Text
        className="text-center text-[14px] leading-[20px] text-[#9b9b9b]"
        variant="body"
      >
        Read and discuss books together with friends. Book Clubs are coming in a
        future update.
      </Text>
    </View>
    <View className="rounded-full bg-[#ede9f7] px-4 py-1.5">
      <Text
        className="text-[12px] font-medium text-[#797DEA]"
        variant="caption"
      >
        Coming soon
      </Text>
    </View>
  </Card>
));
BookClubsPlaceholder.displayName = 'BookClubsPlaceholder';

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

        {libraryTab === 'book-clubs' ? (
          <BookClubsPlaceholder />
        ) : (
          <>
            <WhatToReadNextCard wantToRead={wantToRead} />

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
          </>
        )}
      </Container>
    </Screen>
  );
});

LibraryScreen.displayName = 'LibraryScreen';
