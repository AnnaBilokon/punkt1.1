export const LIBRARIUM_GENRES = [
  'Fiction',
  'Non-fiction',
  'Detective',
  'Crime',
  'Mystery',
  'Thriller',
  'Fantasy',
  'Fantastic',
  'Sci-fi',
  'Horror',
  'Adventure',
  'Romance',
  'Historical',
  'Literary',
  'Drama',
  'Poetry',
  'Biography',
  'Memoir',
  'Self-help',
  'Essay',
  "Children's",
  'Young Adult',
  'Classics',
  'Dystopian',
  'Comics / Graphic novel',
] as const;

export type LibrariumGenre = (typeof LIBRARIUM_GENRES)[number];

export const LIBRARIAN_TIERS = [
  { bonus: 100, emoji: '📚', min: 1, name: 'First Shelf' },
  { bonus: 250, emoji: '📖', min: 5, name: 'Contributor' },
  { bonus: 500, emoji: '🏛️', min: 15, name: 'Curator' },
  { bonus: 1000, emoji: '🎓', min: 30, name: 'Senior Librarian' },
  { bonus: 2000, emoji: '⭐', min: 50, name: 'Master Librarian' },
] as const;

export type LibrarianTier = (typeof LIBRARIAN_TIERS)[number];

export const MARKS_PER_APPROVAL = 150;
export const LEAVES_PER_APPROVAL = 50;
