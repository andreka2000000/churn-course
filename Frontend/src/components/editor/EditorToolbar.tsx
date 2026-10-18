import { Play, CheckCircle, RotateCcw, Loader2 } from "lucide-react";

interface Props {
  onRun: () => void;
  onSubmit: () => void;
  onReset: () => void;
  isRunning: boolean;
}

export function EditorToolbar({ onRun, onSubmit, onReset, isRunning }: Props) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-bg-secondary border-b border-border">
      <button
        onClick={onRun}
        disabled={isRunning}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-bg-tertiary hover:bg-[#30363d] text-sm disabled:opacity-50 transition"
      >
        {isRunning ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Play size={14} />
        )}
        Запустить
        <kbd className="ml-2 text-xs px-1.5 py-0.5 rounded bg-black/40 text-gray-400">
          Ctrl+↵
        </kbd>
      </button>

      <button
        onClick={onSubmit}
        disabled={isRunning}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-success/20 hover:bg-success/30 text-success text-sm disabled:opacity-50 transition"
      >
        <CheckCircle size={14} />
        Отправить на проверку
      </button>

      <div className="flex-1" />

      <button
        onClick={onReset}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-bg-tertiary text-sm text-gray-400 transition"
        title="Сбросить к исходному коду"
      >
        <RotateCcw size={14} />
        Сбросить
      </button>
    </div>
  );
}