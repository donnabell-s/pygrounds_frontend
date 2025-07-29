// src/contexts/AdaptiveContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { adaptiveService } from "../services/adaptiveService";
import type { PreAssessmentQuestion } from "../types/adaptive";

type AdaptiveContextType = {
  preAssessmentQuestions: PreAssessmentQuestion[] | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
};

const AdaptiveContext = createContext<AdaptiveContextType | undefined>(undefined);

export const AdaptiveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preAssessmentQuestions, setPreAssessmentQuestions] = useState<PreAssessmentQuestion[] | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const qs = await adaptiveService.getPreAssessmentQuestions();
      setPreAssessmentQuestions(qs);
      setError(null);
    } catch (e) {
      setPreAssessmentQuestions([]);
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  return (
    <AdaptiveContext.Provider value={{ preAssessmentQuestions, isLoading, error, refresh: fetchQuestions }}>
      {children}
    </AdaptiveContext.Provider>
  );
};

export const useAdaptive = () => {
  const ctx = useContext(AdaptiveContext);
  if (!ctx) throw new Error("useAdaptive must be used within AdaptiveProvider");
  return ctx;
};
