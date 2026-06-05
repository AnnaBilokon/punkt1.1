import { useMemo } from 'react';

import { useLibrarySections } from '@/features/library/hooks/useLibrarySections';
import { useStreak } from '@/features/profile/hooks/useStreak';
import { useAuthStore } from '@/store/authStore';
import { useChallengeStore } from '@/store/challengeStore';
import type { Book } from '@/types';

export const useLiveChallenge = () => {
  const challenge = useChallengeStore((s) => s.challenge);
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const { data: streakData } = useStreak(userId);
  const streak = streakData?.current ?? 0;
  const { finished } = useLibrarySections();

  const { liveChallenge, monthlyBooks } = useMemo(() => {
    const year = challenge.year;

    const yearBooks = finished.filter((b) => {
      if (b.finishedAt) {
        return new Date(b.finishedAt).getFullYear() === year;
      }
      return year === new Date().getFullYear();
    });

    const byMonth = yearBooks.reduce<Record<number, Book[]>>((acc, book) => {
      const month = book.finishedAt
        ? new Date(book.finishedAt).getMonth() + 1
        : new Date().getMonth() + 1;
      return { ...acc, [month]: [...(acc[month] ?? []), book] };
    }, {});

    return {
      liveChallenge: { ...challenge, completed: yearBooks.length },
      monthlyBooks: byMonth,
    };
  }, [challenge, finished]);

  return { challenge: liveChallenge, monthlyBooks, streak };
};
