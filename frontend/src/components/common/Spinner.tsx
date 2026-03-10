export function Spinner() {
  return (
    <div className="flex items-center gap-2 text-text-dim font-orbitron text-xs tracking-widest">
      <span className="inline-block w-4 h-4 border-2 border-voss-green/30 border-t-voss-green rounded-full animate-spin" />
      Loading...
    </div>
  );
}
