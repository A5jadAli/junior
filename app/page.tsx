"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Github, Code, Zap, CheckCircle } from "lucide-react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-primary rounded-2xl">
                <Code className="h-12 w-12 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              AI Coding Assistant
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Your autonomous development partner. Let AI handle the coding
              while you focus on the big picture.
            </p>
          </div>

          {/* Login Card */}
          <Card className="max-w-md mx-auto mb-16 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                Get Started
              </CardTitle>
              <CardDescription className="text-center">
                Sign in with GitHub to access your repositories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
                className="w-full h-12 text-lg"
                size="lg"
              >
                <Github className="mr-2 h-5 w-5" />
                Continue with GitHub
              </Button>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card>
              <CardHeader>
                <Zap className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Autonomous Development</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400">
                  AI agents handle git operations, code generation, testing, and
                  deployment automatically.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CheckCircle className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Human Oversight</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400">
                  Review and approve implementation plans before code is
                  written. Full control when you need it.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Code className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Production Ready</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400">
                  Generated code includes tests, error handling, and follows
                  your project's conventions.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* How it works */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-8">How It Works</h2>
            <div className="grid md:grid-cols-4 gap-6 text-left">
              <div className="relative">
                <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold mb-4">
                  1
                </div>
                <h3 className="font-semibold mb-2">Describe Task</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Tell the AI what feature you want to build
                </p>
              </div>

              <div className="relative">
                <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold mb-4">
                  2
                </div>
                <h3 className="font-semibold mb-2">Review Plan</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  AI generates detailed implementation plan for approval
                </p>
              </div>

              <div className="relative">
                <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold mb-4">
                  3
                </div>
                <h3 className="font-semibold mb-2">AI Implements</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Code is written, tested, and pushed to new branch
                </p>
              </div>

              <div className="relative">
                <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold mb-4">
                  4
                </div>
                <h3 className="font-semibold mb-2">Review & Merge</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Check the results and merge when ready
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
