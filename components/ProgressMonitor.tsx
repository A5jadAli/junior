"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import type { TaskStatusResponse } from "@/types";
import { getStatusLabel } from "@/lib/utils";

interface ProgressMonitorProps {
  taskId: string;
  status: TaskStatusResponse | null;
}

export function ProgressMonitor({ taskId, status }: ProgressMonitorProps) {
  if (!status) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-sm text-slate-600">Loading status...</p>
        </CardContent>
      </Card>
    );
  }

  const steps = [
    { status: "pending", label: "Task Created", progress: 0 },
    { status: "git_sync", label: "Git Sync", progress: 10 },
    { status: "planning", label: "Generating Plan", progress: 30 },
    { status: "awaiting_approval", label: "Awaiting Approval", progress: 40 },
    { status: "approved", label: "Plan Approved", progress: 45 },
    { status: "in_progress", label: "Implementing Code", progress: 60 },
    { status: "testing", label: "Running Tests", progress: 80 },
    { status: "completed", label: "Completed", progress: 100 },
  ];

  const currentStepIndex = steps.findIndex((s) => s.status === status.status);

  return (
    <div className="space-y-6">
      {/* Current Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {status.status === "completed" ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : status.status === "failed" || status.status === "rejected" ? (
              <AlertCircle className="h-5 w-5 text-red-600" />
            ) : (
              <Clock className="h-5 w-5 text-blue-600 animate-pulse" />
            )}
            Current Status: {getStatusLabel(status.status)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {status.current_step}
          </p>
        </CardContent>
      </Card>

      {/* Progress Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const isPending = index > currentStepIndex;

              return (
                <div key={step.status} className="flex items-center gap-4">
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      isCompleted
                        ? "bg-green-500 border-green-500"
                        : isCurrent
                          ? "bg-blue-500 border-blue-500 animate-pulse"
                          : "bg-slate-200 border-slate-300"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    ) : (
                      <span
                        className={`text-sm font-semibold ${isCurrent ? "text-white" : "text-slate-500"}`}
                      >
                        {index + 1}
                      </span>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-medium ${isCurrent ? "text-blue-600" : isCompleted ? "text-green-600" : "text-slate-400"}`}
                      >
                        {step.label}
                      </span>
                      {isCurrent && (
                        <Badge variant="outline" className="animate-pulse">
                          In Progress
                        </Badge>
                      )}
                      {isCompleted && (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Activity Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {status.logs && status.logs.length > 0 ? (
              status.logs.map((log, index) => (
                <div
                  key={index}
                  className="text-sm font-mono p-2 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700"
                >
                  {log}
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No logs available yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
