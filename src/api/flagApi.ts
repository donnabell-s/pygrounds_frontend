import client from "./client";

export interface FlagCountByLevel {
  beginner: number;
  intermediate: number;
  advanced: number;
  master: number;
}

export interface FlaggedQuestion {
  id: number;
  question_text: string;
  flagged: boolean;
  flag_notes: string | null;
  flagged_by: string | null;
  flag_created_at: string | null;
  game_type: string;
  estimated_difficulty: string;
  answer_options?: Record<string, string> | null;
  correct_answer?: string | null;
  game_data?: Record<string, any> | null;
  flag_count_by_level?: FlagCountByLevel | null;
}

export const flagApi = {
  // Get all flagged questions with pagination + optional level filter
  getFlaggedQuestions: async (
    page = 1,
    pageSize = 10,
    level?: string,
    minCount?: number
  ): Promise<{
    count: number;
    next: string | null;
    previous: string | null;
    results: FlaggedQuestion[];
  } | null> => {
    try {
      const params = new URLSearchParams({
        page: String(page),
        page_size: String(pageSize),
      });
      if (level) params.append("level", level);
      if (minCount && minCount > 0) params.append("min_count", String(minCount));

      const res = await client.get(`/question/flagged/?${params.toString()}`);
      return res.data as {
        count: number;
        next: string | null;
        previous: string | null;
        results: FlaggedQuestion[];
      };
    } catch (err) {
      console.error("flagApi.getFlaggedQuestions error", err);
      return null;
    }
  },

  // Get flagged questions by filter
  getFlaggedQuestionsByFilter: async (
    reason?: string,
    gameType?: string,
    page = 1,
    pageSize = 10
  ): Promise<{ count: number; results: FlaggedQuestion[] } | null> => {
    try {
      const params = new URLSearchParams();
      if (reason) params.append("reason", reason);
      if (gameType) params.append("game_type", gameType);
      params.append("page", String(page));
      params.append("page_size", String(pageSize));

      const res = await client.get(`/question/flagged/?${params.toString()}`);
      return res.data as { count: number; results: FlaggedQuestion[] };
    } catch (err) {
      console.error("flagApi.getFlaggedQuestionsByFilter error", err);
      return null;
    }
  },

  // Dismiss/remove a flagged question (unflag it)
  dismissFlaggedQuestion: async (questionId: number): Promise<{ status: string; message: string } | null> => {
    try {
      const res = await client.post(`/question/${questionId}/toggle-flag/`, {});
      return res.data as { status: string; message: string };
    } catch (err) {
      console.error("flagApi.dismissFlaggedQuestion error", err);
      return null;
    }
  },

  // Mark a flagged question as reviewed (or unflag it)
  markFlaggedAsReviewed: async (questionId: number): Promise<{ status: string; message: string } | null> => {
    try {
      const res = await client.post(`/question/${questionId}/toggle-flag/`, {});
      return res.data as { status: string; message: string };
    } catch (err) {
      console.error("flagApi.markFlaggedAsReviewed error", err);
      return null;
    }
  },

  // Regenerate a flagged question with LLM prompt
  regenerateQuestion: async (
    questionId: number,
    llmPrompt: string
  ): Promise<{ status: string; regenerated_question_id: number; regeneration_context: Record<string, unknown> } | null> => {
    try {
      const res = await client.post(`/question/${questionId}/regenerate/`, {
        llm_prompt: llmPrompt,
      });
      return res.data as {
        status: string;
        regenerated_question_id: number;
        regeneration_context: Record<string, unknown>;
      };
    } catch (err) {
      console.error("flagApi.regenerateQuestion error", err);
      return null;
    }
  },

  // Get a specific question by ID
  getQuestionById: async (questionId: number): Promise<FlaggedQuestion | null> => {
    try {
      const res = await client.get(`/question/${questionId}/`);
      const data = res.data as { question?: FlaggedQuestion } & FlaggedQuestion;
      return (data?.question ?? data) as FlaggedQuestion;
    } catch (err) {
      console.error("flagApi.getQuestionById error", err);
      return null;
    }
  },
};

export default flagApi;