import { Loader2 } from "lucide-react";

export function Spinner({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 size={size} className="animate-spin text-accent" />
    </div>
  );
}

export function FullScreenSpinner() {
  return (
    <div className="flex items-center justify-center h-screen bg-bg-primary">
      <Spinner size={32} />
    </div>
  );
}