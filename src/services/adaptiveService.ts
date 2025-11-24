// src/services/adaptiveService.ts
import { adaptiveApi } from "../api/adaptiveApi";
import type { PreAssessmentQuestion, GameZone, Topic } from "../types/adaptive";

export const adaptiveService = {

  getPreAssessmentQuestions: (): Promise<PreAssessmentQuestion[]> =>
    adaptiveApi.getPreAssessmentQuestions(),

  getUserZoneProgress: (): Promise<GameZone[]> =>
    adaptiveApi.getUserZoneProgress(),

  getUserTopicProgress: (): Promise<Topic[]> =>
    adaptiveApi.getUserTopicProgress(),

  getLeaderboardZoneProgress: (): Promise<Topic[]> =>
    adaptiveApi.getLeaderboardZoneProgress(),
};
