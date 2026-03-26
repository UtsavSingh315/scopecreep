import { NextResponse } from "next/server";
import db from "@/lib/dbClient";

/**
 * POST /api/projects/[user]/[projectId]/change-requests
 *
 * Create a new change request for a project.
 *
 * @async
 * @function POST
 * @param {Request} request - HTTP request with JSON body
 * @param {string} request.body.customId - Unique change request ID (CX prefix)
 * @param {number} [request.body.baselineId] - Baseline to compare against
 * @param {number} [request.body.primaryModuleId] - Primary module affected
 * @param {string} request.body.title - Change title
 * @param {string} request.body.description - Change description
 * @param {Object} request.body.sliderInputs - Slider metric values
 * @param {Object} request.body.numericDeltas - Numeric changes
 * @param {Object} params - Route parameters
 * @param {string} params.projectId - The project's numeric ID
 * @returns {Response} JSON response with created change request
 *
 * @description
 * Creates a raw change request record in the database.
 * Note: Prefer using submitChangeRequest() server action for full impact analysis.
 * This endpoint stores minimal change data without impact calculations.
 */
export async function POST(request, { params }) {
  // Expects payload matching change_requests table schema
  const { projectId } = params;
  try {
    const body = await request.json();
    const {
      customId,
      baselineId,
      primaryModuleId,
      title,
      description,
      sliderInputs,
      numericDeltas,
    } = body;

    const conn = await db.initDb();
    if (!conn)
      return NextResponse.json(
        { ok: false, error: "DB not configured" },
        { status: 500 },
      );

    const { changeRequests } = require("../../../../../../db/schema");
    const [cr] = await conn
      .insert(changeRequests)
      .values({
        customId,
        projectId: Number(projectId),
        baselineId: Number(baselineId),
        primaryModuleId: Number(primaryModuleId),
        title,
        description,
        sliderInputs,
        numericDeltas,
      })
      .returning();

    return NextResponse.json({ ok: true, changeRequest: cr });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 },
    );
  }
}
