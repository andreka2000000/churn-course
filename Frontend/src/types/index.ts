// ====== Пользователь ======
export interface User {
  id: number;
  email: string;
  username: string;
  avatar_url?: string;
}

// ====== Курс ======
export interface Course {
  id: number;
  title: string;
  description: string;
  modules: Module[];
}

export interface Module {
  id: number;
  title: string;
  order: number;
  lessons: LessonSummary[];
  completed_count?: number;
}

export interface LessonSummary {
  id: number;
  title: string;
  order: number;
  completed: boolean;
}

export interface Lesson {
  id: number;
  title: string;
  order: number;
  module_id: number;
  theory_md: string;
  starter_code: string;
  task: Task;
  completed: boolean;
}

export interface Task {
  id: number;
  description: string;
  max_score: number;
  hint?: string;
}

// ====== Запуск кода ======
export interface RunRequest {
  lesson_id: number;
  code: string;
}

export interface RunResult {
  stdout: string;
  stderr: string;
  exit_code: number;
  files: Record<string, string>; // имя файла → base64
  duration_ms: number;
}

export interface SubmitResult extends RunResult {
  passed: boolean;
  score: number;
  max_score: number;
  tests: TestResult[];
}

export interface TestResult {
  name: string;
  passed: boolean;
  message?: string;
}

// ====== Прогресс ======
export interface Progress {
  total_lessons: number;
  completed_lessons: number;
  score: number;
  max_score: number;
}