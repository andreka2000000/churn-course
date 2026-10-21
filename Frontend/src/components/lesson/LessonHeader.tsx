import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";

interface Props {
  title: string;
  lessonId: number;
  hasPrev: boolean;
  hasNext: boolean;
}

export function LessonHeader({ title, lessonId, hasPrev, hasNext }: Props) {
  const navigate = useNavigate();
  return (
    <header className="flex items-center gap-4 px-6 py-3 border-b border-border bg-bg-secondary">
      <Link to="/" className="text-ui-text hover:text-accent flex items-center gap-1.5 text-sm transition"><Home size={14} /> К карте курса</Link>
      <span className="text-ui-text">/</span>
      <h1 className="font-medium text-ui-heading">{title}</h1>
      <div className="flex-1" />
      <button disabled={!hasPrev} onClick={() => navigate(`/lesson/${lessonId - 1}`)} className="p-1.5 rounded hover:bg-bg-tertiary disabled:opacity-30 disabled:cursor-not-allowed transition text-ui-text" title="Предыдущий урок"><ChevronLeft size={18} /></button>
      <button disabled={!hasNext} onClick={() => navigate(`/lesson/${lessonId + 1}`)} className="p-1.5 rounded hover:bg-bg-tertiary disabled:opacity-30 disabled:cursor-not-allowed transition text-ui-text" title="Следующий урок"><ChevronRight size={18} /></button>
    </header>
  );
}