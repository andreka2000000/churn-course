import { api } from "./client";
import type { RunRequest, RunResult, SubmitResult } from "../types";

export const runnerApi = {
  run: async (payload: RunRequest): Promise<RunResult> => {
    const { data } = await api.post(`/run`, payload);
    return data;
  },

  submit: async (payload: RunRequest): Promise<SubmitResult> => {
    const { data } = await api.post(`/submit`, payload);
    return data;
  },
};