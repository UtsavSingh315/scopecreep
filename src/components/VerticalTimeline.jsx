import { motion } from "framer-motion";

export default function VerticalTimeline({ baselines = [] }) {
  return (
    <div className="space-y-4">
      {baselines.map((b, idx) => (
        <motion.div
          key={b.id}
          whileHover={{ x: 6 }}
          className="p-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-mono text-xs text-slate-100">
            {b.customId || "BX"}
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-100">
              {b.versionLabel}
            </div>
            <div className="text-xs text-slate-300">
              Locked: {b.lockedAt || "N/A"}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
