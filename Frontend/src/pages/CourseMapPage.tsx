import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { coursesApi } from "../api/courses";
import { CheckCircle2, Circle, BookOpen } from "lucide-react";
import { FullScreenSpinner } from "../components/ui/Spinner";
import { ProgressBar } from "../components/ui/ProgressBar";

export function CourseMapPage() {
  const { data: course, isLoading, error } = useQuery({
    queryKey: ["course", 1],
    queryFn: () => coursesApi.getCourse(1),
  });

  if (isLoading) return <FullScreenSpinner />;

  if (error || !course) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center text-gray-400">
        Не удалось загрузить курс. Проверьте, что бэкенд запущен на{" "}
        <code className="text-accent">http://localhost:8080</code>
      </div>
    );
  }

  const totalLessons = course.modules.reduce(
    (sum, m) => sum + m.lessons.length,
    0
  );
  const completedLessons = course.modules.reduce(
    (sum, m) => sum + m.lessons.filter((l) => l.completed).length,
    0
  );
  const progressPercent =
    totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto p-8 overflow-auto h-full">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen size={32} className="text-accent" />
          <h1 className="text-3xl font-bold text-white">{course.title}</h1>
        </div>
        <p className="text-gray-400 mb-4">{course.description}</p>

        <div className="max-w-md">
          <ProgressBar
            value={progressPercent}
            label={`Пройдено ${completedLessons} из ${totalLessons} уроков`}
          />
        </div>
      </div>

      <div className="space-y-8">
        {course.modules.map((module) => {
          const completed = module.lessons.filter((l) => l.completed).length;
          return (
            <section key={module.id}>
              <div className="flex items-baseline justify-between mb-3">
                <h2 className="text-xl font-semibold text-white">
                  Модуль {module.order}. {module.title}
                </h2>
                <span className="text-sm text-gray-500">
                  {completed} / {module.lessons.length}
                </span>
              </div>

              <div className="space-y-2">
                {module.lessons.map((lesson) => (
                  <Link
                    key={lesson.id}
                    to={`/lesson/${lesson.id}`}
                    className="flex items-center gap-3 p-4 rounded-lg bg-bg-secondary hover:bg-bg-tertiary border border-border transition group"
                  >
                    {lesson.completed ? (
                      <CheckCircle2 size={20} className="text-success shrink-0" />
                    ) : (
                      <Circle size={20} className="text-gray-600 shrink-0" />
                    )}
                    <span className="font-medium text-gray-200 group-hover:text-white">
                      {module.order}.{lesson.order} {lesson.title}
                    </span>
                    <span className="flex-1" />
                    <span className="text-gray-500 group-hover:text-accent transition">
                      →
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}