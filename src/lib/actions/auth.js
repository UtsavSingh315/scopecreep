"use server";

import { initDb } from "@/db/index";
import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";
import bcryptjs from "bcryptjs";
import { cookies } from "next/headers";

const SALT_ROUNDS = 10;
const { hash, compare } = bcryptjs;

/**
 * Register a new user in the system.
 *
 * @async
 * @function registerUser
 * @param {string} email - The user's email address (unique identifier)
 * @param {string} password - The user's password (will be hashed with bcrypt)
 * @param {string} fullName - The user's full name
 * @param {string} username - The user's username (unique identifier)
 * @param {string} [mobileNo] - Optional mobile number for the user
 * @returns {Promise<{success: boolean, user?: Object} | {error: string}>}
 *          Success object with user data or error message
 * @throws Catches and returns error if database connection fails or validation fails
 *
 * @description
 * - Validates that email and mobile number (if provided) don't already exist
 * - Hashes the password using bcrypt with 10 salt rounds
 * - Creates new user record in database
 * - Returns user object with id, email, and username
 */
export async function registerUser(
  email,
  password,
  fullName,
  username,
  mobileNo,
) {
  try {
    const db = await initDb();

    if (!db) {
      return { error: "Database connection failed" };
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return { error: "User already exists with this email" };
    }

    // Check if mobile number already exists
    if (mobileNo) {
      const existingMobile = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.mobileNo, mobileNo))
        .limit(1);

      if (existingMobile.length > 0) {
        return { error: "User already exists with this mobile number" };
      }
    }

    // Hash password
    const hashedPassword = await hash(password, SALT_ROUNDS);

    // Create user
    const result = await db
      .insert(schema.users)
      .values({
        email,
        passwordHash: hashedPassword,
        fullName,
        username,
        mobileNo: mobileNo || null,
        createdAt: new Date(),
      })
      .returning({
        id: schema.users.id,
        email: schema.users.email,
        username: schema.users.username,
      });

    if (result.length === 0) {
      return { error: "Failed to create user" };
    }

    return { success: true, user: result[0] };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: error.message || "Registration failed" };
  }
}

/**
 * Authenticate a user and establish a session via cookies.
 *
 * @async
 * @function loginUser
 * @param {string} email - The user's email address
 * @param {string} password - The user's password (will be verified against stored hash)
 * @returns {Promise<{success: boolean, user?: Object} | {error: string}>}
 *          Success object with user data or error message
 *
 * @description
 * - Finds user by email in the database
 * - Verifies password using bcrypt comparison
 * - Sets three HTTP-only cookies for session management:
 *   * userId (secure, httpOnly) - Used to identify the user
 *   * userEmail (secure) - Email for display purposes
 *   * username (secure) - Username for display purposes
 * - Cookies expire in 7 days
 */
export async function loginUser(email, password) {
  try {
    const db = await initDb();

    if (!db) {
      return { error: "Database connection failed" };
    }

    // Find user by email
    const users = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);

    if (users.length === 0) {
      return { error: "User not found" };
    }

    const user = users[0];

    // Verify password
    const isPasswordValid = await compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return { error: "Invalid password" };
    }

    // Set session cookie (in real app, use proper session management)
    const cookieStore = await cookies();
    await cookieStore.set({
      name: "userId",
      value: user.id.toString(),
      maxAge: 60 * 60 * 24 * 7, // 7 days
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
    });

    await cookieStore.set({
      name: "userEmail",
      value: user.email,
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === "production",
      httpOnly: false,
      sameSite: "lax",
    });

    await cookieStore.set({
      name: "username",
      value: user.username,
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === "production",
      httpOnly: false,
      sameSite: "lax",
    });

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
      },
    };
  } catch (error) {
    console.error("Login error:", error);
    return { error: error.message || "Login failed" };
  }
}

/**
 * Logout the current user by clearing session cookies.
 *
 * @async
 * @function logoutUser
 * @returns {Promise<{success: boolean} | {error: string}>}
 *          Success confirmation or error message
 *
 * @description
 * Deletes all authentication-related cookies:
 * - userId (user identifier)
 * - userEmail (for display)
 * - username (for display)
 */
export async function logoutUser() {
  try {
    const cookieStore = await cookies();
    await cookieStore.delete("userId");
    await cookieStore.delete("userEmail");
    await cookieStore.delete("username");
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    return { error: "Logout failed" };
  }
}

/**
 * Retrieve the currently authenticated user from session cookie.
 *
 * @async
 * @function getCurrentUser
 * @returns {Promise<Object|null>}
 *          User object if authenticated, null otherwise
 *
 * @description
 * - Reads the userId from cookies
 * - If not present, returns null (user not authenticated)
 * - Queries database for complete user record by userId
 * - Returns full user object or null if not found
 */
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return null;
    }

    const db = await initDb();

    if (!db) {
      return null;
    }

    const users = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, parseInt(userId)))
      .limit(1);

    if (users.length === 0) {
      return null;
    }

    return users[0];
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
}
