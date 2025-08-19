export interface GeneratedQuestion {
    id: number;
    topic: number;
    subtopic: number;
    question_text: string;
    correct_answer: string;
    estimated_difficulty: 'beginner' | 'intermediate' | 'advanced' | 'master';
    game_type: 'coding' | 'non_coding';
    game_data: Record<string, any>;
    validation_status: 'pending' | 'approved' | 'rejected' | 'needs_review';
}

export interface BulkGenerationParams {
    subtopic_ids: number[];
    game_type: 'coding' | 'non_coding';
    difficulties: ('beginner' | 'intermediate' | 'advanced' | 'master')[];
    count: number;
}

export interface PreAssessmentBulkGenerationParams {
    topic_ids?: number[];
    total_questions: number;
}
export interface QuestionGenerationResponse {
    success: boolean;
    questions: GeneratedQuestion[];
    message?: string;
}
 export interface TopicQuestionsSummary {
    total_questions: number;
    coding_questions: number;
    non_coding_questions: number;
    difficulty_distribution: {
        beginner: number;
        intermediate: number;
        advanced: number;
        master: number;
    };
}

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
