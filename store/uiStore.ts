import { create } from 'zustand';

type LibraryTab = 'book-clubs' | 'bookshelves';
type ThemePreference = 'dark' | 'light' | 'system';

type UiState = {
  libraryTab: LibraryTab;
  setLibraryTab: (tab: LibraryTab) => void;
  setThemePreference: (themePreference: ThemePreference) => void;
  themePreference: ThemePreference;
};

export const useUiStore = create<UiState>()((set) => ({
  libraryTab: 'bookshelves',
  setLibraryTab: (libraryTab) => set({ libraryTab }),
  setThemePreference: (themePreference) => set({ themePreference }),
  themePreference: 'system',
}));
