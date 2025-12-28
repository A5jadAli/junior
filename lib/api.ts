import axios from "axios";
import type {
  Project,
  Task,
  TaskStatusResponse,
  PlanResponse,
  ReportResponse,
  Repository,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Projects
export const projectsApi = {
  create: async (data: {
    name: string;
    repository_url: string;
    description?: string;
    context?: any;
  }): Promise<Project> => {
    const response = await api.post("/api/projects", data);
    return response.data;
  },

  getAll: async (): Promise<Project[]> => {
    const response = await api.get("/api/projects");
    return response.data;
  },

  getById: async (id: string): Promise<Project> => {
    const response = await api.get(`/api/projects/${id}`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/projects/${id}`);
  },
};

// Tasks
export const tasksApi = {
  create: async (data: {
    project_id: string;
    description: string;
    priority?: string;
    additional_context?: string;
  }): Promise<Task> => {
    const response = await api.post("/api/tasks", data);
    return response.data;
  },

  getById: async (id: string): Promise<Task> => {
    const response = await api.get(`/api/tasks/${id}`);
    return response.data;
  },

  getStatus: async (id: string): Promise<TaskStatusResponse> => {
    const response = await api.get(`/api/status/${id}`);
    return response.data;
  },

  getPlan: async (id: string): Promise<PlanResponse> => {
    const response = await api.get(`/api/tasks/${id}/plan`);
    return response.data;
  },

  getReport: async (id: string): Promise<ReportResponse> => {
    const response = await api.get(`/api/tasks/${id}/report`);
    return response.data;
  },

  approve: async (
    id: string,
    approved: boolean,
    feedback?: string
  ): Promise<void> => {
    await api.post(`/api/tasks/${id}/approve`, {
      approved,
      feedback,
    });
  },
};

// Auth & GitHub
export const authApi = {
  githubAuth: async (
    code: string
  ): Promise<{ access_token: string; user: any }> => {
    const response = await api.post("/api/auth/github", { code });
    return response.data;
  },

  getRepositories: async (accessToken: string): Promise<Repository[]> => {
    const response = await api.get("/api/user/repositories", {
      params: { access_token: accessToken },
    });
    return response.data;
  },
};
