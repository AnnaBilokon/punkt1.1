import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { memo, useEffect } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useNotifications } from '@/features/social/hooks/useNotifications';
import { useAppStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import type { AppNotification } from '@/types';

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
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const Av = ({ name, url, size }: { name: string; url: string | null; size: number }) => {
  const { bg, fg } = pal(name);
  return url ? (
    <Image source={{ uri: url }} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg }} />
  ) : (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: size * 0.34, fontWeight: '600', color: fg }}>{inits(name)}</Text>
    </View>
  );
};

const NotifRow = memo(({ notif, isUnread, onPress }: {
  notif: AppNotification;
  isUnread: boolean;
  onPress: () => void;
}) => {
  const body = notif.type === 'follow'
    ? <Text style={{ fontSize: 13, color: TEXT_SEC, lineHeight: 19 }}>
        <Text style={{ fontWeight: '600', color: TEXT_PRI }}>{notif.fromDisplayName}</Text>
        {' started following you'}
      </Text>
    : <Text style={{ fontSize: 13, color: TEXT_SEC, lineHeight: 19 }}>
        <Text style={{ fontWeight: '600', color: TEXT_PRI }}>{notif.fromDisplayName}</Text>
        {' commented on your '}
        {notif.bookTitle
          ? <Text style={{ fontStyle: 'italic' }}>{notif.bookTitle}</Text>
          : 'activity'}
        {notif.commentText ? <Text style={{ color: TEXT_MUTED }}>{`: "${notif.commentText}"`}</Text> : null}
      </Text>;

  const icon = notif.type === 'follow'
    ? <View style={{ position: 'absolute', bottom: -2, right: -2, width: 18, height: 18, borderRadius: 9, backgroundColor: BRAND, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: BG }}>
        <Ionicons name="person-add" size={9} color="#fff" />
      </View>
    : <View style={{ position: 'absolute', bottom: -2, right: -2, width: 18, height: 18, borderRadius: 9, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: BG }}>
        <Ionicons name="chatbubble" size={9} color="#fff" />
      </View>;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 13,
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: DIVIDER,
        backgroundColor: isUnread ? '#f0ebfa' : BG,
        opacity: pressed ? 0.75 : 1,
      })}
    >
      <View style={{ position: 'relative' }}>
        <Av name={notif.fromDisplayName} url={notif.fromAvatarUrl} size={42} />
        {icon}
      </View>
      <View style={{ flex: 1 }}>
        {body}
        <Text style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 3 }}>{fmtRelative(notif.createdAt)}</Text>
      </View>
      {isUnread && (
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: BRAND, marginTop: 6 }} />
      )}
    </Pressable>
  );
});
NotifRow.displayName = 'NotifRow';

export const NotificationsScreen = memo(() => {
  const router = useRouter();
  const userId = useAuthStore(s => s.user?.id ?? null);
  const lastRead = useAppStore(s => s.notificationsLastRead);
  const markRead = useAppStore(s => s.markNotificationsRead);
  const { data: notifs = [], isLoading } = useNotifications(userId);

  useEffect(() => {
    markRead();
  }, [markRead]);

  const isUnread = (n: AppNotification) =>
    !lastRead || new Date(n.createdAt) > new Date(lastRead);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: BG }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: DIVIDER }}>
        <Pressable hitSlop={8} onPress={() => router.back()} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, marginRight: 8 })}>
          <Ionicons name="chevron-back" size={24} color={TEXT_PRI} />
        </Pressable>
        <Text style={{ fontSize: 18, fontWeight: '700', color: TEXT_PRI }}>Notifications</Text>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={BRAND} />
        </View>
      ) : !notifs.length ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 40 }}>
          <Text style={{ fontSize: 40 }}>🔔</Text>
          <Text style={{ fontSize: 16, fontWeight: '700', color: TEXT_PRI }}>No notifications yet</Text>
          <Text style={{ fontSize: 13, color: TEXT_SEC, textAlign: 'center', lineHeight: 20 }}>
            When someone follows you or comments on your reading activity, it'll appear here.
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {notifs.map(n => (
            <NotifRow
              key={n.id}
              notif={n}
              isUnread={isUnread(n)}
              onPress={() => router.push(`/user/${n.fromUserId}` as any)}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
});
NotificationsScreen.displayName = 'NotificationsScreen';
