/**
 * Database client wrapper module.
 *
 * Provides a consistent interface to database helper functions defined in db/index.js.
 * Includes fallback handling if database module is unavailable.
 *
 * @module dbClient
 */

// Small wrapper that exposes DB helpers from project-level db/index.js
// Uses a relative path to the repo-level db helper and re-exports the functions.
let _db = null;
try {
  // db index lives at project root /db/index.js
  _db = require("../db/index.js").default;
} catch (e) {
  try {
    _db = require("../db/index.js");
  } catch (err) {
    // not available — stub functions
    _db = null;
  }
}

/**
 * Initialize the database connection.
 *
 * @async
 * @function initDb
 * @returns {Promise<Object|null>} Database instance or null if unavailable
 *
 * @description
 * Initializes a connection to the database using Drizzle ORM.
 * Returns null if database module is not configured.
 */
export async function initDb() {
  if (!_db) return null;
  return _db.initDb ? _db.initDb() : null;
}

/**
 * Get the active baseline for a project.
 *
 * @async
 * @function getActiveBaseline
 * @param {number} projectId - The project's numeric ID
 * @returns {Promise<Object|null>} Baseline object or null
 *
 * @description
 * Fetches the current active baseline for a project.
 * Baselines track the accepted version of project metrics.
 */
export async function getActiveBaseline(projectId) {
  if (!_db) return null;
  return _db.getActiveBaseline(projectId);
}

/**
 * Get all modules for a project.
 *
 * @async
 * @function getModules
 * @param {number} projectId - The project's numeric ID
 * @returns {Promise<Array>} Array of module objects, empty array if unavailable
 *
 * @description
 * Retrieves all modules (components/services) that belong to a project.
 * Modules represent distinct parts of the system being tracked.
 */
export async function getModules(projectId) {
  if (!_db) return [];
  return _db.getModules(projectId);
}

export async function getBaselineModuleSnapshot(baselineId, moduleId) {
  if (!_db) return null;
  return _db.getBaselineModuleSnapshot(baselineId, moduleId);
}

export async function createModule(projectId, data) {
  if (!_db) return null;
  return _db.createModule(projectId, data);
}

export async function leftJoinBaselineModules(baselineId) {
  if (!_db) return [];
  return _db.leftJoinBaselineModules(baselineId);
}

export default {
  initDb,
  getActiveBaseline,
  getModules,
  getBaselineModuleSnapshot,
  createModule,
  leftJoinBaselineModules,
};
