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

export async function initDb() {
  if (!_db) return null;
  return _db.initDb ? _db.initDb() : null;
}

export async function getActiveBaseline(projectId) {
  if (!_db) return null;
  return _db.getActiveBaseline(projectId);
}

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
