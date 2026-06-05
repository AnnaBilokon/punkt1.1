import { supabase } from '@/services/supabase';

type ActivityRow = { date: string };

const computeStreak = (dates: string[]): { best: number; current: number } => {
  if (dates.length === 0) return { best: 0, current: 0 };

  const unique = [...new Set(dates)].sort().reverse();

  const todayUtc = new Date().toISOString().slice(0, 10);
  const yesterdayUtc = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

  // Current streak: count backwards from today or yesterday
  let current = 0;
  const latestEntry = unique[0];
  if (latestEntry === todayUtc || latestEntry === yesterdayUtc) {
    let ref = latestEntry;
    for (const d of unique) {
      if (d === ref) {
        current++;
        const dt = new Date(ref + 'T12:00:00Z');
        dt.setUTCDate(dt.getUTCDate() - 1);
        ref = dt.toISOString().slice(0, 10);
      } else {
        break;
      }
    }
  }

  // Best streak: longest consecutive run in all history
  const asc = [...unique].reverse();
  let best = asc.length > 0 ? 1 : 0;
  let run = 1;
  for (let i = 1; i < asc.length; i++) {
    const prev = asc[i - 1] ?? '';
    const curr = asc[i] ?? '';
    const diffDays = Math.round(
      (new Date(curr + 'T12:00:00Z').getTime() - new Date(prev + 'T12:00:00Z').getTime()) /
        86_400_000,
    );
    if (diffDays === 1) {
      run++;
      if (run > best) best = run;
    } else {
      run = 1;
    }
  }

  return { best: Math.max(best, current), current };
};

export const streakService = {
  logActivity: async (userId: string): Promise<void> => {
    const today = new Date().toISOString().slice(0, 10);
    await supabase
      .from('reading_activity')
      .upsert({ date: today, user_id: userId }, { onConflict: 'user_id,date' });
  },

  getStreak: async (userId: string): Promise<{ best: number; current: number }> => {
    const { data, error } = await supabase
      .from('reading_activity')
      .select('date')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    if (error) throw new Error(error.message);
    const dates = (data as ActivityRow[]).map((r) => r.date);
    return computeStreak(dates);
  },
};
