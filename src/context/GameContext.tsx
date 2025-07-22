// src/context/GameContext.tsx
import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { gameApi } from "../api";
import type { GameSession, CrosswordResult } from "../types/game";

type GameContextType = {
  activeSession: GameSession | null;
  startCrosswordGame: () => Promise<void>;
  submitCrosswordResult: (sessionId: string, data: CrosswordResult) => Promise<void>;
  isLoading: boolean;
  clearActiveSession: () => void;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [activeSession, setActiveSession] = useState<GameSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const startCrosswordGame = async () => {
    setIsLoading(true);
    try {
      const { data } = await gameApi.startCrossword();
      console.log("Crossword Game Data:", data);
      setActiveSession(data);
      localStorage.setItem("activeSession", JSON.stringify(data));
    } catch (err) {
      console.error("Failed to start crossword", err);
    } finally {
      setIsLoading(false);
    }
  };

  const submitCrosswordResult = async (sessionId: string, result: CrosswordResult) => {
    try {
      const response = await gameApi.submitCrossword(sessionId, result);
      console.log("Submission Response:", response.data);
      setActiveSession(null);
      localStorage.removeItem("activeSession");
    } catch (err) {
      console.error("Failed to submit crossword", err);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("activeSession");
    if (stored) {
      setActiveSession(JSON.parse(stored));
    }
  }, []);

  const clearActiveSession = () => {
    setActiveSession(null);
    localStorage.removeItem("activeSession");
  };

  return (
    <GameContext.Provider
      value={{
        activeSession,
        startCrosswordGame,
        submitCrosswordResult,
        isLoading,
        clearActiveSession,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside GameProvider");
  return ctx;
};
