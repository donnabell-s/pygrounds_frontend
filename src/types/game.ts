// src/types/game.ts

export interface Minigame {
  id: number;
  title: string;
  description: string;
  category: string;
  color: string;
}

export interface GameSession {
  session_id: string;
  game_type: string;
  status: "active" | "completed" | "expired";
  start_time: string;
  end_time: string | null;
  total_score: number;
  time_limit: number;
  session_questions: SessionQuestion[];
}

export interface SessionQuestion {
  id: number; // GameQuestion ID
  question: {
    id: number;
    text: string;
    answer: string;
    difficulty: "easy" | "medium" | "hard";
  };
}

export interface CrosswordPlacement {
  word: string;
  clue: string;
  row: number;
  col: number;
  direction: "across" | "down";
}

export interface CrosswordSessionData {
  session_id: string;
  grid: string[];
  placements: CrosswordPlacement[];
  timer_seconds: number;
  started_at: string;
}

export interface WordSearchPlacement {
  word: string;
  row: number;
  col: number;
  direction: string;
}

export interface WordSearchSessionData {
  session_id: string;
  matrix: string[];
  placements: WordSearchPlacement[];
  timer_seconds: number;
  started_at: string;
}

export interface AnswerSubmission {
  question_id: number;
  user_answer: string;
  time_taken: number;
}

export interface QuestionResponse {
  question: number;
  user_answer: string;
  is_correct: boolean;
  time_taken: number;
  answered_at: string;
}

// ───── NEW TYPES ─────
// Return shape for loading the crossword grid (grid + clues)
export interface CrosswordGridData {
  grid: string[];
  placements: CrosswordPlacement[];
}

// Return shape for loading the wordsearch matrix (matrix + placements)
export interface WordSearchMatrixData {
  matrix: string[];
  placements: WordSearchPlacement[];
}
