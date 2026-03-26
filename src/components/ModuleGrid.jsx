import { motion } from "framer-motion";

export default function ModuleGrid({ modules = [] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {modules.map((m) => (
        <motion.div
          key={m.id}
          whileHover={{ y: -4 }}
          className="p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-slate-100">{m.name}</h4>
              <p className="text-xs text-slate-300">
                {m.techStack || "Unknown"}
              </p>
            </div>
            <div className="text-xs font-mono text-slate-200">{m.id}</div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-300">
            <div className="p-2 rounded bg-slate-900/30">
              <div className="text-2xl font-semibold text-slate-100">
                {m.screens || 0}
              </div>
              <div className="text-[10px]">Screens</div>
            </div>
            <div className="p-2 rounded bg-slate-900/30">
              <div className="text-2xl font-semibold text-slate-100">
                {m.apis || 0}
              </div>
              <div className="text-[10px]">APIs</div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
