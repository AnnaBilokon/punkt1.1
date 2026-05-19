import { useMemo } from 'react';

import type { Book } from '@/types';

export type Achievement = {
  earned: boolean;
  emoji: string;
  hint: string;
  id: string;
  label: string;
};

const daysBetween = (a: string, b: string) =>
  Math.abs(
    (new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24),
  );

export const useAchievements = (
  books: Book[],
  reviewsCount: number,
): Achievement[] =>
  useMemo(() => {
    const completed = books.filter((b) => b.status === 'completed');

    const speedReader = completed.some(
      (b) =>
        b.startedAt &&
        b.finishedAt &&
        daysBetween(b.startedAt, b.finishedAt) <= 3,
    );

    const booksNeeded = Math.max(0, 5 - books.length);
    const reviewsNeeded = Math.max(0, 5 - reviewsCount);

    return [
      {
        earned: books.length >= 5,
        emoji: '📚',
        hint:
          booksNeeded > 0
            ? `Add ${booksNeeded} more book${booksNeeded !== 1 ? 's' : ''} to unlock`
            : '',
        id: 'bookworm',
        label: 'Bookworm',
      },
      {
        earned: reviewsCount >= 5,
        emoji: '🏆',
        hint:
          reviewsNeeded > 0
            ? `Write ${reviewsNeeded} more review${reviewsNeeded !== 1 ? 's' : ''} to unlock`
            : '',
        id: '5-reviews',
        label: '5 reviews',
      },
      {
        earned: false,
        emoji: '🌍',
        hint: 'Read books from 3 different countries to unlock',
        id: 'world-traveller',
        label: 'World traveller',
      },
      {
        earned: false,
        emoji: '🇺🇦',
        hint: 'Read at least 1 Ukrainian book to unlock',
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
        earned: false,
        emoji: '🌙',
        hint: 'Log reading activity after midnight to unlock',
        id: 'night-owl',
        label: 'Night owl',
      },
    ];
  }, [books, reviewsCount]);
