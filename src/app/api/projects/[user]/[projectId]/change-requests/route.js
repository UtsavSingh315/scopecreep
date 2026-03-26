import { NextResponse } from "next/server";
import db from "@/lib/dbClient";

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
