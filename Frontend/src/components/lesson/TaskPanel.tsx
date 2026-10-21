import { useState } from "react";
import { Lightbulb } from "lucide-react";
import type { Task, SubmitResult } from "../../types";

interface Props {
  task: Task;
  submitResult?: SubmitResult;
}

export function TaskPanel({ task, submitResult }: Props) {
  const [showHint, setShowHint] = useState(false);

  return (
    <div className="p-6 space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-2 text-ui-heading">📝 Задание</h2>
        <p className="text-ui-text leading-relaxed whitespace-pre-wrap">{task.description}</p>
      </div>

      <div className="text-sm text-ui-text">
        Максимум баллов: <span className="text-ui-heading font-medium">{task.max_score}</span>
      </div>

      {task.hint && (
        <div>
          <button onClick={() => setShowHint(!showHint)} className="flex items-center gap-2 text-sm text-warning hover:text-yellow-400 transition">
            <Lightbulb size={14} /> {showHint ? "Скрыть подсказку" : "Показать подсказку"}
          </button>
          {showHint && <div className="mt-2 p-3 rounded-md bg-warning/10 border border-warning/30 text-sm text-ui-text">{task.hint}</div>}
        </div>
      )}

      {submitResult && (
        <div className="pt-4 border-t border-border">
          <h3 className="font-semibold mb-2 text-ui-heading">Результат</h3>
          <div className={`p-3 rounded-md border ${submitResult.passed ? "bg-success/10 text-success border-success/30" : "bg-danger/10 text-danger border-danger/30"}`}>
            {submitResult.passed ? "✅ Задание выполнено!" : "❌ Попробуйте ещё раз"}
            <div className="text-xs mt-1 opacity-80">{submitResult.score} / {submitResult.max_score} баллов</div>
          </div>
        </div>
      )}
    </div>
  );
}