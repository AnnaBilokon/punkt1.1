import { create } from 'zustand';

import { shelfService } from '@/services/shelves/shelfService';
import { queryClient } from '@/shared/lib/queryClient';

export const customShelvesQueryKey = (userId: string) =>
  ['custom-shelves', userId] as const;

export const archivedShelvesQueryKey = (userId: string) =>
  ['archived-shelves', userId] as const;

export const shelfBooksQueryKey = (shelfId: string) =>
  ['shelf-books', shelfId] as const;

export const bookShelfIdsQueryKey = (bookApiId: string, userId: string) =>
  ['book-shelf-ids', bookApiId, userId] as const;

type ShelfState = {
  addBookToShelf: (shelfId: string, bookApiId: string, userId: string) => Promise<void>;
  archiveShelf: (userId: string, shelfId: string) => Promise<void>;
  createShelf: (userId: string, name: string) => Promise<void>;
  deleteShelf: (userId: string, shelfId: string) => Promise<void>;
  removeBookFromShelf: (shelfId: string, bookApiId: string, userId: string) => Promise<void>;
  renameShelf: (userId: string, shelfId: string, name: string) => Promise<void>;
  unarchiveShelf: (userId: string, shelfId: string) => Promise<void>;
};

export const useShelfStore = create<ShelfState>()(() => ({
  addBookToShelf: async (shelfId, bookApiId, userId) => {
    await shelfService.addBookToShelf(shelfId, bookApiId, userId);
    void queryClient.invalidateQueries({ queryKey: shelfBooksQueryKey(shelfId) });
    void queryClient.invalidateQueries({ queryKey: customShelvesQueryKey(userId) });
    void queryClient.invalidateQueries({ queryKey: bookShelfIdsQueryKey(bookApiId, userId) });
  },

  archiveShelf: async (userId, shelfId) => {
    await shelfService.archiveShelf(shelfId);
    void queryClient.invalidateQueries({ queryKey: customShelvesQueryKey(userId) });
    void queryClient.invalidateQueries({ queryKey: archivedShelvesQueryKey(userId) });
  },

  createShelf: async (userId, name) => {
    await shelfService.createShelf(userId, name);
    void queryClient.invalidateQueries({ queryKey: customShelvesQueryKey(userId) });
  },

  deleteShelf: async (userId, shelfId) => {
    await shelfService.deleteShelf(shelfId);
    void queryClient.invalidateQueries({ queryKey: customShelvesQueryKey(userId) });
    void queryClient.invalidateQueries({ queryKey: archivedShelvesQueryKey(userId) });
  },

  removeBookFromShelf: async (shelfId, bookApiId, userId) => {
    await shelfService.removeBookFromShelf(shelfId, bookApiId);
    void queryClient.invalidateQueries({ queryKey: shelfBooksQueryKey(shelfId) });
    void queryClient.invalidateQueries({ queryKey: customShelvesQueryKey(userId) });
    void queryClient.invalidateQueries({ queryKey: bookShelfIdsQueryKey(bookApiId, userId) });
  },

  renameShelf: async (userId, shelfId, name) => {
    await shelfService.renameShelf(shelfId, name);
    void queryClient.invalidateQueries({ queryKey: customShelvesQueryKey(userId) });
    void queryClient.invalidateQueries({ queryKey: archivedShelvesQueryKey(userId) });
  },

  unarchiveShelf: async (userId, shelfId) => {
    await shelfService.unarchiveShelf(shelfId);
    void queryClient.invalidateQueries({ queryKey: customShelvesQueryKey(userId) });
    void queryClient.invalidateQueries({ queryKey: archivedShelvesQueryKey(userId) });
  },
}));
