import { initDb } from "./src/db/index.js";
import * as schema from "./src/db/schema.js";
import bcryptjs from "bcryptjs";

const { hash } = bcryptjs;
const SALT_ROUNDS = 10;

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seed...");

    const db = await initDb();

    if (!db) {
      console.error("❌ Database connection failed");
      process.exit(1);
    }

    // Test user credentials
    const testUser = {
      email: "utsavsssingh@gmail.com",
      password: "Utsav24",
      fullName: "Utsav singh",
      username: "utsavsingh",
      phone: "9000000001",
    };

    // Hash password
    const hashedPassword = await hash(testUser.password, SALT_ROUNDS);

    console.log(`📝 Creating test user: ${testUser.email}`);

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

    if (result.length === 0) {
      console.error("❌ Failed to create user");
      process.exit(1);
    }

    console.log("✅ Test user created successfully!");
    console.log("\n📊 User Details:");
    console.log(`   ID: ${result[0].id}`);
    console.log(`   Email: ${result[0].email}`);
    console.log(`   Username: ${result[0].username}`);
    console.log(`   Password: ${testUser.password}`);
    console.log("\n🎯 Ready to test login at: http://localhost:3001/login");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  }
}

seedDatabase();
