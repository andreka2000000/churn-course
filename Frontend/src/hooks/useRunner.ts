import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { runnerApi } from "../api/runner";
import type { RunResult, SubmitResult } from "../types";

export function useRunner(lessonId: number) {
  const [lastRun, setLastRun] = useState<RunResult | null>(null);
  const [lastSubmit, setLastSubmit] = useState<SubmitResult | null>(null);

  const runMutation = useMutation({
    mutationFn: (code: string) => runnerApi.run({ lesson_id: lessonId, code }),
    onSuccess: (data) => setLastRun(data),
  });

  const submitMutation = useMutation({
    mutationFn: (code: string) => runnerApi.submit({ lesson_id: lessonId, code }),
    onSuccess: (data) => {
      setLastSubmit(data);
      setLastRun(data);
    },
  });

  const run = useCallback(
    (code: string, options?: any) => runMutation.mutate(code, options),
    [runMutation]
  );

  const submit = useCallback(
    (code: string, options?: any) => submitMutation.mutate(code, options),
    [submitMutation]
  );

  return {
    run,
    submit,
    lastRun,
    lastSubmit,
    isRunning: runMutation.isPending || submitMutation.isPending,
  };
}