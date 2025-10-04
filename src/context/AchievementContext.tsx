import React, { createContext, useContext, useState, useCallback } from 'react';
import achievementService from '../services/achievementService';

type Achievement = {
  id: string;
  code: string;
  name: string;
  description: string;
  isUnlocked: boolean;
  progress: { current: number; target: number };
};

type AchievementContextType = {
  achievements: Achievement[];
  loading: boolean;
  refresh: (userId?: number) => Promise<void>;
};

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

export const AchievementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async (userId?: number) => {
    setLoading(true);
    try {
      const data = await achievementService.fetchProgress(userId);
      setAchievements(data);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <AchievementContext.Provider value={{ achievements, loading, refresh }}>
      {children}
    </AchievementContext.Provider>
  );
};

export const useAchievement = () => {
  const ctx = useContext(AchievementContext);
  if (!ctx) throw new Error('useAchievement must be used within AchievementProvider');
  return ctx;
};

export default AchievementContext;
