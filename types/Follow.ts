export type PublicProfile = {
  avatarUrl: string | null;
  currentlyReading?: string | null;
  displayName: string;
  id: string;
};

export type FriendActivity = {
  action: 'completed' | 'reading' | 'want-to-read' | 'review' | 'rated' | 'badge' | 'club';
  avatarUrl: string | null;
  bookApiId: string;
  bookAuthor: string;
  bookCover: string | null;
  bookTitle: string;
  date: string;
  displayName: string;
  userId: string;
  rating?: number;
  reviewText?: string;
  reviewSpoiler?: boolean;
  badgeName?: string;
  clubName?: string;
  likeCount?: number;
  commentCount?: number;
};

export type ActivityComment = {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  text: string;
  createdAt: string;
};

export type AppNotification = {
  id: string;
  type: 'comment' | 'follow';
  fromUserId: string;
  fromDisplayName: string;
  fromAvatarUrl: string | null;
  bookTitle: string | undefined;
  bookApiId: string | undefined;
  commentText: string | undefined;
  createdAt: string;
};

export type UserPublicStats = PublicProfile & {
  bio: string | null;
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
