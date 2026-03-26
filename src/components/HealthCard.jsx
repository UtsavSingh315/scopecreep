import { motion } from "framer-motion";

export default function HealthCard({ baseline = {}, config = {} }) {
  const creepPct =
    baseline.totalBudgetEst && config.budgetTolerancePct
      ? Math.round(
          (baseline.totalBudgetEst * 100) / (config.budgetTolerancePct ? 1 : 1),
        )
      : 0; // placeholder
  const progress = Math.min(
    100,
    Math.round(
      (baseline.totalBudgetEst || 0) / ((baseline.totalBudgetEst || 1) / 100),
    ) || 0,
  );
  const danger = creepPct > (config.budgetTolerancePct || 0) * 100;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">
            Budget Health
          </h3>
          <p className="text-xs text-slate-300">
            Baseline: {baseline.versionLabel || "v1.0"}
          </p>
        </div>
        <div
          className={`text-xs font-mono px-2 py-1 rounded ${danger ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"}`}>
          {danger ? "Over Tolerance" : "Healthy"}
        </div>
      </div>
      <div className="mt-4">
        <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, progress)}%` }}
            transition={{ duration: 0.8 }}
            className={`h-3 ${danger ? "bg-rose-400" : "bg-emerald-400"}`}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-slate-300">
          <span>Spent: ${baseline.totalBudgetEst || 0}</span>
          <span>Tolerance: {(config.budgetTolerancePct || 0) * 100}%</span>
        </div>
      </div>
    </motion.div>
  );
}
