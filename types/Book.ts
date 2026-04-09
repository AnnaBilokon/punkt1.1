export type BookStatus = 'reading' | 'completed' | 'want-to-read';

export type Book = {
  author: string;
  coverImage: string;
  description: string;
  genres: string[];
  id: string;
  pages: number;
  progress: number;
  publishedYear: number;
  rating: number;
  status: BookStatus;
  title: string;
};
