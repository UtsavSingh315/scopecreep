# Impact Score Calculation & Baseline Promotion - Architecture Summary

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                      SCOPE CREEP ANALYZER                           │
│                    Impact Scoring System v1.0                       │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER (React)                            │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  NewChangeClient.jsx (/changes/new)                            │  │
│  │  ────────────────────────────────────────────────────────────  │  │
│  │  • Sliders (1-10):                                             │  │
│  │    - technical_complexity, stakeholder_priority                │  │
│  │    - resource_availability, architecture_impact                │  │
│  │    - dependency_depth, revenue_roi                             │  │
│  │                                                                │  │
│  │  • Numerics (0+):                                              │  │
│  │    - new_screens, external_integrations                        │  │
│  │    - db_schema_changes, logic_rules                            │  │
│  │                                                                │  │
│  │  • Live Score Gauge (SVG):                                     │  │
│  │    Score: 0-100 (Low/Medium/High impact)                       │  │
│  │    Color: Emerald/Amber/Rose                                   │  │
│  │                                                                │  │
│  │  • Form Submission:                                            │  │
│  │    Calls: submitChange() [Server Action]                       │  │
│  │    Redirects to: /impacts                                      │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                   │                                     │
│                                   ↓                                     │
│                       [Form Submission Event]                          │
│                                   │                                     │
└───────────────────────────────────┼──────────────────────────────────────┘
                                    │
        ┌───────────────────────────┘
        │
        ↓
┌──────────────────────────────────────────────────────────────────────────┐
│                        SERVER ACTION LAYER                              │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  submitChange() [Wrapper: src/lib/actions/submit-change.js]    │  │
│  │  ────────────────────────────────────────────────────────────  │  │
│  │  Purpose: Bridge between client and server action              │  │
│  │  Calls: submitChangeRequest()                                  │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                   │                                     │
│                                   ↓                                     │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  submitChangeRequest() [src/lib/actions/changes.js]             │  │
│  │  ────────────────────────────────────────────────────────────  │  │
│  │                                                                │  │
│  │  PART 1: CALCULATE IMPACT SCORE                                │  │
│  │  ──────────────────────────────────────────────────────────  │  │
│  │                                                                │  │
│  │  Input: sliders {}, numerics {}                               │  │
│  │                                                                │  │
│  │  Step 1: Slider Score (60% weight)                            │  │
│  │  ────────────────────────────────────                         │  │
│  │  For each slider:                                              │  │
│  │    normalized = slider_value × 10  (convert 1-10 → 10-100)    │  │
│  │    contribution = normalized × weight                          │  │
│  │  sliderScore = Σ(contributions)                                │  │
│  │                                                                │  │
│  │  Weights:                                                       │  │
│  │    • technical_complexity: 15%                                 │  │
│  │    • stakeholder_priority: 5%                                  │  │
│  │    • resource_availability: 10%                                │  │
│  │    • architecture_impact: 15%                                  │  │
│  │    • dependency_depth: 10%                                     │  │
│  │    • revenue_roi: 5%                                           │  │
│  │                                                                │  │
│  │  Step 2: Numeric Score (40% weight)                            │  │
│  │  ───────────────────────────────────                          │  │
│  │  For each numeric:                                              │  │
│  │    severity_capped = min(numeric_value, 10)  [SEVERITY CAP]   │  │
│  │    normalized = severity_capped × 10  (convert 0-10 → 0-100)  │  │
│  │    contribution = normalized × weight                          │  │
│  │  numericScore = Σ(contributions)                               │  │
│  │                                                                │  │
│  │  Weights:                                                       │  │
│  │    • new_screens: 10%                                          │  │
│  │    • external_integrations: 15%                                │  │
│  │    • db_schema_changes: 10%                                    │  │
│  │    • logic_rules: 5%                                           │  │
│  │                                                                │  │
│  │  Step 3: Final Score                                            │  │
│  │  ──────────────────                                            │  │
│  │  finalScore = round(min(sliderScore + numericScore, 100))     │  │
│  │                                                                │  │
│  │  Result: 0-100 number                                           │  │
│  │  Recommendation: "Low/Medium/High Impact"                      │  │
│  │  Breakdown: JSON object with all contributions                 │  │
│  │  Log: Detailed calculation audit trail                         │  │
│  │                                                                │  │
│  │  DATABASE INSERTION                                             │  │
│  │  ─────────────────                                             │  │
│  │  • Insert change_requests row:                                 │  │
│  │    - customId, projectId, baselineId, primaryModuleId          │  │
│  │    - title, description                                        │  │
│  │    - sliderInputs (JSONB), numericDeltas (JSONB)               │  │
│  │    - status: "Pending"                                         │  │
│  │                                                                │  │
│  │  • Insert impact_results row:                                  │  │
│  │    - changeId (FK)                                             │  │
│  │    - finalScore (0-100)                                        │  │
│  │    - recommendationText                                        │  │
│  │    - weightedBreakdown (JSONB)                                 │  │
│  │    - calculationLog (text)                                     │  │
│  │    - generatedAt (timestamp)                                   │  │
│  │                                                                │  │
│  │  Output: { changeRequest, impactResult, impactCalculation }   │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                   │                                     │
│                                   ↓                                     │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  promoteToBaseline() [src/lib/actions/changes.js]              │  │
│  │  ────────────────────────────────────────────────────────────  │  │
│  │  (Called later when PM clicks "Accept & Promote")             │  │
│  │                                                                │  │
│  │  PART 2: BASELINE PROMOTION (4-STEP ATOMIC TRANSACTION)        │  │
│  │  ──────────────────────────────────────────────────────────  │  │
│  │                                                                │  │
│  │  Step 1: FETCH CURRENT STATE                                   │  │
│  │  ──────────────────────────                                    │  │
│  │  • SELECT from baselines WHERE (projectId=X, isActive=true)    │  │
│  │  • SELECT from baseline_module_snapshots WHERE                 │  │
│  │    (baselineId=active.id)                                      │  │
│  │  Example: v1.0 with 5 module snapshots                         │  │
│  │                                                                │  │
│  │  Step 2: CLONE TO NEW VERSION                                  │  │
│  │  ──────────────────────────────                                │  │
│  │  • Parse versionLabel: "v1.0" → major=1, minor=0              │  │
│  │  • Increment: minor = 0 + 1                                    │  │
│  │  • New label: "v1.1"                                           │  │
│  │                                                                │  │
│  │  • INSERT new baseline:                                         │  │
│  │    - customId (BX...)                                          │  │
│  │    - projectId                                                 │  │
│  │    - versionLabel: "v1.1"                                      │  │
│  │    - totalEffortHours (copy from v1.0)                         │  │
│  │    - totalBudgetEst (copy from v1.0)                           │  │
│  │    - isActive: true                                            │  │
│  │                                                                │  │
│  │  • UPDATE old baseline: isActive = false                        │  │
│  │                                                                │  │
│  │  • INSERT cloned snapshots (batch):                             │  │
│  │    For each snapshot in v1.0:                                  │  │
│  │      INSERT into baseline_module_snapshots {                   │  │
│  │        baselineId: v1.1.id,                                    │  │
│  │        moduleId, screenCount, integrationCount,                │  │
│  │        logicRuleCount, complexityScore                         │  │
│  │      }                                                         │  │
│  │                                                                │  │
│  │  Step 3: APPLY DELTAS TO TARGET MODULE                         │  │
│  │  ───────────────────────────────────                           │  │
│  │  • Find cloned snapshot where moduleId = change.primaryModuleId│  │
│  │  • Build UPDATE object from numericDeltas:                     │  │
│  │                                                                │  │
│  │    if new_screens exists:                                      │  │
│  │      screenCount += new_screens                                │  │
│  │                                                                │  │
│  │    if external_integrations exists:                            │  │
│  │      integrationCount += external_integrations                 │  │
│  │                                                                │  │
│  │    if logic_rules exists:                                      │  │
│  │      logicRuleCount += logic_rules                             │  │
│  │                                                                │  │
│  │    if db_schema_changes exists:                                │  │
│  │      complexityScore += db_schema_changes                      │  │
│  │                                                                │  │
│  │  • UPDATE target snapshot with calculated fields               │  │
│  │  Example: Auth module, screenCount 5→7, complexityScore 5→7    │  │
│  │                                                                │  │
│  │  Step 4: GHOST SCOPE ESCALATION (for high dependency_depth)    │  │
│  │  ───────────────────────────────────────────────────────────  │  │
│  │  if sliderInputs.dependency_depth > 7:                         │  │
│  │    • SELECT from module_dependencies                           │  │
│  │      WHERE parentModuleId = change.primaryModuleId             │  │
│  │    • For each dependent module:                                │  │
│  │      Find its cloned snapshot in v1.1                          │  │
│  │      complexityScore += 1  (flags downstream impact)           │  │
│  │                                                                │  │
│  │  Step 5: UPDATE CHANGE REQUEST STATUS                          │  │
│  │  ──────────────────────────────────                            │  │
│  │  UPDATE change_requests SET status='Accepted'                  │  │
│  │                                                                │  │
│  │  Output: {                                                      │  │
│  │    success: true,                                              │  │
│  │    newBaseline: { id, customId, versionLabel, ... },          │  │
│  │    newVersionLabel: "v1.1",                                    │  │
│  │    appliedDeltas: { new_screens: 2, ... },                    │  │
│  │    ghostScopeEscalationTriggered: true/false                   │  │
│  │  }                                                              │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ↓
┌──────────────────────────────────────────────────────────────────────────┐
│                       DATABASE LAYER (PostgreSQL)                        │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Tables Modified by submitChangeRequest():                              │
│  ──────────────────────────────────────────                             │
│  • change_requests (INSERT 1 row)                                       │
│    Stores user input, sliders/numerics, status                          │
│                                                                          │
│  • impact_results (INSERT 1 row)                                        │
│    Stores calculated score, breakdown, recommendation                   │
│                                                                          │
│  Tables Modified by promoteToBaseline():                                │
│  ───────────────────────────────────────                                │
│  • baselines (INSERT 1 row, UPDATE 1 row)                               │
│    Creates v1.1, marks v1.0 inactive                                    │
│                                                                          │
│  • baseline_module_snapshots (INSERT N rows, UPDATE 1+ rows)            │
│    Clones all snapshots from v1.0 to v1.1                              │
│    Updates target module with deltas                                    │
│    Updates dependent modules if escalation triggered                    │
│                                                                          │
│  • change_requests (UPDATE 1 row)                                       │
│    Sets status to "Accepted"                                            │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Example Change Proposal

```
USER INTERACTION:
┌─────────────────────────────────────────────────────────┐
│  PM fills /changes/new form:                            │
│  ───────────────────────────────                        │
│  • technical_complexity: 8/10                           │
│  • stakeholder_priority: 3/10                           │
│  • resource_availability: 6/10                          │
│  • architecture_impact: 8/10                            │
│  • dependency_depth: 9/10  ← HIGH!                      │
│  • revenue_roi: 4/10                                    │
│  • new_screens: 3                                       │
│  • external_integrations: 2                             │
│  • db_schema_changes: 1                                 │
│  • logic_rules: 0                                       │
│  • Title: "Integrate Stripe Payment Gateway"           │
│  • Module: "Payment Module"                             │
└─────────────────────────────────────────────────────────┘
                        ↓
SCORE CALCULATION (Client-side preview):
┌─────────────────────────────────────────────────────────┐
│  sliderScore = 8×10×0.15 + 3×10×0.05 + 6×10×0.1      │
│              + 8×10×0.15 + 9×10×0.1 + 4×10×0.05       │
│              = 12 + 1.5 + 6 + 12 + 9 + 2 = 42.5       │
│                                                        │
│  numericScore = 3×10×0.1 + 2×10×0.15 + 1×10×0.1 + 0   │
│               = 3 + 3 + 1 = 7                          │
│                                                        │
│  finalScore = 42.5 + 7 = 49.5 → 50/100                │
│  Status: Medium Impact (Amber)                         │
│  Recommendation: "Requires careful review and testing" │
└─────────────────────────────────────────────────────────┘
                        ↓ (PM clicks Submit)
SERVER VALIDATION & PERSISTENCE:
┌─────────────────────────────────────────────────────────┐
│  submitChangeRequest() recalculates score (same result) │
│  INSERT change_requests:                               │
│    id: 42                                              │
│    customId: "CX1709234901492"                         │
│    projectId: 1                                        │
│    baselineId: 1 (v1.0)                               │
│    primaryModuleId: 3 (Payment Module)                │
│    title: "Integrate Stripe Payment Gateway"          │
│    sliderInputs: {technical_complexity: 8, ...}       │
│    numericDeltas: {new_screens: 3, ...}               │
│    status: "Pending"                                  │
│                                                        │
│  INSERT impact_results:                                │
│    changeId: 42                                        │
│    finalScore: 50                                      │
│    recommendationText: "Moderate impact. Requires...   │
│    weightedBreakdown: {                                │
│      technical_complexity_contribution: 12,            │
│      stakeholder_priority_contribution: 1.5,           │
│      ...                                              │
│      new_screens_contribution: 3,                      │
│      external_integrations_contribution: 3,            │
│      ...                                              │
│    }                                                  │
│    calculationLog: "Score calculation: Sliders...      │
└─────────────────────────────────────────────────────────┘
                        ↓ (PM reviews and accepts)
BASELINE PROMOTION:
┌─────────────────────────────────────────────────────────┐
│  promoteToBaseline(changeId: 42)                        │
│                                                        │
│  STEP 1: Fetch                                          │
│  • Current active baseline: v1.0 (id: 1)              │
│  • Snapshots: 5 modules (Auth, Pay, Analytics, etc.)  │
│                                                        │
│  STEP 2: Clone                                          │
│  • INSERT new baseline:                                │
│    id: 2, versionLabel: "v1.1", isActive: true       │
│  • UPDATE old: isActive: false                         │
│  • INSERT 5 new snapshots (all data from v1.0)        │
│                                                        │
│  STEP 3: Apply Deltas                                  │
│  • Find Payment Module snapshot (id: 47) in v1.1      │
│  • UPDATE snapshot (id: 47):                           │
│    screenCount: 5 + 3 = 8                              │
│    integrationCount: 2 + 2 = 4                         │
│    logicRuleCount: 8 + 0 = 8                           │
│    complexityScore: 6 + 1 = 7                          │
│                                                        │
│  STEP 4: Ghost Escalation (dependency_depth: 9 > 7)   │
│  • Find dependents: Payment Module → Order Module     │
│  • UPDATE Order Module snapshot (id: 48):              │
│    complexityScore: 4 + 1 = 5  (flagged for review)  │
│                                                        │
│  STEP 5: Mark Accepted                                 │
│  • UPDATE change_requests (id: 42):                    │
│    status: "Accepted"                                 │
│                                                        │
│  Result: Baseline progresses v1.0 → v1.1              │
│  Payment Module now at new metrics                     │
│  Order Module complexity flagged as downstream impact  │
└─────────────────────────────────────────────────────────┘
```

---

## Key Design Decisions

### 1. Severity Cap (Numerics at 10)

Why? Prevents PMs from entering "200 new screens" and breaking the scoring system. The scale is risk-relative, not absolute.

### 2. Atomic Transactions

Why? Ensures data consistency. If promotion fails halfway, the entire operation rolls back. No orphaned baselines or partial snapshots.

### 3. Clone-All-Snapshots

Why? Each baseline is a complete snapshot. We need to preserve ALL module states, not just the changed one, for accurate comparison later.

### 4. Ghost Scope Escalation

Why? Flags downstream impact without modifying core metrics. Allows PMsware of hidden risks when dependency_depth is high.

### 5. Separate `submitChange()` Wrapper

Why? Allows client component to call server action without import conflicts between "use client" and "use server" files.

---

## Next Steps & Recommendations

1. **Write Unit Tests** for `calculateImpactScore()` with various inputs
2. **Add Audit Logging** to track all score calculations and baseline promotions
3. **Implement Cost/Schedule Estimation** using technical deltas
4. **Create Migration Script** for existing projects to create initial v1.0 baseline
5. **Add Performance Alerts** if baseline promotion takes > 1 second
6. **Build Comparison UI** to show v1.0 vs v1.1 side-by-side
