"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, Edit3, Download } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { tasksApi } from "@/lib/api";
import type { PlanResponse } from "@/types";
import { useToast } from "@/components/ui/use-toast";

interface PlanViewerProps {
  taskId: string;
  isAwaitingApproval: boolean;
  onApproved: () => void;
}

export function PlanViewer({
  taskId,
  isAwaitingApproval,
  onApproved,
}: PlanViewerProps) {
  const { toast } = useToast();
  const [plan, setPlan] = useState<PlanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    loadPlan();
  }, [taskId]);

  const loadPlan = async () => {
    try {
      setLoading(true);
      const data = await tasksApi.getPlan(taskId);
      setPlan(data);
    } catch (error) {
      console.error("Failed to load plan:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setSubmitting(true);
      await tasksApi.approve(taskId, true);
      toast({
        title: "Plan Approved",
        description: "The AI will now start implementing the code.",
      });
      onApproved();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to approve plan",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestChanges = async () => {
    if (!feedback.trim()) {
      toast({
        title: "Error",
        description: "Please provide feedback for changes",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      await tasksApi.approve(taskId, false, feedback);
      toast({
        title: "Changes Requested",
        description: "The AI will revise the plan based on your feedback.",
      });
      setFeedback("");
      setShowFeedback(false);
      onApproved();
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.detail || "Failed to request changes",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (
      !confirm(
        "Are you sure you want to reject this plan? The task will be cancelled."
      )
    ) {
      return;
    }

    try {
      setSubmitting(true);
      await tasksApi.approve(taskId, false);
      toast({
        title: "Plan Rejected",
        description: "The task has been cancelled.",
      });
      onApproved();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to reject plan",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const downloadPlan = () => {
    if (!plan) return;

    const blob = new Blob([plan.plan_content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `plan-${taskId}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-sm text-slate-600">Loading plan...</p>
        </CardContent>
      </Card>
    );
  }

  if (!plan) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-sm text-slate-600">Plan not available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Implementation Plan</CardTitle>
            <Button variant="outline" size="sm" onClick={downloadPlan}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code(props) {
                  const { node, className, children, ref, ...rest } = props;
                  const match = /language-(\w+)/.exec(className || "");
                  return match ? (
                    <SyntaxHighlighter
                      style={vscDarkPlus as any}
                      language={match[1]}
                      PreTag="div"
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {plan.plan_content}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      {isAwaitingApproval && (
        <Card>
          <CardHeader>
            <CardTitle>Review & Approve</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {showFeedback ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="feedback">Feedback for Changes</Label>
                  <Textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Please add email verification step before user activation. Also include rate limiting for the endpoint."
                    rows={4}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowFeedback(false);
                      setFeedback("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleRequestChanges} disabled={submitting}>
                    Submit Feedback
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={handleApprove}
                  disabled={submitting}
                  className="flex-1"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve & Proceed
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowFeedback(true)}
                  disabled={submitting}
                  className="flex-1"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Request Changes
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={submitting}
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
