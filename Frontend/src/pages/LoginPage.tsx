import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuthStore } from "../store/authStore";
import { Loader2, Code2 } from "lucide-react";

export function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const url = mode === "login" ? "/auth/login" : "/auth/register";
      const payload =
        mode === "login" ? { email, password } : { email, username, password };

      const { data } = await api.post(url, payload);
      setAuth(data.token, data.user);
      navigate("/");
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Что-то пошло не так"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Code2 size={40} className="text-accent mb-3" />
          <h1 className="text-2xl font-bold text-white">Учи IT</h1>
          <p className="text-gray-400 text-sm mt-1">
            Прогноз оттока клиентов телеком-оператора
          </p>
        </div>

        <div className="bg-bg-secondary border border-border rounded-lg p-6">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-2 rounded-md text-sm transition ${
                mode === "login"
                  ? "bg-accent text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Вход
            </button>
            <button
              onClick={() => setMode("register")}
              className={`flex-1 py-2 rounded-md text-sm transition ${
                mode === "register"
                  ? "bg-accent text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Регистрация
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-bg-primary border border-border focus:border-accent outline-none text-white transition"
                placeholder="student@example.com"
              />
            </div>

            {mode === "register" && (
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">
                  Имя пользователя
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-bg-primary border border-border focus:border-accent outline-none text-white transition"
                  placeholder="Иван"
                />
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Пароль</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-bg-primary border border-border focus:border-accent outline-none text-white transition"
                placeholder="••••••"
              />
            </div>

            {error && (
              <div className="p-3 rounded-md bg-danger/10 border border-danger/30 text-danger text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-md bg-accent hover:bg-accent-hover text-white font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {mode === "login" ? "Войти" : "Создать аккаунт"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}