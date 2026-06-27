export type DM = {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
  readAt: string | null;
};

export type Conversation = {
  conversationId: string;
  otherUserId: string;
  otherDisplayName: string;
  otherAvatarUrl: string | null;
  lastMessagePreview: string | null;
  lastMessageAt: string;
  unreadCount: number;
};
