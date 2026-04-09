import type { ReadingChallenge } from '@/types';

export const getChallengeProgress = (challenge: ReadingChallenge) =>
  Math.round((challenge.completed / challenge.goal) * 100);
