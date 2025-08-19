import client from './client';
import type { PreAssessmentQuestion } from '../types/adaptive';
import type { 
    GeneratedQuestion, 
    QuestionGenerationResponse, 
    TopicQuestionsSummary,
    PreAssessmentBulkGenerationParams 
} from '../types/questions';

export const adminQuestionApi = {
    // Question Generation Endpoints
    generateBulkQuestions: async (data: { 
        subtopic_ids: number[],
        game_type: string,
        difficulties: string[],
        count: number
    }): Promise<QuestionGenerationResponse> => {
        const response = await client.post<QuestionGenerationResponse>('/generate/bulk/', data);
        return response.data;
    },

    generateSubtopicQuestions: async (subtopicId: number): Promise<QuestionGenerationResponse> => {
        const response = await client.post<QuestionGenerationResponse>(`/generate/subtopic/${subtopicId}/`);
        return response.data;
    },

    generatePreAssessmentQuestions: async (data: PreAssessmentBulkGenerationParams): Promise<QuestionGenerationResponse> => {
        const response = await client.post<QuestionGenerationResponse>('/generate/preassessment/bulk/', data);
        return response.data;
    },

    generateSoloPreAssessment: async (): Promise<QuestionGenerationResponse> => {
        const response = await client.post<QuestionGenerationResponse>('/generate/preassessment/solo/');
        return response.data;
    },

    generateSoloCoding: async (): Promise<QuestionGenerationResponse> => {
        const response = await client.post<QuestionGenerationResponse>('/generate/coding/solo/');
        return response.data;
    },

    generateSoloNonCoding: async (): Promise<QuestionGenerationResponse> => {
        const response = await client.post<QuestionGenerationResponse>('/generate/noncoding/solo/');
        return response.data;
    },

    getRagContext: async (subtopicId: number): Promise<{ context: string }> => {
        const response = await client.get<{ context: string }>(`/rag-context/${subtopicId}/`);
        return response.data;
    },

    // Question Retrieval Endpoints
    getQuestion: async (questionId: number): Promise<GeneratedQuestion> => {
        const response = await client.get<GeneratedQuestion>(`/question/${questionId}/`);
        return response.data;
    },

    getSubtopicQuestions: async (subtopicId: number): Promise<GeneratedQuestion[]> => {
        const response = await client.get<GeneratedQuestion[]>(`/subtopic/${subtopicId}/`);
        return response.data;
    },

    getTopicQuestionsSummary: async (topicId: number): Promise<TopicQuestionsSummary> => {
        const response = await client.get<TopicQuestionsSummary>(`/topic/${topicId}/summary/`);
        return response.data;
    },

    getAllQuestions: async (page = 1): Promise<{ results: GeneratedQuestion[], total: number }> => {
        const response = await client.get<{ results: GeneratedQuestion[], total: number }>(`/all/?page=${page}`);
        return response.data;
    },

    // Admin Question Management
    getAdminQuestions: async (page = 1): Promise<{ results: GeneratedQuestion[], total: number }> => {
        const response = await client.get<{ results: GeneratedQuestion[], total: number }>(`/admin/questions/?page=${page}`);
        return response.data;
    },

    getAdminQuestion: async (id: number): Promise<GeneratedQuestion> => {
        const response = await client.get<GeneratedQuestion>(`/admin/questions/${id}/`);
        return response.data;
    },

    updateAdminQuestion: async (id: number, data: Partial<GeneratedQuestion>): Promise<GeneratedQuestion> => {
        const response = await client.put<GeneratedQuestion>(`/admin/questions/${id}/`, data);
        return response.data;
    },

    deleteAdminQuestion: async (id: number): Promise<void> => {
        await client.delete(`/admin/questions/${id}/`);
    },

    // Pre-assessment Questions Management
    getAdminPreAssessmentQuestions: async (page = 1): Promise<{ results: PreAssessmentQuestion[], total: number }> => {
        const response = await client.get<{ results: PreAssessmentQuestion[], total: number }>(`/admin/pre-assessment/?page=${page}`);
        return response.data;
    },

    getAdminPreAssessmentQuestion: async (id: number): Promise<PreAssessmentQuestion> => {
        const response = await client.get<PreAssessmentQuestion>(`/admin/pre-assessment/${id}/`);
        return response.data;
    },

    updateAdminPreAssessmentQuestion: async (id: number, data: Partial<PreAssessmentQuestion>): Promise<PreAssessmentQuestion> => {
        const response = await client.put<PreAssessmentQuestion>(`/admin/pre-assessment/${id}/`, data);
        return response.data;
    },

    deleteAdminPreAssessmentQuestion: async (id: number): Promise<void> => {
        await client.delete(`/admin/pre-assessment/${id}/`);
    }
};