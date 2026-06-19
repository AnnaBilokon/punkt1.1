import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { memo, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CommentSheet } from '@/features/social/components/CommentSheet';
import { friendActivityQueryKey, useFriendActivity } from '@/features/social/hooks/useFriendActivity';
import { followersQueryKey, useFollowers } from '@/features/social/hooks/useFollowers';
import { followingQueryKey, useFollowing } from '@/features/social/hooks/useFollowing';
import { useMyActivity } from '@/features/social/hooks/useMyActivity';
import { useNotifications } from '@/features/social/hooks/useNotifications';
import { socialService } from '@/services/social/socialService';
import { useAppStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import type { FriendActivity, PublicProfile } from '@/types';

// ── Design tokens (Figma) ──────────────────────────────────────────────────────
const TEXT_PRI   = '#1c1714';
const TEXT_SEC   = '#6b6560';
const TEXT_MUTED = '#a8a29d';
const BG         = '#ffffff';
const BG_SUBTLE  = '#f7f5f2';
const DIVIDER    = 'rgba(0,0,0,0.08)';
const STAR_GOLD  = '#ba7517';
const STAR_EMPTY = '#d3d1c7';
const FOLLOW_BTN = '#1c1714';
const FOLLOW_TXT = '#7b6ef6';
const DANGER     = '#e5484d';
const BADGE_BG   = '#faeeda';
const BADGE_BOR  = '#fac775';
const BADGE_TXT  = '#633806';

// ── Avatar palette (Figma) ─────────────────────────────────────────────────────
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

const handle = (name: string) => `@${name.toLowerCase().replace(/\s+/g, '')}`;

const fmtRelative = (iso: string) => {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? '1d ago' : `${d}d ago`;
};

const GROUP_LABELS = ['Today', 'Yesterday', 'Earlier this week', 'Earlier'] as const;

const dateGroup = (iso: string) => {
  const d = new Date(iso); d.setHours(0, 0, 0, 0);
  const t = new Date();    t.setHours(0, 0, 0, 0);
  const diff = t.getTime() - d.getTime();
  if (diff <= 0)              return 'Today';
  if (diff <= 86_400_000)     return 'Yesterday';
  if (diff <= 6 * 86_400_000) return 'Earlier this week';
  return 'Earlier';
};

// ── Shared atoms ───────────────────────────────────────────────────────────────

const Av = memo(({ name, url, size, radius }: { name: string; url: string | null; size: number; radius: number }) => {
  const { bg, fg } = pal(name);
  return url ? (
    <Image source={{ uri: url }} style={{ width: size, height: size, borderRadius: radius, backgroundColor: bg }} />
  ) : (
    <View style={{ width: size, height: size, borderRadius: radius, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: size * 0.32, fontWeight: '600', color: fg }}>{inits(name || 'R')}</Text>
    </View>
  );
});
Av.displayName = 'Av';

const BookThumb = memo(({ url, title, w, h, r }: { url: string | null; title: string; w: number; h: number; r: number }) => {
  const { bg, fg } = pal(title);
  return url ? (
    <Image source={{ uri: url }} resizeMode="cover" style={{ width: w, height: h, borderRadius: r, backgroundColor: bg }} />
  ) : (
    <View style={{ width: w, height: h, borderRadius: r, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 9, fontWeight: '700', color: fg }}>{title.slice(0, 2).toUpperCase()}</Text>
    </View>
  );
});
BookThumb.displayName = 'BookThumb';

const StarRating = memo(({ rating }: { rating: number | undefined }) => {
  if (!rating) return null;
  return (
    <View style={{ flexDirection: 'row', gap: 1, marginTop: 4 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Text key={i} style={{ fontSize: 12, color: i <= rating ? STAR_GOLD : STAR_EMPTY }}>★</Text>
      ))}
    </View>
  );
});
StarRating.displayName = 'StarRating';

const ReviewExcerpt = memo(({ text, spoiler }: { text: string | undefined; spoiler?: boolean }) => {
  const [revealed, setRevealed] = useState(false);
  if (!text) return null;
  if (spoiler && !revealed) {
    return (
      <Pressable
        onPress={() => setRevealed(true)}
        style={{ marginTop: 7, padding: 10, backgroundColor: '#fef3c7', borderLeftWidth: 2, borderLeftColor: '#f59e0b', borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 7 }}
      >
        <Ionicons name="eye-off-outline" size={13} color="#92400e" />
        <Text style={{ fontSize: 12, color: '#92400e', fontWeight: '600' }}>Spoiler — tap to reveal</Text>
      </Pressable>
    );
  }
  return (
    <View style={{ marginTop: 7, padding: 10, backgroundColor: 'rgba(0,0,0,0.04)', borderLeftWidth: 2, borderLeftColor: 'rgba(0,0,0,0.12)', borderRadius: 8 }}>
      {spoiler && <Text style={{ fontSize: 10, fontWeight: '600', color: '#92400e', marginBottom: 4 }}>⚠ SPOILER</Text>}
      <Text style={{ fontSize: 12, color: TEXT_SEC, lineHeight: 18, fontStyle: 'italic' }}>"{text}"</Text>
    </View>
  );
});
ReviewExcerpt.displayName = 'ReviewExcerpt';

const BadgePill = memo(({ name }: { name: string }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', marginTop: 6, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 99, backgroundColor: BADGE_BG, borderWidth: 0.5, borderColor: BADGE_BOR }}>
    <Text style={{ fontSize: 12 }}>🏆</Text>
    <Text style={{ fontSize: 11, fontWeight: '600', color: BADGE_TXT }}>{name}</Text>
  </View>
));
BadgePill.displayName = 'BadgePill';

const SectionLabel = memo(({ label }: { label: string }) => (
  <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 }}>
    <Text style={{ fontSize: 10, fontWeight: '700', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: 0.5 }}>
      {label}
    </Text>
  </View>
));
SectionLabel.displayName = 'SectionLabel';

// Skeleton row shown while loading
const SkeletonRow = () => (
  <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: DIVIDER }}>
    <View style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: BG_SUBTLE }} />
    <View style={{ flex: 1, gap: 7 }}>
      <View style={{ width: '70%', height: 12, borderRadius: 6, backgroundColor: BG_SUBTLE }} />
      <View style={{ width: '30%', height: 10, borderRadius: 6, backgroundColor: BG_SUBTLE }} />
    </View>
    <View style={{ width: 34, height: 48, borderRadius: 4, backgroundColor: BG_SUBTLE }} />
  </View>
);

// ── Activity tab types & helpers ───────────────────────────────────────────────

type Rxn = { liked: boolean; count: number };

// Batch consecutive same-user TBR events within the same date group
type TbrBatch = {
  _type: 'batch';
  id: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  covers: Array<{ title: string; url: string | null }>;
  date: string;
};

type DisplayItem = (FriendActivity & { _type?: undefined }) | TbrBatch;

function batchFeed(feed: FriendActivity[]): DisplayItem[] {
  const result: DisplayItem[] = [];
  for (const item of feed) {
    if (item.action !== 'want-to-read') {
      result.push(item);
      continue;
    }
    const last = result[result.length - 1];
    if (last && last._type === 'batch' && last.userId === item.userId && dateGroup(last.date) === dateGroup(item.date)) {
      last.covers.push({ title: item.bookTitle, url: item.bookCover });
    } else {
      result.push({ _type: 'batch', id: item.userId + item.date, userId: item.userId, displayName: item.displayName, avatarUrl: item.avatarUrl, covers: [{ title: item.bookTitle, url: item.bookCover }], date: item.date });
    }
  }
  return result;
}

// ── Activity card ──────────────────────────────────────────────────────────────

const ActivityCard = memo(({ item, rxn, onLike, onComment, onPress }: {
  item: DisplayItem;
  rxn: Rxn;
  onLike: () => void;
  onComment: () => void;
  onPress: () => void;
}) => {
  if (item._type === 'batch') {
    return (
      <View style={{ borderBottomWidth: 1, borderBottomColor: DIVIDER, backgroundColor: BG }}>
        <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4, gap: 10 }}>
            <Av name={item.displayName} url={item.avatarUrl} size={34} radius={8} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, color: TEXT_PRI, lineHeight: 19 }}>
                <Text style={{ fontWeight: '600' }}>{item.displayName}</Text>
                <Text>{` added ${item.covers.length} book${item.covers.length > 1 ? 's' : ''} to TBR`}</Text>
              </Text>
              <Text style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 2 }}>{fmtRelative(item.date)}</Text>
              <View style={{ flexDirection: 'row', gap: 5, marginTop: 7 }}>
                {item.covers.slice(0, 4).map((c, i) => (
                  <BookThumb key={i} url={c.url} title={c.title} w={28} h={38} r={3} />
                ))}
              </View>
            </View>
          </View>
        </Pressable>
        <View style={{ paddingHorizontal: 16, paddingBottom: 14 }}>
          <ReactionBar rxn={rxn} commentCount={0} showComment={false} onLike={onLike} onComment={onComment} />
        </View>
      </View>
    );
  }

  const showCover  = item.action === 'completed' || item.action === 'reading';
  const showStars  = (item.action === 'completed' || item.action === 'rated') && !!item.rating;
  const showReview = !!item.reviewText;
  const showBadge  = item.action === 'badge' && !!item.badgeName;

  const actionText =
    item.action === 'completed'    ? 'finished' :
    item.action === 'reading'      ? 'started reading' :
    item.action === 'want-to-read' ? 'added' :
    item.action === 'rated'        ? 'rated' :
    item.action === 'review'       ? 'wrote a review for' :
    item.action === 'badge'        ? 'earned a new badge' :
    item.action === 'club'         ? 'joined a book club' : '';

  const actionSuffix = item.action === 'want-to-read' ? ' to TBR' : '';

  return (
    <View style={{ borderBottomWidth: 1, borderBottomColor: DIVIDER, backgroundColor: BG }}>
      <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4, gap: 10 }}>
          <Av name={item.displayName} url={item.avatarUrl} size={34} radius={8} />

          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, color: TEXT_PRI, lineHeight: 19 }}>
              <Text style={{ fontWeight: '600' }}>{item.displayName}</Text>
              <Text>{` ${actionText} `}</Text>
              {item.bookTitle ? <Text style={{ fontStyle: 'italic' }}>{item.bookTitle}</Text> : null}
              {actionSuffix ? <Text>{actionSuffix}</Text> : null}
            </Text>

            <Text style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 2 }}>{fmtRelative(item.date)}</Text>

            {showStars  && <StarRating rating={item.rating} />}
            {showReview && <ReviewExcerpt text={item.reviewText} spoiler={item.reviewSpoiler === true} />}
            {showBadge  && <BadgePill name={item.badgeName!} />}
          </View>

          {showCover && <BookThumb url={item.bookCover} title={item.bookTitle} w={34} h={48} r={4} />}
        </View>
      </Pressable>
      <View style={{ paddingHorizontal: 16, paddingBottom: 14 }}>
        <ReactionBar rxn={rxn} commentCount={item.commentCount ?? 0} showComment onLike={onLike} onComment={onComment} />
      </View>
    </View>
  );
});
ActivityCard.displayName = 'ActivityCard';

const ReactionBar = memo(({ rxn, commentCount, showComment, onLike, onComment }: { rxn: Rxn; commentCount: number; showComment: boolean; onLike: () => void; onComment: () => void }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 9 }}>
    <Pressable hitSlop={8} onPress={onLike} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Text style={{ fontSize: 14, color: rxn.liked ? DANGER : TEXT_MUTED }}>{rxn.liked ? '♥' : '♡'}</Text>
      {rxn.count > 0 && <Text style={{ fontSize: 12, color: TEXT_MUTED }}>{rxn.count}</Text>}
    </Pressable>
    {showComment && (
      <Pressable hitSlop={8} onPress={onComment} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <Text style={{ fontSize: 13, color: TEXT_MUTED }}>💬</Text>
        {commentCount > 0 && <Text style={{ fontSize: 12, color: TEXT_MUTED }}>{commentCount}</Text>}
      </Pressable>
    )}
  </View>
));
ReactionBar.displayName = 'ReactionBar';

// ── Activity tab ───────────────────────────────────────────────────────────────

type CommentTarget = { activityUserId: string; bookApiId: string; bookTitle: string };

const ActivityTab = memo(({ userId, onPeople, onComment }: { userId: string; onPeople: () => void; onComment: (t: CommentTarget) => void }) => {
  const router = useRouter();
  const { data: feed = [], isLoading } = useFriendActivity(userId);
  const { data: myFeed = [] } = useMyActivity(userId);
  const [rxns, setRxns] = useState<Map<string, Rxn>>(new Map());

  const getRxn  = (id: string): Rxn => rxns.get(id) ?? { liked: false, count: 0 };
  const toggle  = (id: string) => setRxns(prev => {
    const next = new Map(prev);
    const cur  = next.get(id) ?? { liked: false, count: 0 };
    next.set(id, { liked: !cur.liked, count: cur.count + (cur.liked ? -1 : 1) });
    return next;
  });

  const groups = useMemo(() => {
    const batched = batchFeed(feed);
    const map = new Map<string, DisplayItem[]>();
    for (const item of batched) {
      const g = dateGroup(item.date);
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(item);
    }
    return GROUP_LABELS.filter(g => map.has(g)).map(g => ({ label: g, items: map.get(g)! }));
  }, [feed]);

  if (isLoading) return (
    <View>
      {[1, 2, 3].map(i => <SkeletonRow key={i} />)}
    </View>
  );

  if (!feed.length) return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 40, paddingTop: 80 }}>
      <Text style={{ fontSize: 40 }}>👥</Text>
      <Text style={{ fontSize: 16, fontWeight: '700', color: TEXT_PRI }}>No activity yet</Text>
      <Text style={{ fontSize: 13, color: TEXT_SEC, textAlign: 'center', lineHeight: 20 }}>
        Follow readers to see what they're reading.
      </Text>
      <Pressable onPress={onPeople} style={({ pressed }) => ({ marginTop: 4, paddingHorizontal: 22, paddingVertical: 10, borderRadius: 99, backgroundColor: FOLLOW_BTN, opacity: pressed ? 0.7 : 1 })}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>Find readers →</Text>
      </Pressable>
    </View>
  );

  return (
    <>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {myFeed.length > 0 && (
          <View>
            <SectionLabel label="Your activity" />
            {myFeed.map((item, i) => {
              const id = `${item.userId}-${item.bookApiId}`;
              return (
                <ActivityCard
                  key={`mine-${i}`}
                  item={item}
                  rxn={getRxn(id)}
                  onLike={() => toggle(id)}
                  onComment={() => onComment({ activityUserId: item.userId, bookApiId: item.bookApiId, bookTitle: item.bookTitle })}
                  onPress={() => router.push(`/book/${item.bookApiId}` as any)}
                />
              );
            })}
          </View>
        )}
        {groups.map(({ label, items }) => (
          <View key={label}>
            <SectionLabel label={label} />
            {items.map((item, i) => {
              const id = item._type === 'batch' ? item.id : `${item.userId}-${item.bookApiId}`;
              const target: CommentTarget | null = item._type === 'batch' ? null : {
                activityUserId: item.userId,
                bookApiId: item.bookApiId,
                bookTitle: item.bookTitle,
              };
              return (
                <ActivityCard
                  key={`${id}-${i}`}
                  item={item}
                  rxn={getRxn(id)}
                  onLike={() => toggle(id)}
                  onComment={() => target && onComment(target)}
                  onPress={() => router.push(`/user/${item.userId}` as any)}
                />
              );
            })}
          </View>
        ))}
      </ScrollView>
    </>
  );
});
ActivityTab.displayName = 'ActivityTab';

// ── People tab ─────────────────────────────────────────────────────────────────

type PMode = 'following' | 'followers';

const PersonRow = memo(({ user, isFollowing, isFollowBack, toggling, onToggle, onPress }: {
  user: PublicProfile;
  isFollowing: boolean;
  isFollowBack: boolean;
  toggling: boolean;
  onToggle: () => void;
  onPress: () => void;
}) => {
  const btnLabel = isFollowing ? 'Following' : isFollowBack ? 'Follow back' : 'Follow';

  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ borderBottomWidth: 1, borderBottomColor: DIVIDER, backgroundColor: pressed ? BG_SUBTLE : BG })}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12 }}>
        <Av name={user.displayName} url={user.avatarUrl} size={44} radius={10} />

        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: '600', color: TEXT_PRI }}>{user.displayName}</Text>
          <Text numberOfLines={1} style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 1 }}>{handle(user.displayName)}</Text>
          {user.currentlyReading && (
            <Text numberOfLines={1} style={{ fontSize: 11, color: TEXT_SEC, marginTop: 2 }}>📖 {user.currentlyReading}</Text>
          )}
        </View>

        <Pressable
          disabled={toggling}
          onPress={e => { e.stopPropagation?.(); onToggle(); }}
          style={({ pressed }) => ({
            paddingHorizontal: 14, paddingVertical: 6, borderRadius: 99,
            backgroundColor: isFollowing ? FOLLOW_BTN : BG,
            borderWidth: 1, borderColor: FOLLOW_BTN,
            opacity: toggling || pressed ? 0.5 : 1,
          })}
        >
          <Text style={{ fontSize: 12, fontWeight: '700', color: isFollowing ? '#fff' : FOLLOW_BTN }}>
            {btnLabel}
          </Text>
        </Pressable>
      </View>
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

  const followingIds  = useMemo(() => new Set(following.map((f: PublicProfile) => f.id)), [following]);
  const followerIds   = useMemo(() => new Set(followers.map((f: PublicProfile) => f.id)), [followers]);

  const suggestions = useMemo(
    () => followers.filter((f: PublicProfile) => !followingIds.has(f.id) && !dismissed.has(f.id)).slice(0, 6),
    [followers, followingIds, dismissed],
  );

  const list: PublicProfile[] = mode === 'following' ? following : followers;
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

  return (
    <View style={{ flex: 1 }}>
      {/* Search pill */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: DIVIDER }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: BG_SUBTLE, borderRadius: 99, paddingHorizontal: 14, height: 36, gap: 8 }}>
          <Text style={{ fontSize: 14, color: TEXT_MUTED }}>🔍</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search readers…"
            placeholderTextColor={TEXT_MUTED}
            autoCapitalize="none"
            style={{ flex: 1, fontSize: 13, color: TEXT_PRI, padding: 0 }}
          />
          {search.length > 0 && (
            <Pressable hitSlop={8} onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={15} color={TEXT_MUTED} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Sub-tabs — Following · N | Followers · N */}
      <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: DIVIDER }}>
        {(['following', 'followers'] as PMode[]).map(m => {
          const active = mode === m;
          const count  = m === 'following' ? following.length : followers.length;
          return (
            <Pressable key={m} onPress={() => setMode(m)} style={{ flex: 1, alignItems: 'center', paddingVertical: 10, borderBottomWidth: active ? 2 : 0, borderBottomColor: TEXT_PRI }}>
              <Text style={{ fontSize: 13, fontWeight: active ? '600' : '400', color: active ? TEXT_PRI : TEXT_MUTED }}>
                {m === 'following' ? 'Following' : 'Followers'}{count > 0 ? ` · ${count}` : ''}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Suggested strip */}
        {suggestions.length > 0 && !search && (
          <View style={{ backgroundColor: BG_SUBTLE, borderBottomWidth: 1, borderBottomColor: DIVIDER, paddingBottom: 12 }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8 }}>
              Suggested Readers
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
              {suggestions.map((u: PublicProfile) => {
                const { bg, fg } = pal(u.displayName);
                return (
                  <Pressable key={u.id} onPress={() => void (async () => { setDismissed(prev => new Set([...prev, u.id])); await doToggle(u.id); })()} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 5, paddingLeft: 5, paddingRight: 10, borderRadius: 99, backgroundColor: BG, borderWidth: 1, borderColor: DIVIDER, opacity: pressed ? 0.6 : 1 })}>
                    <View style={{ width: 24, height: 24, borderRadius: 6, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 9, fontWeight: '600', color: fg }}>{inits(u.displayName)}</Text>
                    </View>
                    <Text style={{ fontSize: 12, color: TEXT_PRI }}>{u.displayName.split(' ')[0]}</Text>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: FOLLOW_TXT }}>+ Follow</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}

        {loading ? (
          <View>{[1, 2, 3, 4].map(i => <SkeletonRow key={i} />)}</View>
        ) : !list.length ? (
          <View style={{ alignItems: 'center', paddingTop: 52, gap: 8 }}>
            <Ionicons name="person-add-outline" size={36} color="#d9d9d9" />
            <Text style={{ fontSize: 15, fontWeight: '600', color: TEXT_PRI }}>
              {mode === 'following' ? 'Not following anyone yet' : 'No followers yet'}
            </Text>
          </View>
        ) : !filtered.length ? (
          <View style={{ alignItems: 'center', paddingTop: 52 }}>
            <Text style={{ fontSize: 13, color: TEXT_SEC }}>No results for "{search}"</Text>
          </View>
        ) : (
          filtered.map((u: PublicProfile) => (
            <PersonRow
              key={u.id}
              user={u}
              isFollowing={followingIds.has(u.id)}
              isFollowBack={mode === 'followers' && !followingIds.has(u.id) && followerIds.has(u.id)}
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
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('activity');
  const [commentTarget, setCommentTarget] = useState<CommentTarget | null>(null);
  const lastRead = useAppStore(s => s.notificationsLastRead);
  const { data: notifs = [] } = useNotifications(userId);
  const unreadCount = notifs.filter(n => !lastRead || new Date(n.createdAt) > new Date(lastRead)).length;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: BG }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 14 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: TEXT_PRI }}>Friends</Text>
        <Pressable
          hitSlop={8}
          onPress={() => router.push('/notifications' as any)}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <View style={{ position: 'relative' }}>
            <Ionicons name="notifications-outline" size={24} color={TEXT_PRI} />
            {unreadCount > 0 && (
              <View style={{ position: 'absolute', top: -4, right: -5, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: DANGER, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: '#fff' }}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </View>
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', marginTop: 12 }}>
        {(['activity', 'people'] as Tab[]).map(t => {
          const active = tab === t;
          return (
            <Pressable key={t} onPress={() => setTab(t)} style={{ flex: 1, alignItems: 'center', paddingVertical: 10, borderBottomWidth: active ? 2 : 1, borderBottomColor: active ? TEXT_PRI : DIVIDER }}>
              <Text style={{ fontSize: 14, fontWeight: active ? '600' : '400', color: active ? TEXT_PRI : TEXT_MUTED }}>
                {t === 'activity' ? 'Activity' : 'People'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {userId !== null && (
        <View style={{ flex: 1 }}>
          {tab === 'activity' && <ActivityTab userId={userId} onPeople={() => setTab('people')} onComment={setCommentTarget} />}
          {tab === 'people'   && <PeopleTab userId={userId} />}
        </View>
      )}

      <CommentSheet
        activityUserId={commentTarget?.activityUserId ?? ''}
        bookApiId={commentTarget?.bookApiId ?? ''}
        bookTitle={commentTarget?.bookTitle ?? ''}
        visible={!!commentTarget}
        onClose={() => setCommentTarget(null)}
      />
    </SafeAreaView>
  );
});
FriendsScreen.displayName = 'FriendsScreen';
