// src/context/GameContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import gameApi from "../api/gameApi";
import type {
  GameSession,
  CrosswordSessionData,
  CrosswordGridData,
  WordSearchSessionData,
  WordSearchMatrixData,
  AnswerSubmission,
  QuestionResponse,
} from "../types/game";

interface GameContextType {
  activeSession: GameSession | null;
  gameEnded: boolean;
  setGameEnded: (ended: boolean) => void;
  resetGameEnd: () => void;
  clearActiveSession: () => void;
  startCrosswordGame: () => Promise<CrosswordSessionData | null>;
  getCrosswordGrid: (sessionId: string) => Promise<CrosswordGridData | null>;
  startWordSearchGame: () => Promise<WordSearchSessionData | null>;
  getWordSearchMatrix: (
    sessionId: string
  ) => Promise<WordSearchMatrixData | null>;
  submitAnswers: (
    sessionId: string,
    answers: AnswerSubmission[]
  ) => Promise<number | null>;
  fetchResponses: (sessionId: string) => Promise<QuestionResponse[] | null>;
  fetchGameSession: (sessionId: string) => Promise<GameSession | null>;
}

const GameContext = createContext<GameContextType>({} as GameContextType);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [activeSession, setActiveSession] = useState<GameSession | null>(null);
  const [gameEnded, setGameEnded] = useState(false);

  // ✅ Hydrate from localStorage and auto-end if session expired
  useEffect(() => {
    const storedSession = localStorage.getItem("activeSession");
    const storedGameEnded = localStorage.getItem("gameEnded");

    if (storedSession) {
      const session = JSON.parse(storedSession);
      const start = new Date(session.start_time).getTime();
      const now = new Date().getTime();
      const duration = session.time_limit * 1000;

      if (now >= start + duration) {
        setGameEnded(true);
      }

      setActiveSession(session);
    }

    if (storedGameEnded === "true") {
      setGameEnded(true);
    }
  }, []);

  useEffect(() => {
    if (activeSession) {
      localStorage.setItem("activeSession", JSON.stringify(activeSession));
    } else {
      localStorage.removeItem("activeSession");
    }
  }, [activeSession]);

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
    localStorage.removeItem("activeSession");
    localStorage.removeItem("gameEnded");
  };

  const resetGameEnd = () => {
    setGameEnded(false);
    localStorage.removeItem("gameEnded");
  };

  const startCrosswordGame = async (): Promise<CrosswordSessionData | null> => {
    const gridResp = await gameApi.startCrossword();
    if (!gridResp) return null;

    const session = await gameApi.getSession(gridResp.session_id);
    if (session) {
      setActiveSession(session);
      setGameEnded(false); // ✅ Reset game state
      localStorage.removeItem("gameEnded");
      localStorage.setItem("activeSession", JSON.stringify(session));
    }

    return gridResp;
  };

  const getCrosswordGrid = (sessionId: string) =>
    gameApi.getCrosswordGrid(sessionId);

  const startWordSearchGame = async (): Promise<WordSearchSessionData | null> => {
    const matrixResp = await gameApi.startWordSearch();
    if (!matrixResp) return null;

    const session = await gameApi.getSession(matrixResp.session_id);
    if (session) {
      setActiveSession(session);
      setGameEnded(false); // ✅ Reset game state
      localStorage.removeItem("gameEnded");
      localStorage.setItem("activeSession", JSON.stringify(session));
    }

    return matrixResp;
  };

  const getWordSearchMatrix = (sessionId: string) =>
    gameApi.getWordSearchMatrix(sessionId);

  const submitAnswers = async (
    sessionId: string,
    answers: AnswerSubmission[]
  ): Promise<number | null> => {
    const result = await gameApi.submitAnswers(sessionId, answers);
    if (result?.score !== undefined) {
      setGameEnded(true);
      const updated = await gameApi.getSession(sessionId);
      if (updated) {
        setActiveSession(updated);
        localStorage.setItem("activeSession", JSON.stringify(updated));
      }
      return result.score;
    }
    return null;
  };

  const fetchResponses = (sessionId: string) =>
    gameApi.getResponses(sessionId);

  const fetchGameSession = async (
    sessionId: string
  ): Promise<GameSession | null> => {
    const session = await gameApi.getSession(sessionId);
    if (session) {
      setActiveSession(session);
      localStorage.setItem("activeSession", JSON.stringify(session));
    }
    return session;
  };

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
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);
