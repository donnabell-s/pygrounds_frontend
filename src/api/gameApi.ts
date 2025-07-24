// src/api/gameApi.ts
import client from "./client";
import type {
  CrosswordSessionData,
  WordSearchSessionData,
  GameSession,
  AnswerSubmission,
  QuestionResponse,
  CrosswordPlacement,
  WordSearchPlacement
} from "../types/game";

// ───── helper types ─────
export interface CrosswordGridData {
  grid: string[];
  placements: CrosswordPlacement[];
}

export interface WordSearchMatrixData {
  matrix: string[];
  placements: WordSearchPlacement[];
}

// ───── gameApi ─────
const gameApi = {
  // ─ start a new crossword session
  startCrossword: async (): Promise<CrosswordSessionData | null> => {
    try {
      const res = await client.post<CrosswordSessionData>("/crossword/start/");
      return res.data;
    } catch (err) {
      console.error("gameApi.startCrossword error", err);
      return null;
    }
  },

  // ─ start a new wordsearch session
  startWordSearch: async (): Promise<WordSearchSessionData | null> => {
    try {
      const res = await client.post<WordSearchSessionData>("/wordsearch/start/");
      return res.data;
    } catch (err) {
      console.error("gameApi.startWordSearch error", err);
      return null;
    }
  },

  // ─ fetch session metadata (any game)
  getSession: async (sessionId: string): Promise<GameSession | null> => {
    try {
      const res = await client.get<GameSession>(`/session/${sessionId}/`);
      return res.data;
    } catch (err) {
      console.error("gameApi.getSession error", err);
      return null;
    }
  },

  // ─ load crossword grid & clues
  getCrosswordGrid: async (
    sessionId: string
  ): Promise<CrosswordGridData | null> => {
    try {
      const res = await client.get<CrosswordGridData>(
        `/crossword/${sessionId}/grid/`
      );
      return res.data;
    } catch (err) {
      console.error("gameApi.getCrosswordGrid error", err);
      return null;
    }
  },

  // ─ load wordsearch matrix & placements
  getWordSearchMatrix: async (
    sessionId: string
  ): Promise<WordSearchMatrixData | null> => {
    try {
      const res = await client.get<WordSearchMatrixData>(
        `/wordsearch/${sessionId}/matrix/`
      );
      return res.data;
    } catch (err) {
      console.error("gameApi.getWordSearchMatrix error", err);
      return null;
    }
  },

  // ─ submit answers (shared across games)
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

  // ─ fetch past question responses
  getResponses: async (
    sessionId: string
  ): Promise<QuestionResponse[] | null> => {
    try {
      const res = await client.get<QuestionResponse[]>(
        `/session/${sessionId}/responses/`
      );
      return res.data;
    } catch (err) {
      console.error("gameApi.getResponses error", err);
      return null;
    }
  },

  // Add to gameApi
  exitSession: async (sessionId: string): Promise<boolean> => {
    try {
      const res = await client.post(`/session/${sessionId}/exit/`, {
        session_id: sessionId,
      });
      return res.status === 200;
    } catch (err) {
      console.error("gameApi.exitSession error", err);
      return false;
    }
  },

};

export default gameApi;
