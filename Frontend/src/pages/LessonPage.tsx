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

  const { data: lesson, isLoading: isLoadingLesson } = useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: () => coursesApi.getLesson(lessonId),
  });

  const { data: course, isLoading: isLoadingCourse } = useQuery({
    queryKey: ["course", 1],
    queryFn: () => coursesApi.getCourse(1),
  });

  if (isLoadingLesson || isLoadingCourse) return <FullScreenSpinner />;

  if (!lesson || !course) {
    return <div className="p-8 text-center text-ui-text">Урок не найден</div>;
  }

  const allLessons = course.modules.flatMap(m => m.lessons);
  const currentIndex = allLessons.findIndex(l => l.id === lessonId);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allLessons.length - 1 && allLessons[currentIndex + 1].unlocked;

  return (
    <div className="h-full flex flex-col">
      <LessonHeader
        title={lesson.title}
        lessonId={lesson.id}
        hasPrev={hasPrev}
        hasNext={hasNext}
      />

      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-[minmax(350px,_1.5fr)_2.4fr_minmax(250px,_0.6fr)] min-h-0 overflow-hidden">
        <div className="lg:border-r border-border lg:overflow-auto border-b lg:border-b-0 pb-8 lg:pb-0">
          <TheoryView markdown={lesson.theory_md} />
        </div>
        <div className="min-h-[400px] lg:min-h-0">
          <CodeEditor lesson={lesson} />
        </div>
        <div className="lg:border-l border-border lg:overflow-auto bg-bg-secondary">
          <TaskPanel task={lesson.task} />
        </div>
      </div>
    </div>
  );
}