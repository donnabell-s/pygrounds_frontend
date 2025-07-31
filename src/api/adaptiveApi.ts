// src/api/adaptiveApi.ts
import client from "./client";
import type { PreAssessmentQuestion, GameZone, Topic } from "../types/adaptive";

export const adaptiveApi = {
  getPreAssessmentQuestions: async (): Promise<PreAssessmentQuestion[]> => {
    try {
      const res = await client.get<PreAssessmentQuestion[]>("/preassessment/");
      return res.data;
    } catch {
      return [];
    }
  },
  getUserZoneProgress: async (): Promise<GameZone[]> => {
    try {
      const res = await client.get<GameZone[]>("/progress/current-zone/");
      return res.data;
    } catch {
      return [];
    }
  },
  getUserTopicProgress: async (): Promise<Topic[]> => {
    try {
      const res = await client.get<Topic[]>("/progress/topics/");
      return res.data;
    } catch {
      return [];
    }
  }
};
