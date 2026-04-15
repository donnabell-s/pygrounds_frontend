import achievementApi from '../api/achievementApi';
import type { Achievement } from '../interfaces/achievements';

// Module-level cache — persists across component mounts/unmounts within the same session.
// Keyed by userId (undefined for the logged-in user's own profile).
const cache = new Map<string, Achievement[]>();

const cacheKey = (userId?: number) => (userId !== undefined ? String(userId) : '__self__');

export const getAchievements = async (userId?: number, forceRefresh = false) => {
  const key = cacheKey(userId);

  if (!forceRefresh && cache.has(key)) {
    return cache.get(key)!;
  }

  const data = await achievementApi.getProgress(userId);
  const anyData = data as any;
  const results = Array.isArray(anyData) ? anyData : anyData.results || [];

  const mapped: Achievement[] = results.map((a: any) => ({
    id: String(a.id),
    name: a.title,
    description: a.description,
    isUnlocked: !!a.is_unlocked,
    progress: { current: a.progress_current || 0, target: a.progress_target || 1 },
    icon: a.icon || undefined,
  }));

  cache.set(key, mapped);
  return mapped;
};
