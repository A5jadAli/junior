export interface User {
  id: number;
  login: string;
  name: string;
  email: string;
  avatar_url: string;
}

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  clone_url: string;
  ssh_url: string;
  default_branch: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  repository_url: string;
  description: string | null;
  local_path: string;
  main_branch: string;
  context: {
    tech_stack?: string[];
    coding_style?: string;
    test_framework?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  plan_path: string | null;
  report_path: string | null;
  branch_name: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export type TaskStatus =
  | "pending"
  | "git_sync"
  | "planning"
  | "awaiting_approval"
  | "approved"
  | "in_progress"
  | "testing"
  | "completed"
  | "failed"
  | "rejected";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface TaskStatusResponse {
  id: string;
  status: TaskStatus;
  current_step: string;
  progress_percentage: number;
  logs: string[];
  plan_available: boolean;
  report_available: boolean;
  error_message: string | null;
}

export interface PlanResponse {
  task_id: string;
  plan_content: string;
  status: TaskStatus;
}

export interface ReportResponse {
  task_id: string;
  report_content: string;
  status: TaskStatus;
  branch_name: string;
  commit_hash: string;
}
