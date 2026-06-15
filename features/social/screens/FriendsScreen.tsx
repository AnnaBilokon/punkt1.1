import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { memo, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { friendActivityQueryKey, useFriendActivity } from '@/features/social/hooks/useFriendActivity';
import { followersQueryKey, useFollowers } from '@/features/social/hooks/useFollowers';
import { followingQueryKey, useFollowing } from '@/features/social/hooks/useFollowing';
import { socialService } from '@/services/social/socialService';
import { useAuthStore } from '@/store/authStore';
import type { FriendActivity, PublicProfile } from '@/types';

// ── Tokens ────────────────────────────────────────────────────────────────────
const C = {
  textPrimary:   '#1C1714',
  textSecondary: '#6B6560',
  textMuted:     '#A8A29D',
  bgPage:        '#F7F5F2',
  bgCard:        '#FFFFFF',
  bgSubtle:      '#EEEAE5',
  border:        'rgba(0,0,0,0.07)',
  borderMed:     'rgba(0,0,0,0.1)',
  starGold:      '#BA7517',
  starEmpty:     '#D3D1C7',
  danger:        '#E24B4A',
  accent:        '#7851A9',
  activeLine:    '#1C1714',
};

// ── Avatar palette ─────────────────────────────────────────────────────────────
const PALETTE = [
  { bg: '#E1F5EE', fg: '#085041' },
  { bg: '#FAEEDA', fg: '#633806' },
  { bg: '#EEEDFE', fg: '#3C3489' },
  { bg: '#E6F1FB', fg: '#185FA5' },
  { bg: '#FBEAF0', fg: '#72243E' },
  { bg: '#EAF3DE', fg: '#3B6D11' },
  { bg: '#F5EDFB', fg: '#5C2D91' },
  { bg: '#FEF3E2', fg: '#7A4210' },
];

const palette = (name: string) => {
  const idx = ((name.charCodeAt(0) ?? 0) + (name.charCodeAt(1) ?? 0)) % PALETTE.length;
  return PALETTE[idx]!;
};

const inits = (name: string) => {
  const p = name.trim().split(' ');
  return p.length >= 2
    ? `${p[0]![0] ?? ''}${p[1]![0] ?? ''}`.toUpperCase()
    : name.slice(0, 2).toUpperCase();
};

const fmtRelative = (iso: string) => {
  const d = Date.now() - new Date(iso).getTime();
  const m = Math.floor(d / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const dateGroup = (iso: string) => {
  const d = new Date(iso); d.setHours(0, 0, 0, 0);
  const t = new Date(); t.setHours(0, 0, 0, 0);
  const diff = t.getTime() - d.getTime();
  if (diff <= 0) return 'Today';
  if (diff <= 86_400_000) return 'Yesterday';
  if (diff <= 6 * 86_400_000) return 'Earlier this week';
  return 'Earlier';
};
const GROUP_ORDER = ['Today', 'Yesterday', 'Earlier this week', 'Earlier'];

// ── Atoms ─────────────────────────────────────────────────────────────────────

const Avatar = memo(({ name, url, size, r }: { name: string; url: string | null; size: number; r: number }) => {
  const { bg, fg } = palette(name);
  return url ? (
    <Image source={{ uri: url }} style={{ width: size, height: size, borderRadius: r, backgroundColor: bg }} />
  ) : (
    <View style={{ width: size, height: size, borderRadius: r, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: size * 0.32, fontWeight: '600', color: fg }}>{inits(name || 'R')}</Text>
    </View>
  );
});
Avatar.displayName = 'Avatar';

const Cover = memo(({ url, title, w = 34, h = 48 }: { url: string | null; title: string; w?: number; h?: number }) => {
  const { bg, fg } = palette(title);
  return url ? (
    <Image source={{ uri: url }} resizeMode="cover" style={{ width: w, height: h, borderRadius: 4, backgroundColor: '#eee' }} />
  ) : (
    <View style={{ width: w, height: h, borderRadius: 4, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 10, fontWeight: '700', color: fg }}>{title.slice(0, 2).toUpperCase()}</Text>
    </View>
  );
});
Cover.displayName = 'Cover';

const SectionLbl = ({ label }: { label: string }) => (
  <Text style={{ fontSize: 10, fontWeight: '600', color: C.textMuted, letterSpacing: 0.8, textTransform: 'uppercase', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 }}>
    {label}
  </Text>
);

// ── Activity tab ───────────────────────────────────────────────────────────────

type Reaction = { liked: boolean; count: number };

const ActivityCard = memo(({ item, rxn, onLike, onPress }: {
  item: FriendActivity;
  rxn: Reaction;
  onLike: () => void;
  onPress: () => void;
}) => {
  const showCover = item.action !== 'want-to-read';
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        paddingHorizontal: 16,
        paddingVertical: 11,
        borderBottomWidth: 1,
        borderBottomColor: C.border,
        backgroundColor: pressed ? C.bgSubtle : C.bgPage,
      })}
    >
      <Avatar name={item.displayName} url={item.avatarUrl} size={34} r={8} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 13, color: C.textPrimary, lineHeight: 19 }}>
          <Text style={{ fontWeight: '600' }}>{item.displayName}</Text>
          {item.action === 'want-to-read' ? (
            <><Text style={{ fontWeight: '400' }}> added </Text><Text style={{ fontStyle: 'italic' }}>{item.bookTitle}</Text><Text style={{ fontWeight: '400' }}> to TBR</Text></>
          ) : item.action === 'completed' ? (
            <><Text style={{ fontWeight: '400' }}> finished </Text><Text style={{ fontStyle: 'italic' }}>{item.bookTitle}</Text></>
          ) : (
            <><Text style={{ fontWeight: '400' }}> started reading </Text><Text style={{ fontStyle: 'italic' }}>{item.bookTitle}</Text></>
          )}
        </Text>
        <Text style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{fmtRelative(item.date)}</Text>
        {item.action === 'completed' && (
          <Text style={{ fontSize: 12, letterSpacing: 1.5, marginTop: 4 }}>
            <Text style={{ color: C.starGold }}>{'★★★★'}</Text>
            <Text style={{ color: C.starEmpty }}>{'☆'}</Text>
          </Text>
        )}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 8 }}>
          <Pressable hitSlop={8} onPress={onLike} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name={rxn.liked ? 'heart' : 'heart-outline'} size={14} color={rxn.liked ? C.danger : C.textMuted} />
            {rxn.count > 0 && <Text style={{ fontSize: 12, color: rxn.liked ? C.danger : C.textMuted }}>{rxn.count}</Text>}
          </Pressable>
          <Pressable hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="chatbubble-outline" size={13} color={C.textMuted} />
          </Pressable>
        </View>
      </View>
      {showCover && <Cover url={item.bookCover} title={item.bookTitle} />}
    </Pressable>
  );
});
ActivityCard.displayName = 'ActivityCard';

const ActivityTab = memo(({ userId, onPeople }: { userId: string; onPeople: () => void }) => {
  const router = useRouter();
  const { data: feed = [], isLoading } = useFriendActivity(userId);
  const [rxns, setRxns] = useState<Map<string, Reaction>>(new Map());

  const getRxn = (id: string): Reaction => rxns.get(id) ?? { liked: false, count: 0 };
  const toggleLike = (id: string) => setRxns(prev => {
    const next = new Map(prev);
    const cur = next.get(id) ?? { liked: false, count: 0 };
    next.set(id, { liked: !cur.liked, count: cur.count + (cur.liked ? -1 : 1) });
    return next;
  });

  const groups = useMemo(() => {
    const map = new Map<string, FriendActivity[]>();
    for (const item of feed) {
      const g = dateGroup(item.date);
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(item);
    }
    return GROUP_ORDER.filter(g => map.has(g)).map(g => ({ label: g, items: map.get(g)! }));
  }, [feed]);

  if (isLoading) return <ActivityIndicator color={C.accent} style={{ marginTop: 48 }} />;

  if (!feed.length) return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 40 }}>
      <Ionicons name="people-outline" size={40} color="#d5cfc9" />
      <Text style={{ fontSize: 16, fontWeight: '700', color: C.textPrimary, textAlign: 'center' }}>No activity yet</Text>
      <Text style={{ fontSize: 13, color: C.textSecondary, textAlign: 'center', lineHeight: 20 }}>Follow readers to see what they're reading.</Text>
      <Pressable onPress={onPeople} style={{ marginTop: 4, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 99, backgroundColor: C.textPrimary }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: '#fff' }}>Find readers →</Text>
      </Pressable>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
      {groups.map(({ label, items }) => (
        <View key={label}>
          <SectionLbl label={label} />
          {items.map((item, i) => {
            const id = `${item.userId}-${item.bookApiId}`;
            return <ActivityCard key={`${id}-${i}`} item={item} rxn={getRxn(id)} onLike={() => toggleLike(id)} onPress={() => router.push(`/user/${item.userId}` as any)} />;
          })}
        </View>
      ))}
    </ScrollView>
  );
});
ActivityTab.displayName = 'ActivityTab';

// ── People tab ─────────────────────────────────────────────────────────────────

type PMode = 'following' | 'followers';

const PersonRow = memo(({ user, isFollowing, showFollowBack, toggling, onToggle, onPress }: {
  user: PublicProfile;
  isFollowing: boolean;
  showFollowBack: boolean;
  toggling: boolean;
  onToggle: () => void;
  onPress: () => void;
}) => {
  const { bg, fg } = palette(user.displayName);
  const label = isFollowing ? 'Following' : showFollowBack ? 'Follow back' : 'Follow';
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 11,
        paddingHorizontal: 14,
        paddingVertical: 11,
        borderBottomWidth: 1,
        borderBottomColor: C.border,
        backgroundColor: pressed ? C.bgSubtle : C.bgPage,
      })}
    >
      {user.avatarUrl ? (
        <Image source={{ uri: user.avatarUrl }} style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: bg }} />
      ) : (
        <View style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: fg }}>{inits(user.displayName)}</Text>
        </View>
      )}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: '500', color: C.textPrimary }}>{user.displayName}</Text>
      </View>
      <Pressable
        disabled={toggling}
        onPress={(e) => { e.stopPropagation?.(); onToggle(); }}
        style={{
          paddingHorizontal: 13,
          paddingVertical: 6,
          borderRadius: 99,
          borderWidth: 0.5,
          borderColor: isFollowing ? C.textPrimary : C.borderMed,
          backgroundColor: isFollowing ? C.textPrimary : 'transparent',
          opacity: toggling ? 0.4 : 1,
        }}
      >
        <Text style={{ fontSize: 12, fontWeight: '500', color: isFollowing ? '#fff' : C.textPrimary }}>{label}</Text>
      </Pressable>
    </Pressable>
  );
});
PersonRow.displayName = 'PersonRow';

const PeopleTab = memo(({ userId }: { userId: string }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<PMode>('following');
  const [search, setSearch] = useState('');
  const [toggling, setToggling] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const { data: following = [], isLoading: lfg } = useFollowing(userId);
  const { data: followers = [], isLoading: lfr } = useFollowers(userId);

  const followingIds = useMemo(() => new Set(following.map((f: PublicProfile) => f.id)), [following]);

  const suggestions = useMemo(
    () => followers.filter((f: PublicProfile) => !followingIds.has(f.id) && !dismissed.has(f.id)).slice(0, 8),
    [followers, followingIds, dismissed],
  );

  const list = mode === 'following' ? following : followers;
  const loading = mode === 'following' ? lfg : lfr;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? list.filter((u: PublicProfile) => u.displayName.toLowerCase().includes(q)) : list;
  }, [list, search]);

  const doToggle = async (targetId: string) => {
    if (toggling) return;
    setToggling(targetId);
    try {
      if (followingIds.has(targetId)) {
        await socialService.unfollow(userId, targetId);
      } else {
        await socialService.follow(userId, targetId);
      }
      await queryClient.invalidateQueries({ queryKey: followingQueryKey(userId) });
      await queryClient.invalidateQueries({ queryKey: followersQueryKey(userId) });
      await queryClient.invalidateQueries({ queryKey: friendActivityQueryKey(userId) });
    } finally {
      setToggling(null);
    }
  };

  const onRowToggle = (id: string, name: string) => {
    if (followingIds.has(id)) {
      Alert.alert(`Unfollow ${name}?`, undefined, [
        { style: 'cancel', text: 'Cancel' },
        { style: 'destructive', text: 'Unfollow', onPress: () => void doToggle(id) },
      ]);
    } else {
      void doToggle(id);
    }
  };

  const onFollowChip = async (id: string) => {
    setDismissed(prev => new Set([...prev, id]));
    await doToggle(id);
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Search */}
      <View style={{ paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.bgSubtle, borderRadius: 99, borderWidth: 0.5, borderColor: C.borderMed, paddingHorizontal: 12, height: 36, gap: 7 }}>
          <Ionicons name="search" size={14} color={C.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search readers…"
            placeholderTextColor={C.textMuted}
            autoCapitalize="none"
            style={{ flex: 1, fontSize: 13, color: C.textPrimary, padding: 0 }}
          />
          {search.length > 0 && (
            <Pressable hitSlop={8} onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={14} color={C.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Sub-tabs */}
      <View style={{ flexDirection: 'row' }}>
        {(['following', 'followers'] as PMode[]).map(m => {
          const active = mode === m;
          const count = m === 'following' ? following.length : followers.length;
          return (
            <Pressable
              key={m}
              onPress={() => setMode(m)}
              style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5, paddingVertical: 10, borderBottomWidth: active ? 2 : 1, borderBottomColor: active ? C.activeLine : C.border }}
            >
              <Text style={{ fontSize: 13, fontWeight: active ? '500' : '400', color: active ? C.textPrimary : C.textMuted }}>
                {m === 'following' ? 'Following' : 'Followers'}
              </Text>
              {count > 0 && <Text style={{ fontSize: 11, color: C.textMuted }}>{count}</Text>}
            </Pressable>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Suggested strip */}
        {suggestions.length > 0 && !search && (
          <View style={{ backgroundColor: C.bgSubtle, borderBottomWidth: 1, borderBottomColor: C.border, paddingBottom: 12 }}>
            <SectionLbl label="Suggested readers" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 14, gap: 7 }}>
              {suggestions.map((u: PublicProfile) => {
                const { bg, fg } = palette(u.displayName);
                return (
                  <Pressable key={u.id} onPress={() => void onFollowChip(u.id)} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 5, paddingBottom: 5, paddingLeft: 5, paddingRight: 10, borderRadius: 99, borderWidth: 0.5, borderColor: C.borderMed, backgroundColor: C.bgCard, opacity: pressed ? 0.7 : 1 })}>
                    <View style={{ width: 24, height: 24, borderRadius: 6, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 9, fontWeight: '600', color: fg }}>{inits(u.displayName)}</Text>
                    </View>
                    <Text style={{ fontSize: 12, color: C.textPrimary }}>{u.displayName.split(' ')[0]}</Text>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: C.accent }}>+ Follow</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* List */}
        {loading ? (
          <ActivityIndicator color={C.accent} style={{ marginTop: 48 }} />
        ) : !list.length ? (
          <View style={{ alignItems: 'center', paddingTop: 52, gap: 10 }}>
            <Ionicons name="person-add-outline" size={40} color="#d5cfc9" />
            <Text style={{ fontSize: 15, fontWeight: '600', color: C.textPrimary }}>{mode === 'following' ? "Not following anyone yet" : 'No followers yet'}</Text>
          </View>
        ) : !filtered.length ? (
          <View style={{ alignItems: 'center', paddingTop: 52 }}>
            <Text style={{ fontSize: 13, color: C.textSecondary }}>No readers found for "{search}"</Text>
          </View>
        ) : (
          filtered.map((u: PublicProfile) => (
            <PersonRow
              key={u.id}
              user={u}
              isFollowing={followingIds.has(u.id)}
              showFollowBack={mode === 'followers' && !followingIds.has(u.id)}
              toggling={toggling === u.id}
              onToggle={() => onRowToggle(u.id, u.displayName)}
              onPress={() => router.push(`/user/${u.id}` as any)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
});
PeopleTab.displayName = 'PeopleTab';

// ── Screen ─────────────────────────────────────────────────────────────────────

type Tab = 'activity' | 'people';

export const FriendsScreen = memo(() => {
  const userId = useAuthStore(s => s.user?.id ?? null);
  const [tab, setTab] = useState<Tab>('activity');

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: C.bgPage }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 0 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: C.textPrimary }}>Friends</Text>
      </View>
      <View style={{ flexDirection: 'row', marginTop: 12 }}>
        {(['activity', 'people'] as Tab[]).map(t => {
          const active = tab === t;
          return (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              style={{ flex: 1, alignItems: 'center', paddingVertical: 11, borderBottomWidth: active ? 2 : 1, borderBottomColor: active ? C.activeLine : C.border }}
            >
              <Text style={{ fontSize: 14, fontWeight: active ? '600' : '400', color: active ? C.textPrimary : C.textMuted }}>
                {t === 'activity' ? 'Activity' : 'People'}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {userId !== null && (
        <View style={{ flex: 1 }}>
          {tab === 'activity' && <ActivityTab userId={userId} onPeople={() => setTab('people')} />}
          {tab === 'people' && <PeopleTab userId={userId} />}
        </View>
      )}
    </SafeAreaView>
  );
});
FriendsScreen.displayName = 'FriendsScreen';
