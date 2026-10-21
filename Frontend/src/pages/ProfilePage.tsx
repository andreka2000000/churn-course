import { useQuery } from "@tanstack/react-query";
import { coursesApi } from "../api/courses";
import { useAuthStore } from "../store/authStore";
import { FullScreenSpinner } from "../components/ui/Spinner";
import { ProgressBar } from "../components/ui/ProgressBar";
import { User as UserIcon, Award, BookOpen } from "lucide-react";

export function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const { data: progress, isLoading } = useQuery({
    queryKey: ["progress"],
    queryFn: () => coursesApi.getProgress(),
  });

  if (isLoading) return <FullScreenSpinner />;
  const percent = progress && progress.total_lessons > 0 ? (progress.completed_lessons / progress.total_lessons) * 100 : 0;

  return (
    <div className="max-w-2xl mx-auto p-8 overflow-auto h-full">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
          <UserIcon size={32} className="text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-ui-heading">{user?.username ?? "Студент"}</h1>
          <p className="text-ui-text text-sm">{user?.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-4 rounded-lg bg-bg-secondary border border-border">
          <div className="flex items-center gap-2 text-ui-text text-sm mb-1">
            <BookOpen size={14} /> Уроков пройдено
          </div>
          <div className="text-2xl font-bold text-ui-heading">
            {progress?.completed_lessons ?? 0} <span className="text-ui-text text-base">/ {progress?.total_lessons ?? 0}</span>
          </div>
        </div>
        <div className="p-4 rounded-lg bg-bg-secondary border border-border">
          <div className="flex items-center gap-2 text-ui-text text-sm mb-1">
            <Award size={14} /> Баллов набрано
          </div>
          <div className="text-2xl font-bold text-ui-heading">
            {progress?.score ?? 0} <span className="text-ui-text text-base">/ {progress?.max_score ?? 0}</span>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-bg-secondary border border-border mb-4">
        <h2 className="font-semibold text-ui-heading mb-3">Прогресс по курсу</h2>
        <ProgressBar value={percent} />
      </div>

      <div className="p-4 rounded-lg bg-bg-secondary border border-border mt-4">
        <h2 className="font-semibold text-ui-heading mb-3 flex items-center gap-2">
          <Award size={20} className="text-accent" /> Ваш сертификат
        </h2>
        {progress && progress.completed_lessons === progress.total_lessons && progress.total_lessons > 0 ? (
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-success/50 rounded-lg bg-success/5">
            <div className="text-4xl mb-2">🎉</div>
            <p className="text-success font-medium text-center mb-4">Поздравляем! Вы полностью прошли курс.</p>
            <button onClick={() => alert("Здесь будет генерация PDF-сертификата!")} className="px-6 py-2 bg-success hover:bg-green-600 text-white rounded-md transition">
              Скачать сертификат
            </button>
          </div>
        ) : (
          <div className="text-sm text-ui-text">
            <p>Сертификат станет доступен после прохождения всех {progress?.total_lessons || 20} уроков.</p>
            <p className="mt-2 text-xs">Осталось пройти: <span className="text-ui-heading font-medium">{(progress?.total_lessons || 20) - (progress?.completed_lessons || 0)}</span> уроков.</p>
          </div>
        )}
      </div>
    </div>
  );
}