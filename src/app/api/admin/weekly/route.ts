import { NextResponse } from 'next/server';
import { getStore } from '@/lib/store';
import type { MoodLogRecord, RiskEventRecord, NotificationRecord } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function weekStart(d: Date): string {
  const c = new Date(d);
  const day = (c.getDay() + 6) % 7; // Monday = 0
  c.setDate(c.getDate() - day);
  return c.toISOString().slice(0, 10);
}
function within(iso: string, days: number): boolean {
  return Date.now() - new Date(iso).getTime() <= days * 24 * 60 * 60 * 1000;
}

/**
 * GET /api/admin/weekly → weekly analytics driven by user check-ins, plus the
 * deeper parameters useful for analysis. Anonymous/aggregate only.
 */
export async function GET() {
  try {
    const store = getStore();
    const [profiles, moods, risks, notifications] = await Promise.all([
      store.allProfiles(),
      store.allMoods(),
      store.allRiskEvents(),
      store.allNotifications(),
    ]);

    // 8-week buckets
    const weeks: string[] = [];
    for (let i = 7; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i * 7);
      weeks.push(weekStart(d));
    }
    const bucket = <T extends { createdAt: string }>(rows: T[]) => {
      const map = new Map<string, T[]>();
      weeks.forEach((w) => map.set(w, []));
      rows.forEach((r) => {
        const w = weekStart(new Date(r.createdAt));
        if (map.has(w)) map.get(w)!.push(r);
      });
      return map;
    };
    const moodW = bucket<MoodLogRecord>(moods);
    const riskW = bucket<RiskEventRecord>(risks);
    const notifW = bucket<NotificationRecord>(notifications);

    const series = weeks.map((w) => {
      const ms = moodW.get(w) ?? [];
      const rs = riskW.get(w) ?? [];
      const ns = notifW.get(w) ?? [];
      return {
        weekStart: w,
        label: new Date(w + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        checkins: ms.length,
        activeUsers: new Set(ms.map((m) => m.profileId)).size,
        avgValence: ms.length ? Number((ms.reduce((s, m) => s + m.valence, 0) / ms.length).toFixed(2)) : 0,
        crisisEvents: rs.filter((r) => r.riskLevel === 'CRISIS').length,
        mediumEvents: rs.filter((r) => r.riskLevel === 'MEDIUM').length,
        proactiveSends: ns.filter((n) => n.type === 'proactive_checkin').length,
        delivered: ns.filter((n) => n.status === 'sent' || n.status === 'delivered').length,
      };
    });

    // Distributions (last 30 days)
    const recentMoods = moods.filter((m) => within(m.createdAt, 30));
    const moodDistribution: Record<string, number> = {};
    const topicDistribution: Record<string, number> = {};
    for (const m of recentMoods) {
      moodDistribution[m.mood] = (moodDistribution[m.mood] ?? 0) + 1;
      topicDistribution[m.topicTag] = (topicDistribution[m.topicTag] ?? 0) + 1;
    }

    // Time-of-day histogram (validates the "2 AM companion" thesis)
    const hourHistogram = Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      count: moods.filter((m) => new Date(m.createdAt).getHours() === h).length,
    }));

    // Deeper parameters
    const totalNotifs = notifications.length;
    const deliveredNotifs = notifications.filter((n) => n.status === 'sent' || n.status === 'delivered').length;
    const params = {
      totalUsers: profiles.length,
      avgCheckinsPerUser: profiles.length ? Number((moods.length / profiles.length).toFixed(1)) : 0,
      emailOptInPct: profiles.length ? Math.round((profiles.filter((p) => p.emailOptIn).length / profiles.length) * 100) : 0,
      whatsappOptInPct: profiles.length ? Math.round((profiles.filter((p) => p.whatsappOptIn).length / profiles.length) * 100) : 0,
      memoryOptInPct: profiles.length ? Math.round((profiles.filter((p) => p.consentMemory).length / profiles.length) * 100) : 0,
      hinglishPct: profiles.length ? Math.round((profiles.filter((p) => p.language === 'hinglish').length / profiles.length) * 100) : 0,
      deliverySuccessPct: totalNotifs ? Math.round((deliveredNotifs / totalNotifs) * 100) : 0,
      crisisTotal: risks.filter((r) => r.riskLevel === 'CRISIS').length,
    };

    return NextResponse.json({
      series,
      moodDistribution: Object.entries(moodDistribution).map(([mood, count]) => ({ mood, count })).sort((a, b) => b.count - a.count),
      topicDistribution: Object.entries(topicDistribution).map(([topic, count]) => ({ topic, count })).sort((a, b) => b.count - a.count),
      hourHistogram,
      params,
    });
  } catch (err) {
    console.error('[api/admin/weekly] error', err);
    return NextResponse.json({ error: 'could not load weekly analytics' }, { status: 500 });
  }
}
