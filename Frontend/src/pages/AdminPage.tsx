import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { FullScreenSpinner } from "../components/ui/Spinner";
import type { User } from "../types";
import { ShieldCheck, Mail, Users, CheckCircle, BookOpen, Trophy } from "lucide-react";

export function AdminPage() {
  const { data: users, isLoading } = useQuery({
    queryKey: ["admin_users"],
    queryFn: async () => {
      const { data } = await api.get<User[]>("/admin/users");
      return data;
    },
  });

  if (isLoading) return <FullScreenSpinner />;

  const totalUsers = users?.length || 0;
  const verifiedUsers = users?.filter(u => u.is_verified).length || 0;
  const totalCompleted = users?.reduce((sum, u) => sum + (u.completed_lessons ?? 0), 0) || 0;
  const totalScore = users?.reduce((sum, u) => sum + (u.total_score ?? 0), 0) || 0;

  return (
    <div className="max-w-5xl mx-auto p-8 overflow-auto h-full">
      <div className="flex items-center gap-3 mb-8">
        <ShieldCheck size={32} className="text-accent" />
        <h1 className="text-3xl font-bold text-ui-heading">Панель администратора</h1>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-lg bg-bg-secondary border border-border">
          <div className="flex items-center gap-2 text-ui-text text-sm mb-1">
            <Users size={16} /> Всего пользователей
          </div>
          <div className="text-2xl font-bold text-ui-heading">{totalUsers}</div>
        </div>
        <div className="p-4 rounded-lg bg-bg-secondary border border-border">
          <div className="flex items-center gap-2 text-ui-text text-sm mb-1">
            <CheckCircle size={16} /> Подтвердили почту
          </div>
          <div className="text-2xl font-bold text-success">{verifiedUsers}</div>
        </div>
        <div className="p-4 rounded-lg bg-bg-secondary border border-border">
          <div className="flex items-center gap-2 text-ui-text text-sm mb-1">
            <BookOpen size={16} /> Пройдено уроков (всего)
          </div>
          <div className="text-2xl font-bold text-accent">{totalCompleted}</div>
        </div>
        <div className="p-4 rounded-lg bg-bg-secondary border border-border">
          <div className="flex items-center gap-2 text-ui-text text-sm mb-1">
            <Trophy size={16} /> Баллов (всего)
          </div>
          <div className="text-2xl font-bold text-warning">{totalScore}</div>
        </div>
      </div>

      <div className="bg-bg-secondary border border-border rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-bg-tertiary text-ui-heading text-sm">
              <th className="p-4 border-b border-border">ID</th>
              <th className="p-4 border-b border-border">Имя</th>
              <th className="p-4 border-b border-border">Email</th>
              <th className="p-4 border-b border-border">Почта</th>
              <th className="p-4 border-b border-border">Роль</th>
              <th className="p-4 border-b border-border">Уроков</th>
              <th className="p-4 border-b border-border">Баллы</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0 hover:bg-bg-tertiary/50 transition">
                <td className="p-4 text-ui-text text-sm">{u.id}</td>
                <td className="p-4 text-ui-heading font-medium">{u.username}</td>
                <td className="p-4 text-ui-text text-sm">{u.email}</td>
                <td className="p-4">
                  {u.is_verified ? (
                    <span className="flex items-center gap-1 text-xs text-success"><Mail size={12}/> ОК</span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-warning"><Mail size={12}/> Ожидает</span>
                  )}
                </td>
                <td className="p-4 text-sm">
                  {u.is_admin ? <span className="text-accent font-medium">Админ</span> : <span className="text-gray-500">Студент</span>}
                </td>
                <td className="p-4 text-sm text-ui-heading font-medium">
                  {u.completed_lessons ?? 0}
                </td>
                <td className="p-4 text-sm text-ui-heading font-medium">
                  {u.total_score ?? 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}