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
} from "../types/game";

export const gameService = {
  startCrossword: (): Promise<CrosswordSessionData | null> => gameApi.startCrossword(),
  getCrosswordGrid: (id: string): Promise<CrosswordGridData | null> => gameApi.getCrosswordGrid(id),

  startWordSearch: (): Promise<WordSearchSessionData | null> => gameApi.startWordSearch(),
  getWordSearchMatrix: (id: string): Promise<WordSearchMatrixData | null> => gameApi.getWordSearchMatrix(id),

  submitAnswers: (id: string, a: AnswerSubmission[]): Promise<{ score: number } | null> =>
    gameApi.submitAnswers(id, a),
  getResponses: (id: string): Promise<QuestionResponse[] | null> => gameApi.getResponses(id),
  getSession: (id: string): Promise<GameSession | null> => gameApi.getSession(id),
  exitSession: (id: string): Promise<boolean> => gameApi.exitSession(id),

  submitPreAssessmentAnswers: (answers: Record<number, string>): Promise<any | null> =>
    gameApi.submitPreAssessmentAnswers(answers),
};
