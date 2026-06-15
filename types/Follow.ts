export type PublicProfile = {
  avatarUrl: string | null;
  displayName: string;
  id: string;
};

export type FriendActivity = {
  action: 'completed' | 'reading' | 'want-to-read';
  avatarUrl: string | null;
  bookApiId: string;
  bookAuthor: string;
  bookCover: string | null;
  bookTitle: string;
  date: string;
  displayName: string;
  userId: string;
};

export type UserPublicStats = PublicProfile & {
  booksRead: number;
  followersCount: number;
  followingCount: number;
};

export type UserPublicBook = {
  author: string;
  bookApiId: string;
  coverImage: string | null;
  finishedAt: string | null;
  myRating: number | null;
  progress: number;
  status: 'completed' | 'reading';
  title: string;
};
