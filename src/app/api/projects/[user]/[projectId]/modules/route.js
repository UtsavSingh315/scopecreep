import { NextResponse } from "next/server";
import db from "@/lib/dbClient";

/**
 * GET /api/projects/[user]/[projectId]/modules
 *
 * Retrieve all modules for a specific project.
 *
 * @async
 * @function GET
 * @param {Request} request - HTTP request object
 * @param {Object} params - Route parameters
 * @param {string} params.projectId - The project's numeric ID
 * @returns {Response} JSON response with modules array
 *
 * @description
 * Fetches all modules (components/services) that belong to the project.
 * Returns 200 with modules array on success, 500 on error.
 */
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

/**
 * POST /api/projects/[user]/[projectId]/modules
 *
 * Create a new module for a project.
 *
 * @async
 * @function POST
 * @param {Request} request - HTTP request with JSON body
 * @param {string} request.body.name - Module name
 * @param {string} [request.body.techStack] - Technology stack description
 * @param {Array<string>} [request.body.dependencies] - List of dependent modules
 * @param {Object} params - Route parameters
 * @param {string} params.projectId - The project's numeric ID
 * @returns {Response} JSON response with created module object
 *
 * @description
 * Creates a new module within the specified project.
 * Module represents a distinct component/service in the system.
 */
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
