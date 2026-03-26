import { NextResponse } from "next/server";
import db from '@/lib/dbClient';

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
