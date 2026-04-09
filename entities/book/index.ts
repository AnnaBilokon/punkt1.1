import type { Book } from '@/types';

export const getBookProgressPercentage = (book: Book) =>
  Math.max(0, Math.min(100, book.progress));

export const getBookStatusLabel = (status: Book['status']) => {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'reading':
      return 'Reading';
    case 'want-to-read':
      return 'Want to read';
    default:
      return 'Unknown';
  }
};
