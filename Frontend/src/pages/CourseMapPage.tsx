import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { coursesApi } from "../api/courses";
import { CheckCircle2, Circle, BookOpen, Lock } from "lucide-react";
import { FullScreenSpinner } from "../components/ui/Spinner";
import { ProgressBar } from "../components/ui/ProgressBar";

export function CourseMapPage() {
  const { data: course, isLoading, error } = useQuery({
    queryKey: ["course", 1],
    queryFn: () => coursesApi.getCourse(1),
  });

  if (isLoading) return <FullScreenSpinner />;
  if (error || !course) return <div className="max-w-3xl mx-auto p-8 text-center text-ui-text">Не удалось загрузить курс.</div>;

  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const completedLessons = course.modules.reduce((sum, m) => sum + m.lessons.filter((l) => l.completed).length, 0);
  const progressPercent = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto p-8 overflow-auto h-full">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen size={32} className="text-accent" />
          <h1 className="text-3xl font-bold text-ui-heading">{course.title}</h1>
        </div>
        <p className="text-ui-text mb-4">{course.description}</p>

        <div className="max-w-md mb-8">
          <ProgressBar value={progressPercent} label={`Пройдено ${completedLessons} из ${totalLessons} уроков`} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-lg bg-bg-secondary border border-border">
            <div className="text-accent mb-2 font-semibold">🎯 Чему вы научитесь</div>
            <ul className="text-sm text-ui-text space-y-1 list-disc pl-4">
              <li>Проводить EDA и находить инсайты в данных</li>
              <li>Готовить признаки (Feature Engineering)</li>
              <li>Обучать ML-модели (LogReg, RF, CatBoost)</li>
              <li>Интерпретировать модели через SHAP</li>
              <li>Деплоить модели через FastAPI</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg bg-bg-secondary border border-border">
            <div className="text-accent mb-2 font-semibold">🛠 Что внутри</div>
            <ul className="text-sm text-ui-text space-y-1 list-disc pl-4">
              <li>4 модуля и 20 практических уроков</li>
              <li>Реальный датасет российского оператора</li>
              <li>Встроенный редактор кода (VS Code)</li>
              <li>Автоматическая проверка решений</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg bg-bg-secondary border border-border">
            <div className="text-accent mb-2 font-semibold">🏆 Результат</div>
            <p className="text-sm text-ui-text leading-relaxed">
              Вы создадите полноценную ML-модель прогноза оттока, оцените её экономический эффект и подготовите питч для руководства. Это готовый кейс в ваше портфолио!
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {course.modules.map((module) => {
          const completed = module.lessons.filter((l) => l.completed).length;
          return (
            <section key={module.id}>
              <div className="flex items-baseline justify-between mb-3">
                <h2 className="text-xl font-semibold text-ui-heading">Модуль {module.order}. {module.title}</h2>
                <span className="text-sm text-ui-text">{completed} / {module.lessons.length}</span>
              </div>

              <div className="space-y-2">
                {module.lessons.map((lesson) => (
                  <div key={lesson.id}>
                    {lesson.unlocked ? (
                      <Link to={`/lesson/${lesson.id}`} className="flex items-center gap-3 p-4 rounded-lg bg-bg-secondary hover:bg-bg-tertiary border border-border transition group">
                        {lesson.completed ? <CheckCircle2 size={20} className="text-success shrink-0" /> : <Circle size={20} className="text-ui-text shrink-0" />}
                        <span className="font-medium text-ui-heading">{module.order}.{lesson.order} {lesson.title}</span>
                        <span className="flex-1" />
                        <span className="text-ui-text transition">→</span>
                      </Link>
                    ) : (
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-bg-secondary/40 border border-border/50 opacity-60 cursor-not-allowed">
                        <Lock size={20} className="text-ui-text shrink-0" />
                        <span className="font-medium text-ui-text">{module.order}.{lesson.order} {lesson.title}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}