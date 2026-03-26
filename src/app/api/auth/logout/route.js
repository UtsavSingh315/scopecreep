import { cookies } from "next/headers";

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
      { status: 200 }
    );
  } catch (error) {
    console.error("Logout error:", error);
    return Response.json(
      { success: false, error: "Failed to logout" },
      { status: 500 }
    );
  }
}
