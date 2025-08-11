// src/types/game.ts

// ─────────────────────────────────────────────────────────────────────────────
// Shared Level Types & Thresholds (used by Leaderboard, ProgressBar, TopThree)
// ─────────────────────────────────────────────────────────────────────────────
export type LevelName = "Beginner" | "Intermediate" | "Advanced" | "Master";
export type LevelTierBase = { maxXP: number; label: LevelName };

export const LEVELS: readonly LevelTierBase[] = [
  { maxXP: 100, label: "Beginner" },
  { maxXP: 150, label: "Intermediate" },
  { maxXP: 150, label: "Advanced" },
  { maxXP: 100, label: "Master" },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Core Domain Types (kept broad to match current usage)
// ─────────────────────────────────────────────────────────────────────────────
export interface Minigame {
  id: number;
  title: string;
  description: string;
  category: string;
  color: string;
}

export interface GameSessionQuestion {
  id: number;
  question?: {
    question_text?: string;
    correct_answer?: string | null;
    explanation?: string | null;
    game_type?: string;
    game_data?: Record<string, any>;
  };
  user_answer?: string | null;
  response?: { user_answer?: string | null; is_correct?: boolean | null } | null;
  is_correct?: boolean | null;
  correct?: boolean | null;
}

export interface GameSession {
  session_id: string;
  game_type: string;
  remaining_lives: number;
  status: "active" | "completed" | "expired";
  start_time: string;
  end_time?: string;
  time_limit: number; // seconds
  hints_used?: number;
  session_questions?: GameSessionQuestion[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Crossword
// ─────────────────────────────────────────────────────────────────────────────
export type CrosswordDirection = "across" | "down";

export interface CrosswordPlacement {
  row: number;
  col: number;
  direction: CrosswordDirection;
  word: string;
  clue?: string;
  game_question_id?: number | string | null;
}

export interface CrosswordGridData {
  grid: string[];
  placements: CrosswordPlacement[];
}

export interface CrosswordSessionData {
  session_id: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Word Search
// ─────────────────────────────────────────────────────────────────────────────
export type WordSearchDirection = "across" | "down" | "diag" | "diagUp" | "diagDown";

export interface WordSearchPlacement {
  row: number;
  col: number;
  direction: WordSearchDirection;
  word: string;
}

export interface WordSearchMatrixData {
  matrix: string[];
  placements: WordSearchPlacement[];
}

export interface WordSearchSessionData {
  session_id: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Submissions
// ─────────────────────────────────────────────────────────────────────────────
export interface AnswerSubmission {
  question_id: number;
  user_answer: string;
  time_taken: number;
}

export interface QuestionResponse {
  question?: number | string;
  user_answer?: string | null;
  is_correct?: boolean | null;
  session_question_id?: number | string;
  question_id?: number | string;
  response?: { user_answer?: string | null; is_correct?: boolean | null } | null;
}

// Response shape for Hangman / Debugging submissions
export interface HangmanSubmissionResponse {
  success: boolean;
  message: string;
  game_over: boolean;
  remaining_lives: number;
  traceback?: string;
}

export type DebuggingSubmissionResponse = HangmanSubmissionResponse;

// Pre-assessment answers
export type PreAssessmentAnswers = Record<number, string>;
