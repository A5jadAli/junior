"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Calendar, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { projectsApi } from "@/lib/api";
import type { Project } from "@/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ProjectCardProps {
  project: Project;
  onDeleted: () => void;
}

export function ProjectCard({ project, onDeleted }: ProjectCardProps) {
  const router = useRouter();

  const handleDelete = async () => {
    try {
      await projectsApi.delete(project.id);
      onDeleted();
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader onClick={() => router.push(`/projects/${project.id}`)}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">📦 {project.name}</CardTitle>
            <CardDescription className="line-clamp-2">
              {project.description || "No description"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent onClick={() => router.push(`/projects/${project.id}`)}>
        <div className="space-y-3">
          <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
            <GitBranch className="h-4 w-4 mr-2" />
            <span>{project.main_branch}</span>
          </div>

          <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Updated {formatDate(project.updated_at)}</span>
          </div>

          {project.context?.tech_stack &&
            project.context.tech_stack.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {project.context.tech_stack.slice(0, 3).map((tech) => (
                  <Badge key={tech} variant="secondary">
                    {tech}
                  </Badge>
                ))}
                {project.context.tech_stack.length > 3 && (
                  <Badge variant="secondary">
                    +{project.context.tech_stack.length - 3}
                  </Badge>
                )}
              </div>
            )}
        </div>

        <div className="flex gap-2 mt-4 pt-4 border-t">
          <Button
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/projects/${project.id}`);
            }}
          >
            View Tasks
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                onClick={(e) => e.stopPropagation()}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Project</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete {project.name}? This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
