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

  // Leaderboard
  fetchLeaderboard: (gameType: string) => Promise<import("../types/game").LeaderboardEntry[] | null>;

  startHangmanGame: () => Promise<GameSession | null>;
  submitHangmanCode: (sessionId: string, code: string) => Promise<any>;
  startDebuggingGame: () => Promise<GameSession | null>;
  submitDebuggingCode: (sessionId: string, code: string) => Promise<any>;

  submitPreAssessmentAnswers: (answers: Record<number, string>) => Promise<any | null>;
}

const GameContext = createContext<GameContextType>({} as GameContextType);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeSession, setActiveSession] = useState<GameSession | null>(null);
  const [gameEnded, setGameEnded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("activeSession");
    if (stored) setActiveSession(JSON.parse(stored));
    if (localStorage.getItem("gameEnded") === "true") setGameEnded(true);
  }, []);

  useEffect(() => {
    if (activeSession) localStorage.setItem("activeSession", JSON.stringify(activeSession));
    else localStorage.removeItem("activeSession");
  }, [activeSession]);

  useEffect(() => {
    if (gameEnded) localStorage.setItem("gameEnded", "true");
    else localStorage.removeItem("gameEnded");
  }, [gameEnded]);

  const clearActiveSession = () => {
    setActiveSession(null);
    setGameEnded(false);
    localStorage.removeItem("activeSession");
    localStorage.removeItem("gameEnded");
    localStorage.removeItem("submitted"); // legacy key cleanup
  };

  const resetGameEnd = () => {
    setGameEnded(false);
    localStorage.removeItem("gameEnded");
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

  const getCrosswordGrid = (sessionId: string) => gameService.getCrosswordGrid(sessionId);

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

  const getWordSearchMatrix = (sessionId: string) => gameService.getWordSearchMatrix(sessionId);

  const submitAnswers = async (sessionId: string, answers: AnswerSubmission[]) => {
    const result = await gameService.submitAnswers(sessionId, answers);
    if (result?.score !== undefined) {
      setGameEnded(true);
      const updated = await gameService.getSession(sessionId);
      if (updated) setActiveSession(updated);
      return result.score;
    }
    return null;
  };

  const fetchResponses = (sessionId: string) => gameService.getResponses(sessionId);

  const fetchGameSession = async (sessionId: string) => {
    const session = await gameService.getSession(sessionId);
    if (session) setActiveSession(session);
    return session;
  };

  const exitSession = async (sessionId: string) => {
    const ok = await gameService.exitSession(sessionId);
    if (ok) clearActiveSession();
    return ok;
  };

  const fetchLeaderboard = async (gameType: string) => {
    try {
      return await gameService.getLeaderboard(gameType);
    } catch (err) {
      console.error("fetchLeaderboard error", err);
      return null;
    }
  };

  const startHangmanGame = async (): Promise<GameSession | null> => {
    const resp = await gameService.startHangman();
    if (!resp) return null;
    const session = await gameService.getSession(resp.session_id);
    if (session) {
      setActiveSession(session);
      setGameEnded(false);
    }
    return resp;
  };

  const submitHangmanCode = async (sessionId: string, code: string): Promise<any> => {
    const result = await gameService.submitHangmanCode(sessionId, code);
    if (result?.success || result?.game_over) {
      setGameEnded(true);
      const updated = await gameService.getSession(sessionId);
      if (updated) setActiveSession(updated);
    }
    return result;
  };

  const startDebuggingGame = async (): Promise<GameSession | null> => {
    const resp = await gameService.startDebugging();
    if (!resp) return null;
    const session = await gameService.getSession(resp.session_id);
    if (session) {
      setActiveSession(session);
      setGameEnded(false);
    }
    return resp;
  };

  const submitDebuggingCode = async (sessionId: string, code: string): Promise<any> => {
    const result = await gameService.submitDebuggingCode(sessionId, code);
    if (result?.success || result?.game_over) {
      setGameEnded(true);
      const updated = await gameService.getSession(sessionId);
      if (updated) setActiveSession(updated);
    }
    return result;
  };

  const submitPreAssessmentAnswers = (answers: Record<number, string>) => gameService.submitPreAssessmentAnswers(answers);

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
        startHangmanGame,
        submitHangmanCode,
        startDebuggingGame,
        submitDebuggingCode,
        submitPreAssessmentAnswers,
        fetchLeaderboard,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
};
