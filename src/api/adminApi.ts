import client from './client';
import type { PreAssessmentQuestion, AdminZone, AdminTopic, AdminSubtopic, UploadedDocument, PipelineResult, DocumentListResponse } from '../types/adaptive';

export const adminApi = {
    // PreAssessment APIs
    getPreAssessmentQuestions: async (): Promise<PreAssessmentQuestion[]> => {
        try {
            const response = await client.get<PreAssessmentQuestion[]>('/preassessment/questions/');
            return response.data;
        } catch (error) {
            console.warn('PreAssessment endpoint not implemented yet');
            return [];
        }
    },
    // Zone APIs
    getAllZones: async (): Promise<AdminZone[]> => {
        const response = await client.get<AdminZone[]>('/zones/');
        return response.data;
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
    getAllTopics: async (): Promise<AdminTopic[]> => {
        const response = await client.get<AdminTopic[]>('/topics/');
        return response.data;
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
    getAllSubtopics: async (): Promise<AdminSubtopic[]> => {
        const response = await client.get<AdminSubtopic[]>('/subtopics/');
        return response.data;
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


};
