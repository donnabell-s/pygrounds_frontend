export interface AdminZone {
  id: number;
  name: string;
  description: string;
  order: number;
  topics_count: number;
}

export interface AdminTopic {
  id: number;
  zone: number;
  zone_name: string;
  name: string;
  description: string;
  subtopics_count: number;
}

export interface AdminDocument {
  id: number;
  title: string;
  description: string;
  file_url: string;
  upload_date: string;
  file_size: number;
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
    game_data?: {
        options?: string[];
        explanation?: string;
        generation_timestamp?: string;
    };
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

export interface Subtopic {
  id: number;
  topic: number;
  topic_name: string;
  zone_name: string;
  name: string;
  concept_intent?: string;
  code_intent?: string;
  has_embedding: boolean;
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
export interface UploadedDocument {
    id: number;
    title: string;
    file: string;
    uploaded_at: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'master';
    processing_status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'QUEUED' | 'COMPLETED_WITH_WARNINGS';
    processing_message: string;
    total_pages: number;
    chunks_count: number;
}

export interface DocumentListResponse {
    status: 'success' | 'error';
    message: string;
    count: number;
    documents: UploadedDocument[];
    statuses: {
        pending: number;
        processing: number;
        completed: number;
        failed: number;
    };
}

export interface PipelineResult {
    status: 'success' | 'error' | 'accepted';
    message: string;
    queue_position?: number;
    processing_status?: string;
    results?: {
        status: 'success' | 'error';
        message: string;
        processed_subtopics: number;
        total_similarities: number;
    };
}

export interface Zone {
  id: number;
  name: string;
  description: string;
  order: number;
}

export interface AdminSubtopic {
  id: number;
  topic: number;
  topic_name: string;
  zone_name: string;
  name: string;
  concept_intent?: string;
  code_intent?: string;
  has_embedding: boolean;
  embedding_status: "not_started" | "pending" | "processing" | "completed" | "failed";
  embedding_error: string | null;
  embedding_updated_at: string;
}

