import { NextResponse } from "next/server";
import db from "@/lib/dbClient";

/**
 * GET /api/projects/[user]/[projectId]/baseline-snapshots
 *
 * Retrieve a baseline module snapshot.
 *
 * @async
 * @function GET
 * @param {Request} request - HTTP request with query parameters
 * @param {string} request.searchParams.baselineId - The baseline's numeric ID (required)
 * @param {string} request.searchParams.moduleId - The module's numeric ID (required)
 * @param {Object} params - Route parameters (contains user, projectId)
 * @returns {Response} JSON response with baseline snapshot object
 *
 * @description
 * Retrieves metrics/snapshot for a specific module within a baseline.
 * Baseline snapshots capture module metrics at a point in time.
 * Returns 400 if baselineId or moduleId are missing.
 * Returns 500 on database errors.
 */
export async function GET(request, { params }) {
  // Query params: baselineId, moduleId
  const { searchParams } = new URL(request.url);
  const baselineId = searchParams.get("baselineId");
  const moduleId = searchParams.get("moduleId");
  if (!baselineId || !moduleId)
    return NextResponse.json(
      { ok: false, error: "baselineId and moduleId required" },
      { status: 400 },
    );
  try {
    const snapshot = await db.getBaselineModuleSnapshot(baselineId, moduleId);
    return NextResponse.json({ ok: true, snapshot });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 },
    );
  }
}
