import { getDiagnosticInfo } from "@/lib/actions/projects";

/**
 * GET /api/debug/changes
 *
 * DEBUG ENDPOINT: Retrieve diagnostic information for a project.
 * This endpoint is for development and debugging purposes.
 *
 * @async
 * @function GET
 * @param {Request} request - HTTP request with query parameters
 * @param {string} request.searchParams.project - Project custom ID (e.g., "PX000100") (required)
 * @returns {Response} JSON response with diagnostic data
 *
 * @description
 * Returns detailed diagnostic information about a project including:
 * - Project details
 * - Baselines
 * - Change requests
 * - Module snapshots
 * - Impact analyses
 * Returns 400 if project parameter is missing, 500 on errors.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectCustomId = searchParams.get("project");

    if (!projectCustomId) {
      return Response.json(
        { error: "Missing project parameter" },
        { status: 400 },
      );
    }

    const result = await getDiagnosticInfo(projectCustomId);
    return Response.json(result);
  } catch (error) {
    return Response.json(
      { error: error.message || "Failed to get diagnostic info" },
      { status: 500 },
    );
  }
}
