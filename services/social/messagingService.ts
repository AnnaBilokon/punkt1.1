import { supabase } from '@/services/supabase';
import type { Conversation, DM } from '@/types';

export const messagingService = {
  getOrCreateConversation: async (userId: string, otherUserId: string): Promise<string> => {
    const [u1, u2] = [userId, otherUserId].sort();

    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('user1_id', u1)
      .eq('user2_id', u2)
      .maybeSingle();

    if (existing) return existing.id as string;

    const { data, error } = await supabase
      .from('conversations')
      .insert({ user1_id: u1, user2_id: u2 })
      .select('id')
      .single();

    if (error) {
      // Race condition — select again
      const { data: retry } = await supabase
        .from('conversations')
        .select('id')
        .eq('user1_id', u1)
        .eq('user2_id', u2)
        .maybeSingle();
      if (retry) return retry.id as string;
      throw new Error(error.message);
    }

    return data.id as string;
  },

  getConversations: async (userId: string): Promise<Conversation[]> => {
    const { data, error } = await supabase
      .from('conversations')
      .select('id, user1_id, user2_id, last_message_at, last_message_preview')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    if (error) throw new Error(error.message);
    if (!data?.length) return [];

    const otherIds = data.map((row) =>
      (row.user1_id as string) === userId
        ? (row.user2_id as string)
        : (row.user1_id as string),
    );

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url')
      .in('id', otherIds);

    const profileMap = new Map(
      (profiles ?? []).map((p) => [p.id as string, p]),
    );

    const convIds = data.map((r) => r.id as string);
    const { data: unreadData } = await supabase
      .from('messages')
      .select('conversation_id')
      .in('conversation_id', convIds)
      .neq('sender_id', userId)
      .is('read_at', null);

    const unreadMap = new Map<string, number>();
    for (const row of unreadData ?? []) {
      const id = row.conversation_id as string;
      unreadMap.set(id, (unreadMap.get(id) ?? 0) + 1);
    }

    return data.map((row) => {
      const otherId =
        (row.user1_id as string) === userId
          ? (row.user2_id as string)
          : (row.user1_id as string);
      const profile = profileMap.get(otherId);
      return {
        conversationId: row.id as string,
        otherUserId: otherId,
        otherDisplayName: (profile?.display_name as string) || 'Reader',
        otherAvatarUrl: (profile?.avatar_url as string | null) ?? null,
        lastMessagePreview: (row.last_message_preview as string | null) ?? null,
        lastMessageAt: row.last_message_at as string,
        unreadCount: unreadMap.get(row.id as string) ?? 0,
      };
    });
  },

  getMessages: async (conversationId: string): Promise<DM[]> => {
    const { data, error } = await supabase
      .from('messages')
      .select('id, conversation_id, sender_id, text, created_at, read_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => ({
      id: row.id as string,
      conversationId: row.conversation_id as string,
      senderId: row.sender_id as string,
      text: row.text as string,
      createdAt: row.created_at as string,
      readAt: (row.read_at as string | null) ?? null,
    }));
  },

  sendMessage: async (
    conversationId: string,
    senderId: string,
    text: string,
  ): Promise<DM> => {
    const { data, error } = await supabase
      .from('messages')
      .insert({ conversation_id: conversationId, sender_id: senderId, text })
      .select()
      .single();

    if (error) throw new Error(error.message);

    await supabase
      .from('conversations')
      .update({
        last_message_at: new Date().toISOString(),
        last_message_preview: text.slice(0, 80),
      })
      .eq('id', conversationId);

    return {
      id: data.id as string,
      conversationId: data.conversation_id as string,
      senderId: data.sender_id as string,
      text: data.text as string,
      createdAt: data.created_at as string,
      readAt: null,
    };
  },

  markRead: async (conversationId: string, userId: string): Promise<void> => {
    await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .is('read_at', null);
  },
};
