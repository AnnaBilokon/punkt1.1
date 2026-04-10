export type BookStatus = 'reading' | 'completed' | 'want-to-read';

export type Book = {
  author: string;
  coverImage: string;
  description: string;
  finishedAt?: string;
  genres: string[];
  id: string;
  myRating?: number;
  note?: string;
  pages: number;
  progress: number;
  publishedYear: number;
  rating: number;
  review?: string;
  startedAt?: string;
  status: BookStatus;
  title: string;
};

/** Fields that can be written to user_books when tracking a reading session. */
export type ReadingDataUpdate = {
  finishedAt?: string | null;
  myRating?: number | null;
  note?: string | null;
  progress?: number;
  review?: string | null;
  startedAt?: string | null;
  status?: BookStatus;
};
