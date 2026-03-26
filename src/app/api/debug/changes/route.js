import { getDiagnosticInfo } from "@/lib/actions/projects";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectCustomId = searchParams.get("project");

    if (!projectCustomId) {
      return Response.json(
        { error: "Missing project parameter" },
        { status: 400 }
      );
    }

    const result = await getDiagnosticInfo(projectCustomId);
    return Response.json(result);
  } catch (error) {
    return Response.json(
      { error: error.message || "Failed to get diagnostic info" },
      { status: 500 }
    );
  }
}
