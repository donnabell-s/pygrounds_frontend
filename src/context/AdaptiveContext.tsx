// src/contexts/AdaptiveContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { adaptiveService } from "../services/adaptiveService";
import type { PreAssessmentQuestion, GameZone, Topic } from "../types/adaptive";

type AdaptiveContextType = {
  preAssessmentQuestions: PreAssessmentQuestion[] | null;
  zoneProgress: GameZone[] | null;
  topicProgress: Topic[] | null;
  leaderboardZoneProgress: any[] | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
};

const AdaptiveContext = createContext<AdaptiveContextType | undefined>(undefined);

export const AdaptiveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preAssessmentQuestions, setPreAssessmentQuestions] = useState<PreAssessmentQuestion[] | null>(null);
  const [zoneProgress, setZoneProgress] = useState<GameZone[] | null>(null);
  const [topicProgress, setTopicProgress] = useState<Topic[] | null>(null);
  const [leaderboardZoneProgress, setLeaderboardZoneProgress] = useState<any[] | null>(null);

  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAdaptiveData = async () => {
    setLoading(true);
    try {
      // Fetch all adaptive data in parallel
      const [qs, zones, topics, leaderboard] = await Promise.all([
        adaptiveService.getPreAssessmentQuestions(),
        adaptiveService.getUserZoneProgress(),
        adaptiveService.getUserTopicProgress(),
        adaptiveService.getLeaderboardZoneProgress(),
      ]);
      
      console.log("Zones:", zones);
      console.log("Topics:", topics);


      setPreAssessmentQuestions(qs);
      setZoneProgress(zones);
      setTopicProgress(topics);
      setLeaderboardZoneProgress(leaderboard);
      setError(null);
    } catch (e) {
      console.error("Adaptive fetch error:", e);
      setError(e as Error);
      setPreAssessmentQuestions(null);
      setZoneProgress(null);
      setTopicProgress(null);
      setLeaderboardZoneProgress(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdaptiveData();
  }, []);

  return (
    <AdaptiveContext.Provider
      value={{
        preAssessmentQuestions,
        zoneProgress,
        topicProgress,
        leaderboardZoneProgress,
        isLoading,
        error,
        refresh: fetchAdaptiveData,
      }}
    >
      {children}
    </AdaptiveContext.Provider>
  );
};

export const useAdaptive = () => {
  const ctx = useContext(AdaptiveContext);
  if (!ctx) throw new Error("useAdaptive must be used within AdaptiveProvider");
  return ctx;
};
