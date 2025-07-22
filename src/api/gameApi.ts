// src/api/gameApi.ts
import client from "./client";
import type { GameSession, CrosswordResult } from "../types/game";

export const gameApi = {
  // Starts crossword game session (gets grid and metadata)
  startCrossword: () =>
    client.get<GameSession>("/minigames/start-crossword/"), // Use GET without user_id

  // Submits crossword result
  submitCrossword: (sessionId: string, data: CrosswordResult) =>
    client.post(`/minigames/submit-crossword/`, { session_id: sessionId, answers: data.answered }),
};
