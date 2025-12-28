"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  FileText,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { ProgressMonitor } from "@/components/ProgressMonitor";
import { PlanViewer } from "@/components/PlanViewer";
import { ReportViewer } from "@/components/ReportViewer";
import { tasksApi } from "@/lib/api";
import type { Task, TaskStatusResponse } from "@/types";
import {
  formatDate,
  getStatusColor,
  getStatusLabel,
  getPriorityColor,
} from "@/lib/utils";

export default function TaskDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [status, setStatus] = useState<TaskStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTask();
    loadStatus();

    // Poll status every 3 seconds if not completed
    const interval = setInterval(() => {
      if (
        status?.status !== "completed" &&
        status?.status !== "failed" &&
        status?.status !== "rejected"
      ) {
        loadStatus();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [params.id]);

  const loadTask = async () => {
    try {
      const data = await tasksApi.getById(params.id);
      setTask(data);
    } catch (error) {
      console.error("Failed to load task:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStatus = async () => {
    try {
      const data = await tasksApi.getStatus(params.id);
      setStatus(data);
    } catch (error) {
      console.error("Failed to load status:", error);
    }
  };

  if (loading || !task) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isCompleted = task.status === "completed";
  const isFailed = task.status === "failed" || task.status === "rejected";
  const isAwaitingApproval = task.status === "awaiting_approval";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Task Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  {isCompleted && (
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  )}
                  {isFailed && <XCircle className="h-6 w-6 text-red-600" />}
                  <CardTitle className="text-2xl">{task.description}</CardTitle>
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority.toUpperCase()}
                  </Badge>
                  <span>•</span>
                  <span>Created {formatDate(task.created_at)}</span>
                  {task.branch_name && (
                    <>
                      <span>•</span>
                      <span className="font-mono text-xs">
                        {task.branch_name}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <Button variant="outline" size="sm" onClick={loadStatus}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {/* Status & Progress */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className={`font-medium ${getStatusColor(task.status)} text-white px-3 py-1 rounded`}
                >
                  {getStatusLabel(task.status)}
                </span>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {status?.progress_percentage || 0}% Complete
                </span>
              </div>
              <Progress value={status?.progress_percentage || 0} />
            </div>

            {/* Error Message */}
            {task.error_message && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                <p className="text-sm text-red-800 dark:text-red-200">
                  <strong>Error:</strong> {task.error_message}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="progress" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="plan" disabled={!status?.plan_available}>
              <FileText className="h-4 w-4 mr-2" />
              Plan {!status?.plan_available && "(Not Ready)"}
            </TabsTrigger>
            <TabsTrigger value="report" disabled={!status?.report_available}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Report {!status?.report_available && "(Not Ready)"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="progress">
            <ProgressMonitor taskId={params.id} status={status} />
          </TabsContent>

          <TabsContent value="plan">
            {status?.plan_available && (
              <PlanViewer
                taskId={params.id}
                isAwaitingApproval={isAwaitingApproval}
                onApproved={loadTask}
              />
            )}
          </TabsContent>

          <TabsContent value="report">
            {status?.report_available && <ReportViewer taskId={params.id} />}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
