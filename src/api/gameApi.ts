// src/api/gameApi.ts
import client from "./client";
import type {
  CrosswordSessionData,
  WordSearchSessionData,
  GameSession,
  AnswerSubmission,
  QuestionResponse,
} from "../types/game";

// Helper types
export interface CrosswordGridData {
  grid: string[];
  placements: any[];
}
export interface WordSearchMatrixData {
  matrix: string[];
  placements: any[];
}

export const gameApi = {
  startCrossword: async (): Promise<CrosswordSessionData | null> => {
    try {
      const res = await client.post<CrosswordSessionData>("/crossword/start/");
      return res.data;
    } catch {
      return null;
    }
  },

  getCrosswordGrid: async (id: string): Promise<CrosswordGridData | null> => {
    try {
      const res = await client.get<CrosswordGridData>(`/crossword/${id}/grid/`);
      return res.data;
    } catch {
      return null;
    }
  },

  startWordSearch: async (): Promise<WordSearchSessionData | null> => {
    try {
      const res = await client.post<WordSearchSessionData>("/wordsearch/start/");
      return res.data;
    } catch {
      return null;
    }
  },

  getWordSearchMatrix: async (id: string): Promise<WordSearchMatrixData | null> => {
    try {
      const res = await client.get<WordSearchMatrixData>(`/wordsearch/${id}/matrix/`);
      return res.data;
    } catch {
      return null;
    }
  },

  submitAnswers: async (sessionId: string, answers: AnswerSubmission[]): Promise<{ score: number } | null> => {
    try {
      const res = await client.post<{ score: number }>(`/session/${sessionId}/submit/`, { answers });
      return res.data;
    } catch {
      return null;
    }
  },

  getResponses: async (sessionId: string): Promise<QuestionResponse[] | null> => {
    try {
      const res = await client.get<QuestionResponse[]>(`/session/${sessionId}/responses/`);
      return res.data;
    } catch {
      return null;
    }
  },

  getSession: async (sessionId: string): Promise<GameSession | null> => {
    try {
      const res = await client.get<GameSession>(`/session/${sessionId}/`);
      return res.data;
    } catch {
      return null;
    }
  },

  exitSession: async (sessionId: string): Promise<boolean> => {
    try {
      await client.post(`/session/${sessionId}/exit/`);
      return true;
    } catch {
      return false;
    }
  },

  // ...hangman/debugging similarly...
  submitPreAssessmentAnswers: async (answers: Record<number, string>): Promise<any | null> => {
    try {
      const res = await client.post("/preassessment/submit/", answers);
      return res.data;
    } catch {
      return null;
    }
  },
};
