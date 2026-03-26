import { motion } from "framer-motion";

export default function ComparisonDrawer({
  open = false,
  baseline = null,
  onClose = () => {},
}) {
  return (
    <motion.aside
      initial={{ x: "100%" }}
      animate={{ x: open ? "0%" : "100%" }}
      className="fixed right-0 top-0 bottom-0 w-full md:w-1/3 p-6 bg-slate-900/60 backdrop-blur-xl border-l border-white/10">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-100">
          Baseline: {baseline?.customId || "—"}
        </h3>
        <button onClick={onClose} className="text-slate-200">
          Close
        </button>
      </div>

      <div className="mt-4 space-y-3 text-slate-300 text-sm">
        {baseline ? (
          baseline.modules?.map((m) => (
            <div key={m.moduleId} className="p-2 rounded bg-slate-800/30">
              <div className="font-semibold">{m.moduleName}</div>
              <div className="text-xs">
                Screens: {m.screenCount} • APIs: {m.integrationCount}
              </div>
            </div>
          ))
        ) : (
          <div>No baseline selected</div>
        )}
      </div>
    </motion.aside>
  );
}
