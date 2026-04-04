// src/api/gameApi.ts
import client from "./client";
import type {
  CrosswordSessionData,
  WordSearchSessionData,
  GameSession,
  AnswerSubmission,
  QuestionResponse,
  CrosswordPlacement,
  WordSearchPlacement,
  DebuggingSubmissionResponse,
} from "../types/game";

// Helper types
export interface CrosswordGridData {
  grid: string[];
  placements: CrosswordPlacement[];
}

export interface WordSearchMatrixData {
  matrix: string[];
  placements: WordSearchPlacement[];
}

export const gameApi = {
  // ────────── Crosswords ──────────
  startCrossword: async (): Promise<CrosswordSessionData | null> => {
    try {
      const res = await client.post<CrosswordSessionData>("/crossword/start/");
      return res.data;
    } catch (err) {
      console.error("gameApi.startCrossword error", err);
      return null;
    }
  },

  getCrosswordGrid: async (id: string): Promise<CrosswordGridData | null> => {
    try {
      const res = await client.get<CrosswordGridData>(`/crossword/${id}/grid/`);
      return res.data;
    } catch (err) {
      console.error("gameApi.getCrosswordGrid error", err);
      return null;
    }
  },

  // ────────── Word Search ──────────
  startWordSearch: async (): Promise<WordSearchSessionData | null> => {
    try {
      const res = await client.post<WordSearchSessionData>("/wordsearch/start/");
      return res.data;
    } catch (err) {
      console.error("gameApi.startWordSearch error", err);
      return null;
    }
  },

  getWordSearchMatrix: async (id: string): Promise<WordSearchMatrixData | null> => {
    try {
      const res = await client.get<WordSearchMatrixData>(`/wordsearch/${id}/matrix/`);
      return res.data;
    } catch (err) {
      console.error("gameApi.getWordSearchMatrix error", err);
      return null;
    }
  },

  // ────────── Generic Session Methods ──────────
  getSession: async (sessionId: string): Promise<GameSession | null> => {
    try {
      const res = await client.get<GameSession>(`/session/${sessionId}/`);
      return res.data;
    } catch (err) {
      console.error("gameApi.getSession error", err);
      return null;
    }
  },

  exitSession: async (sessionId: string): Promise<boolean> => {
    try {
      const res = await client.post(`/session/${sessionId}/exit/`, { session_id: sessionId });
      return res.status === 200;
    } catch (err) {
      console.error("gameApi.exitSession error", err);
      return false;
    }
  },

  submitAnswers: async (
    sessionId: string,
    answers: AnswerSubmission[]
  ): Promise<{ score: number } | null> => {
    try {
      const res = await client.post<{ score: number }>(
        `/session/${sessionId}/submit/`,
        { session_id: sessionId, answers }
      );
      return res.data;
    } catch (err) {
      console.error("gameApi.submitAnswers error", err);
      return null;
    }
  },

  getResponses: async (sessionId: string): Promise<QuestionResponse[] | null> => {
    try {
      const res = await client.get<QuestionResponse[]>(`/session/${sessionId}/responses/`);
      return res.data;
    } catch (err) {
      console.error("gameApi.getResponses error", err);
      return null;
    }
  },

  // ────────── Questions ──────────
  toggleQuestionFlag: async (
    questionId: number,
    note?: string
  ): Promise<{ success: boolean; is_flagged: boolean; message?: string } | null> => {
    try {
      const res = await client.post<{ success: boolean; is_flagged: boolean; message?: string }>(
        `/question/${questionId}/toggle-flag/`,
        note ? { note } : {}
      );
      return res.data;
    } catch (err) {
      console.error("gameApi.toggleQuestionFlag error", err);
      return null;
    }
  },

  // ────────── Hangman ──────────
  startHangman: async (): Promise<GameSession | null> => {
    try {
      const res = await client.post<GameSession>("/hangman/start/");
      return res.data;
    } catch (err) {
      console.error("gameApi.startHangman error", err);
      return null;
    }
  },

  submitHangmanCode: async (
    sessionId: string,
    code: string
  ): Promise<{
    success: boolean;
    message: string;
    game_over: boolean;
    remaining_lives: number;
    traceback?: string;
  } | null> => {
    try {
      const res = await client.post<{
        success: boolean;
        message: string;
        game_over: boolean;
        remaining_lives: number;
        traceback?: string;
      }>(`/hangman/${sessionId}/submit-code/`, { code });
      return res.data;
    } catch (err) {
      console.error("gameApi.submitHangmanCode error", err);
      return null;
    }
  },

  // ────────── Debugging ──────────
  startDebugging: async (): Promise<GameSession | null> => {
    try {
      const res = await client.post<GameSession>("/debugging/start/");
      return res.data;
    } catch (err) {
      console.error("gameApi.startDebugging error", err);
      return null;
    }
  },

  submitDebuggingCode: async (
    sessionId: string,
    code: string
  ): Promise<DebuggingSubmissionResponse | null> => {
    try {
      const res = await client.post<DebuggingSubmissionResponse>(
        `/debugging/${sessionId}/submit-code/`,
        { code }
      );
      return res.data;
    } catch (err) {
      console.error("gameApi.submitDebuggingCode error", err);
      return null;
    }
  },

  // ────────── Pre-assessment ──────────
  submitPreAssessmentAnswers: async (
    answers: Record<number, string>
  ): Promise<any | null> => {
    try {
      const res = await client.post<{ result: any }>(
        "/preassessment/submit/",
        answers
      );
      return res.data;
    } catch (err) {
      console.error("gameApi.submitPreAssessmentAnswers error", err);
      return null;
    }
  },

  // ────────── Leaderboard ──────────
  getLeaderboard: async (gameType: string): Promise<import("../types/game").LeaderboardEntry[] | null> => {
    try {
      const res = await client.get<import("../types/game").LeaderboardEntry[]>(`/leaderboard/${gameType}/`);
      return res.data;
    } catch (err) {
      console.error("gameApi.getLeaderboard error", err);
      return null;
    }
  },

  // ────────── Question Flagging ──────────
  flagQuestion: async (questionId: number, reason: string, note: string): Promise<{ status: string; message: string } | null> => {
    try {
      const res = await client.post<{ status: string; message: string }>(
        `/question/${questionId}/toggle-flag/`,
        { reason, note }
      );
      return res.data;
    } catch (err) {
      console.error("gameApi.flagQuestion error", err);
      return null;
    }
  },
};

export default gameApi;
