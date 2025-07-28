// src/context/AdaptiveContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect
} from "react";
import adaptiveApi from "../api/adaptiveApi";
import type { PreAssessmentQuestion } from "../types/adaptive";

type AdaptiveContextType = {
  preAssessmentQuestions: PreAssessmentQuestion[] | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
};

const AdaptiveContext = createContext<AdaptiveContextType | undefined>(
  undefined
);

export const AdaptiveProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [preAssessmentQuestions, setPreAssessmentQuestions] = useState<
    PreAssessmentQuestion[] | null
  >(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

// src/context/AdaptiveContext.tsx
const fetchQuestions = async () => {
  setIsLoading(true);
  try {
    const questions = await adaptiveApi.getPreAssessmentQuestions();
    setPreAssessmentQuestions(questions);    // ← no extra wrapping
  } catch (e) {
    setError(e as Error);
    setPreAssessmentQuestions([]);
  } finally {
    setIsLoading(false);
  }
};


  useEffect(() => {
    fetchQuestions();
  }, []);

  return (
    <AdaptiveContext.Provider
      value={{
        preAssessmentQuestions,
        isLoading,
        error,
        refresh: fetchQuestions,
      }}
    >
      {children}
    </AdaptiveContext.Provider>
  );
};

export const useAdaptive = (): AdaptiveContextType => {
  const ctx = useContext(AdaptiveContext);
  if (!ctx)
    throw new Error("useAdaptive must be used within an AdaptiveProvider");
  return ctx;
};
