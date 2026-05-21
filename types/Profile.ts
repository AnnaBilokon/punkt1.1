export type Profile = {
  avatarUrl: string | null;
  bio: string | null;
  displayName: string;
  homeWidgets: HomeWidgets;
  id: string;
  tbrOrder: string[];
};

export type WidgetId =
  | 'currentlyReading'
  | 'customShelves'
  | 'finished'
  | 'readingChallenge'
  | 'tbrShelf'
  | 'whatToReadNext';

export type WidgetItem = {
  enabled: boolean;
  id: WidgetId;
};

export type HomeWidgets = WidgetItem[];

export const WIDGET_LABELS: Record<WidgetId, string> = {
  currentlyReading: 'Currently Reading',
  customShelves: 'My Shelves',
  finished: 'Finished',
  readingChallenge: 'Reading Challenge',
  tbrShelf: 'TBR shelf',
  whatToReadNext: 'What to Read Next',
};

export const DEFAULT_HOME_WIDGETS: HomeWidgets = [
  { id: 'currentlyReading', enabled: true },
  { id: 'whatToReadNext', enabled: true },
  { id: 'tbrShelf', enabled: true },
  { id: 'finished', enabled: true },
  { id: 'readingChallenge', enabled: true },
  { id: 'customShelves', enabled: true },
];
