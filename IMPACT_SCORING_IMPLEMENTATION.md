# Impact Score Calculation & Baseline Promotion Logic - Implementation Guide

## Overview

This implementation provides a complete backend calculation system for the Scope Creep Analyzer application, enabling:

1. **Live Impact Score Calculation** - Real-time scoring of proposed changes based on risk assessment and technical deltas
2. **Baseline Promotion** - Atomic database transactions that create new project versions when changes are accepted

---

## Part 1: Impact Score Calculation

### The Math

The final impact score is calculated using precise weighted formulas with two components:

#### Component 1: Slider Contribution (60% of total score)

- **Formula**: `Σ(slider_value × 10 × weight)`
- Sliders use a 1–10 scale, which is normalized to 0–100 by multiplying by 10
- Then weighted according to their relative importance

**Weights:**

- technical_complexity: 15%
- stakeholder_priority: 5%
- resource_availability: 10%
- architecture_impact: 15%
- dependency_depth: 10%
- revenue_roi: 5%
- **Total: 60%**

#### Component 2: Numeric Contribution (40% of total score)

- **Formula**: `Σ(min(numeric_value, 10) × 10 × weight)`
- Numerics are **severity-capped** at 10 to prevent score overflow
- This "severity cap" ensures that even if a PM enters "+25 new screens", it's treated as max risk (10)
- Then normalized to 0–100 and weighted

**Weights:**

- new_screens: 10%
- external_integrations: 15%
- db_schema_changes: 10%
- logic_rules: 5%
- **Total: 40%**

#### Final Score

```
final_score = round(min(slider_contribution + numeric_contribution, 100))
```

The result is always capped at 100.

### Example Calculation

**Scenario:** PM proposes a change with:

- Architecture Impact: 8/10
- 3 new screens
- 2 external integrations
- All other sliders at default 5
- All other numerics at default 0

**Step 1: Slider Score**

- architecture_impact: 8 × 10 × 0.15 = 12 points
- Other sliders (5 × 10 × weight each):
  - technical_complexity: 5 × 10 × 0.15 = 7.5
  - stakeholder_priority: 5 × 10 × 0.05 = 2.5
  - resource_availability: 5 × 10 × 0.1 = 5
  - dependency_depth: 5 × 10 × 0.1 = 5
  - revenue_roi: 5 × 10 × 0.05 = 2.5
- **Slider Total: 34.5 points**

**Step 2: Numeric Score**

- new_screens: min(3, 10) × 10 × 0.1 = 3 points
- external_integrations: min(2, 10) × 10 × 0.15 = 3 points
- **Numeric Total: 6 points**

**Step 3: Final Score**

- 34.5 + 6 = **40.5 → rounds to 40/100**
- Impact Level: **Medium** (30-70 range)

---

## Part 2: Baseline Promotion Logic

When a PM clicks "Accept & Promote to Baseline", the system performs a 4-step atomic database transaction:

### Step 1: Fetch Current State

```javascript
1. Query the `baselines` table for the currently active version
2. Pull all associated `baseline_module_snapshots` for that version
```

Example: Current active baseline is v1.0

### Step 2: Clone to New Version

```javascript
1. Create a new Baseline record (e.g., v1.1)
2. Set `is_active: true` for new baseline
3. Set `is_active: false` for old baseline (v1.0)
4. Duplicate EVERY snapshot from v1.0 and attach to v1.1
```

**Why clone all snapshots?** Because each baseline is a complete immutable snapshot of the project. When a change affects the "Auth Module", we need to preserve the state of all OTHER modules unchanged.

### Step 3: Apply Deltas to Target Module

Find the cloned snapshot matching `primary_module_id` and inject the numeric deltas:

| Numeric Delta           | →   | Baseline Column                   |
| ----------------------- | --- | --------------------------------- |
| `new_screens`           | →   | `screenCount`                     |
| `external_integrations` | →   | `integrationCount`                |
| `logic_rules`           | →   | `logicRuleCount`                  |
| `db_schema_changes`     | →   | `complexityScore` (+1 per change) |

**Concrete Example:**

- Old Baseline (v1.0): Auth Module had 5 screens
- Change Request: `new_screens: 2`
- New Baseline (v1.1): Auth Module now has 7 screens

```javascript
updates.screenCount =
  (targetSnapshot.screenCount || 0) + Number(numericDeltas.new_screens);
// 5 + 2 = 7
```

### Step 4: Ghost Scope Escalation (Advanced)

If `dependency_depth > 7`:

1. Query the `moduleDependencies` table for modules that depend on the primary module
2. For each dependent module, increment its `complexityScore` by 1 in the new baseline
3. This flags downstream impact without modifying their core metrics

**Rationale:** High dependency depth means this change might trigger cascading updates in dependent modules. Bumping their complexity score signals this to future change proposals.

Example:

- Auth Module (changed) → Parent to Payments Module
- If dependency_depth > 7, Payments' complexity_score gets +1 in v1.1
- This creates a "warning snapshot" for review

### Step 5: Mark Change as Accepted

```javascript
UPDATE change_requests SET status = 'Accepted' WHERE id = ?
```

---

## Implementation Details

### Server Actions (`src/lib/actions/changes.js`)

#### `submitChangeRequest(payload)`

- **Input**: { projectId, primaryModuleId, benchmarkBaselineId, sliders, numerics, title, description }
- **Output**: { changeRequest, impactResult, impactCalculation }
- **Side Effects**:
  - Inserts row into `change_requests` table
  - Inserts row into `impact_results` table with calculated score
  - Stores slider inputs, numeric deltas, calculation breakdown, and recommendation text

#### `promoteToBaseline(changeId)`

- **Input**: changeId (ID of accepted change request)
- **Output**: { success, newBaseline, newVersionLabel, appliedDeltas, ghostScopeEscalationTriggered }
- **Side Effects**:
  - Creates new Baseline version
  - Clones all snapshots
  - Applies deltas
  - Handles dependency escalation
  - Updates change request status

### Client Component (`NewChangeClient.jsx`)

The component:

1. Maintains local state for sliders and numerics
2. Calculates live score using the same weights (for immediate UI feedback)
3. Calls `submitChange()` server action on form submission
4. Redirects to `/impacts` page on success

**Note**: The component uses the same `SCORING_WEIGHTS` constant as the server for consistency. The server performs the authoritative calculation.

### Database Tables

#### `change_requests`

```
id, customId, projectId, baselineId (reference),
primaryModuleId (reference), title, description,
sliderInputs (JSONB), numericDeltas (JSONB), status
```

#### `impact_results`

```
id, changeId (FK), finalScore (0-100), recommendationText,
weightedBreakdown (JSONB), calculationLog (text),
generatedAt (timestamp)
```

#### `baselines`

```
id, customId, projectId, versionLabel (v1.0, v1.1, etc.),
totalEffortHours, totalBudgetEst, isActive (boolean),
lockedAt (timestamp)
```

#### `baseline_module_snapshots`

```
id, baselineId (FK), moduleId (FK),
screenCount, integrationCount, logicRuleCount,
complexityScore
```

---

## Integration with UI Pages

### `/changes/new` - Change Proposal Form

- User fills sliders (1-10) and numeric inputs (0+)
- Component calculates live score and shows impact gauge
- On submit, calls `submitChangeRequest()` server action
- Redirects to `/impacts`

### `/impacts` - Impact Ledger & Review

- Displays all submitted changes with final scores
- Shows "Promote to Baseline" button for pending changes
- On acceptance, calls `promoteToBaseline()` server action
- Updates display to show new baseline version

### `/baselines` - Version History

- Lists all baseline versions (v1.0, v1.1, v1.2, etc.)
- Shows which is active and which are archived
- Clicking a baseline shows the snapshots (module metrics at that version)

---

## Error Handling

Both server actions throw descriptive errors:

- "DB not configured" - Database connection issue
- "Change ${id} not found" - Invalid changeId
- "No active baseline for project ${id}" - Project has no baseline
- Re-throws Drizzle transaction errors for database issues

The client component:

- Catches errors and displays in an alert
- Logs to console for debugging
- Sets `isSubmitting = false` on error to allow retry

---

## Testing the Implementation

### Unit Test: Score Calculation

```javascript
const result = calculateImpactScore(
  { technical_complexity: 8, stakeholder_priority: 5, ... },
  { new_screens: 3, external_integrations: 2, ... }
);
// Expected: finalScore between 0-100
```

### Integration Test: Baseline Promotion

```javascript
1. Create change request (submitChangeRequest)
2. Promote it (promoteToBaseline with returned changeId)
3. Verify:
   - New baseline exists with incremented version
   - Old baseline is now inactive
   - Target module snapshot has updated metrics
   - Change request status is "Accepted"
```

### E2E Test: Full Flow

1. User navigates to `/changes/new`
2. Fills form and submits
3. See impact score in real-time
4. Clicks submit → redirects to `/impacts`
5. Clicks "Promote to Baseline"
6. Verify in `/baselines` that new version appeared

---

## Performance Considerations

- **Transaction Isolation**: All baseline promotion operations are atomic (all-or-nothing)
- **N+1 Query Prevention**: Snapshots are cloned in a single batch insert, not loop
- **Caching**: Consider caching active baselines in production
- **Indexing**: Add indexes on (projectId, isActive) for baselines table

---

## Future Enhancements

1. **Cost & Schedule Estimation**: Calculate predicted hours/budget impact from technical deltas
2. **Resource Availability Check**: Validate team capacity before accepting high-risk changes
3. **Integration with Project Timeline**: Auto-adjust sprint/release dates based on impact score
4. **Change History**: Track all deltas applied to each module across baselines
5. **Rollback Capability**: Allow reverting to previous baselines with atomic transaction
6. **Audit Logging**: Log all impacts and promotions for compliance

---

## Summary

This implementation provides production-grade:

- **Transparent Scoring**: Fully auditable calculation with breakdown logs
- **Atomic Operations**: Database transactions ensure data consistency
- **Extensible Architecture**: Easy to add new scoring factors or delta types
- **Real-time Feedback**: Client-side calculation matches server-side validation
- **Historical Tracking**: Baselines preserve project snapshots for comparison and analysis
