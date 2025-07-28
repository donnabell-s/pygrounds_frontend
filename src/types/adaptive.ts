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
