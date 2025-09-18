import client from './client';
import type { PreAssessmentQuestion, AdminZone, AdminTopic, AdminSubtopic, UploadedDocument, PipelineResult, DocumentListResponse } from '../types/adaptive';
import type { 
    BulkGenerationParams, 
    SingleGenerationParams, 
    BulkGenerationResponse, 
    SingleGenerationResponse, 
    GeneratedQuestion, 
    QuestionListResponse, 
    GenerationStatus, 
    WorkersResponse,
    DifficultyCheckResponse,
    PreAssessmentBulkGenerationParams,
    PreAssessmentGenerationResponse,
    PreAssessmentGenerationStatus,
    CancelGenerationResponse
} from '../types/questions';

export const adminApi = {
    // Question Generation APIs
    generateBulkQuestions: async (params: BulkGenerationParams): Promise<BulkGenerationResponse> => {
        const response = await client.post<BulkGenerationResponse>('/generate/bulk/', params);
        return response.data;
    },

    generateSingleSubtopicQuestions: async (subtopicId: number, params: SingleGenerationParams): Promise<SingleGenerationResponse> => {
        const response = await client.post<SingleGenerationResponse>(`/generate/subtopic/${subtopicId}/`, params);
        return response.data;
    },

    // Worker Tracking APIs
    getGenerationStatus: async (sessionId: string): Promise<GenerationStatus> => {
        const response = await client.get<GenerationStatus>(`/generate/status/${sessionId}/`);
        return response.data;
    },

    getWorkerStatus: async (sessionId: string): Promise<WorkersResponse> => {
        const response = await client.get<WorkersResponse>(`/generate/workers/${sessionId}/`);
        return response.data;
    },

    // Cancel Generation APIs
    cancelGeneration: async (sessionId: string): Promise<CancelGenerationResponse> => {
        const response = await client.post<CancelGenerationResponse>(`/generate/cancel/${sessionId}/`, {});
        return response.data;
    },

    // Difficulty Checker APIs (Standby - Model not connected yet)
    bulkCheckDifficulty: async (questionType: 'minigame' | 'preassessment'): Promise<DifficultyCheckResponse> => {
        // TODO: Replace with actual API call when AI model is connected
        console.warn(`Bulk difficulty checker model not connected yet - would check all ${questionType} questions`);
        
        // Mock response for development
        return {
            status: 'success', 
            message: `Difficulty checker is not yet connected. Would analyze all ${questionType} questions and update their status from 'pending' to 'processed'.`,
            results: {
                total_checked: 0,
                updated_count: 0,
                unchanged_count: 0,
                error_count: 0
            }
        };
    },

    // Question Management APIs
    getAllQuestions: async (params?: {
        game_type?: 'coding' | 'non_coding';
        difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'master';
        validation_status?: 'pending' | 'processed';
        topic_id?: number;
        subtopic_id?: number;
        page?: number;
        page_size?: number;
    }): Promise<QuestionListResponse> => {
        const queryParams = new URLSearchParams();
        if (params?.game_type) queryParams.append('game_type', params.game_type);
        if (params?.difficulty) queryParams.append('difficulty', params.difficulty);
        if (params?.validation_status) queryParams.append('validation_status', params.validation_status);
        if (params?.topic_id) queryParams.append('topic_id', params.topic_id.toString());
        if (params?.subtopic_id) queryParams.append('subtopic_id', params.subtopic_id.toString());
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
        
        const url = `/admin/questions/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await client.get<QuestionListResponse>(url);
        return response.data;
    },

    getAllQuestionsNoPagination: async (params?: {
        game_type?: 'coding' | 'non_coding';
        difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'master';
        validation_status?: 'pending' | 'processed';
        topic_id?: number;
        subtopic_id?: number;
    }): Promise<QuestionListResponse> => {
        const queryParams = new URLSearchParams();
        if (params?.game_type) queryParams.append('game_type', params.game_type);
        if (params?.difficulty) queryParams.append('difficulty', params.difficulty);
        if (params?.validation_status) queryParams.append('validation_status', params.validation_status);
        if (params?.topic_id) queryParams.append('topic_id', params.topic_id.toString());
        if (params?.subtopic_id) queryParams.append('subtopic_id', params.subtopic_id.toString());
        
        const url = `/all/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await client.get<QuestionListResponse>(url);
        return response.data;
    },

    getQuestion: async (questionId: number): Promise<GeneratedQuestion> => {
        const response = await client.get<GeneratedQuestion>(`/question/${questionId}/`);
        return response.data;
    },

    updateQuestion: async (questionId: number, data: {
        question_text?: string;
        correct_answer?: string;
        estimated_difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'master';
        game_data?: any;
        validation_status?: 'pending' | 'processed';
    }): Promise<GeneratedQuestion> => {
        const response = await client.put<GeneratedQuestion>(`/admin/questions/${questionId}/`, data);
        return response.data;
    },

    partialUpdateQuestion: async (questionId: number, data: {
        question_text?: string;
        correct_answer?: string;
        estimated_difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'master';
        game_type?: 'coding' | 'non_coding';
        game_data?: any;
        validation_status?: 'pending' | 'processed';
    }): Promise<GeneratedQuestion> => {
        const response = await client.patch<GeneratedQuestion>(`/admin/questions/${questionId}/`, data);
        return response.data;
    },

    deleteQuestion: async (questionId: number): Promise<void> => {
        await client.delete(`/admin/questions/${questionId}/`);
    },

    getQuestionsBySubtopic: async (subtopicId: number): Promise<{ subtopic: any; questions: GeneratedQuestion[] }> => {
        const response = await client.get<{ subtopic: any; questions: GeneratedQuestion[] }>(`/subtopic/${subtopicId}/`);
        return response.data;
    },

    getTopicSummary: async (topicId: number): Promise<any> => {
        const response = await client.get<any>(`/topic/${topicId}/summary/`);
        return response.data;
    },

    bulkUpdateQuestionStatus: async (questionIds: number[], validationStatus: 'pending' | 'processed'): Promise<{ status: string; updated_count: number; message: string }> => {
        const response = await client.post<{ status: string; updated_count: number; message: string }>('/admin/questions/bulk-update-status/', {
            question_ids: questionIds,
            validation_status: validationStatus
        });
        return response.data;
    },

    bulkDeleteQuestions: async (questionIds: number[]): Promise<{ status: string; deleted_count: number; message: string }> => {
        const response = await client.post<{ status: string; deleted_count: number; message: string }>('/admin/questions/bulk-delete/', {
            question_ids: questionIds
        });
        return response.data;
    },

    // Additional Generation APIs
    generatePreAssessmentQuestions: async (params: PreAssessmentBulkGenerationParams): Promise<PreAssessmentGenerationResponse> => {
        const response = await client.post<PreAssessmentGenerationResponse>('/generate/preassessment/', params);
        return response.data;
    },

    getPreAssessmentGenerationStatus: async (sessionId: string): Promise<PreAssessmentGenerationStatus> => {
        const response = await client.get<PreAssessmentGenerationStatus>(`/generate/status/${sessionId}/`);
        return response.data;
    },

    // PreAssessment APIs
    getPreAssessmentQuestions: async (params?: {
        page?: number;
        page_size?: number;
        difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'master';
        topic_id?: number;
        search?: string;
    }): Promise<{ count: number; next: string | null; previous: string | null; results: PreAssessmentQuestion[] }> => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
        if (params?.difficulty) queryParams.append('difficulty', params.difficulty);
        if (params?.topic_id) queryParams.append('topic_id', params.topic_id.toString());
        if (params?.search) queryParams.append('search', params.search);
        
        const url = `/admin/pre-assessment/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await client.get<{ count: number; next: string | null; previous: string | null; results: PreAssessmentQuestion[] }>(url);
        return response.data;
    },

    getPreAssessmentQuestion: async (questionId: number): Promise<PreAssessmentQuestion> => {
        const response = await client.get<PreAssessmentQuestion>(`/admin/pre-assessment/${questionId}/`);
        return response.data;
    },

    createPreAssessmentQuestion: async (data: {
        topic_ids: number[];
        subtopic_ids: number[];
        question_text: string;
        answer_options: string[];
        correct_answer: string;
        estimated_difficulty: 'beginner' | 'intermediate' | 'advanced' | 'master';
        order: number;
    }): Promise<PreAssessmentQuestion> => {
        const response = await client.post<PreAssessmentQuestion>('/admin/pre-assessment/', data);
        return response.data;
    },

    updatePreAssessmentQuestion: async (questionId: number, data: {
        topic_ids?: number[];
        subtopic_ids?: number[];
        question_text?: string;
        answer_options?: string[];
        correct_answer?: string;
        estimated_difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'master';
        order?: number;
    }): Promise<PreAssessmentQuestion> => {
        const response = await client.put<PreAssessmentQuestion>(`/admin/pre-assessment/${questionId}/`, data);
        return response.data;
    },

    partialUpdatePreAssessmentQuestion: async (questionId: number, data: {
        question_text?: string;
        topic_ids?: number[];
        subtopic_ids?: number[];
        estimated_difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'master';
    }): Promise<PreAssessmentQuestion> => {
        const response = await client.patch<PreAssessmentQuestion>(`/admin/pre-assessment/${questionId}/`, data);
        return response.data;
    },

    deletePreAssessmentQuestion: async (questionId: number): Promise<void> => {
        await client.delete(`/admin/pre-assessment/${questionId}/`);
    },
    // Zone APIs
    getAllZones: async (params?: {
        page?: number;
        page_size?: number;
    }): Promise<{ count: number; results: AdminZone[] }> => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
        
        const url = `/zones/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await client.get<{ count: number; next: string | null; previous: string | null; results: AdminZone[] }>(url);
        return response.data; // Return full paginated response for server-side pagination
    },

    getAllZonesNoPagination: async (): Promise<AdminZone[]> => {
        const response = await client.get<{ count: number; next: string | null; previous: string | null; results: AdminZone[] }>('/zones/');
        return response.data.results; // Extract results from paginated response for backward compatibility
    },

    getZone: async (id: number): Promise<AdminZone> => {
        const response = await client.get<AdminZone>(`/zones/${id}/`);
        return response.data;
    },

    createZone: async (data: {
        name: string,
        description: string,
        order: number
    }): Promise<AdminZone> => {
        const response = await client.post<AdminZone>('/zones/', data);
        return response.data;
    },

    updateZone: async (id: number, data: {
        name?: string,
        description?: string,
        order?: number
    }): Promise<AdminZone> => {
        const response = await client.put<AdminZone>(`/zones/${id}/`, data);
        return response.data;
    },

    deleteZone: async (id: number, force: boolean = false): Promise<void> => {
        const url = force ? `/zones/${id}/?force=true` : `/zones/${id}/`;
        await client.delete(url);
    },

    // Topic APIs
    getAllTopics: async (params?: {
        page?: number;
        page_size?: number;
    }): Promise<{ count: number; results: AdminTopic[] }> => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
        
        const url = `/topics/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await client.get<{ count: number; next: string | null; previous: string | null; results: AdminTopic[] }>(url);
        return response.data; // Return full paginated response for server-side pagination
    },

    getAllTopicsNoPagination: async (): Promise<AdminTopic[]> => {
        const response = await client.get<{ count: number; next: string | null; previous: string | null; results: AdminTopic[] }>('/topics/');
        return response.data.results; // Extract results from paginated response for backward compatibility
    },

    getTopic: async (id: number): Promise<AdminTopic> => {
        const response = await client.get<AdminTopic>(`/topics/${id}/`);
        return response.data;
    },

    createTopic: async (data: {
        zone: number,
        name: string,
        description: string
    }): Promise<AdminTopic> => {
        const response = await client.post<AdminTopic>('/topics/', data);
        return response.data;
    },

    updateTopic: async (id: number, data: {
        zone?: number,
        name?: string,
        description?: string
    }): Promise<AdminTopic> => {
        const response = await client.put<AdminTopic>(`/topics/${id}/`, data);
        return response.data;
    },

    deleteTopic: async (id: number): Promise<void> => {
        await client.delete(`/topics/${id}/`);
    },

    // Subtopic APIs
    getAllSubtopics: async (params?: {
        page?: number;
        page_size?: number;
    }): Promise<{ count: number; results: AdminSubtopic[] }> => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
        
        const url = `/subtopics/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await client.get<{ count: number; next: string | null; previous: string | null; results: AdminSubtopic[] }>(url);
        return response.data; // Return full paginated response for server-side pagination
    },

    getAllSubtopicsNoPagination: async (): Promise<AdminSubtopic[]> => {
        const response = await client.get<{ count: number; next: string | null; previous: string | null; results: AdminSubtopic[] }>('/subtopics/');
        return response.data.results; // Extract results from paginated response for backward compatibility
    },

    getSubtopic: async (id: number): Promise<AdminSubtopic> => {
        const response = await client.get<AdminSubtopic>(`/subtopics/${id}/`);
        return response.data;
    },

    createSubtopic: async (data: {
        topic: number,
        name: string,
        concept_intent?: string,
        code_intent?: string
    }): Promise<AdminSubtopic> => {
        const response = await client.post<AdminSubtopic>('/subtopics/', data);
        return response.data;
    },

    updateSubtopic: async (id: number, data: {
        topic?: number,
        name?: string,
        concept_intent?: string,
        code_intent?: string
    }): Promise<AdminSubtopic> => {
        const response = await client.put<AdminSubtopic>(`/subtopics/${id}/`, data);
        return response.data;
    },

    deleteSubtopic: async (id: number): Promise<void> => {
        await client.delete(`/subtopics/${id}/`);
    },

    // Document APIs
    getAllDocuments: async (): Promise<DocumentListResponse> => {
        try {
            const response = await client.get<DocumentListResponse>('/docs/');
            return response.data;
        } catch (error: any) {
            console.warn('Documents endpoint not available:', error.message);
            return {
                status: 'error',
                message: error.message || 'Failed to fetch documents',
                count: 0,
                documents: [],
                statuses: { pending: 0, processing: 0, completed: 0, failed: 0 }
            };
        }
    },

    uploadDocument: async (formData: FormData): Promise<UploadedDocument> => {
        const response = await client.post<{ status: string; document: UploadedDocument }>('/docs/upload/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.document;
    },

    deleteDocument: async (id: number): Promise<void> => {
        await client.delete(`/docs/${id}/delete/`);
    },

    runPipeline: async (id: number, reprocess: boolean = false): Promise<PipelineResult> => {
        const response = await client.post<PipelineResult>(`/pipeline/${id}/`, { reprocess });
        return response.data;
    },

    cancelPipeline: async (id: number): Promise<void> => {
        await client.post(`/pipeline/${id}/cancel/`);
    },

    getDocumentStatus: async (id: number): Promise<UploadedDocument> => {
        const response = await client.get<UploadedDocument>(`/docs/${id}/`);
        return response.data;
    },

    // Content Ingestion APIs - Fixed for pagination compatibility
    getTopics: async (): Promise<AdminTopic[]> => {
        const response = await client.get<{ count: number; next: string | null; previous: string | null; results: AdminTopic[] }>('/content-ingestion/topics/');
        return response.data.results; // Extract results from paginated response
    },

    getSubtopics: async (topicId: number): Promise<AdminSubtopic[]> => {
        const response = await client.get<{ count: number; next: string | null; previous: string | null; results: AdminSubtopic[] }>(`/content-ingestion/subtopics/?topic=${topicId}`);
        return response.data.results; // Extract results from paginated response
    },

    getDocuments: async (subtopicId: number): Promise<UploadedDocument[]> => {
        const response = await client.get<{ count: number; next: string | null; previous: string | null; results: UploadedDocument[] }>(`/content-ingestion/documents/?subtopic=${subtopicId}`);
        return response.data.results; // Extract results from paginated response
    },


};
