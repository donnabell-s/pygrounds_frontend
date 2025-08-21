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
      // Use the zones progress endpoint, not current-zone
      const res = await client.get<GameZone[]>("/progress/zones/");
      console.log("getUserZoneProgress - API Response:", res.data);
      return res.data;
    } catch (error: any) {
      console.warn('Zone progress endpoint not available:', error.message);
      return [];
    }
  },
  getUserTopicProgress: async (): Promise<Topic[]> => {
    try {
      const res = await client.get<Topic[]>("/progress/topics/");
      console.log("getUserTopicProgress - API Response:", res.data);
      return res.data;
    } catch (error: any) {
      console.warn('Topic progress endpoint not available:', error.message);
      return [];
    }
  },
    getLeaderboardZoneProgress : async (): Promise<Topic[]> => {
    try {
      console.log("getLeaderboardZoneProgress - Making API call...");
      const res = await client.get<Topic[]>("/progress/zones/all/");
      console.log("getLeaderboardZoneProgress - API Response:", res.data);
      return res.data;
    } catch (error: any) {
      console.warn('Leaderboard endpoint not available:', error.message);
      return [];
    }
  }
};
