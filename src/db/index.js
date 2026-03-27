import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Singleton cached instances to survive Next.js hot reloads
let cachedDrizzle = null;
let cachedPool = null;

export async function initDb() {
  if (cachedDrizzle) return cachedDrizzle;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.warn("DATABASE_URL not set — DB methods will be no-ops.");
    return null;
  }

  try {
    if (!cachedPool) {
      cachedPool = new Pool({ connectionString });
    }

    // drizzle accepts a Pool
    cachedDrizzle = drizzle(cachedPool, { schema });
    return cachedDrizzle;
  } catch (err) {
    console.warn(
      "Could not initialize Drizzle/pg client. DB operations will be skipped.",
      err?.message || err,
    );
    return null;
  }
}

export function getPool() {
  return cachedPool;
}

// ----- Helper Functions -----

export async function getActiveBaseline(projectId) {
  const conn = await initDb();
  if (!conn) return null;

  const q = await conn
    .select()
    .from(schema.baselines)
    .where(schema.baselines.projectId.eq(Number(projectId)))
    .where(schema.baselines.isActive.eq(true))
    .limit(1);
  return q?.[0] ?? null;
}

export async function getModules(projectId) {
  const conn = await initDb();
  if (!conn) return [];

  const q = await conn
    .select()
    .from(schema.modules)
    .where(schema.modules.projectId.eq(Number(projectId)))
    .orderBy(schema.modules.id.asc);
  return q;
}

export async function getBaselineModuleSnapshot(baselineId, moduleId) {
  const conn = await initDb();
  if (!conn) return null;

  const q = await conn
    .select()
    .from(schema.baselineModuleSnapshots)
    .where(schema.baselineModuleSnapshots.baselineId.eq(Number(baselineId)))
    .where(schema.baselineModuleSnapshots.moduleId.eq(Number(moduleId)))
    .limit(1);
  return q?.[0] ?? null;
}

export async function createModule(
  projectId,
  { name, techStack, dependencies = [] },
) {
  const conn = await initDb();
  if (!conn) {
    // fallback: return a mocked module object
    return { id: Date.now(), projectId: Number(projectId), name, techStack };
  }

  const [m] = await conn
    .insert(schema.modules)
    .values({ projectId: Number(projectId), name, techStack })
    .returning();

  // insert dependencies
  for (const depId of dependencies || []) {
    await conn
      .insert(schema.moduleDependencies)
      .values({ parentModuleId: m.id, childModuleId: Number(depId) });
  }
  return m;
}

export async function leftJoinBaselineModules(baselineId) {
  const conn = await initDb();
  if (!conn) return [];

  // Use the shared pool to run raw SQL; avoid creating/ending pools per call
  const pool = getPool();
  if (!pool) return [];

  const sql = `SELECT m.*, b.screen_count, b.integration_count, b.logic_rule_count, b.complexity_score
    FROM modules m
    LEFT JOIN baseline_module_snapshots b ON m.id = b.module_id AND b.baseline_id = $1
    WHERE m.project_id = (SELECT project_id FROM baselines WHERE id = $1)`;

  const res = await pool.query(sql, [Number(baselineId)]);
  return res.rows;
}

export default {
  initDb,
  getPool,
  getActiveBaseline,
  getModules,
  getBaselineModuleSnapshot,
  createModule,
  leftJoinBaselineModules,
};
