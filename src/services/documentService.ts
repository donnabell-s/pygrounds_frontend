import client from '../api/client';
import type { AdminDocument } from '../types/adaptive';

export const documentService = {
    uploadDocument: async (formData: FormData): Promise<AdminDocument> => {
        const response = await client.post<AdminDocument>('/documents/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    getAllDocuments: async (): Promise<AdminDocument[]> => {
        const response = await client.get<AdminDocument[]>('/documents/');
        return response.data;
    },

    getDocument: async (id: number): Promise<AdminDocument> => {
        const response = await client.get<AdminDocument>(`/documents/${id}/`);
        return response.data;
    },

    deleteDocument: async (id: number): Promise<void> => {
        await client.delete(`/documents/${id}/`);
    },

    downloadDocument: async (id: number): Promise<Blob> => {
        const response = await client.get<Blob>(`/documents/${id}/download/`, {
            responseType: 'blob'
        });
        return response.data;
    }
};
