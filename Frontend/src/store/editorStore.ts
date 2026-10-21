import { create } from "zustand";

interface EditorState {
  codeByLesson: Record<number, string>;
  setCode: (lessonId: number, code: string) => void;
  getCode: (lessonId: number, fallback: string) => string;
  resetCode: (lessonId: number) => void;
}

export const useEditorStore = create<EditorState>()((set, get) => ({
  codeByLesson: {},

  setCode: (lessonId, code) =>
    set((s) => ({ codeByLesson: { ...s.codeByLesson, [lessonId]: code } })),

  getCode: (lessonId, fallback) =>
    get().codeByLesson[lessonId] ?? fallback,

  resetCode: (lessonId) =>
    set((s) => {
      const copy = { ...s.codeByLesson };
      delete copy[lessonId];
      return { codeByLesson: copy };
    }),
}));