import { create } from 'zustand';

import { userBooksQueryKey } from '@/features/library/hooks/useUserBooks';
import { streakQueryKey } from '@/features/profile/hooks/useStreak';
import { bookRepository } from '@/services/books/bookRepository';
import { streakService } from '@/services/profile/streakService';
import { queryClient } from '@/shared/lib/queryClient';
import { bookShelfIdsQueryKey, customShelvesQueryKey } from '@/store/shelfStore';
import type { Book, BookStatus, ReadingDataUpdate } from '@/types';

type BookState = {
  addBook: (userId: string, book: Book, status: BookStatus | null) => Promise<void>;
  removeBook: (userId: string, bookApiId: string) => Promise<void>;
  saveReadingData: (
    userId: string,
    bookApiId: string,
    updates: ReadingDataUpdate,
  ) => Promise<void>;
  updateBookMeta: (userId: string, bookApiId: string, book: Book) => Promise<void>;
  updateBookStatus: (
    userId: string,
    bookApiId: string,
    status: BookStatus | null,
  ) => Promise<void>;
};

export const useBookStore = create<BookState>()(() => ({
  addBook: async (userId, book, status) => {
    await bookRepository.addBook(userId, book, status);
    void queryClient.invalidateQueries({ queryKey: userBooksQueryKey(userId) });
    void streakService.logActivity(userId).then(() =>
      queryClient.invalidateQueries({ queryKey: streakQueryKey(userId) }),
    );
  },

  removeBook: async (userId, bookApiId) => {
    await bookRepository.removeBook(userId, bookApiId);
    void queryClient.invalidateQueries({ queryKey: userBooksQueryKey(userId) });
    void queryClient.invalidateQueries({ queryKey: ['shelf-books'] });
    void queryClient.invalidateQueries({ queryKey: customShelvesQueryKey(userId) });
    void queryClient.invalidateQueries({ queryKey: bookShelfIdsQueryKey(bookApiId, userId) });
  },

  saveReadingData: async (userId, bookApiId, updates) => {
    await bookRepository.saveReadingData(userId, bookApiId, updates);
    void queryClient.invalidateQueries({ queryKey: userBooksQueryKey(userId) });
    void streakService.logActivity(userId).then(() =>
      queryClient.invalidateQueries({ queryKey: streakQueryKey(userId) }),
    );
  },

  updateBookMeta: async (userId, bookApiId, book) => {
    await bookRepository.updateBookMeta(userId, bookApiId, book);
    void queryClient.invalidateQueries({ queryKey: userBooksQueryKey(userId) });
  },

  updateBookStatus: async (userId, bookApiId, status) => {
    await bookRepository.updateBook(userId, bookApiId, { status });
    void queryClient.invalidateQueries({ queryKey: userBooksQueryKey(userId) });
    void streakService.logActivity(userId).then(() =>
      queryClient.invalidateQueries({ queryKey: streakQueryKey(userId) }),
    );
  },
}));
