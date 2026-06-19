import { Ionicons } from '@expo/vector-icons';
import { memo, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAddComment, useComments, useDeleteComment } from '@/features/social/hooks/useComments';
import { useAuthStore } from '@/store/authStore';
import type { ActivityComment } from '@/types';

const TEXT_PRI   = '#1c1714';
const TEXT_SEC   = '#6b6560';
const TEXT_MUTED = '#a8a29d';
const BG         = '#ffffff';
const BG_SUBTLE  = '#f7f5f2';
const DIVIDER    = 'rgba(0,0,0,0.08)';
const BRAND      = '#7851a9';

const PALETTE = [
  { bg: '#e1f5ee', fg: '#085041' },
  { bg: '#faeeda', fg: '#633806' },
  { bg: '#eeedfe', fg: '#3c3489' },
  { bg: '#e6f1fb', fg: '#185fa5' },
  { bg: '#fbeaf0', fg: '#72243e' },
  { bg: '#fcebeb', fg: '#791f1f' },
  { bg: '#eaf3de', fg: '#3b6d11' },
  { bg: '#f7f5f2', fg: '#4a4540' },
];

const pal = (seed: string) =>
  PALETTE[((seed.charCodeAt(0) ?? 0) + (seed.charCodeAt(1) ?? 0)) % PALETTE.length]!;

const inits = (name: string) => {
  const p = name.trim().split(' ');
  return (p.length >= 2 ? `${p[0]![0] ?? ''}${p[1]![0] ?? ''}` : name.slice(0, 2)).toUpperCase();
};

const fmtRelative = (iso: string) => {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const CommentAvatar = ({ name, url, size }: { name: string; url: string | null; size: number }) => {
  const { bg, fg } = pal(name);
  return url ? (
    <Image source={{ uri: url }} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg }} />
  ) : (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: size * 0.33, fontWeight: '600', color: fg }}>{inits(name)}</Text>
    </View>
  );
};

const CommentRow = memo(({ comment, currentUserId, onDelete }: {
  comment: ActivityComment;
  currentUserId: string | null;
  onDelete: (id: string) => void;
}) => (
  <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingVertical: 10 }}>
    <CommentAvatar name={comment.displayName} url={comment.avatarUrl} size={32} />
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: TEXT_PRI }}>{comment.displayName}</Text>
        <Text style={{ fontSize: 11, color: TEXT_MUTED }}>{fmtRelative(comment.createdAt)}</Text>
      </View>
      <Text style={{ fontSize: 13, color: TEXT_SEC, marginTop: 2, lineHeight: 19 }}>{comment.text}</Text>
    </View>
    {comment.userId === currentUserId && (
      <Pressable
        hitSlop={8}
        onPress={() => Alert.alert('Delete comment?', undefined, [
          { style: 'cancel', text: 'Cancel' },
          { style: 'destructive', text: 'Delete', onPress: () => onDelete(comment.id) },
        ])}
      >
        <Ionicons name="trash-outline" size={14} color={TEXT_MUTED} />
      </Pressable>
    )}
  </View>
));
CommentRow.displayName = 'CommentRow';

type Props = {
  activityUserId: string;
  bookApiId: string;
  bookTitle: string;
  visible: boolean;
  onClose: () => void;
};

export const CommentSheet = memo(({ activityUserId, bookApiId, bookTitle, visible, onClose }: Props) => {
  const insets = useSafeAreaInsets();
  const userId = useAuthStore(s => s.user?.id ?? null);
  const [text, setText] = useState('');

  const overlayAnim = useRef(new Animated.Value(0)).current;
  const sheetBottom = insets.bottom + 82;
  // Start off-screen below; animate up on mount. useNativeDriver: false because `bottom` is a layout prop.
  const bottomAnim = useRef(new Animated.Value(-600)).current;

  // Slide-in on mount
  useEffect(() => {
    Animated.parallel([
      Animated.spring(bottomAnim, { toValue: sheetBottom, useNativeDriver: false, bounciness: 3, speed: 14 }),
      Animated.timing(overlayAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard avoidance
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = Keyboard.addListener(showEvent, (e) => {
      Animated.timing(bottomAnim, {
        toValue: e.endCoordinates.height + 8,
        duration: Platform.OS === 'ios' ? e.duration : 180,
        useNativeDriver: false,
      }).start();
    });
    const onHide = Keyboard.addListener(hideEvent, (e) => {
      Animated.timing(bottomAnim, {
        toValue: sheetBottom,
        duration: Platform.OS === 'ios' ? e.duration : 180,
        useNativeDriver: false,
      }).start();
    });

    return () => { onShow.remove(); onHide.remove(); };
  }, [bottomAnim, sheetBottom]);

  const { data: comments = [], isLoading } = useComments(activityUserId, bookApiId, visible);
  const { mutate: addComment, isPending: sending } = useAddComment(activityUserId, bookApiId);
  const { mutate: deleteComment } = useDeleteComment(activityUserId, bookApiId);

  if (!visible) return null;

  const handleSend = () => {
    if (!text.trim() || !userId) return;
    addComment({ userId, text }, { onSuccess: () => setText('') });
  };

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      {/* dim overlay */}
      <Animated.View
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)', opacity: overlayAnim }}
        pointerEvents="box-none"
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>

      {/* sheet — sits above the floating tab bar (18 offset + 64 height + safe area) */}
      <Animated.View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: bottomAnim,
          backgroundColor: BG,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          maxHeight: '72%',
          minHeight: '40%',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.12,
          shadowRadius: 12,
          elevation: 20,
        }}
      >
        {/* Handle */}
        <View style={{ alignItems: 'center', paddingTop: 10, paddingBottom: 4 }}>
          <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: BG_SUBTLE }} />
        </View>

        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: DIVIDER }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: TEXT_PRI }}>Comments</Text>
          <Text numberOfLines={1} style={{ flex: 1, fontSize: 12, color: TEXT_MUTED, textAlign: 'center', fontStyle: 'italic', paddingHorizontal: 12 }}>
            {bookTitle}
          </Text>
          <Pressable hitSlop={8} onPress={onClose}>
            <Ionicons name="close" size={20} color={TEXT_MUTED} />
          </Pressable>
        </View>

        {/* Comments list */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingVertical: 4, paddingBottom: 8 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {isLoading ? (
            <ActivityIndicator color={BRAND} style={{ marginTop: 24 }} />
          ) : !comments.length ? (
            <View style={{ alignItems: 'center', paddingTop: 32, gap: 6 }}>
              <Text style={{ fontSize: 28 }}>💬</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: TEXT_PRI }}>No comments yet</Text>
              <Text style={{ fontSize: 12, color: TEXT_MUTED }}>Be the first to say something.</Text>
            </View>
          ) : (
            comments.map(c => (
              <CommentRow
                key={c.id}
                comment={c}
                currentUserId={userId}
                onDelete={(id) => deleteComment(id)}
              />
            ))
          )}
        </ScrollView>

        {/* Input */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 16, borderTopWidth: 1, borderTopColor: DIVIDER }}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Add a comment…"
            placeholderTextColor={TEXT_MUTED}
            multiline
            maxLength={500}
            style={{ flex: 1, fontSize: 14, color: TEXT_PRI, backgroundColor: BG_SUBTLE, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, maxHeight: 100 }}
          />
          <Pressable
            onPress={handleSend}
            disabled={!text.trim() || sending}
            style={({ pressed }) => ({
              width: 36, height: 36, borderRadius: 18,
              backgroundColor: text.trim() ? BRAND : BG_SUBTLE,
              alignItems: 'center', justifyContent: 'center',
              opacity: pressed || sending ? 0.6 : 1,
            })}
          >
            {sending
              ? <ActivityIndicator size="small" color="#fff" />
              : <Ionicons name="arrow-up" size={18} color={text.trim() ? '#fff' : TEXT_MUTED} />
            }
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
});
CommentSheet.displayName = 'CommentSheet';
