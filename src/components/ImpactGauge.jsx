import { motion } from "framer-motion";

export default function ImpactGauge({ score = 0 }) {
  const color = score < 30 ? "#10B981" : score < 70 ? "#F59E0B" : "#FB7185";
  const pct = Math.max(0, Math.min(100, score));

  return (
    <div className="w-full flex flex-col items-center">
      <svg viewBox="0 0 200 100" className="w-64 h-32">
        <defs>
          <linearGradient id="g" x1="0%" x2="100%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#FB7185" />
          </linearGradient>
        </defs>
        <path
          d="M10 90 A80 80 0 0 1 190 90"
          fill="none"
          stroke="#0f172a20"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <motion.path
          d="M10 90 A80 80 0 0 1 190 90"
          fill="none"
          stroke="url(#g)"
          strokeWidth="14"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: pct / 100 }}
          transition={{ duration: 0.8 }}
        />
        <text
          x="100"
          y="66"
          textAnchor="middle"
          className="fill-slate-100 text-2xl font-bold">
          {Math.round(pct)}%
        </text>
      </svg>
    </div>
  );
}
