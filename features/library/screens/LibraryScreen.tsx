import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { Alert, View } from 'react-native';

import {
  Avatar,
  Container,
  FloatingActionButton,
  IconButton,
  Screen,
  SectionHeader,
  Text,
} from '@/components';
import { getInitials } from '@/entities/user';
import { useLibrarySections } from '@/features/library/hooks/useLibrarySections';
import { useAuthStore } from '@/store/authStore';
import { useChallengeStore } from '@/store/challengeStore';
import { useUiStore } from '@/store/uiStore';

import { BookHorizontalList } from '../components/BookHorizontalList';
import { LibraryTabs } from '../components/LibraryTabs';
import { ReadingChallengeCard } from '../components/ReadingChallengeCard';

export const LibraryScreen = memo(() => {
  const challenge = useChallengeStore((state) => state.challenge);
  const libraryTab = useUiStore((state) => state.libraryTab);
  const setLibraryTab = useUiStore((state) => state.setLibraryTab);
  const user = useAuthStore((state) => state.user);
  const { keepReading, wantToRead } = useLibrarySections();

  return (
    <Screen contentClassName="gap-8 pt-4" scrollable>
      <Container className="gap-8">
        <View className="flex-row items-center justify-between gap-4">
          <View className="gap-1">
            <Text variant="caption">Today</Text>
            <Text variant="display">My Library</Text>
          </View>
          <View className="flex-row items-center gap-3">
            <IconButton
              accessibilityLabel="Open notifications"
              icon="notifications-outline"
            />
            <Avatar
              fallback={user ? getInitials(user) : 'PK'}
              uri={user?.avatarUrl}
            />
          </View>
        </View>

        <ReadingChallengeCard challenge={challenge} />

        <View className="gap-4">
          <LibraryTabs onChange={setLibraryTab} value={libraryTab} />
          <View className="rounded-[24px] border border-border/80 bg-white/70 px-5 py-4 dark:border-borderDark dark:bg-surfaceDark/80">
            <View className="flex-row items-start justify-between gap-4">
              <View className="flex-1 gap-2">
                <Text variant="label">
                  {libraryTab === 'bookshelves' ? 'Bookshelves' : 'Book Clubs'}
                </Text>
                <Text className="text-textMuted dark:text-textMutedDark">
                  {libraryTab === 'bookshelves'
                    ? 'Organize reading lists, track momentum, and prepare for synced backend shelves.'
                    : 'Community spaces land next. Structure is ready for clubs, threads, and live reading sprints.'}
                </Text>
              </View>
              <Ionicons
                color="#6E56CF"
                name={
                  libraryTab === 'bookshelves'
                    ? 'library-outline'
                    : 'people-outline'
                }
                size={22}
              />
            </View>
          </View>
        </View>

        <View className="gap-5">
          <SectionHeader eyebrow="Keep reading" title="Library" />
          <BookHorizontalList
            books={keepReading}
            emptyLabel="No active reads yet."
          />
        </View>

        <View className="gap-5">
          <SectionHeader eyebrow="Queue" title="Want to Read" />
          <BookHorizontalList
            books={wantToRead}
            emptyLabel="Your want-to-read shelf is clear."
          />
        </View>
      </Container>

      <FloatingActionButton
        accessibilityLabel="Add a new book"
        onPress={() => {
          // TODO: Connect this action to the create-book flow once backend mutations are available.
          Alert.alert(
            'Add book',
            'Hook this action into the book creation flow next.',
          );
        }}
      />
    </Screen>
  );
});

LibraryScreen.displayName = 'LibraryScreen';
