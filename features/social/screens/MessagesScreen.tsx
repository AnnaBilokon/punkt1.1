import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { memo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useConversations } from '@/features/social/hooks/useConversations';
import { useAuthStore } from '@/store/authStore';
import type { Conversation } from '@/types';

const TEXT_PRI   = '#1c1714';
const TEXT_SEC   = '#6b6560';
const TEXT_MUTED = '#a8a29d';
const BG         = '#ffffff';
const BG_SUBTLE  = '#f7f5f2';
const DIVIDER    = 'rgba(0,0,0,0.07)';
const BRAND      = '#c1eeff';

const PALETTE = [
  { bg: '#e1f5ee', fg: '#085041' },
  { bg: '#faeeda', fg: '#633806' },
  { bg: '#eeedfe', fg: '#3c3489' },
  { bg: '#e6f1fb', fg: '#185fa5' },
  { bg: '#fbeaf0', fg: '#72243e' },
  { bg: '#f7f5f2', fg: '#4a4540' },
];
const pal = (seed: string) =>
  PALETTE[((seed.charCodeAt(0) ?? 0) + (seed.charCodeAt(1) ?? 0)) % PALETTE.length]!;
const inits = (name: string) => {
  const p = name.trim().split(' ');
  return (p.length >= 2 ? `${p[0]![0] ?? ''}${p[1]![0] ?? ''}` : name.slice(0, 2)).toUpperCase();
};

const fmtTime = (iso: string) => {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60_000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

const ConvoRow = memo(({ item, onPress }: { item: Conversation; onPress: () => void }) => {
  const { bg, fg } = pal(item.otherDisplayName);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 13,
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: DIVIDER,
        backgroundColor: item.unreadCount > 0 ? '#faf8ff' : BG,
        opacity: pressed ? 0.75 : 1,
      })}
    >
      {item.otherAvatarUrl ? (
        <Image
          source={{ uri: item.otherAvatarUrl }}
          style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: bg }}
        />
      ) : (
        <View
          style={{
            width: 48, height: 48, borderRadius: 24,
            backgroundColor: bg, alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '700', color: fg }}>
            {inits(item.otherDisplayName)}
          </Text>
        </View>
      )}

      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <Text
            style={{ fontSize: 14, fontWeight: item.unreadCount > 0 ? '700' : '500', color: TEXT_PRI }}
            numberOfLines={1}
          >
            {item.otherDisplayName}
          </Text>
          <Text style={{ fontSize: 11, color: TEXT_MUTED, marginLeft: 8 }}>
            {fmtTime(item.lastMessageAt)}
          </Text>
        </View>
        <Text
          numberOfLines={1}
          style={{ fontSize: 13, color: item.unreadCount > 0 ? TEXT_SEC : TEXT_MUTED, marginTop: 2 }}
        >
          {item.lastMessagePreview ?? 'Start a conversation'}
        </Text>
      </View>

      {item.unreadCount > 0 && (
        <View
          style={{
            minWidth: 20, height: 20, borderRadius: 10,
            backgroundColor: BRAND, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>
            {item.unreadCount > 9 ? '9+' : item.unreadCount}
          </Text>
        </View>
      )}
    </Pressable>
  );
});
ConvoRow.displayName = 'ConvoRow';

export const MessagesScreen = memo(() => {
  const router = useRouter();
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const { data: conversations = [], isLoading } = useConversations(userId);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: BG }}>
      <View
        style={{
          flexDirection: 'row', alignItems: 'center',
          paddingHorizontal: 16, paddingTop: 10, paddingBottom: 14,
          borderBottomWidth: 1, borderBottomColor: DIVIDER,
        }}
      >
        <Pressable
          hitSlop={8}
          onPress={() => router.back()}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, marginRight: 8 })}
        >
          <Ionicons name="chevron-back" size={24} color={TEXT_PRI} />
        </Pressable>
        <Text style={{ fontSize: 18, fontWeight: '700', color: TEXT_PRI }}>Messages</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator color="#513b3c" style={{ flex: 1 }} />
      ) : !conversations.length ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 40 }}>
          <Ionicons name="chatbubbles-outline" size={48} color="#d9d9d9" />
          <Text style={{ fontSize: 16, fontWeight: '700', color: TEXT_PRI }}>No messages yet</Text>
          <Text style={{ fontSize: 13, color: TEXT_SEC, textAlign: 'center', lineHeight: 20 }}>
            Tap Message on someone's profile to start a conversation.
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.conversationId}
          renderItem={({ item }) => (
            <ConvoRow
              item={item}
              onPress={() => router.push(`/chat/${item.otherUserId}` as any)}
            />
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
});
MessagesScreen.displayName = 'MessagesScreen';
