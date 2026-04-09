import { create } from 'zustand';

import { mockBooks, mockBookshelves } from '@/mocks/books';
import type { Book, Bookshelf } from '@/types';

type BookState = {
  books: Book[];
  bookshelves: Bookshelf[];
  getBooksByStatus: (status: Book['status']) => Book[];
};

export const useBookStore = create<BookState>()((_, get) => ({
  books: mockBooks,
  bookshelves: mockBookshelves,
  getBooksByStatus: (status) =>
    get().books.filter((book) => book.status === status),
}));
