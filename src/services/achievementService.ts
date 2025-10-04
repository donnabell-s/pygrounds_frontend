import achievementApi from '../api/achievementApi';

export const achievementService = {
  async fetchProgress(userId?: number) {
    const data = await achievementApi.getProgress(userId);
  const anyData = data as any;
  const results = Array.isArray(anyData) ? anyData : anyData.results || [];
    // normalize to UI shape
    return results.map((a: any) => ({
      id: String(a.id),
      code: a.code,
      name: a.title,
      description: a.description,
      isUnlocked: !!a.is_unlocked,
      progress: { current: a.progress_current || 0, target: a.progress_target || 1 },
      icon: a.icon || undefined,
    }));
  },
};

export default achievementService;
