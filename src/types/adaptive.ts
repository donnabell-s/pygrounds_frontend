export interface PreAssessmentQuestion {
  id: number;
  topic_ids: number[];
  subtopic_ids: number[];
  question_text: string;
  answer_options: string[];
  correct_answer: string;
  estimated_difficulty: "beginner" | "intermediate" | "advanced" | "master";
  order: number;
}

export interface GameZone {
  zone: {
    id: number;
    name: string;
    description: string;
    order: number;
  };
  unlocked_at: string;
  completion_percent: number;
  is_current: boolean;
  locked: boolean;
}


export interface Topic {
  topic:{
    id: number;
    name: string;
    description: string;
    order: number;
    zone: number; 
  };
  proficiency_percent: number;

}

// Leaderboard entries from /user-learning/progress/zones/all/
export type LeaderboardEntry = {
  user_id: number;
  username: string;
  first_name?: string | null;
  last_name?: string | null;
  overall_completion: number; // 0–100
  progresses: {
    zone_id: number;
    zone_name: string;
    zone_order: number | null;
    completion_percent: number; // 0–100
  }[];
};


