import { useMemo } from 'react';

import type { Book } from '@/types';

export type Achievement = {
  earned: boolean;
  emoji: string;
  hint: string;
  id: string;
  label: string;
};

type AchievementsParams = {
  books: Book[];
  currentStreak: number;
  journalCount: number;
  reReadsCount: number;
  reviewsCount: number;
};

const daysBetween = (a: string, b: string) =>
  Math.abs(
    (new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24),
  );

export const useAchievements = ({
  books,
  currentStreak,
  journalCount,
  reReadsCount,
  reviewsCount,
}: AchievementsParams): Achievement[] =>
  useMemo(() => {
    const completed = books.filter((b) => b.status === 'completed');

    const speedReader = completed.some(
      (b) =>
        b.startedAt &&
        b.finishedAt &&
        daysBetween(b.startedAt, b.finishedAt) <= 3,
    );

    const distinctLanguages = new Set(
      books.map((b) => b.language).filter((l): l is string => !!l),
    );
    const worldTraveller = distinctLanguages.size >= 3;
    const uaReader = books.some((b) => b.language === 'uk');

    const booksNeeded = Math.max(0, 5 - books.length);
    const reviewsNeeded = Math.max(0, 5 - reviewsCount);
    const criticNeeded = Math.max(0, 10 - reviewsCount);
    const journalNeeded = Math.max(0, 5 - journalCount);
    const streakNeeded7 = Math.max(0, 7 - currentStreak);
    const streakNeeded30 = Math.max(0, 30 - currentStreak);

    return [
      {
        earned: books.length >= 5,
        emoji: '📚',
        hint: booksNeeded > 0
          ? `Add ${booksNeeded} more book${booksNeeded !== 1 ? 's' : ''} to unlock`
          : '',
        id: 'bookworm',
        label: 'Bookworm',
      },
      {
        earned: reviewsCount >= 5,
        emoji: '🏆',
        hint: reviewsNeeded > 0
          ? `Write ${reviewsNeeded} more review${reviewsNeeded !== 1 ? 's' : ''} to unlock`
          : '',
        id: '5-reviews',
        label: '5 reviews',
      },
      {
        earned: reviewsCount >= 10,
        emoji: '✍️',
        hint: criticNeeded > 0
          ? `Write ${criticNeeded} more review${criticNeeded !== 1 ? 's' : ''} to unlock`
          : '',
        id: 'critic',
        label: 'Critic',
      },
      {
        earned: worldTraveller,
        emoji: '🌍',
        hint: worldTraveller
          ? ''
          : `Read books in ${Math.max(0, 3 - distinctLanguages.size)} more language${3 - distinctLanguages.size !== 1 ? 's' : ''} to unlock`,
        id: 'world-traveller',
        label: 'World traveller',
      },
      {
        earned: uaReader,
        emoji: '🇺🇦',
        hint: uaReader ? '' : 'Read at least 1 Ukrainian book to unlock',
        id: 'ua-reader',
        label: 'UA reader',
      },
      {
        earned: speedReader,
        emoji: '⚡',
        hint: 'Finish a book in under 3 days to unlock',
        id: 'speed-reader',
        label: 'Speed reader',
      },
      {
        earned: reReadsCount >= 1,
        emoji: '📖',
        hint: reReadsCount >= 1 ? '' : 'Re-read any book to unlock',
        id: 're-reader',
        label: 'Re-reader',
      },
      {
        earned: journalCount >= 5,
        emoji: '🗒️',
        hint: journalNeeded > 0
          ? `Write ${journalNeeded} more journal entr${journalNeeded !== 1 ? 'ies' : 'y'} to unlock`
          : '',
        id: 'journaler',
        label: 'Journaler',
      },
      {
        earned: currentStreak >= 7,
        emoji: '🔥',
        hint: streakNeeded7 > 0
          ? `Read for ${streakNeeded7} more day${streakNeeded7 !== 1 ? 's' : ''} in a row to unlock`
          : '',
        id: 'streak-starter',
        label: 'Streak starter',
      },
      {
        earned: currentStreak >= 30,
        emoji: '💎',
        hint: streakNeeded30 > 0
          ? `Reach a 30-day streak (${currentStreak} days so far) to unlock`
          : '',
        id: 'committed',
        label: 'Committed',
      },
      {
        earned: false,
        emoji: '🌙',
        hint: 'Log reading activity after 10 PM to unlock',
        id: 'night-owl',
        label: 'Night owl',
      },
    ];
  }, [books, currentStreak, journalCount, reReadsCount, reviewsCount]);
