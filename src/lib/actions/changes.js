"use server";
import { initDb } from "@/db/index";
import { eq, and } from "drizzle-orm";
import * as schema from "@/db/schema";

const SCORING_WEIGHTS = {
  sliders: {
    technical_complexity: 0.15,
    stakeholder_priority: 0.05,
    resource_availability: 0.1,
    architecture_impact: 0.15,
    dependency_depth: 0.1,
    revenue_roi: 0.05,
  },
  numerics: {
    new_screens: 0.1,
    external_integrations: 0.15,
    db_schema_changes: 0.1,
    logic_rules: 0.05,
  },
};

function calculateImpactScore(sliders, numerics) {
  let sliderScore = 0;
  let numericScore = 0;
  const breakdown = {};

  Object.keys(sliders).forEach((key) => {
    if (!(key in SCORING_WEIGHTS.sliders)) return;
    const val = Number(sliders[key]);
    const weight = SCORING_WEIGHTS.sliders[key];
    const contrib = val * 10 * weight;
    sliderScore += contrib;
    breakdown[key] = contrib;
  });

  Object.keys(numerics).forEach((key) => {
    if (!(key in SCORING_WEIGHTS.numerics)) return;
    const val = Number(numerics[key]) || 0;
    const weight = SCORING_WEIGHTS.numerics[key];
    const capped = Math.min(val, 10);
    const contrib = capped * 10 * weight;
    numericScore += contrib;
    breakdown[key] = contrib;
  });

  const finalScore = Math.round(Math.min(sliderScore + numericScore, 100));
  const calculationLog = `Score: ${finalScore}/100 (Sliders: ${sliderScore.toFixed(1)}, Numerics: ${numericScore.toFixed(1)})`;

  return {
    finalScore,
    sliderContribution: sliderScore,
    numericContribution: numericScore,
    breakdown,
    calculationLog,
  };
}

function generateRecommendation(score) {
  if (score < 30) return "Low impact. Safe to proceed with standard QA.";
  if (score < 70)
    return "Moderate impact. Requires careful review and testing.";
  return "High impact. Critical scope increase. Recommend stakeholder review.";
}

export async function submitChangeRequest(payload) {
  const conn = await initDb();
  if (!conn) throw new Error("DB not configured");

  const impactCalculation = calculateImpactScore(
    payload.sliders,
    payload.numerics,
  );

  return await conn.transaction(async (tx) => {
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
      finalScore: impactCalculation.finalScore,
      recommendationText: generateRecommendation(impactCalculation.finalScore),
      weightedBreakdown: impactCalculation.breakdown,
      calculationLog: impactCalculation.calculationLog,
    };

    const [ir] = await tx
      .insert(schema.impactResults)
      .values(impactValues)
      .returning();

    return {
      changeRequest: cr,
      impactResult: ir,
      impactCalculation,
    };
  });
}

export async function promoteToBaseline(changeId) {
  const conn = await initDb();
  if (!conn) throw new Error("DB not configured");

  return await conn.transaction(async (tx) => {
    const [changeRequest] = await tx
      .select()
      .from(schema.changeRequests)
      .where(eq(schema.changeRequests.id, changeId));

    if (!changeRequest) throw new Error(`Change ${changeId} not found`);

    const [activeBaseline] = await tx
      .select()
      .from(schema.baselines)
      .where(
        and(
          eq(schema.baselines.projectId, changeRequest.projectId),
          eq(schema.baselines.isActive, true),
        ),
      );

    if (!activeBaseline)
      throw new Error(
        `No active baseline for project ${changeRequest.projectId}`,
      );

    const versionParts = activeBaseline.versionLabel.split(".");
    versionParts[1] = String(Number(versionParts[1]) + 1);
    const newVersionLabel = versionParts.join(".");

    const newBaselineCustomId = `BX${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 900 + 100)}`;

    const [newBaseline] = await tx
      .insert(schema.baselines)
      .values({
        customId: newBaselineCustomId,
        projectId: changeRequest.projectId,
        versionLabel: newVersionLabel,
        totalEffortHours: activeBaseline.totalEffortHours,
        totalBudgetEst: activeBaseline.totalBudgetEst,
        isActive: true,
      })
      .returning();

    await tx
      .update(schema.baselines)
      .set({ isActive: false })
      .where(eq(schema.baselines.id, activeBaseline.id));

    const oldSnapshots = await tx
      .select()
      .from(schema.baselineModuleSnapshots)
      .where(eq(schema.baselineModuleSnapshots.baselineId, activeBaseline.id));

    const clonedSnapshots = oldSnapshots.map((s) => ({
      baselineId: newBaseline.id,
      moduleId: s.moduleId,
      screenCount: s.screenCount,
      integrationCount: s.integrationCount,
      logicRuleCount: s.logicRuleCount,
      complexityScore: s.complexityScore,
    }));

    const insertedSnapshots = await tx
      .insert(schema.baselineModuleSnapshots)
      .values(clonedSnapshots)
      .returning();

    const numericDeltas = changeRequest.numericDeltas || {};
    const targetSnapshot = insertedSnapshots.find(
      (s) => s.moduleId === changeRequest.primaryModuleId,
    );

    if (targetSnapshot) {
      const updates = {};
      if (numericDeltas.new_screens !== undefined) {
        updates.screenCount =
          (targetSnapshot.screenCount || 0) + Number(numericDeltas.new_screens);
      }
      if (numericDeltas.external_integrations !== undefined) {
        updates.integrationCount =
          (targetSnapshot.integrationCount || 0) +
          Number(numericDeltas.external_integrations);
      }
      if (numericDeltas.logic_rules !== undefined) {
        updates.logicRuleCount =
          (targetSnapshot.logicRuleCount || 0) +
          Number(numericDeltas.logic_rules);
      }
      if (numericDeltas.db_schema_changes !== undefined) {
        updates.complexityScore =
          (targetSnapshot.complexityScore || 5) +
          Number(numericDeltas.db_schema_changes);
      }

      if (Object.keys(updates).length > 0) {
        await tx
          .update(schema.baselineModuleSnapshots)
          .set(updates)
          .where(eq(schema.baselineModuleSnapshots.id, targetSnapshot.id));
      }
    }

    const sliderInputs = changeRequest.sliderInputs || {};
    const dependencyDepth = Number(sliderInputs.dependency_depth) || 0;

    if (dependencyDepth > 7 && changeRequest.primaryModuleId) {
      const dependents = await tx
        .select()
        .from(schema.moduleDependencies)
        .where(
          eq(
            schema.moduleDependencies.parentModuleId,
            changeRequest.primaryModuleId,
          ),
        );

      for (const dep of dependents) {
        const depSnapshot = insertedSnapshots.find(
          (s) => s.moduleId === dep.childModuleId,
        );
        if (depSnapshot) {
          await tx
            .update(schema.baselineModuleSnapshots)
            .set({ complexityScore: (depSnapshot.complexityScore || 5) + 1 })
            .where(eq(schema.baselineModuleSnapshots.id, depSnapshot.id));
        }
      }
    }

    await tx
      .update(schema.changeRequests)
      .set({ status: "Accepted" })
      .where(eq(schema.changeRequests.id, changeId));

    return {
      success: true,
      newBaseline,
      newVersionLabel,
      appliedDeltas: numericDeltas,
      ghostScopeEscalationTriggered: dependencyDepth > 7,
    };
  });
}

export default submitChangeRequest;
