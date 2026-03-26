# Frontend-Backend Disconnection Audit

## Summary

This document identifies all locations where the frontend is NOT properly connected to the backend and no real data is being sent to/retrieved from the database.

---

## Critical Issues

### 1. **Authentication Pages - No Database Integration**

#### File: `src/app/(auth)/login/page.jsx`

- **Issue**: Login form has no server action to authenticate users or store session data
- **Issue Line**: Lines 88-94 (Button click with no handler)
- **Problem**:
  - No `onSubmit` handler on form
  - No server action called to validate credentials
  - No database lookup for user credentials
  - No session/token creation
- **Impact**: Users cannot actually log in; no authentication flow

#### File: `src/app/(auth)/signup/page.jsx`

- **Issue**: Signup form has no server action to create user accounts
- **Issue Line**: Lines 117-119 (Create Account button with no handler)
- **Problem**:
  - No `onSubmit` handler on form
  - No server action to insert user into database
  - No password hashing or validation
  - No session creation after signup
- **Impact**: New users cannot create accounts; no data stored

---

### 2. **Project Dashboard - No Real Data Fetching**

#### File: `src/app/[user]/[projectId]/page.jsx`

- **Issue**: Displays hardcoded statistics instead of querying database
- **Issue Line**: Lines 19-32 (Mock statistics)
- **Problem**:
  - Hardcoded "12 Baselines", "45 Total Changes", "23% Scope Creep"
  - No database query for actual project metrics
  - No dynamic data based on actual change requests or baselines
- **Impact**: Dashboard shows fake data, not real project state

---

### 3. **Changes Management - No Database Connection**

#### File: `src/app/[user]/[projectId]/changes/page.jsx`

- **Issue**: Uses hardcoded mock changes instead of querying database
- **Issue Line**: Lines 6-43 (sampleChanges const with hardcoded data)
- **Problem**:
  - `sampleChanges` array contains mock data
  - No database query to fetch actual change requests
  - No real data displayed to users
- **Impact**: Users cannot see their actual submitted changes

#### File: `src/app/[user]/[projectId]/changes/new/NewChangeClient.jsx`

- **Issue**: Form submission calls server action but data may not persist correctly
- **Issue Line**: Line 142-160 (handleSubmit function)
- **Problem**:
  - Calls `submitChange()` server action (which is properly connected)
  - BUT: The parent page passes hardcoded modules instead of fetching from database
  - Module selection shows mock data, not real database modules
- **Impact**: Changes are submitted but against mock module data

#### File: `src/app/[user]/[projectId]/changes/new/page.jsx`

- **Issue**: Uses hardcoded mock modules instead of querying database
- **Issue Line**: Lines 8-36 (Mock modules array)
- **Problem**:
  - `modules` array is hardcoded with sample data
  - No database query to fetch actual project modules
  - Parameters NOT awaited from Next.js 16 async params
- **Issue Line 2**: `const { user, projectId } = params;` should be `await params`
- **Impact**: Users can only submit changes against fake modules

---

### 4. **Baselines Management - No Database Connection**

#### File: `src/app/[user]/[projectId]/baselines/page.jsx`

- **Issue**: Displays mock baseline data instead of querying database
- **Issue Line**: Lines 15-60 (sampleBaselines const with hardcoded data)
- **Problem**:
  - Component is NOT async, uses client-side React.use() correctly
  - BUT data is completely mocked
  - No database query to fetch actual baselines for the project
  - No real version control or baseline history
- **Impact**: Users see fake baselines, cannot view real project baselines

---

### 5. **Impacts/Results - No Database Connection**

#### File: `src/app/[user]/[projectId]/impacts/page.jsx`

- **Issue**: Displays mock impact data instead of querying actual change results
- **Issue Line**: Lines 14-43 (mockImpacts array with hardcoded data)
- **Problem**:
  - Mock impact results for changes that don't exist in database
  - No database query to fetch actual `impact_results` table records
  - No correlation with actual submitted changes
  - Hardcoded cost predictions (12000, 5000, 8000) not calculated from real data
- **Impact**: Impact analysis shows fake predictions, not real impact scores

---

### 6. **My Projects - No Database Connection**

#### File: `src/app/[user]/my-projects/page.jsx`

- **Issue**: Displays mock projects instead of querying database
- **Issue Line**: Line 5 (mockProjects const)
- **Issue Line**: Line 28 (comment: "Use mock data for now")
- **Problem**:
  - `mockProjects` contains hardcoded sample project data
  - No database query to fetch user's actual projects
  - No link to real project creation
  - "New Project" button (Line 126) has no click handler
- **Impact**: Users cannot see their actual projects

---

### 7. **Modules Management - No Database Connection**

#### File: `src/app/[user]/[projectId]/modules/page.jsx`

- **Issue**: Uses hardcoded mock modules instead of querying database
- **Issue Line**: Lines 7-63 (mockModules array)
- **Problem**:
  - `mockModules` contains sample module data
  - No actual database query to fetch project modules
  - Comment on Line 74 indicates fallback to mock data on error (no DB setup)
- **Impact**: Users cannot see actual project modules

---

### 8. **Change Details Page - No Dynamic Data**

#### File: `src/app/[user]/[projectId]/changes/[changeId]/page.jsx`

- **Issue**: Displays mock change data, doesn't fetch from database
- **Issue Line**: Lines 45-100 (Mock change object)
- **Problem**:
  - `change` object is hardcoded mock data
  - No database query using `changeId` param to fetch actual change request
  - Not using the `changeId` dynamic segment from URL
- **Impact**: Cannot view actual submitted change request details

---

### 9. **Change Comparison - No Database Connection**

#### File: `src/app/[user]/[projectId]/changes/[changeId]/compare/page.jsx`

- **Issue**: Uses placeholder mock data instead of querying database
- **Issue Line**: Lines 6-7 (Mock change and baseline objects)
- **Problem**:
  - Variables `change` and `baseline` are hardcoded mock objects
  - No database query to fetch actual change request and baseline
  - Not using dynamic params from URL
- **Impact**: Cannot compare actual change with baseline

---

### 10. **Baseline Details - No Database Connection**

#### File: `src/app/[user]/[projectId]/baselines/[baselineId]/page.jsx`

- **Issue**: Uses hardcoded mock data instead of querying database
- **Issue Line**: Lines 5-40+ (Mock baseline object)
- **Problem**:
  - Baseline details are hardcoded
  - No database query using `baselineId` param
  - No retrieval of actual baseline snapshots or delta information
- **Impact**: Cannot view actual baseline specifications

---

### 11. **Form Handlers - No Database Integration**

#### File: `src/app/(auth)/login/page.jsx`

- **Issue Line**: Line 88-94 (Login button)
- **Problem**: No `onClick` or `onSubmit` handler attached

#### File: `src/app/(auth)/signup/page.jsx`

- **Issue Line**: Line 117-119 (Create Account button)
- **Problem**: No `onClick` or `onSubmit` handler attached

#### File: `src/app/[user]/my-projects/page.jsx`

- **Issue Line**: Line 126 (New Project button)
- **Problem**: No `onClick` handler to create new project

#### File: `src/app/[user]/[projectId]/config/page.jsx`

- **Issue Line**: Form inputs (all form fields)
- **Problem**: No submit handler to save configuration changes to database

---

## Properly Connected Features

### ✅ Working: Change Request Submission

- **File**: `src/lib/actions/changes.js` - Server actions are properly implemented
- **File**: `src/lib/actions/submit-change.js` - Wrapper correctly calls server actions
- **File**: `src/app/[user]/[projectId]/changes/new/NewChangeClient.jsx` - Form properly calls `submitChange()`
- **Status**: Impact scores are calculated and stored in database ✓

---

## Summary Table

| Component        | File                                                             | Issue                       | Line(s)         |
| ---------------- | ---------------------------------------------------------------- | --------------------------- | --------------- |
| Login Form       | `src/app/(auth)/login/page.jsx`                                  | No authentication handler   | 88-94           |
| Signup Form      | `src/app/(auth)/signup/page.jsx`                                 | No user creation handler    | 117-119         |
| Dashboard Stats  | `src/app/[user]/[projectId]/page.jsx`                            | Hardcoded metrics           | 19-32           |
| Changes List     | `src/app/[user]/[projectId]/changes/page.jsx`                    | Mock data only              | 6-43            |
| New Change Page  | `src/app/[user]/[projectId]/changes/new/page.jsx`                | Mock modules, missing await | 2, 8-36         |
| Baselines List   | `src/app/[user]/[projectId]/baselines/page.jsx`                  | Mock data only              | 15-60           |
| Impacts Page     | `src/app/[user]/[projectId]/impacts/page.jsx`                    | Mock impact data            | 14-43           |
| My Projects      | `src/app/[user]/my-projects/page.jsx`                            | Mock projects               | 5, 28           |
| Modules List     | `src/app/[user]/[projectId]/modules/page.jsx`                    | Mock modules                | 7-63            |
| Change Details   | `src/app/[user]/[projectId]/changes/[changeId]/page.jsx`         | Mock data, no param usage   | 45-100          |
| Change Compare   | `src/app/[user]/[projectId]/changes/[changeId]/compare/page.jsx` | Mock data                   | 6-7             |
| Baseline Details | `src/app/[user]/[projectId]/baselines/[baselineId]/page.jsx`     | Mock data                   | 5-40+           |
| Project Config   | `src/app/[user]/[projectId]/config/page.jsx`                     | No form submission handler  | All form fields |

---

## Recommendations

### Immediate Fixes Needed:

1. Add database queries to fetch real data in all pages
2. Connect login/signup forms to authentication server actions
3. Replace all mock data with actual database queries
4. Implement form submission handlers for configuration pages
5. Use dynamic route parameters to fetch specific records
6. Fix `NewChangePage` to await params correctly

### Sequence:

1. **Priority 1**: Authentication (login, signup)
2. **Priority 2**: My Projects list (core feature)
3. **Priority 3**: Project data pages (changes, baselines, modules)
4. **Priority 4**: Detail/comparison pages (use dynamic params)
5. **Priority 5**: Configuration pages (save to database)
