import client from './client';

export const achievementApi = {
  // Get per-user achievement progress (if userId omitted, server may use request user)
  getProgress: async (userId?: number) => {
    const url = userId ? `/achievements/progress/?user_id=${userId}` : `/achievements/progress/`;
    const res = await client.get(url);
    return res.data;
  },
};

export default achievementApi;
