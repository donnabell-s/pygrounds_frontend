// src/api/adaptiveApi.ts
import client from "./client";
import type { PreAssessmentQuestion } from "../types/adaptive";

const adaptiveApi = {
  getPreAssessmentQuestions: async (): Promise<PreAssessmentQuestion[]> => {
    const res = await client.get<PreAssessmentQuestion[]>(
      `/questions/preassessment/`
    );
    return res.data;
  },
};

export default adaptiveApi;
