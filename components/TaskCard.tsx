"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, CheckCircle, AlertCircle, Eye } from "lucide-react";
import {
  formatDate,
  getStatusColor,
  getStatusLabel,
  getPriorityColor,
} from "@/lib/utils";
import type { Task } from "@/types";

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const router = useRouter();

  const getStatusIcon = (status: string) => {
    if (status === "completed")
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (status === "failed" || status === "rejected")
      return <AlertCircle className="h-5 w-5 text-red-600" />;
    return <Clock className="h-5 w-5 text-blue-600" />;
  };

  const getProgressPercentage = (status: string): number => {
    const progressMap: Record<string, number> = {
      pending: 0,
      git_sync: 10,
      planning: 30,
      awaiting_approval: 40,
      approved: 45,
      in_progress: 60,
      testing: 80,
      completed: 100,
      failed: 0,
      rejected: 0,
    };
    return progressMap[status] || 0;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {getStatusIcon(task.status)}
              <h3 className="text-lg font-semibold line-clamp-1">
                {task.description}
              </h3>
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
                  <span className="font-mono text-xs">{task.branch_name}</span>
                </>
              )}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/tasks/${task.id}`)}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span
              className={`font-medium ${getStatusColor(task.status)} text-white px-2 py-1 rounded text-xs`}
            >
              {getStatusLabel(task.status)}
            </span>
            <span className="text-slate-600 dark:text-slate-400">
              {getProgressPercentage(task.status)}%
            </span>
          </div>
          <Progress value={getProgressPercentage(task.status)} />
        </div>

        {/* Error Message */}
        {task.error_message && (
          <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-800 dark:text-red-200">
            <AlertCircle className="h-4 w-4 inline mr-2" />
            {task.error_message}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
