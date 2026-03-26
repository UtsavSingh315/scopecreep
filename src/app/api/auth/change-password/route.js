import { initDb } from "@/db/index";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

/**
 * Change password endpoint
 * Requires authentication and validates current password before updating
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return Response.json(
        { success: false, error: "Current and new password are required" },
        { status: 400 }
      );
    }

    // Get user from session/auth context
    // This is a placeholder - you'll need to implement proper authentication
    // For now, we'll return an error indicating auth is needed
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return Response.json(
        { success: false, error: "Unauthorized - please login first" },
        { status: 401 }
      );
    }

    const db = await initDb();
    if (!db) {
      return Response.json(
        { success: false, error: "Database connection failed" },
        { status: 500 }
      );
    }

    // Fetch the user
    const users = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, parseInt(userId)));

    const user = users[0];
    if (!user) {
      return Response.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return Response.json(
        { success: false, error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db
      .update(schema.users)
      .set({ passwordHash: hashedPassword })
      .where(eq(schema.users.id, user.id));

    return Response.json(
      { success: true, message: "Password changed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Change password error:", error);
    return Response.json(
      { success: false, error: "Failed to change password" },
      { status: 500 }
    );
  }
}
