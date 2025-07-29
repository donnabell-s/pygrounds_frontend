// src/api/adaptiveApi.ts
import client from "./client";
import type { PreAssessmentQuestion } from "../types/adaptive";

export const adaptiveApi = {
  getPreAssessmentQuestions: async (): Promise<PreAssessmentQuestion[]> => {
    try {
      const res = await client.get<PreAssessmentQuestion[]>("/preassessment/");
      return res.data;
    } catch {
      return [];
    }
  }
};
