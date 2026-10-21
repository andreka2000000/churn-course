interface Props {
  value: number;   // 0..100
  label?: string;
  showPercent?: boolean;
}

export function ProgressBar({ value, label, showPercent = true }: Props) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div>
      {(label || showPercent) && (
        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
          {label && <span>{label}</span>}
          {showPercent && <span>{Math.round(clamped)}%</span>}
        </div>
      )}
      <div className="h-2 rounded-full bg-bg-tertiary overflow-hidden">
        <div
          className="h-full bg-accent transition-all duration-300"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}