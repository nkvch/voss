import type { ReactNode } from "react";

type View = "record" | "dashboard";

export function Layout({
  children,
  currentView,
  onNavigate,
}: {
  children: ReactNode;
  currentView: View;
  onNavigate: (view: View) => void;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="crt-overlay" />
      <div className="ambient-glow" />

      <header className="sticky top-0 z-50 border-b border-border bg-hull/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛰️</span>
            <div>
              <h1 className="font-orbitron text-sm font-bold text-voss-green tracking-wider">
                V.O.S.S.
              </h1>
              <span className="font-orbitron text-[0.5rem] text-text-muted tracking-widest">
                VOICE OPERATING STATION SYSTEM
              </span>
            </div>
          </div>

          <nav className="flex gap-1">
            <button
              onClick={() => onNavigate("record")}
              className={`px-4 py-2 rounded-lg font-orbitron text-xs tracking-wider uppercase transition-all cursor-pointer ${
                currentView === "record"
                  ? "bg-voss-green/10 text-voss-green border border-voss-green/30"
                  : "text-text-dim border border-transparent hover:text-text-primary hover:border-border"
              }`}
            >
              Record
            </button>
            <button
              onClick={() => onNavigate("dashboard")}
              className={`px-4 py-2 rounded-lg font-orbitron text-xs tracking-wider uppercase transition-all cursor-pointer ${
                currentView === "dashboard"
                  ? "bg-voss-green/10 text-voss-green border border-voss-green/30"
                  : "text-text-dim border border-transparent hover:text-text-primary hover:border-border"
              }`}
            >
              Dashboard
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 relative z-10 w-full">
        {children}
      </main>

      <footer className="mt-auto border-t border-border text-center py-4 font-orbitron text-[0.55rem] tracking-wider text-text-muted relative z-10">
        V.O.S.S. MK.VII — CREW ASSESSMENT PROTOCOL — MERIDIAN ENGINEERING
      </footer>
    </div>
  );
}
