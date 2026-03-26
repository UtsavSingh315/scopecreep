import { NextResponse } from "next/server";
import db from "@/lib/dbClient";

export async function GET(request, { params }) {
  const { projectId } = params;
  try {
    const modules = await db.getModules(projectId);
    return NextResponse.json({ ok: true, modules });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 },
    );
  }
}

export async function POST(request, { params }) {
  const { projectId } = params;
  try {
    const body = await request.json();
    const { name, techStack, dependencies } = body;
    const m = await db.createModule(projectId, {
      name,
      techStack,
      dependencies,
    });
    return NextResponse.json({ ok: true, module: m });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 },
    );
  }
}
