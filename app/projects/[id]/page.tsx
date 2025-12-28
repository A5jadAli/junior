// ============================================================
// FILE: src/app/projects/[id]/page.tsx
// ============================================================

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, GitBranch, RefreshCw } from "lucide-react";
import { TaskCard } from "@/components/TaskCard";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";
import { projectsApi } from "@/lib/api";
import type { Project, Task } from "@/types";
import axios from "axios";

export default function ProjectDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    loadProject();
    loadTasks();
  }, [params.id]);

  const loadProject = async () => {
    try {
      const data = await projectsApi.getById(params.id);
      setProject(data);
    } catch (error) {
      console.error("Failed to load project:", error);
    }
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      // Get all tasks for this project
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks`
      );
      const allTasks = response.data;
      const projectTasks = allTasks.filter(
        (t: Task) => t.project_id === params.id
      );
      setTasks(projectTasks);
    } catch (error) {
      console.error("Failed to load tasks:", error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCreated = () => {
    setShowCreateDialog(false);
    loadTasks();
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Project Info */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">📦 {project.name}</h1>
              <p className="text-slate-600 dark:text-slate-400">
                {project.description || "No description"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-500">Repository:</span>
              <p className="font-mono text-sm">{project.repository_url}</p>
            </div>
            <div>
              <span className="text-slate-500">Main Branch:</span>
              <p className="flex items-center gap-2">
                <GitBranch className="h-4 w-4" />
                {project.main_branch}
              </p>
            </div>
          </div>
        </div>

        {/* Tasks Section */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">Tasks</h2>
            <p className="text-slate-600 dark:text-slate-400">
              {tasks.length} task{tasks.length !== 1 ? "s" : ""} total
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={loadTasks}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
          </div>
        </div>

        {/* Tasks List */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-lg">
            <div className="mb-4 text-6xl">📝</div>
            <h3 className="text-xl font-semibold mb-2">No tasks yet</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Create your first task to get started
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Task
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </main>

      {/* Create Task Dialog */}
      <CreateTaskDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        projectId={params.id}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  );
}
