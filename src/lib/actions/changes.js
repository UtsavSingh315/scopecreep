"use server";
import { initDb } from "@/db/index";
import * as schema from "@/db/schema";

// NOTE: This is a Next.js Server Action. It will run on the server.
export async function submitChangeRequest(payload) {
  // payload expected keys: projectId, primaryModuleId, benchmarkBaselineId, sliders, numerics, liveScore, title, description
  const conn = await initDb();
  if (!conn) throw new Error("DB not configured");

  // Transactional insert: create change_request, then impact_result
  return await conn.transaction(async (tx) => {
    // 1) generate a server-side customId - timestamp + random suffix gives uniqueness for now
    const customId = `CX${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 900 + 100)}`;

    const changeValues = {
      customId,
      projectId: Number(payload.projectId),
      baselineId: payload.benchmarkBaselineId
        ? Number(payload.benchmarkBaselineId)
        : null,
      primaryModuleId: payload.primaryModuleId
        ? Number(payload.primaryModuleId)
        : null,
      title: payload.title || null,
      description: payload.description || null,
      sliderInputs: payload.sliders || null,
      numericDeltas: payload.numerics || null,
      status: "Pending",
    };

    const [cr] = await tx
      .insert(schema.changeRequests)
      .values(changeValues)
      .returning();

    const impactValues = {
      changeId: cr.id,
      finalScore: Number(payload.liveScore) || 0,
      predictedCostIncrease: payload.predictedCostIncrease || null,
      predictedDelayDays: payload.predictedDelayDays || null,
      ghostScopeFindings: payload.ghostScopeFindings || null,
      recommendationText: payload.recommendationText || null,
      weightedBreakdown: payload.weightedBreakdown || null,
      calculationLog: payload.calculationLog || null,
    };

    const [ir] = await tx
      .insert(schema.impactResults)
      .values(impactValues)
      .returning();

    return { changeRequest: cr, impactResult: ir };
  });
}

export default submitChangeRequest;
