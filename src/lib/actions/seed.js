"use server";

import { initDb } from "@/db/index";
import * as schema from "@/db/schema";
import bcryptjs from "bcryptjs";
import { eq } from "drizzle-orm";

const { hash } = bcryptjs;
const SALT_ROUNDS = 10;

export async function seedTestUser() {
  try {
    const db = await initDb();

    if (!db) {
      return { error: "Database connection failed" };
    }

    // Test user credentials
    const testUser = {
      email: "utsavsssingh@gmail.com",
      password: "Utsav24",
      fullName: "Utsav singh",
      username: "utsavsingh",
      phone: "9000000001",
    };

    // Check if user already exists
    const existingUsers = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, testUser.email))
      .limit(1);

    if (existingUsers && existingUsers.length > 0) {
      return {
        success: false,
        message: "Test user already exists",
        user: existingUsers[0],
      };
    }

    // Hash password
    const hashedPassword = await hash(testUser.password, SALT_ROUNDS);

    console.log("📝 Creating test user:", testUser.email);

    // Insert user
    const result = await db
      .insert(schema.users)
      .values({
        email: testUser.email,
        passwordHash: hashedPassword,
        fullName: testUser.fullName,
        username: testUser.username,
        phone: testUser.phone,
        createdAt: new Date(),
      })
      .returning({
        id: schema.users.id,
        email: schema.users.email,
        username: schema.users.username,
      });

    if (!result || result.length === 0) {
      return { error: "Failed to create user" };
    }

    return {
      success: true,
      message: "Test user created successfully",
      user: {
        id: result[0].id,
        email: result[0].email,
        username: result[0].username,
        password: testUser.password,
      },
    };
  } catch (error) {
    console.error("❌ Seed error:", error);
    return { error: error.message || "Seed failed" };
  }
}
