import axios, { type AxiosResponse } from "axios";
import client from "./client"; 


const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

export interface ReadingMaterial {
  id: number;
  title: string;
  content: string;
  subtopic?: {
    id: number;
    title: string;
    topic?: { id: number; title: string };
  };
}

interface Topic {
  id: number;
  name: string;
}

interface Subtopic {
  id: number;
  name: string;
  topic_ref?: number;
  topic_name?: string;
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
export const readingApi = {

  getAll: async (isAdmin = false): Promise<any> => {
  const endpoint = isAdmin
    ? "/reading/admin/materials/?ordering=-id"
    : "/reading-materials/?ordering=id";

  const token =
    localStorage.getItem("accessToken") || localStorage.getItem("access_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await client.get(endpoint, { headers });
  return response.data;
},

  
  create: async (data: {
    title: string;
    content: string;
    topic_ref: number;
    subtopic_ref: number;
  }) => {
    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("access_token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return axios.post(`${API_BASE_URL}/reading/admin/materials/`, data, { headers });
  },

  update: async (
    id: number,
    data: { title: string; content: string; topic_ref: number; subtopic_ref: number }
  ) => {
    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("access_token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return axios.put(`${API_BASE_URL}/reading/admin/materials/${id}/`, data, { headers });
  },

  delete: async (id: number) => {
    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("access_token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return axios.delete(`${API_BASE_URL}/reading/admin/materials/${id}/`, { headers });
  },
  getTopics: async (): Promise<Topic[]> => {
    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("access_token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    let allResults: Topic[] = [];
    let nextUrl: string | null = `${API_BASE_URL}/reading/admin/topics/`;

    while (nextUrl) {
      const res: AxiosResponse<PaginatedResponse<Topic>> = await axios.get<
        PaginatedResponse<Topic>
      >(nextUrl, { headers });

      const data: PaginatedResponse<Topic> = res.data;

      if (Array.isArray(data.results)) {
        allResults = [...allResults, ...data.results];
        nextUrl = data.next;
      } else {
        nextUrl = null;
      }
    }

    console.log("Loaded total topics:", allResults.length);
    return allResults;
  },

  getSubtopics: async (): Promise<Subtopic[]> => {
    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("access_token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    let allResults: Subtopic[] = [];
    let nextUrl: string | null = `${API_BASE_URL}/reading/admin/subtopics/`;

    while (nextUrl) {
      const res: AxiosResponse<PaginatedResponse<Subtopic>> = await axios.get<
        PaginatedResponse<Subtopic>
      >(nextUrl, { headers });

      const data: PaginatedResponse<Subtopic> = res.data;

      if (Array.isArray(data.results)) {
        allResults = [...allResults, ...data.results];
        nextUrl = data.next;
      } else {
        nextUrl = null;
      }
    }

    console.log("Loaded total subtopics:", allResults.length);
    return allResults;
  },
};

 
