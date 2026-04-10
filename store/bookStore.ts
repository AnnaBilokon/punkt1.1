import { create } from 'zustand';

import { userBooksQueryKey } from '@/features/library/hooks/useUserBooks';
import { bookRepository } from '@/services/books/bookRepository';
import { queryClient } from '@/shared/lib/queryClient';
import type { Book, BookStatus, ReadingDataUpdate } from '@/types';

type BookState = {
  addBook: (userId: string, book: Book, status: BookStatus) => Promise<void>;
  removeBook: (userId: string, bookApiId: string) => Promise<void>;
  saveReadingData: (
    userId: string,
    bookApiId: string,
    updates: ReadingDataUpdate,
  ) => Promise<void>;
  updateBookStatus: (
    userId: string,
    bookApiId: string,
    status: BookStatus,
  ) => Promise<void>;
};

export const useBookStore = create<BookState>()(() => ({
  addBook: async (userId, book, status) => {
    await bookRepository.addBook(userId, book, status);
    void queryClient.invalidateQueries({ queryKey: userBooksQueryKey(userId) });
  },

  removeBook: async (userId, bookApiId) => {
    await bookRepository.removeBook(userId, bookApiId);
    void queryClient.invalidateQueries({ queryKey: userBooksQueryKey(userId) });
  },

  saveReadingData: async (userId, bookApiId, updates) => {
    await bookRepository.saveReadingData(userId, bookApiId, updates);
    void queryClient.invalidateQueries({ queryKey: userBooksQueryKey(userId) });
  },

  updateBookStatus: async (userId, bookApiId, status) => {
    await bookRepository.updateBook(userId, bookApiId, { status });
    void queryClient.invalidateQueries({ queryKey: userBooksQueryKey(userId) });
  },
}));
