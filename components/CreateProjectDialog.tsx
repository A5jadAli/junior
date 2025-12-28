"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { projectsApi, authApi } from "@/lib/api";
import type { Repository } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "sonner";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated: () => void;
}

export function CreateProjectDialog({
  open,
  onOpenChange,
  onProjectCreated,
}: CreateProjectDialogProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    tech_stack: "",
    coding_style: "PEP 8",
    test_framework: "pytest",
  });

  useEffect(() => {
    if (open && session?.accessToken) {
      loadRepositories();
    }
  }, [open, session]);

  const loadRepositories = async () => {
    if (!session?.accessToken) return;

    try {
      setLoadingRepos(true);
      const repos = await authApi.getRepositories(session.accessToken);
      setRepositories(repos);
    } catch (error) {
      console.error("Failed to load repositories:", error);
      toast({
        title: "Error",
        description: "Failed to load repositories",
        variant: "destructive",
      });
    } finally {
      setLoadingRepos(false);
    }
  };

  const handleRepoSelect = (repoId: string) => {
    const repo = repositories.find((r) => r.id.toString() === repoId);
    if (repo) {
      setSelectedRepo(repo);
      setFormData((prev) => ({
        ...prev,
        name: repo.name,
        description: repo.description || "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRepo) {
      toast({
        title: "Error",
        description: "Please select a repository",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      await projectsApi.create({
        name: formData.name,
        repository_url: selectedRepo.ssh_url,
        description: formData.description,
        context: {
          tech_stack: formData.tech_stack
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          coding_style: formData.coding_style,
          test_framework: formData.test_framework,
        },
      });

      toast({
        title: "Success",
        description: "Project created successfully",
      });

      onProjectCreated();

      // Reset form
      setFormData({
        name: "",
        description: "",
        tech_stack: "",
        coding_style: "PEP 8",
        test_framework: "pytest",
      });
      setSelectedRepo(null);
    } catch (error: any) {
      console.error("Failed to create project:", error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to create project",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Select a repository and configure your AI coding assistant
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Repository Selection */}
          <div className="space-y-2">
            <Label htmlFor="repository">Repository *</Label>
            {loadingRepos ? (
              <div className="text-sm text-slate-600">
                Loading repositories...
              </div>
            ) : (
              <Select onValueChange={handleRepoSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a repository" />
                </SelectTrigger>
                <SelectContent>
                  {repositories.map((repo) => (
                    <SelectItem key={repo.id} value={repo.id.toString()}>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{repo.full_name}</span>
                        {repo.description && (
                          <span className="text-xs text-slate-500">
                            {repo.description}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {selectedRepo && (
              <p className="text-xs text-slate-500">
                Using SSH URL: {selectedRepo.ssh_url}
              </p>
            )}
          </div>

          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="my-awesome-project"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Brief description of your project"
              rows={3}
            />
          </div>

          {/* Tech Stack */}
          <div className="space-y-2">
            <Label htmlFor="tech_stack">Tech Stack</Label>
            <Input
              id="tech_stack"
              value={formData.tech_stack}
              onChange={(e) =>
                setFormData({ ...formData, tech_stack: e.target.value })
              }
              placeholder="Python, FastAPI, PostgreSQL (comma-separated)"
            />
            <p className="text-xs text-slate-500">
              Separate technologies with commas
            </p>
          </div>

          {/* Coding Style */}
          <div className="space-y-2">
            <Label htmlFor="coding_style">Coding Style</Label>
            <Input
              id="coding_style"
              value={formData.coding_style}
              onChange={(e) =>
                setFormData({ ...formData, coding_style: e.target.value })
              }
              placeholder="PEP 8, Black, etc."
            />
          </div>

          {/* Test Framework */}
          <div className="space-y-2">
            <Label htmlFor="test_framework">Test Framework</Label>
            <Input
              id="test_framework"
              value={formData.test_framework}
              onChange={(e) =>
                setFormData({ ...formData, test_framework: e.target.value })
              }
              placeholder="pytest, unittest, etc."
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !selectedRepo}
              className="flex-1"
            >
              {loading ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
