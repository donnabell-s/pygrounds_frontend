// src/services/gameService.ts
import { gameApi } from "../api/gameApi";
import type {
  CrosswordSessionData,
  CrosswordGridData,
  WordSearchSessionData,
  WordSearchMatrixData,
  AnswerSubmission,
  QuestionResponse,
  GameSession,
  DebuggingSubmissionResponse,
} from "../types/game";

export const gameService = {
  // ────────── Crosswords ──────────
  startCrossword: (): Promise<CrosswordSessionData | null> => gameApi.startCrossword(),
  getCrosswordGrid: (id: string): Promise<CrosswordGridData | null> => gameApi.getCrosswordGrid(id),

  // ────────── Word Search ──────────
  startWordSearch: (): Promise<WordSearchSessionData | null> => gameApi.startWordSearch(),
  getWordSearchMatrix: (id: string): Promise<WordSearchMatrixData | null> => gameApi.getWordSearchMatrix(id),

  // ────────── Generic Session ──────────
  submitAnswers: (id: string, answers: AnswerSubmission[]): Promise<{ score: number } | null> =>
    gameApi.submitAnswers(id, answers),
  getResponses: (id: string): Promise<QuestionResponse[] | null> => gameApi.getResponses(id),
  getSession: (id: string): Promise<GameSession | null> => gameApi.getSession(id),
  exitSession: (id: string): Promise<boolean> => gameApi.exitSession(id),

  // ────────── Hangman ──────────
  startHangman: (): Promise<GameSession | null> => gameApi.startHangman(),
  submitHangmanCode: (id: string, code: string): Promise<any> =>
    gameApi.submitHangmanCode(id, code),

  // ────────── Debugging ──────────
  startDebugging: (): Promise<GameSession | null> => gameApi.startDebugging(),
  submitDebuggingCode: (id: string, code: string): Promise<DebuggingSubmissionResponse | null> =>
    gameApi.submitDebuggingCode(id, code),

  // ────────── Pre-assessment ──────────
  submitPreAssessmentAnswers: (answers: Record<number, string>): Promise<any | null> =>
    gameApi.submitPreAssessmentAnswers(answers),
  // ────────── Leaderboard ──────────
  getLeaderboard: (gameType: string) => gameApi.getLeaderboard(gameType),
};
