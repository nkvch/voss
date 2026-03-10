import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`p-5 rounded-xl bg-voss-green/[0.015] border border-border transition-all duration-300 hover:border-border-bright hover:shadow-[0_4px_20px_rgba(0,0,0,0.3),0_0_15px_rgba(0,255,136,0.03)] ${className}`}
    >
      {children}
    </div>
  );
}
