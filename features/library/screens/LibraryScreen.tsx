import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { memo, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { Card, Container, Screen, Text } from '@/components';
import { CreateShelfModal } from '@/features/library/components/CreateShelfModal';
import { useCustomShelves } from '@/features/library/hooks/useCustomShelves';
import { useLibrarySections } from '@/features/library/hooks/useLibrarySections';
import { useChallengeStore } from '@/store/challengeStore';
import { useAuthStore } from '@/store/authStore';
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
  const router = useRouter();
  const challenge = useChallengeStore((state) => state.challenge);
  const libraryTab = useUiStore((state) => state.libraryTab);
  const setLibraryTab = useUiStore((state) => state.setLibraryTab);
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const {
    keepReading = [],
    wantToRead = [],
    finished = [],
    isFetching,
  } = useLibrarySections();
  const { data: customShelves = [] } = useCustomShelves(userId);
  const [createShelfVisible, setCreateShelfVisible] = useState(false);

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
                  status="reading"
                  title="Currently Reading"
                />

                <LibraryShelfCard
                  books={wantToRead}
                  countLabel={`${wantToRead.length} book${wantToRead.length !== 1 ? 's' : ''}`}
                  showCaption
                  status="want-to-read"
                  title="Want to Read"
                />

                <LibraryShelfCard
                  books={finished}
                  countLabel={`${finished.length} book${finished.length !== 1 ? 's' : ''}`}
                  showCaption
                  status="completed"
                  title="Finished"
                />

                {/* Custom shelves */}
                <View className="gap-3">
                  <View className="flex-row items-center justify-between">
                    <Text
                      className="text-[18px] font-semibold text-black"
                      variant="body"
                    >
                      My Shelves
                    </Text>
                    <Pressable
                      className="flex-row items-center gap-1"
                      onPress={() => setCreateShelfVisible(true)}
                      style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                    >
                      <Ionicons color="#797DEA" name="add" size={18} />
                      <Text
                        className="text-[13px] font-medium text-[#797DEA]"
                        variant="body"
                      >
                        New shelf
                      </Text>
                    </Pressable>
                  </View>

                  {customShelves.length === 0 ? (
                    <Pressable
                      className="items-center gap-3 rounded-[17px] border border-dashed border-[#d0d0e8] py-8"
                      onPress={() => setCreateShelfVisible(true)}
                      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                    >
                      <View className="h-12 w-12 items-center justify-center rounded-full bg-[#ede9f7]">
                        <Ionicons color="#797DEA" name="bookmark-outline" size={22} />
                      </View>
                      <Text
                        className="text-[14px] text-[#9b9b9b]"
                        variant="body"
                      >
                        Create your first custom shelf
                      </Text>
                    </Pressable>
                  ) : (
                    customShelves.map((shelf) => (
                      <Pressable
                        key={shelf.id}
                        onPress={() =>
                          router.push(`/custom-shelf/${shelf.id}` as any)
                        }
                        style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                      >
                        <Card className="flex-row items-center rounded-[17px] border-[#d9d9d9] bg-[#f9f9f9] px-5 py-4">
                          <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-[#ede9f7]">
                            <Ionicons
                              color="#797DEA"
                              name="bookmark-outline"
                              size={18}
                            />
                          </View>
                          <View className="flex-1">
                            <Text
                              className="text-[16px] font-medium text-black"
                              variant="body"
                            >
                              {shelf.name}
                            </Text>
                            <Text
                              className="text-[13px] text-[#9b9b9b]"
                              variant="body"
                            >
                              {shelf.bookCount} book
                              {shelf.bookCount !== 1 ? 's' : ''}
                            </Text>
                          </View>
                          <Ionicons
                            color="#c0c0c0"
                            name="chevron-forward"
                            size={18}
                          />
                        </Card>
                      </Pressable>
                    ))
                  )}
                </View>
              </>
            )}
          </>
        )}
      </Container>

      <CreateShelfModal
        visible={createShelfVisible}
        onClose={() => setCreateShelfVisible(false)}
      />
    </Screen>
  );
});

LibraryScreen.displayName = 'LibraryScreen';
