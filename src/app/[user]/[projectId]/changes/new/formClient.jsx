"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { calculateChangeImpact } from "@/lib/impactCalculator";
import { submitChangeRequest } from "@/lib/actions/changes"; // server action

export default function ChangesForm({ initialBaselineId, modules = [], user, projectId, onComputed }) {
  const router = useRouter();
  const [primaryModuleId, setPrimaryModuleId] = useState(modules[0]?.id || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sliders, setSliders] = useState({
    technicalComplexity: 5, stakeholderPriority: 5, resourceAvailability: 5, architectureImpact: 5, dependencyDepth: 5, revenueROI: 5
  });
  const [numerics, setNumerics] = useState({ newScreens: 0, externalIntegrations: 0, dbSchemaChanges: 0, logicRules: 0 });
  const [isSubmitting, setSubmitting] = useState(false);
  const [computed, setComputed] = useState({ finalScore: 0, breakdown: {} });

  // live compute
  useEffect(() => {
    const result = calculateChangeImpact({ sliders, numbers: numerics, ghostScopeCount: 0, affectedModulesCount: 0, rules: [] });
    setComputed(result);
    onComputed?.(result);
  }, [sliders, numerics]);

  async function handleSubmit(e) {
    e?.preventDefault?.();
    setSubmitting(true);

    const payload = {
      projectId,
      primaryModuleId,
      benchmarkBaselineId: initialBaselineId,
      title,
      description,
      sliders,
      numerics,
      liveScore: computed.finalScore
    };

    try {
      // call server action (use server)
      const { changeRequest } = await submitChangeRequest(payload);
      const idForRoute = changeRequest.customId || changeRequest.id;
      router.push(`/${user}/${projectId}/changes/${idForRoute}`);
    } catch (err) {
      console.error(err);
      alert("Failed to submit change. See console.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="grid grid-cols-1 lg:grid-cols-3 gap-6" onSubmit={handleSubmit}>
      <div className="lg:col-span-2 space-y-4">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input value={title} onChange={(e)=>setTitle(e.target.value)} className="mt-1 w-full rounded-md border px-2 py-1 bg-transparent" required />
        </div>

        <div>
          <label className="block text-sm font-medium">Primary Module</label>
          <select value={primaryModuleId} onChange={(e)=>setPrimaryModuleId(e.target.value)} className="mt-1 w-full rounded-md border px-2 py-1 bg-transparent">
            {modules.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea value={description} onChange={(e)=>setDescription(e.target.value)} className="mt-1 w-full rounded-md border px-2 py-1 bg-transparent" rows={6} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {Object.entries(sliders).map(([key, val]) => (
            <div key={key}>
              <label className="block text-xs font-medium">{key}</label>
              <input type="range" min="1" max="10" value={val} onChange={(e)=>setSliders(s=>({...s,[key]:Number(e.target.value)}))} className="w-full mt-2" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs">New Screens</label>
            <input type="number" value={numerics.newScreens} onChange={(e)=>setNumerics(n=>({...n,newScreens:Number(e.target.value)}))} className="w-full rounded-md border px-2 py-1" />
          </div>
          <div>
            <label className="block text-xs">External Integrations</label>
            <input type="number" value={numerics.externalIntegrations} onChange={(e)=>setNumerics(n=>({...n,externalIntegrations:Number(e.target.value)}))} className="w-full rounded-md border px-2 py-1" />
          </div>
          <div>
            <label className="block text-xs">DB Schema Changes</label>
            <input type="number" value={numerics.dbSchemaChanges} onChange={(e)=>setNumerics(n=>({...n,dbSchemaChanges:Number(e.target.value)}))} className="w-full rounded-md border px-2 py-1" />
          </div>
          <div>
            <label className="block text-xs">Logic Rules</label>
            <input type="number" value={numerics.logicRules} onChange={(e)=>setNumerics(n=>({...n,logicRules:Number(e.target.value)}))} className="w-full rounded-md border px-2 py-1" />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-md bg-emerald-500 text-white">
            {isSubmitting ? "Analyzing..." : "Generate Official Impact"}
          </button>
          <button type="button" onClick={()=>{ setSliders({technicalComplexity:5, stakeholderPriority:5, resourceAvailability:5, architectureImpact:5, dependencyDepth:5, revenueROI:5}); setNumerics({newScreens:0, externalIntegrations:0, dbSchemaChanges:0, logicRules:0}); }} className="px-3 py-2 rounded-md border">Reset</button>
        </div>
      </div>

      {/* Right sticky preview - responsive: collapse below lg into full-width card */}
      <aside className="lg:col-span-1">
        <div className="sticky top-20 bg-slate-900/60 border border-white/5 backdrop-blur-md rounded-xl p-4">
          <h4 className="text-sm font-semibold">Real-time Tentative Score</h4>
          <div className="mt-3">
            <div className="text-3xl font-bold">{computed.finalScore}</div>
            <div className="text-xs text-slate-400 mt-1">Recommendation: <span className="font-medium">{computed.recommendation || (computed.finalScore < 30 ? "ACCEPT" : computed.finalScore < 60 ? "MODIFY" : "REJECT / DEFER")}</span></div>
            <div className="mt-3 text-sm">
              <div>Slider Contribution: {computed.weightedBreakdown?.sliderContribution ?? "—"}</div>
              <div>Numeric Contribution: {computed.weightedBreakdown?.numericContribution ?? "—"}</div>
            </div>
          </div>
        </div>
      </aside>
    </form>
  );
}