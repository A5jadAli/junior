"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { tasksApi } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import type { TaskPriority } from "@/types";

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onTaskCreated: () => void;
}

export function CreateTaskDialog({
  open,
  onOpenChange,
  projectId,
  onTaskCreated,
}: CreateTaskDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    priority: "medium" as TaskPriority,
    additional_context: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.description.length < 10) {
      toast({
        title: "Error",
        description: "Task description must be at least 10 characters",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      await tasksApi.create({
        project_id: projectId,
        description: formData.description,
        priority: formData.priority,
        additional_context: formData.additional_context || undefined,
      });

      toast({
        title: "Success",
        description: "Task created successfully. The AI is now working on it!",
      });

      onTaskCreated();

      // Reset form
      setFormData({
        description: "",
        priority: "medium",
        additional_context: "",
      });
    } catch (error: any) {
      console.error("Failed to create task:", error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to create task",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Describe what you want the AI to build. Be as detailed as possible.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Task Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Create a REST API endpoint POST /api/users that accepts email, password, and name. Include input validation, password hashing with bcrypt, and return JWT token on success."
              rows={6}
              required
            />
            <p className="text-xs text-slate-500">
              Be specific about what you want. Include API endpoints, database
              models, validation rules, etc.
            </p>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) =>
                setFormData({ ...formData, priority: value as TaskPriority })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Additional Context */}
          <div className="space-y-2">
            <Label htmlFor="additional_context">
              Additional Context (Optional)
            </Label>
            <Textarea
              id="additional_context"
              value={formData.additional_context}
              onChange={(e) =>
                setFormData({ ...formData, additional_context: e.target.value })
              }
              placeholder="Follow existing authentication patterns. Use the same error response format as other endpoints. Add rate limiting."
              rows={3}
            />
            <p className="text-xs text-slate-500">
              Extra instructions, patterns to follow, or specific requirements
            </p>
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
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
