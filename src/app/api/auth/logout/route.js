import { cookies } from "next/headers";

/**
 * POST /api/auth/logout
 *
 * Logout endpoint that clears all authentication cookies.
 *
 * @async
 * @function POST
 * @param {Request} request - The HTTP request object (not used)
 * @returns {Response} JSON response with success status
 *
 * @description
 * - Deletes session, auth, and authToken cookies
 * - Clears all authentication state
 * - Returns success message on completion
 * - Returns 200 on success, 500 on error
 */
export async function POST(request) {
  try {
    // Clear authentication cookies
    const cookieStore = await cookies();

    // Remove auth token or session cookie
    // Adjust the cookie name based on your authentication setup
    cookieStore.delete("session");
    cookieStore.delete("auth");
    cookieStore.delete("authToken");

    return Response.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Logout error:", error);
    return Response.json(
      { success: false, error: "Failed to logout" },
      { status: 500 },
    );
  }
}
