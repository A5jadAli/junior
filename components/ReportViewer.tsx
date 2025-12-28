"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, ExternalLink, GitBranch } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { tasksApi } from "@/lib/api";
import type { ReportResponse } from "@/types";

interface ReportViewerProps {
  taskId: string;
}

export function ReportViewer({ taskId }: ReportViewerProps) {
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, [taskId]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const data = await tasksApi.getReport(taskId);
      setReport(data);
    } catch (error) {
      console.error("Failed to load report:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!report) return;

    const blob = new Blob([report.report_content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${taskId}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-sm text-slate-600">Loading report...</p>
        </CardContent>
      </Card>
    );
  }

  if (!report) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-sm text-slate-600">Report not available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Task Completed Successfully! 🎉</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-500 mb-1">Branch</p>
              <Badge variant="outline" className="font-mono">
                <GitBranch className="h-3 w-3 mr-1" />
                {report.branch_name}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Commit Hash</p>
              <Badge variant="outline" className="font-mono text-xs">
                {report.commit_hash.substring(0, 8)}
              </Badge>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={downloadReport}>
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Full Report */}
      <Card>
        <CardHeader>
          <CardTitle>Completion Report</CardTitle>
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
              {report.report_content}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
