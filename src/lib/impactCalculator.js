// impactCalculator.js
/**
 * Impact and scope creep calculation module.
 *
 * Implements rule-based evaluation system (forward-chaining) for detecting
 * and scoring scope creep risk. Includes default rules and custom evaluation.
 *
 * @module impactCalculator
 */

const SEVERITY_POINTS = { Low: 20, Medium: 40, High: 65, Critical: 90 };

/**
 * Default set of scope creep detection rules.
 *
 * @constant {Array<Object>} defaultRules
 * @description
 * Rules evaluate change request metrics to detect scope creep signals.
 * Each rule has:
 * - id: Unique identifier
 * - name: Human-readable name
 * - conditionJson: JSON-based condition (supports and, or, gt, gte, lt, lte, eq, neq)
 * - severity: Risk level (Low, Medium, High, Critical)
 * - scoreWeight: Weight in final score (0-10)
 */
export const defaultRules = [
  {
    id: "high-effort",
    name: "High Effort",
    conditionJson: { gt: ["effortIncreasePercent", 30] },
    severity: "High",
    scoreWeight: 8, // 0-10
  },
  {
    id: "many-ghosts",
    name: "Multiple Ghost Scope Findings",
    conditionJson: { gt: ["ghostScopeCount", 2] },
    severity: "Medium",
    scoreWeight: 6,
  },
  {
    id: "db-schema-impact",
    name: "DB Schema Changes",
    conditionJson: { gt: ["dbSchemaChanges", 0] },
    severity: "High",
    scoreWeight: 7,
  },
  {
    id: "many_modules",
    name: "Affected Many Modules",
    conditionJson: { gt: ["affectedModulesCount", 3] },
    severity: "Medium",
    scoreWeight: 5,
  },
];

/**
 * Recursively evaluate a JSON-based condition against a context object.
 *
 * @function evaluateCondition
 * @param {Object} cond - Condition object with operators and operands
 *        Operators: and, or, gt, gte, lt, lte, eq, neq
 * @param {Object} [context={}] - Variables available in condition (metric values)
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @description
 * Supports nested boolean logic (and/or) with comparison operators.
 * Example: { and: [{gt: ["value", 10]}, {lt: ["value", 50]}] }
 * Context values are automatically converted to numbers for comparisons.
 */
// Recursive evaluator for simple JSON condition objects.
// Supports: and, or, gt, gte, lt, lte, eq, neq
export function evaluateCondition(cond, context = {}) {
  if (!cond) return false;
  const keys = Object.keys(cond);
  if (keys.length === 0) return false;
  const op = keys[0];
  const val = cond[op];

  switch (op) {
    case "and":
      return (
        Array.isArray(val) && val.every((c) => evaluateCondition(c, context))
      );
    case "or":
      return (
        Array.isArray(val) && val.some((c) => evaluateCondition(c, context))
      );
    case "gt": {
      const [left, right] = val;
      const l =
        typeof left === "string" ? Number(context[left] ?? 0) : Number(left);
      return l > right;
    }
    case "gte": {
      const [left, right] = val;
      const l =
        typeof left === "string" ? Number(context[left] ?? 0) : Number(left);
      return l >= right;
    }
    case "lt": {
      const [left, right] = val;
      const l =
        typeof left === "string" ? Number(context[left] ?? 0) : Number(left);
      return l < right;
    }
    case "lte": {
      const [left, right] = val;
      const l =
        typeof left === "string" ? Number(context[left] ?? 0) : Number(left);
      return l <= right;
    }
    case "eq": {
      const [left, right] = val;
      const l = typeof left === "string" ? context[left] : left;
      return l === right;
    }
    case "neq": {
      const [left, right] = val;
      const l = typeof left === "string" ? context[left] : left;
      return l !== right;
    }
    default:
      return false;
  }
}

/**
 * Evaluate all rules against a context and calculate risk score.
 *
 * @function evaluateRules
 * @param {Array<Object>} [rules=[]] - Array of rules with conditions and severity
 * @param {Object} [context={}] - Context object with metric values
 * @returns {Object} Object with riskScore (0-100) and triggered rules array
 *
 * @description
 * Implements forward-chaining rule evaluation:
 * - Evaluates each rule's condition against context
 * - Calculates points based on severity level and score weight
 * - Returns total risk score (capped at 100) and list of triggered rules
 * - Used to assess overall scope creep risk
 */
// Forward-chaining rule evaluation
export function evaluateRules(rules = [], context = {}) {
  let riskScore = 0;
  const triggered = [];

  for (const rule of rules) {
    const matches = evaluateCondition(rule.conditionJson, context);
    if (matches) {
      const severityPoints = SEVERITY_POINTS[rule.severity] ?? 0;
      const add = severityPoints * (rule.scoreWeight / 10);
      riskScore += add;
      triggered.push({
        ruleId: rule.id,
        name: rule.name,
        severity: rule.severity,
        pointsAdded: add,
      });
    }
  }

  riskScore = Math.min(100, Math.round(riskScore));
  return { riskScore, triggered };
}

/**
 * Derive estimated effort increase percentage from numeric and slider inputs.
 *
 * @function deriveEffortPercent
 * @param {Object} [numbers={}] - Numeric metrics (newScreens, logicRules, etc.)
 * @param {Object} [sliders={}] - Slider metrics (technicalComplexity, etc.)
 * @returns {number} Estimated effort increase percentage (0-100)
 *
 * @description
 * Heuristic calculation:
 * - New screens: 8 points each
 * - Logic rules: 2 points each
 * - Technical complexity: 2 points per 1-10 scale point
 * - Result capped at 100%
 */
// Heuristic functions to derive percent impacts from inputs.
function deriveEffortPercent(numbers = {}, sliders = {}) {
  // Simple heuristic: newScreens and logicRules weighted toward effort
  const ns = numbers.newScreens || 0; // cap externally
  const lr = numbers.logicRules || 0;
  const ei = Math.min(
    100,
    ns * 8 + lr * 2 + (sliders.technicalComplexity || 5) * 2,
  );
  return ei; // 0-100
}

/**
 * Derive estimated cost increase percentage from inputs.
 *
 * @function deriveCostPercent
 * @param {Object} [numbers={}] - Numeric metrics
 * @param {Object} [sliders={}] - Slider metrics
 * @returns {number} Estimated cost increase percentage (0-100)
 *
 * @description
 * Heuristic calculation:
 * - External integrations: 6 points each
 * - Database schema changes: 12 points each
 * - Architecture impact: 2 points per 1-10 scale point
 */
function deriveCostPercent(numbers = {}, sliders = {}) {
  const ext = numbers.externalIntegrations || 0;
  const db = numbers.dbSchemaChanges || 0;
  const ci = Math.min(
    100,
    ext * 6 + db * 12 + (sliders.architectureImpact || 5) * 2,
  );
  return ci;
}

function deriveTimePercent(numbers = {}, sliders = {}) {
  // time ~ effort but slightly different weights
  const ns = numbers.newScreens || 0;
  const lr = numbers.logicRules || 0;
  const ti = Math.min(
    100,
    ns * 6 +
      lr * 3 +
      (sliders.resourceAvailability
        ? (10 - sliders.resourceAvailability) * 3
        : 15),
  );
  return ti;
}

// Final MCDM weighted decision
export function calculateChangeImpact({
  sliders = {},
  numbers = {},
  ghostScopeCount = 0,
  affectedModulesCount = 0,
  rules = null,
} = {}) {
  // Derive percent metrics
  const effortIncreasePercent = deriveEffortPercent(numbers, sliders);
  const costImpactPercent = deriveCostPercent(numbers, sliders);
  const timeImpactPercent = deriveTimePercent(numbers, sliders);

  const ruleContext = {
    effortIncreasePercent,
    timeImpactPercent,
    costImpactPercent,
    ghostScopeCount,
    affectedModulesCount,
    dbSchemaChanges: numbers.dbSchemaChanges || 0,
  };

  const { riskScore, triggered } = evaluateRules(
    rules ?? defaultRules,
    ruleContext,
  );

  // Final weighted decision per spec
  const finalScore = Math.min(
    100,
    Math.round(
      effortIncreasePercent * 0.35 +
        costImpactPercent * 0.25 +
        riskScore * 0.25 +
        ghostScopeCount * 5 * 0.15,
    ),
  );

  const recommendation =
    finalScore < 30 ? "ACCEPT" : finalScore < 60 ? "MODIFY" : "REJECT / DEFER";

  const calculationLog = `effort:${effortIncreasePercent}, time:${timeImpactPercent}, cost:${costImpactPercent}, risk:${riskScore}, ghosts:${ghostScopeCount} => final:${finalScore}`;

  const weightedBreakdown = {
    sliderContribution: null, // could compute exact slider breakdown if needed
    numericContribution: null,
    effortIncreasePercent,
    costImpactPercent,
    timeImpactPercent,
    riskScore,
  };

  return {
    finalScore,
    recommendation,
    calculationLog,
    weightedBreakdown,
    triggered,
  };
}

export default calculateChangeImpact;
