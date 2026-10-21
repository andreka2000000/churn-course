import { api } from "./client";
import type { Course, Lesson, Progress } from "../types";

export const coursesApi = {
  getCourse: async (id = 1): Promise<Course> => {
    const { data } = await api.get(`/courses/${id}`);
    return data;
  },

  getLesson: async (id: number): Promise<Lesson> => {
    const { data } = await api.get(`/lessons/${id}`);
    return data;
  },

  getProgress: async (): Promise<Progress> => {
    const { data } = await api.get(`/progress`);
    return data;
  },
};