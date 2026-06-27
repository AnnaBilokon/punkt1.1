import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { memo, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  useConversationId,
  useMessages,
  useSendMessage,
} from '@/features/social/hooks/useMessages';
import { usePublicProfile } from '@/features/social/hooks/usePublicProfile';
import { messagingService } from '@/services/social/messagingService';
import { useAuthStore } from '@/store/authStore';
import type { DM } from '@/types';

const TEXT_PRI   = '#1c1714';
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
  const d = new Date(iso);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
};

const Bubble = memo(({ dm, isMine }: { dm: DM; isMine: boolean }) => (
  <View
    style={{
      alignSelf: isMine ? 'flex-end' : 'flex-start',
      maxWidth: '75%',
      marginHorizontal: 14,
      marginVertical: 3,
    }}
  >
    <View
      style={{
        backgroundColor: isMine ? BRAND : BG_SUBTLE,
        borderRadius: 18,
        borderBottomRightRadius: isMine ? 4 : 18,
        borderBottomLeftRadius: isMine ? 18 : 4,
        paddingHorizontal: 14,
        paddingVertical: 9,
      }}
    >
      <Text style={{ fontSize: 14, color: isMine ? '#fff' : TEXT_PRI, lineHeight: 20 }}>
        {dm.text}
      </Text>
    </View>
    <Text
      style={{
        fontSize: 10, color: TEXT_MUTED, marginTop: 3,
        alignSelf: isMine ? 'flex-end' : 'flex-start',
        marginHorizontal: 4,
      }}
    >
      {fmtTime(dm.createdAt)}
    </Text>
  </View>
));
Bubble.displayName = 'Bubble';

type Props = { otherUserId: string };

export const ChatScreen = memo(({ otherUserId }: Props) => {
  const { data: profile } = usePublicProfile(otherUserId);
  const otherDisplayName = profile?.displayName ?? 'Reader';
  const otherAvatarUrl = profile?.avatarUrl ?? null;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const [text, setText] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const flatRef = useRef<FlatList<DM>>(null);

  const { data: conversationId } = useConversationId(userId, otherUserId);
  const { data: messages = [], isLoading } = useMessages(conversationId ?? null);
  const { mutate: sendMessage, isPending: sending } = useSendMessage(conversationId ?? null, userId);

  // Mark messages as read when screen opens and conversationId resolves
  useEffect(() => {
    if (conversationId && userId) {
      void messagingService.markRead(conversationId, userId);
    }
  }, [conversationId, userId]);

  // Keyboard handling
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const onShow = Keyboard.addListener(showEvent, (e) => setKeyboardHeight(e.endCoordinates.height));
    const onHide = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0));
    return () => { onShow.remove(); onHide.remove(); };
  }, []);

  const handleSend = () => {
    if (!text.trim() || !conversationId || !userId) return;
    sendMessage(text.trim(), { onSuccess: () => setText('') });
  };

  const { bg, fg } = pal(otherDisplayName);
  const reversed = [...messages].reverse();

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: BG }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row', alignItems: 'center', gap: 10,
          paddingHorizontal: 12, paddingVertical: 10,
          borderBottomWidth: 1, borderBottomColor: DIVIDER,
        }}
      >
        <Pressable hitSlop={10} onPress={() => router.back()} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
          <Ionicons name="chevron-back" size={24} color={TEXT_PRI} />
        </Pressable>
        {otherAvatarUrl ? (
          <Image source={{ uri: otherAvatarUrl }} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: bg }} />
        ) : (
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: fg }}>{inits(otherDisplayName)}</Text>
          </View>
        )}
        <Text style={{ flex: 1, fontSize: 16, fontWeight: '600', color: TEXT_PRI }} numberOfLines={1}>
          {otherDisplayName}
        </Text>
      </View>

      {/* Messages */}
      {isLoading || !conversationId ? (
        <ActivityIndicator color="#513b3c" style={{ flex: 1 }} />
      ) : (
        <FlatList
          ref={flatRef}
          data={reversed}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Bubble dm={item} isMine={item.senderId === userId} />
          )}
          inverted
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 8 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 60, gap: 8 }}>
              <Text style={{ fontSize: 32 }}>👋</Text>
              <Text style={{ fontSize: 14, color: TEXT_MUTED }}>
                Say hello to {otherDisplayName}
              </Text>
            </View>
          }
        />
      )}

      {/* Input */}
      <View
        style={{
          flexDirection: 'row', alignItems: 'flex-end', gap: 10,
          paddingHorizontal: 14, paddingTop: 10,
          paddingBottom: Math.max(keyboardHeight > 0 ? 10 : insets.bottom + 90, 14),
          borderTopWidth: 1, borderTopColor: DIVIDER,
          backgroundColor: BG,
        }}
      >
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={`Message ${otherDisplayName}…`}
          placeholderTextColor={TEXT_MUTED}
          multiline
          maxLength={1000}
          style={{
            flex: 1, fontSize: 14, color: TEXT_PRI,
            backgroundColor: BG_SUBTLE,
            borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10,
            maxHeight: 120, lineHeight: 20,
          }}
        />
        <Pressable
          onPress={handleSend}
          disabled={!text.trim() || sending || !conversationId}
          style={({ pressed }) => ({
            width: 38, height: 38, borderRadius: 19,
            backgroundColor: text.trim() && conversationId ? BRAND : BG_SUBTLE,
            alignItems: 'center', justifyContent: 'center',
            opacity: pressed || sending ? 0.6 : 1,
            marginBottom: 1,
          })}
        >
          {sending
            ? <ActivityIndicator size="small" color="#fff" />
            : <Ionicons name="arrow-up" size={18} color={text.trim() && conversationId ? '#fff' : TEXT_MUTED} />
          }
        </Pressable>
      </View>
    </SafeAreaView>
  );
});
ChatScreen.displayName = 'ChatScreen';
