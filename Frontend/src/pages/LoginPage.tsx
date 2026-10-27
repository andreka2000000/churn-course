import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuthStore } from "../store/authStore";
import { Loader2, Code2, Mail, RefreshCw, ExternalLink, Copy } from "lucide-react";

export function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifyUrl, setVerifyUrl] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [copied, setCopied] = useState(false);

  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setVerifyUrl(null);
    setLoading(true);

    try {
      const url = mode === "login" ? "/auth/login" : "/auth/register";
      const payload =
        mode === "login" ? { email, password } : { email, username, password };

      const { data } = await api.post(url, payload);

      // Регистрация — показываем ссылку, не пускаем
      if (mode === "register") {
        setVerifyUrl(data.verify_url ?? null);
        setMode("login");
        return;
      }

      // Логин — пускаем
      setAuth(data.token, data.user);
      navigate("/");
    } catch (err: any) {
      const resp = err.response?.data;
      // Спец-обработка: почта не подтверждена
      if (resp?.code === "email_not_verified") {
        setError(resp.error || "Подтвердите почту");
        setVerifyUrl(resp.verify_url ?? null);
      } else {
        setError(resp?.error || resp?.message || "Что-то пошло не так");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    setError("");
    try {
      const { data } = await api.post("/auth/resend-verification", { email });
      setVerifyUrl(data.verify_url ?? null);
    } catch (err: any) {
      setError(err.response?.data?.error || "Не удалось отправить ссылку повторно");
    } finally {
      setResending(false);
    }
  };

  const handleCopy = async () => {
    if (!verifyUrl) return;
    try {
      await navigator.clipboard.writeText(verifyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Code2 size={40} className="text-accent mb-3" />
          <h1 className="text-2xl font-bold text-ui-heading">Учи IT</h1>
          <p className="text-ui-text text-sm mt-1">
            Прогноз оттока клиентов телеком-оператора
          </p>
        </div>

        <div className="bg-bg-secondary border border-border rounded-lg p-6">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => { setMode("login"); setError(""); setVerifyUrl(null); }}
              className={`flex-1 py-2 rounded-md text-sm transition ${
                mode === "login" ? "bg-accent text-white" : "text-ui-text hover:text-ui-heading"
              }`}
            >
              Вход
            </button>
            <button
              onClick={() => { setMode("register"); setError(""); setVerifyUrl(null); }}
              className={`flex-1 py-2 rounded-md text-sm transition ${
                mode === "register" ? "bg-accent text-white" : "text-ui-text hover:text-ui-heading"
              }`}
            >
              Регистрация
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-ui-text mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-bg-primary border border-border focus:border-accent outline-none text-ui-heading placeholder:text-ui-text transition"
                placeholder="student@example.com"
              />
            </div>

            {mode === "register" && (
              <div>
                <label className="block text-sm text-ui-text mb-1.5">Имя пользователя</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-bg-primary border border-border focus:border-accent outline-none text-ui-heading placeholder:text-ui-text transition"
                  placeholder="Иван"
                />
              </div>
            )}

            <div>
              <label className="block text-sm text-ui-text mb-1.5">Пароль</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-bg-primary border border-border focus:border-accent outline-none text-ui-heading placeholder:text-ui-text transition"
                placeholder="••••••"
              />
            </div>

            {error && (
              <div className="p-3 rounded-md bg-danger/10 border border-danger/30 text-danger text-sm">
                {error}
              </div>
            )}

            {/* Блок подтверждения почты */}
            {verifyUrl && (
              <div className="p-3 rounded-md bg-warning/10 border border-warning/30 text-sm space-y-2">
                <div className="flex items-center gap-2 text-ui-heading font-medium">
                  <Mail size={16} /> Подтвердите почту
                </div>
                <p className="text-ui-text">
                  Перейдите по ссылке ниже, чтобы активировать аккаунт:
                </p>
                <div className="flex items-center gap-2">
                  <a
                    href={verifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-accent hover:text-accent-hover underline break-all text-xs"
                  >
                    {verifyUrl}
                  </a>
                  <button
                    type="button"
                    onClick={handleCopy}
                    title="Скопировать ссылку"
                    className="p-1.5 rounded-md border border-border hover:border-accent text-ui-text hover:text-accent transition"
                  >
                    <Copy size={14} />
                  </button>
                  <a
                    href={verifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Открыть ссылку"
                    className="p-1.5 rounded-md border border-border hover:border-accent text-ui-text hover:text-accent transition"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="flex items-center gap-1.5 text-xs text-ui-text hover:text-accent transition disabled:opacity-50"
                >
                  <RefreshCw size={12} className={resending ? "animate-spin" : ""} />
                  {resending ? "Обновляем..." : "Ссылка не работает? Сгенерировать заново"}
                </button>
                {copied && <p className="text-xs text-success">Скопировано!</p>}
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