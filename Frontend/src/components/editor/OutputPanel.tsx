import { useState } from "react";
import { Loader2, Terminal, CheckCircle2, XCircle } from "lucide-react";
import type { RunResult, SubmitResult } from "../../types";

interface Props {
  result: RunResult | null;
  submitResult: SubmitResult | null;
  isRunning: boolean;
}

type Tab = "output" | "tests" | "plots";

export function OutputPanel({ result, submitResult, isRunning }: Props) {
  const [tab, setTab] = useState<Tab>("output");

  const plots = Object.entries(result?.files ?? {}).filter(([name]) =>
    /\.(png|jpg|jpeg)$/i.test(name)
  );

  if (isRunning) {
    return (
      <div className="flex items-center justify-center h-full bg-bg-primary text-gray-400">
        <Loader2 className="animate-spin mr-2" size={20} />
        Выполняется...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-bg-primary">
      <div className="flex border-b border-border bg-bg-secondary">
        <TabButton active={tab === "output"} onClick={() => setTab("output")}>
          <Terminal size={14} />
          Вывод
        </TabButton>
        <TabButton active={tab === "tests"} onClick={() => setTab("tests")}>
          {submitResult?.passed ? (
            <CheckCircle2 size={14} className="text-success" />
          ) : (
            <XCircle size={14} className="text-gray-500" />
          )}
          Тесты
          {submitResult && (
            <span className="ml-1 text-xs text-gray-500">
              ({submitResult.tests.filter((t) => t.passed).length}/
              {submitResult.tests.length})
            </span>
          )}
        </TabButton>
        <TabButton active={tab === "plots"} onClick={() => setTab("plots")}>
          Графики
          {plots.length > 0 && (
            <span className="ml-1 text-xs text-gray-500">({plots.length})</span>
          )}
        </TabButton>
      </div>

      <div className="flex-1 overflow-auto p-4 font-mono text-sm">
        {!result && !submitResult && (
          <p className="text-gray-500">
            Нажмите «Запустить», чтобы увидеть результат
          </p>
        )}

        {tab === "output" && result && (
          <>
            {result.stdout && (
              <pre className="whitespace-pre-wrap text-gray-200">
                {result.stdout}
              </pre>
            )}
            {result.stderr && (
              <pre className="whitespace-pre-wrap text-danger mt-2">
                {result.stderr}
              </pre>
            )}
            <div className="mt-4 text-xs text-gray-500">
              Exit code: {result.exit_code} · {result.duration_ms} ms
            </div>
          </>
        )}

        {tab === "tests" && submitResult && (
          <div className="space-y-2">
            <div
              className={`p-3 rounded-md ${
                submitResult.passed
                  ? "bg-success/10 text-success"
                  : "bg-danger/10 text-danger"
              }`}
            >
              {submitResult.passed
                ? `✅ Все тесты пройдены — ${submitResult.score}/${submitResult.max_score} баллов`
                : `❌ Есть ошибки — ${submitResult.score}/${submitResult.max_score} баллов`}
            </div>
            {submitResult.tests.map((t) => (
              <div
                key={t.name}
                className={`p-2 rounded-md border ${
                  t.passed ? "border-success/30" : "border-danger/30"
                }`}
              >
                <div className="flex items-center gap-2">
                  {t.passed ? (
                    <CheckCircle2 size={14} className="text-success" />
                  ) : (
                    <XCircle size={14} className="text-danger" />
                  )}
                  <span>{t.name}</span>
                </div>
                {t.message && (
                  <pre className="mt-1 text-xs text-gray-400 whitespace-pre-wrap">
                    {t.message}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "tests" && !submitResult && (
          <p className="text-gray-500">
            Отправьте решение на проверку, чтобы увидеть результаты тестов
          </p>
        )}

        {tab === "plots" && (
          <div className="space-y-4">
            {plots.length === 0 && (
              <p className="text-gray-500">Графиков нет</p>
            )}
            {plots.map(([name, b64]) => (
              <div key={name}>
                <p className="text-xs text-gray-500 mb-1">{name}</p>
                <img
                  src={`data:image/png;base64,${b64}`}
                  alt={name}
                  className="rounded-md border border-border max-w-full"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2 text-sm transition border-b-2 ${
        active
          ? "border-accent text-white"
          : "border-transparent text-gray-400 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}