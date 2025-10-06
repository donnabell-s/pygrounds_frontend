export interface GeneratedQuestion {
    id: number;
    topic: {
        id: number;
        name: string;
        zone: {
            id: number;
            name: string;
        };
    };
    subtopic: {
        id: number;
        name: string;
    };
    topic_name: string;
    subtopic_name: string;
    question_text?: string; // Keep for backward compatibility
    question_preview: string; // This is what the API actually returns
    correct_answer: string;
    estimated_difficulty: 'beginner' | 'intermediate' | 'advanced' | 'master';
    game_type: 'coding' | 'non_coding';
    validation_status: 'pending' | 'processed';
    game_data: {
        // Fields from the detailed response
        function_name?: string;
        correct_code?: string;
        sample_input?: string;
        sample_output?: string;
        buggy_question_text?: string;
        buggy_code?: string;
        buggy_correct_code?: string;
        buggy_explanation?: string;
        hidden_tests?: Array<{input: string; expected_output: string}>;
        explanation?: string;
        generation_timestamp?: string;
        
        // Original fields
        zone_id?: number;
        zone_name?: string;
        rag_context?: {
            used: boolean;
            context: string;
        };
    };
}

export interface BulkGenerationParams {
    game_type: 'coding' | 'non_coding';
    difficulty_levels?: ('beginner' | 'intermediate' | 'advanced' | 'master')[];
    num_questions_per_subtopic: number;
    subtopic_ids?: number[];
}

export interface SingleGenerationParams {
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'master';
    game_type: 'coding' | 'non_coding';
    num_questions: number;
}

export interface BulkGenerationResponse {
    status: 'success' | 'error';
    session_id: string;
    message: string;
    statistics?: {
        total_questions_generated: number;
        duplicates_skipped: number;
        generation_duration: number;
        worker_stats: {
            total_workers: number;
            successful_workers: number;
            failed_workers: number;
            max_workers_used: number;
        };
        combination_stats: {
            total_processed: number;
            successful: number;
            failed: number;
        };
    };
    worker_logs?: WorkerLog[];
    worker_performance?: WorkerPerformance[];
}

export interface WorkerLog {
    worker_id: number;
    zone_name: string;
    difficulty: string;
    status: 'pending' | 'processing' | 'completed' | 'error' | 'failed';
    total_generated: number;
    progress: {
        total_combinations: number;
        processed_combinations: number;
        successful_combinations: number;
        failed_combinations: number;
        questions_generated: number;
    };
    detailed_steps: WorkerStep[];
    combination_details: CombinationDetail[];
}

export interface WorkerStep {
    step: string;
    status: 'started' | 'completed' | 'error';
    timestamp: number;
    elapsed: number;
}

export interface CombinationDetail {
    combination_id: number;
    subtopics: string[];
    status: 'success' | 'failed';
    questions_generated: number;
    duration: number;
}

export interface WorkerPerformance {
    worker_id: number;
    zone_name: string;
    difficulty: string;
    status: 'pending' | 'processing' | 'completed' | 'error' | 'failed';
    questions_generated: number;
    duration: number;
    combinations_processed: number;
    success_rate: number;
}

export interface GenerationStatus {
    session_id: string;
    status: 'processing' | 'completed' | 'completed_with_errors' | 'error';
    start_time: number;
    last_updated: number;
    overall_progress: {
        workers_completed: number;
        workers_failed: number;
        workers_active: number;
        total_questions_generated: number;
        total_combinations_processed: number;
        completion_percentage: number;
        estimated_completion_time: number;
    };
    worker_summary: {
        total_workers: number;
        active_workers: number;
        completed_workers: number;
        failed_workers: number;
    };
    zones: string[];
    difficulties: string[];
}

export interface WorkerStatus {
    worker_id: number;
    status: 'pending' | 'processing' | 'completed' | 'error' | 'failed';
    zone_name: string;
    difficulty: string;
    current_step: string;
    progress: {
        total_combinations: number;
        processed_combinations: number;
        successful_combinations: number;
        failed_combinations: number;
        questions_generated: number;
    };
    start_time: number | null;
    last_activity: number;
    duration: number;
}

export interface WorkersResponse {
    session_id: string;
    workers: WorkerStatus[];
    summary: {
        total_workers: number;
        active_workers: number;
        completed_workers: number;
        failed_workers: number;
        pending_workers: number;
    };
}

export interface DifficultyCheckRequest {
    question_ids: number[];
    question_type: 'minigame' | 'preassessment';
}

export interface DifficultyCheckResponse {
    status: 'success' | 'error';
    message: string;
    results?: {
        total_checked: number;
        updated_count: number;
        unchanged_count: number;
        error_count: number;
    };
}

export interface SingleGenerationResponse {
    status: 'success' | 'error';
    message: string;
    generated_count?: number;
    subtopic?: {
        id: number;
        name: string;
        topic_name: string;
    };
    questions?: GeneratedQuestion[];
}

export interface QuestionListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: GeneratedQuestion[];
}

export interface PreAssessmentBulkGenerationParams {
    topic_ids?: number[];
    total_questions: number;
}

export interface PreAssessmentGenerationResponse {
    session_id: string;
    status: 'processing' | 'completed' | 'error';
    step: string;
    questions_generated: number;
    total_questions_requested: number;
    questions_preview: {
        question_text: string;
        options: string[];
        correct_answer: string;
        estimated_difficulty: 'beginner' | 'intermediate' | 'advanced' | 'master';
    }[];
}

export interface PreAssessmentGenerationStatus {
    session_id: string;
    status: 'processing' | 'completed' | 'error';
    type: 'pre_assessment';
    step: string;
    questions_generated: number;
    total_questions_requested: number;
    questions_preview: {
        question_text: string;
        options: string[];
        correct_answer: string;
        estimated_difficulty: 'beginner' | 'intermediate' | 'advanced' | 'master';
    }[];
    topic_count: number;
    topics: {
        id: number;
        name: string;
        questions_generated?: number;
    }[];
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

export interface CancelGenerationResponse {
    success: boolean;
    session_id: string;
    message: string;
    cancellation_stats: {
        cancel_time: number;
        cancel_reason: string;
        session_duration: number;
        cleanup_stats: {
            questions_before_cleanup: number;
            incomplete_questions_removed: number;
            malformed_questions_removed: number;
            valid_questions_kept: number;
        };
    };
    session_status: GenerationStatus | PreAssessmentGenerationStatus;
}
