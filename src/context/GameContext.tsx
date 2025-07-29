// src/contexts/GameContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { gameService } from "../services/gameService";
import type {
  GameSession,
  CrosswordSessionData,
  CrosswordGridData,
  WordSearchSessionData,
  WordSearchMatrixData,
  AnswerSubmission,
  QuestionResponse,
} from "../types/game";

export interface GameContextType {
  activeSession: GameSession | null;
  gameEnded: boolean;
  setGameEnded: (ended: boolean) => void;
  resetGameEnd: () => void;
  clearActiveSession: () => void;

  startCrosswordGame: () => Promise<CrosswordSessionData | null>;
  getCrosswordGrid: (sessionId: string) => Promise<CrosswordGridData | null>;

  startWordSearchGame: () => Promise<WordSearchSessionData | null>;
  getWordSearchMatrix: (sessionId: string) => Promise<WordSearchMatrixData | null>;

  submitAnswers: (sessionId: string, answers: AnswerSubmission[]) => Promise<number | null>;
  fetchResponses: (sessionId: string) => Promise<QuestionResponse[] | null>;

  fetchGameSession: (sessionId: string) => Promise<GameSession | null>;
  exitSession: (sessionId: string) => Promise<boolean>;

  submitPreAssessmentAnswers: (answers: Record<number, string>) => Promise<any | null>;
}

const GameContext = createContext<GameContextType>({} as GameContextType);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeSession, setActiveSession] = useState<GameSession | null>(null);
  const [gameEnded, setGameEnded] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("activeSession");
    if (stored) {
      setActiveSession(JSON.parse(stored));
    }
    if (localStorage.getItem("gameEnded") === "true") {
      setGameEnded(true);
    }
  }, []);

  // Persist activeSession
  useEffect(() => {
    if (activeSession) {
      localStorage.setItem("activeSession", JSON.stringify(activeSession));
    } else {
      localStorage.removeItem("activeSession");
    }
  }, [activeSession]);

  // Persist gameEnded
  useEffect(() => {
    if (gameEnded) {
      localStorage.setItem("gameEnded", "true");
    } else {
      localStorage.removeItem("gameEnded");
    }
  }, [gameEnded]);

  const clearActiveSession = () => {
    setActiveSession(null);
    setGameEnded(false);
  };

  const resetGameEnd = () => {
    setGameEnded(false);
  };

  const startCrosswordGame = async (): Promise<CrosswordSessionData | null> => {
    const resp = await gameService.startCrossword();
    if (!resp) return null;

    const session = await gameService.getSession(resp.session_id);
    if (session) {
      setActiveSession(session);
      setGameEnded(false);
    }
    return resp;
  };

  const getCrosswordGrid = (sessionId: string): Promise<CrosswordGridData | null> =>
    gameService.getCrosswordGrid(sessionId);

  const startWordSearchGame = async (): Promise<WordSearchSessionData | null> => {
    const resp = await gameService.startWordSearch();
    if (!resp) return null;

    const session = await gameService.getSession(resp.session_id);
    if (session) {
      setActiveSession(session);
      setGameEnded(false);
    }
    return resp;
  };

  const getWordSearchMatrix = (sessionId: string): Promise<WordSearchMatrixData | null> =>
    gameService.getWordSearchMatrix(sessionId);

  const submitAnswers = async (sessionId: string, answers: AnswerSubmission[]): Promise<number | null> => {
    const result = await gameService.submitAnswers(sessionId, answers);
    if (result?.score !== undefined) {
      setGameEnded(true);
      const updated = await gameService.getSession(sessionId);
      if (updated) {
        setActiveSession(updated);
      }
      return result.score;
    }
    return null;
  };

  const fetchResponses = (sessionId: string): Promise<QuestionResponse[] | null> =>
    gameService.getResponses(sessionId);

  const fetchGameSession = async (sessionId: string): Promise<GameSession | null> => {
    const session = await gameService.getSession(sessionId);
    if (session) {
      setActiveSession(session);
    }
    return session;
  };

  const exitSession = async (sessionId: string): Promise<boolean> => {
    const ok = await gameService.exitSession(sessionId);
    if (ok) {
      clearActiveSession();
    }
    return ok;
  };

  const submitPreAssessmentAnswers = (answers: Record<number, string>): Promise<any | null> =>
    gameService.submitPreAssessmentAnswers(answers);

  return (
    <GameContext.Provider
      value={{
        activeSession,
        gameEnded,
        setGameEnded,
        resetGameEnd,
        clearActiveSession,
        startCrosswordGame,
        getCrosswordGrid,
        startWordSearchGame,
        getWordSearchMatrix,
        submitAnswers,
        fetchResponses,
        fetchGameSession,
        exitSession,
        submitPreAssessmentAnswers,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = (): GameContextType => {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return ctx;
};
