import { useToast } from "../../hooks/useToast";

const borderColor: Record<string, string> = {
  error: "border-voss-red/40",
  warning: "border-voss-amber/40",
  success: "border-voss-green/40",
};

const glowColor: Record<string, string> = {
  error: "shadow-[0_0_12px_rgba(255,51,68,0.15)]",
  warning: "shadow-[0_0_12px_rgba(255,170,0,0.15)]",
  success: "shadow-[0_0_12px_rgba(0,255,136,0.15)]",
};

const labelColor: Record<string, string> = {
  error: "text-voss-red",
  warning: "text-voss-amber",
  success: "text-voss-green",
};

const labels: Record<string, string> = {
  error: "ERROR",
  warning: "WARNING",
  success: "OK",
};

export function ToastContainer() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast-enter px-4 py-3 rounded-lg bg-panel border ${borderColor[toast.type]} ${glowColor[toast.type]} cursor-pointer`}
          onClick={() => dismissToast(toast.id)}
        >
          <span
            className={`font-orbitron text-[0.6rem] font-bold uppercase tracking-wider ${labelColor[toast.type]}`}
          >
            {labels[toast.type]}
          </span>
          <p className="text-sm text-text-primary mt-1">{toast.message}</p>
        </div>
      ))}
    </div>
  );
}
