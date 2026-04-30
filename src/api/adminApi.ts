import client from './client';
import type { PreAssessmentQuestion, AdminZone, AdminTopic, AdminSubtopic, UploadedDocument, PipelineResult, DocumentListResponse } from '../types/adaptive';
import type { AdminUser, AdminNotification, AdminNotificationListResponse, SendNotificationPayload } from '../types/admin';
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
    CancelGenerationResponse,
    RegenerationPreviewResponse,
    RegenerationSuccessResponse
} from '../types/questions';

export const adminApi = {
 
    // QUESTION GENERATION 
 
    generateBulkQuestions: async (params: BulkGenerationParams): Promise<BulkGenerationResponse> => {
        const response = await client.post<BulkGenerationResponse>('/generate/bulk/', params);
        return response.data;
    },

    generateSingleSubtopicQuestions: async (subtopicId: number, params: SingleGenerationParams): Promise<SingleGenerationResponse> => {
        const response = await client.post<SingleGenerationResponse>(`/generate/subtopic/${subtopicId}/`, params);
        return response.data;
    },

    getGenerationStatus: async (sessionId: string): Promise<GenerationStatus> => {
        const response = await client.get<GenerationStatus>(`/generate/status/${sessionId}/`);
        return response.data;
    },

    getWorkerStatus: async (sessionId: string): Promise<WorkersResponse> => {
        const response = await client.get<WorkersResponse>(`/generate/workers/${sessionId}/`);
        return response.data;
    },

    cancelGeneration: async (sessionId: string): Promise<CancelGenerationResponse> => {
        const response = await client.post<CancelGenerationResponse>(`/generate/cancel/${sessionId}/`, {});
        return response.data;
    },

// Difficulty Checker APIs (NEW ML CHECK DIFFICULTY)
bulkCheckDifficulty: async (payload: {
  questionType: "minigame" | "preassessment";
  gameType?: "coding" | "non_coding";          // optional
  validationStatus?: "pending" | "processed";  // optional
  difficultyFilter?: "beginner" | "intermediate" | "advanced" | "master"; // optional
}): Promise<DifficultyCheckResponse> => {
  const buildBody = () => ({
    question_type_filter: payload.questionType, // keep if backend expects it
    status_filter: payload.validationStatus ?? "all",
    difficulty_filter: payload.difficultyFilter ?? "all",
  });

  const normalize = (data: any) => {
    if (data?.status === "error") {
      return {
        status: "error" as const,
        message: data?.message || "Failed to check difficulty.",
        results: { total_checked: 0, updated_count: 0, unchanged_count: 0, error_count: 1 },
      };
    }

    return {
      status: "success" as const,
      message: data?.message || "Difficulty check done.",
      results: data?.results || {
        total_checked: data?.total_checked ?? 0,
        updated_count: data?.updated_count ?? data?.updated ?? 0,
        unchanged_count: data?.unchanged_count ?? data?.unchanged ?? 0,
        error_count: data?.error_count ?? 0,
      },
    };
  };

  try {
    const body = buildBody();

    // ✅ preassessment: single endpoint
    if (payload.questionType === "preassessment") {
      const res = await client.post(`/ml/check-difficulty/preassessment/`, body);
      return normalize(res.data);
    }

    // ✅ minigame with explicit type: single endpoint
    if (payload.gameType === "coding" || payload.gameType === "non_coding") {
      const res = await client.post(`/ml/check-difficulty/${payload.gameType}/`, body);
      return normalize(res.data);
    }

    // ✅ minigame ALL types: call BOTH coding + non_coding then merge
    const [codingRes, nonCodingRes] = await Promise.allSettled([
      client.post(`/ml/check-difficulty/coding/`, body),
      client.post(`/ml/check-difficulty/non_coding/`, body),
    ]);

    const okResults: Array<ReturnType<typeof normalize>> = [];
    const errors: string[] = [];

    if (codingRes.status === "fulfilled") okResults.push(normalize(codingRes.value.data));
    else errors.push("coding failed");

    if (nonCodingRes.status === "fulfilled") okResults.push(normalize(nonCodingRes.value.data));
    else errors.push("non_coding failed");

    if (okResults.length === 0) {
      return {
        status: "error",
        message: `Failed to check difficulty (${errors.join(", ")}).`,
        results: { total_checked: 0, updated_count: 0, unchanged_count: 0, error_count: 1 },
      };
    }

    // merge counts
    const merged = okResults.reduce(
      (acc, cur) => {
        const r = cur.results;
        if (!r) return acc;
        acc.total_checked += r.total_checked ?? 0;
        acc.updated_count += r.updated_count ?? 0;
        acc.unchanged_count += r.unchanged_count ?? 0;
        acc.error_count += r.error_count ?? 0;
        return acc;
      },
      { total_checked: 0, updated_count: 0, unchanged_count: 0, error_count: 0 }
    );

    return {
      status: "success",
      message: errors.length
        ? `Difficulty check partially done (${errors.join(", ")}).`
        : "Difficulty check done for Coding + Non-Coding.",
      results: merged,
    };
  } catch (error: any) {
    const msg =
      error?.response?.data?.message ||
      error?.response?.data?.detail ||
      error?.message ||
      "Failed to check difficulty.";

    return {
      status: "error",
      message: msg,
      results: { total_checked: 0, updated_count: 0, unchanged_count: 0, error_count: 1 },
    };
  }
},




    // QUESTION MANAGEMENT 
 
    getAllQuestions: async (params?: {
        game_type?: 'coding' | 'non_coding';
        difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'master';
        validation_status?: 'pending' | 'processed';
        topic_id?: number;
        subtopic_id?: number;
        page?: number;
        page_size?: number;
        search?: string;
    }): Promise<QuestionListResponse> => {
        const queryParams = new URLSearchParams();
        if (params?.game_type) queryParams.append('game_type', params.game_type);
        if (params?.difficulty) queryParams.append('difficulty', params.difficulty);
        if (params?.validation_status) queryParams.append('validation_status', params.validation_status);
        if (params?.topic_id) queryParams.append('topic_id', params.topic_id.toString());
        if (params?.subtopic_id) queryParams.append('subtopic_id', params.subtopic_id.toString());
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
        if (params?.search) queryParams.append('search', params.search);
        
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

    getAdminQuestion: async (questionId: number): Promise<GeneratedQuestion> => {
        const response = await client.get<GeneratedQuestion>(`/admin/questions/${questionId}/`);
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
        correct_code?: string;
        sample_input?: string;
        sample_output?: string;
        function_name?: string;
        buggy_explanation?: string;
        buggy_correct_code?: string;
        buggy_question_text?: string;
        buggy_code?: string;
        test_cases?: Array<{input: any[]; expected: any}>;
    }): Promise<GeneratedQuestion> => {
        const response = await client.patch<GeneratedQuestion>(`/admin/questions/${questionId}/`, data);
        return response.data;
    },

    deleteQuestion: async (questionId: number): Promise<void> => {
        await client.delete(`/admin/questions/${questionId}/`);
    },

    regenerateQuestion: async (questionId: number, data: {
        llm_prompt: string;
        regenerated?: Record<string, any>;
        accepted_fields?: string[];
    }): Promise<RegenerationPreviewResponse | RegenerationSuccessResponse> => {
      const response = await client.post(`/question/${questionId}/regenerate/`, data, { timeout: 30000 });
        return response.data;
    },

    getQuestionsBySubtopic: async (subtopicId: number, params?: {
        difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'master';
        game_type?: 'coding' | 'non_coding';
        minigame_type?: string;
    }): Promise<{ subtopic: any; questions: GeneratedQuestion[] }> => {
        const queryParams = new URLSearchParams();
        if (params?.difficulty) queryParams.append('difficulty', params.difficulty);
        if (params?.game_type) queryParams.append('game_type', params.game_type);
        if (params?.minigame_type) queryParams.append('minigame_type', params.minigame_type);
        
        const url = `/subtopic/${subtopicId}/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await client.get<{ subtopic: any; questions: GeneratedQuestion[] }>(url);
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

    // PRE-ASSESSMENT 
 
    generatePreAssessmentQuestions: async (params: PreAssessmentBulkGenerationParams): Promise<PreAssessmentGenerationResponse> => {
        const response = await client.post<PreAssessmentGenerationResponse>('/generate/preassessment/', params);
        return response.data;
    },

    getPreAssessmentGenerationStatus: async (sessionId: string): Promise<PreAssessmentGenerationStatus> => {
        const response = await client.get<PreAssessmentGenerationStatus>(`/generate/status/${sessionId}/`);
        return response.data;
    },

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
        answer_options?: string[];
        correct_answer?: string;
        topic_ids?: number[];
        subtopic_ids?: number[];
        estimated_difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'master';
        order?: number;
    }): Promise<PreAssessmentQuestion> => {
        const response = await client.patch<PreAssessmentQuestion>(`/admin/pre-assessment/${questionId}/`, data);
        return response.data;
    },

    deletePreAssessmentQuestion: async (questionId: number): Promise<void> => {
        await client.delete(`/admin/pre-assessment/${questionId}/`);
    },

 
    // ZONE MANAGEMENT 
 
    getAllZones: async (params?: {
        page?: number;
        page_size?: number;
    }): Promise<{ count: number; results: AdminZone[] }> => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
        
        const url = `/zones/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await client.get<{ count: number; next: string | null; previous: string | null; results: AdminZone[] }>(url);
        return response.data;
    },

    getAllZonesNoPagination: async (): Promise<AdminZone[]> => {
        const allZones: AdminZone[] = [];
        let nextUrl: string | null = '/zones/';
        
        while (nextUrl) {
            const response = await client.get<{ count: number; next: string | null; previous: string | null; results: AdminZone[] }>(nextUrl);
            const data: { count: number; next: string | null; previous: string | null; results: AdminZone[] } = response.data;
            
            if (data.results) {
                allZones.push(...data.results);
                nextUrl = data.next ? new URL(data.next).pathname.replace('/api', '') + new URL(data.next).search : null;
            } else {
                break;
            }
        }
        
        return allZones;
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

   
    // TOPIC MANAGEMENT 

    getAllTopics: async (params?: {
        page?: number;
        page_size?: number;
    }): Promise<{ count: number; results: AdminTopic[] }> => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
        
        const url = `/topics/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await client.get<{ count: number; next: string | null; previous: string | null; results: AdminTopic[] }>(url);
        return response.data; 
    },

    getAllTopicsNoPagination: async (): Promise<AdminTopic[]> => {
        const allTopics: AdminTopic[] = [];
        let nextUrl: string | null = '/topics/';
        
        while (nextUrl) {
            const response = await client.get<{ count: number; next: string | null; previous: string | null; results: AdminTopic[] }>(nextUrl);
            const data: { count: number; next: string | null; previous: string | null; results: AdminTopic[] } = response.data;
            
            if (data.results) {
                allTopics.push(...data.results);
                nextUrl = data.next ? new URL(data.next).pathname.replace('/api', '') + new URL(data.next).search : null;
            } else {
                break;
            }
        }
        
        return allTopics;
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


    // SUBTOPIC MANAGEMENT 

    getAllSubtopics: async (params?: {
        page?: number;
        page_size?: number;
    }): Promise<{ count: number; results: AdminSubtopic[] }> => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
        
        const url = `/subtopics/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await client.get<{ count: number; next: string | null; previous: string | null; results: AdminSubtopic[] }>(url);
        return response.data;
    },

    getAllSubtopicsNoPagination: async (): Promise<AdminSubtopic[]> => {
        const allSubtopics: AdminSubtopic[] = [];
        let nextUrl: string | null = '/subtopics/';
        
        while (nextUrl) {
            const response = await client.get<{ count: number; next: string | null; previous: string | null; results: AdminSubtopic[] }>(nextUrl);
            const data: { count: number; next: string | null; previous: string | null; results: AdminSubtopic[] } = response.data;
            
            if (data.results) {
                allSubtopics.push(...data.results);
                nextUrl = data.next ? new URL(data.next).pathname.replace('/api', '') + new URL(data.next).search : null;
            } else {
                break;
            }
        }
        
        return allSubtopics;
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
        const response = await client.post<AdminSubtopic>('/subtopics/', data, { timeout: 30000 });
        return response.data;
    },

    updateSubtopic: async (id: number, data: {
        topic?: number,
        name?: string,
        concept_intent?: string,
        code_intent?: string
    }): Promise<AdminSubtopic> => {
        const response = await client.put<AdminSubtopic>(`/subtopics/${id}/`, data, { timeout: 30000 });
        return response.data;
    },

    deleteSubtopic: async (id: number): Promise<void> => {
        await client.delete(`/subtopics/${id}/`);
    },


    // DOCUMENT MANAGEMENT 

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
        const response = await client.post<PipelineResult>(`/pipeline/${id}/`, { reprocess }, {
            timeout: 30000
        });
        return response.data;
    },

    cancelPipeline: async (id: number): Promise<void> => {
        await client.post(`/pipeline/${id}/cancel/`);
    },

    getDocumentStatus: async (id: number): Promise<UploadedDocument> => {
        const response = await client.get<UploadedDocument>(`/docs/${id}/`);
        return response.data;
    },

  
    // CONTENT INGESTION 

    getTopics: async (): Promise<AdminTopic[]> => {
        const response = await client.get<{ count: number; next: string | null; previous: string | null; results: AdminTopic[] }>('/content-ingestion/topics/');
        return response.data.results;
    },

    getSubtopics: async (topicId: number): Promise<AdminSubtopic[]> => {
        const response = await client.get<{ count: number; next: string | null; previous: string | null; results: AdminSubtopic[] }>(`/content-ingestion/subtopics/?topic=${topicId}`);
        return response.data.results;
    },

    getDocuments: async (subtopicId: number): Promise<UploadedDocument[]> => {
        const response = await client.get<{ count: number; next: string | null; previous: string | null; results: UploadedDocument[] }>(`/content-ingestion/documents/?subtopic=${subtopicId}`);
        return response.data.results;
    },


    // USER MANAGEMENT

    getAllUsers: async (params?: {
        page?: number;
        page_size?: number;
        search?: string;
    }): Promise<{ count: number; next: string | null; previous: string | null; results: AdminUser[] }> => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
        if (params?.search) queryParams.append('search', params.search);

        const url = `/user/admin/users/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await client.get<{ count: number; next: string | null; previous: string | null; results: AdminUser[] }>(url);
        return response.data;
    },

    createUser: async (userData: {
        username: string;
        email: string;
        first_name: string;
        last_name: string;
        password: string;
        role?: string;
        is_staff?: boolean;
        is_superuser?: boolean;
    }): Promise<AdminUser> => {
        const response = await client.post<AdminUser>('/user/admin/users/', userData);
        return response.data;
    },

    updateUser: async (userId: number, userData: {
        username?: string;
        email?: string;
        first_name?: string;
        last_name?: string;
        role?: string;
        is_staff?: boolean;
        is_superuser?: boolean;
        is_active?: boolean;
    }): Promise<AdminUser> => {
        const response = await client.put<AdminUser>(`/user/admin/users/${userId}/`, userData);
        return response.data;
    },

    deleteUser: async (userId: number): Promise<void> => {
        await client.delete(`/user/admin/users/${userId}/`);
    },

    deactivateUser: async (userId: number): Promise<AdminUser> => {
        const response = await client.patch<AdminUser>(`/user/admin/users/${userId}/deactivate/`);
        return response.data;
    },

    activateUser: async (userId: number): Promise<AdminUser> => {
        const response = await client.patch<AdminUser>(`/user/admin/users/${userId}/activate/`);
        return response.data;
    },


    // NOTIFICATIONS

    getAllNotifications: async (params?: {
        page?: number;
        page_size?: number;
    }): Promise<AdminNotificationListResponse> => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
        const url = `/user/admin/notifications/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await client.get<AdminNotificationListResponse>(url);
        return response.data;
    },

    getNotification: async (id: number): Promise<AdminNotification> => {
        const response = await client.get<AdminNotification>(`/user/admin/notifications/${id}/`);
        return response.data;
    },

    sendNotification: async (payload: SendNotificationPayload): Promise<AdminNotification> => {
        const response = await client.post<AdminNotification>('/user/admin/notifications/', payload);
        return response.data;
    },

    deleteNotification: async (id: number): Promise<void> => {
        await client.delete(`/user/admin/notifications/${id}/`);
    },
};
