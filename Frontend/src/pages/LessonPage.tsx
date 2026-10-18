import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { coursesApi } from "../api/courses";
import { TheoryView } from "../components/lesson/TheoryView";
import { TaskPanel } from "../components/lesson/TaskPanel";
import { LessonHeader } from "../components/lesson/LessonHeader";
import { CodeEditor } from "../components/editor/CodeEditor";
import { FullScreenSpinner } from "../components/ui/Spinner";

export function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const lessonId = Number(id);

  const { data: lesson, isLoading } = useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: () => coursesApi.getLesson(lessonId),
  });

  if (isLoading) return <FullScreenSpinner />;

  if (!lesson) {
    return (
      <div className="p-8 text-center text-gray-400">Урок не найден</div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <LessonHeader
        title={lesson.title}
        lessonId={lesson.id}
        hasPrev={lesson.order > 1 || lesson.module_id > 1}
        hasNext={true}
      />

      <div className="flex-1 grid grid-cols-[minmax(350px,_1.5fr)_2fr_minmax(250px,_0.7fr)] min-h-0">
        <div className="border-r border-border overflow-auto">
          <TheoryView markdown={lesson.theory_md} />
        </div>

        <div className="min-h-0">
          <CodeEditor lesson={lesson} />
        </div>

        <div className="border-l border-border overflow-auto bg-bg-secondary">
          <TaskPanel task={lesson.task} />
        </div>
      </div>
    </div>
  );
}