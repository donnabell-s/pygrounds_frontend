// src/services/adaptiveService.ts
import { adaptiveApi } from "../api/adaptiveApi";
import type { PreAssessmentQuestion } from "../types/adaptive";

export const adaptiveService = {
  getPreAssessmentQuestions: (): Promise<PreAssessmentQuestion[]> =>
    adaptiveApi.getPreAssessmentQuestions(),
};
