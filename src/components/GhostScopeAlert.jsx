export default function GhostScopeAlert({
  findings = [],
  primaryModuleId = null,
}) {
  return (
    <div className="p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg">
      <h4 className="text-sm font-semibold text-slate-100">
        Ghost Scope Findings
      </h4>
      {findings.length === 0 ? (
        <p className="text-xs text-slate-300 mt-2">No ghost scope findings.</p>
      ) : (
        <div className="mt-2 space-y-2 text-xs text-slate-300">
          {findings.map((f, i) => (
            <div
              key={i}
              className={`p-2 rounded ${f.moduleId && f.moduleId !== primaryModuleId ? "bg-rose-900/20 border border-rose-700" : "bg-slate-900/20"}`}>
              <div className="font-mono text-[11px]">
                {f.code || `GHOST-${i + 1}`}
              </div>
              <div className="mt-1">{f.text}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
