import type { Book, ReadingChallenge } from '@/types';

export const mockChallenge: ReadingChallenge = {
  completed: 12,
  goal: 25,
  id: 'challenge-2025',
  label: 'Keep reading.',
  year: 2025,
};

const completedBook = (
  id: string,
  title: string,
  author: string,
  pages: number,
  rating: number,
  genre: string,
  cover: string,
): Book => ({
  author,
  coverImage: cover,
  description: '',
  genres: [genre],
  id,
  myRating: rating,
  pages,
  progress: 100,
  publishedYear: 2024,
  rating,
  status: 'completed',
  title,
});

const COVER_A =
  'https://www.figma.com/api/mcp/asset/1e6e3962-ea81-499a-bd58-3e3d358b04bc';
const COVER_B =
  'https://www.figma.com/api/mcp/asset/86ba0e79-d651-40ce-86d3-adedc79e5dcb';
const COVER_C =
  'https://www.figma.com/api/mcp/asset/28e46ff4-2445-4744-8691-7177223d8af4';
const COVER_D =
  'https://www.figma.com/api/mcp/asset/76cac816-6c0c-462e-9507-767d9bcfb9c7';
const COVER_E =
  'https://www.figma.com/api/mcp/asset/f0ad7d2b-1575-4bb1-9414-7131414ef5d1';

export const mockMonthlyBooks: Record<number, Book[]> = {
  1: [
    completedBook(
      'ch-jan-1',
      'Lessons in Chemistry',
      'Bonnie Garmus',
      390,
      5,
      'Fiction',
      COVER_A,
    ),
    completedBook(
      'ch-jan-2',
      'Tomorrow, and Tomorrow',
      'Gabrielle Zevin',
      416,
      4,
      'Fiction',
      COVER_B,
    ),
    completedBook(
      'ch-jan-3',
      'Happy Place',
      'Emily Henry',
      384,
      4,
      'Romance',
      COVER_C,
    ),
  ],
  2: [
    completedBook(
      'ch-feb-1',
      'Iron Flame',
      'Rebecca Yarros',
      640,
      4,
      'Fantasy',
      COVER_D,
    ),
    completedBook(
      'ch-feb-2',
      'Spare',
      'Prince Harry',
      416,
      3,
      'Biography',
      COVER_E,
    ),
  ],
  3: [
    completedBook(
      'ch-mar-1',
      'Hello Beautiful',
      'Ann Napolitano',
      400,
      5,
      'Literary',
      COVER_A,
    ),
    completedBook(
      'ch-mar-2',
      'The Covenant of Water',
      'Abraham Verghese',
      736,
      5,
      'Literary',
      COVER_B,
    ),
    completedBook(
      'ch-mar-3',
      'Demon Copperhead',
      'Barbara Kingsolver',
      560,
      4,
      'Fiction',
      COVER_C,
    ),
  ],
  4: [
    completedBook(
      'ch-apr-1',
      'Fourth Wing',
      'Rebecca Yarros',
      512,
      4,
      'Fantasy',
      COVER_D,
    ),
    completedBook(
      'ch-apr-2',
      'Intermezzo',
      'Sally Rooney',
      432,
      4,
      'Literary',
      COVER_E,
    ),
  ],
  5: [
    completedBook(
      'ch-may-1',
      'The Women',
      'Kristin Hannah',
      480,
      4,
      'Historical',
      COVER_A,
    ),
    completedBook(
      'ch-may-2',
      'James',
      'Percival Everett',
      320,
      5,
      'Literary',
      COVER_B,
    ),
  ],
};

export const mockStreak = 7;
