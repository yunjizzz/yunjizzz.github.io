# src/lib — Business Logic & Utilities

Core logic for checklist manipulation, state persistence, and helper functions.

## File Structure

```
src/lib/
├── checklist.ts         # Checklist generation, grouping, progress
├── storage.ts           # localStorage operations
└── utils.ts             # Utility functions
```

## checklist.ts

**Purpose:** Core business logic for checklist operations

**Exports:**
- `generateChecklist(moveDate: Date): UserChecklist`
- `getSections(checklist: UserChecklist): ChecklistSection[]`
- `getProgress(checklist: UserChecklist): { total, completed, percent }`
- `toggleItem(checklist: UserChecklist, templateId: string): UserChecklist`
- `isValidMoveDate(date: Date): boolean`
- `getDaysUntilMove(moveDate: string): number`

### generateChecklist()

**Purpose:** Create a new checklist from templates for a given move date

**Input:** `moveDate: Date`

**Output:** `UserChecklist` with:
- `id` — UUID generated via `crypto.randomUUID()`
- `moveDate` — ISO string
- `createdAt` — Current timestamp
- `schemaVersion` — 1 (for future migrations)
- `items` — Array of all 35 templates as unchecked items

**Logic:**
```typescript
const items = checklistTemplates.map(t => ({
  templateId: t.id,
  checked: false,
  checkedAt: null,
  note: null,
}));
```

**Use Case:** User enters date on home page → checklist/page.tsx calls this function

### getSections()

**Purpose:** Group and organize checklist items for display

**Input:** `checklist: UserChecklist`

**Output:** `ChecklistSection[]` with:
- `label` — Display string (e.g., "D-30 | 한 달 전")
- `daysBeforeMove` — Grouping key
- `items` — Sorted templates with user state merged

**Logic:**
1. Extract unique `daysBeforeMove` values from templates
2. Sort chronologically (ascending)
3. For each day group:
   - Filter templates matching that day
   - Merge user state (checked, checkedAt, note) from items
   - Sort by priority (high → medium → low via `priorityOrder`)
   - Return ChecklistSection

**Priority Order:**
```typescript
const priorityOrder = { high: 0, medium: 1, low: 2 };
items.sort((a, b) => (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1));
```

**Use Case:** Checklist/page.tsx calls this to populate display sections

### getProgress()

**Purpose:** Calculate completion statistics

**Input:** `checklist: UserChecklist`

**Output:** Object with:
- `total` — Total item count (35)
- `completed` — Number of checked items
- `percent` — Percentage 0-100 (rounded)

**Logic:**
```typescript
const total = checklist.items.length;
const completed = checklist.items.filter(i => i.checked).length;
const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
```

**Use Case:** Checklist/page.tsx displays progress bar and completion message

### toggleItem()

**Purpose:** Toggle a single item's checked state

**Input:** `checklist: UserChecklist`, `templateId: string`

**Output:** New UserChecklist with item toggled

**Logic:**
- Find item by templateId
- Toggle `checked` boolean
- If toggled to checked: set `checkedAt` to current ISO timestamp
- If toggled to unchecked: set `checkedAt` to null
- Return new checklist object (immutable)

**Immutability:** Creates new objects, doesn't mutate original

**Use Case:** User clicks checkbox → calls `handleToggle()` → calls `toggleItem()` → saves to localStorage

### isValidMoveDate()

**Purpose:** Validate that a move date is today or in the future

**Input:** `date: Date`

**Output:** `boolean`

**Logic:**
1. Normalize both dates to midnight UTC
2. Compare timestamps
3. Return true if date >= today

**Use Case:** Home page date input validation (min attribute also enforces this)

### getDaysUntilMove()

**Purpose:** Calculate days remaining until move

**Input:** `moveDate: string` (ISO format)

**Output:** `number` — Positive for future, 0 for today, negative for past

**Logic:**
1. Parse moveDate and current date
2. Normalize both to midnight UTC (no timezone issues)
3. Calculate milliseconds difference
4. Divide by (1000 * 60 * 60 * 24)
5. Return ceiling value (round up)

**Result Examples:**
- 30 days away → 30
- Today → 0
- 5 days ago → -5

**Use Case:** Checklist/page.tsx uses this for:
- D-Day countdown display
- Auto-collapse logic for past sections

## storage.ts

**Purpose:** localStorage persistence layer for checklist data

**Exports:**
- `saveChecklist(checklist: UserChecklist): void`
- `loadChecklist(): UserChecklist | null`
- `clearChecklist(): void`
- `exportChecklist(checklist: UserChecklist): string`
- `importChecklist(json: string): UserChecklist | null`

### saveChecklist()

**Purpose:** Persist checklist to localStorage

**Input:** `checklist: UserChecklist`

**Logic:**
- JSON stringify the checklist
- Write to localStorage with key `"movement-checklist"`
- Catch and log errors (storage quota exceeded, etc.)

**Idempotent:** Overwrites previous checklist

**Use Case:** Called after `toggleItem()` or `generateChecklist()`

### loadChecklist()

**Purpose:** Retrieve checklist from localStorage

**Output:** `UserChecklist | null`

**Logic:**
1. Read localStorage key `"movement-checklist"`
2. If null/empty: return null
3. Parse JSON
4. Validate `schemaVersion === 1`
5. Return parsed object or null if invalid

**Error Handling:** Catches JSON parse errors, logs schema warnings

**Use Case:** Checklist/page.tsx checks stored checklist on load

### clearChecklist()

**Purpose:** Delete checklist from localStorage

**Logic:** Remove item with key `"movement-checklist"`

**Error Handling:** Catches and logs errors

**Use Case:** Manual user action (not currently exposed in UI)

### exportChecklist()

**Purpose:** Serialize checklist as JSON string for sharing

**Input:** `checklist: UserChecklist`

**Output:** Formatted JSON string with 2-space indentation

**Use Case:** Future feature—allow users to export checklist as file

### importChecklist()

**Purpose:** Deserialize and validate JSON checklist

**Input:** `json: string`

**Output:** `UserChecklist | null`

**Logic:**
1. Parse JSON
2. Validate required fields: `id`, `moveDate`, `items`
3. Return parsed object or null if invalid

**Use Case:** Future feature—allow users to import checklist from file

**Validation:** Prevents malformed data from being used

## utils.ts

**Purpose:** General-purpose utility functions

**Exports:**
- `cn(...inputs: ClassValue[]): string`

### cn()

**Purpose:** Merge Tailwind CSS classes safely

**Dependencies:**
- `clsx` — Conditionally join classNames
- `tailwind-merge` — Resolve conflicting Tailwind classes

**Logic:**
1. Accept multiple class inputs (strings, objects, arrays)
2. Use clsx to merge conditions
3. Use twMerge to resolve conflicts
4. Return final class string

**Example:**
```typescript
cn("px-4 py-2", { "bg-blue-500": isActive }, ["text-white"])
// → "px-4 py-2 bg-blue-500 text-white" (with conflicts resolved)
```

**Use Case:** Component styling throughout the app—avoids duplicate classes

## Import Patterns

**In components:**
```typescript
import { generateChecklist, getSections, toggleItem } from "@/lib/checklist";
import { saveChecklist, loadChecklist } from "@/lib/storage";
import { cn } from "@/lib/utils";
```

**In types/interfaces:**
All functions are properly typed with imports from `@/types`

## Error Handling Strategy

- `storage.ts`: Catches errors silently, logs to console (non-critical)
- `checklist.ts`: Pure functions, no error handling (caller responsible)
- `utils.ts`: No error cases
- Date operations: Normalize UTC to avoid timezone bugs

## Performance Considerations

- `getSections()` sorts items every call—OK for ~35 items
- `toggleItem()` creates new object—immutable, safe for React state
- `getDaysUntilMove()` uses ceiling—slightly optimistic for countdown

## Testing Recommendations

**generateChecklist:**
- Verify UUID uniqueness
- Check all 35 items created
- Validate schemaVersion

**getSections:**
- Verify grouping by daysBeforeMove
- Check priority sorting (high first)
- Merge user state correctly

**toggleItem:**
- Toggle checked state
- Set/clear checkedAt timestamp
- Return new object (no mutation)

**storage:**
- localStorage quota exceeded
- JSON parse errors
- Schema version mismatch

**getDaysUntilMove:**
- Today (0)
- Future date
- Past date (negative)
- UTC normalization
