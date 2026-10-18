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

  const percent =
    progress && progress.total_lessons > 0
      ? (progress.completed_lessons / progress.total_lessons) * 100
      : 0;

  return (
    <div className="max-w-2xl mx-auto p-8 overflow-auto h-full">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
          <UserIcon size={32} className="text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {user?.username ?? "Студент"}
          </h1>
          <p className="text-gray-400 text-sm">{user?.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-4 rounded-lg bg-bg-secondary border border-border">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <BookOpen size={14} />
            Уроков пройдено
          </div>
          <div className="text-2xl font-bold text-white">
            {progress?.completed_lessons ?? 0}{" "}
            <span className="text-gray-500 text-base">
              / {progress?.total_lessons ?? 0}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-bg-secondary border border-border">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <Award size={14} />
            Баллов набрано
          </div>
          <div className="text-2xl font-bold text-white">
            {progress?.score ?? 0}{" "}
            <span className="text-gray-500 text-base">
              / {progress?.max_score ?? 0}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-bg-secondary border border-border">
        <h2 className="font-semibold text-white mb-3">Прогресс по курсу</h2>
        <ProgressBar value={percent} />
      </div>
    </div>
  );
}