import { create } from 'zustand';

import { mockBooks, mockBookshelves } from '@/mocks/books';
import type { Book, Bookshelf } from '@/types';

type BookState = {
  addBook: (book: Book) => void;
  books: Book[];
  bookshelves: Bookshelf[];
  getBooksByStatus: (status: Book['status']) => Book[];
};

export const useBookStore = create<BookState>()((set, get) => ({
  addBook: (book) => {
    const exists = get().books.some((b) => b.id === book.id);
    if (!exists) {
      set((state) => ({
        books: [
          ...state.books,
          { ...book, status: 'want-to-read', progress: 0 },
        ],
      }));
    }
  },
  books: mockBooks,
  bookshelves: mockBookshelves,
  getBooksByStatus: (status) =>
    get().books.filter((book) => book.status === status),
}));
