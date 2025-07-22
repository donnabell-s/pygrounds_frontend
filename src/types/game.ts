// src/types/game.ts
export interface Minigame {
  id: number;
  title: string;
  description: string;
  category: string;
  color: string;
}
// src/types/game.ts
export interface GameSession {
  session_id: string; // Change from id to session_id
  grid: string[];
  placements: {
    word: string;
    clue: string;
    row: number;
    col: number;
    direction: "across" | "down";
  }[];
  timer_seconds: number; // Add this field to match the API response
  started_at: string;
}


export interface CrosswordResult {
  answered: string[]; // List of words user answered
  time_taken: number; // in seconds
}
