// src/api/adaptiveApi.ts
import client from "./client";
import type { PreAssessmentQuestion, GameZone, Topic } from "../types/adaptive";

export const adaptiveApi = {
  getPreAssessmentQuestions: async (): Promise<PreAssessmentQuestion[]> => {
    try {
      // This endpoint doesn't exist yet, return empty array
      console.warn('PreAssessment endpoint not implemented yet');
      return [];
    } catch {
      return [];
    }
  },
  getUserZoneProgress: async (): Promise<GameZone[]> => {
    try {
      // Use the existing zones endpoint instead of progress endpoint
      const res = await client.get<GameZone[]>("/zones/");
      return res.data;
    } catch (error: any) {
      console.warn('Zones endpoint not available:', error.message);
      return [];
    }
  },
  getUserTopicProgress: async (): Promise<Topic[]> => {
    try {
      // Use the existing topics endpoint instead of progress endpoint
      const res = await client.get<Topic[]>("/topics/");
      return res.data;
    } catch (error: any) {
      console.warn('Topics endpoint not available:', error.message);
      return [];
    }
  }
};
