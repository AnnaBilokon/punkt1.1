export type BookStatus = 'reading' | 'completed' | 'want-to-read' | 'dnf';
export type BookFormat = 'audio' | 'paper' | 'ebook';

export type Book = {
  author: string;
  boughtAt?: string;
  coverImage: string;
  description: string;
  dnfPage?: number;
  dnfReason?: string;
  finishedAt?: string;
  format?: BookFormat;
  genres: string[];
  id: string;
  isbn?: string;
  language?: string;
  myRating?: number;
  note?: string;
  pages: number;
  progress: number;
  publishedYear: number;
  publisher?: string;
  rating: number;
  review?: string;
  startedAt?: string;
  status: BookStatus | null;
  tags?: string[];
  title: string;
};

/** Fields that can be written to user_books when tracking a reading session. */
export type ReadingDataUpdate = {
  boughtAt?: string | null;
  dnfPage?: number | null;
  dnfReason?: string | null;
  finishedAt?: string | null;
  format?: BookFormat | null;
  myRating?: number | null;
  note?: string | null;
  progress?: number;
  review?: string | null;
  startedAt?: string | null;
  status?: BookStatus | null;
  tags?: string[];
};
