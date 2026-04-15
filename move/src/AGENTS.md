# src/ — Application Source Code

Core application modules organized by responsibility: pages, UI components, business logic, static data, and type definitions.

## Directory Layout

```
src/
├── app/                    # Next.js App Router pages & layout
├── components/             # React UI components
│   └── ui/                # shadcn/ui component library (7 files)
├── data/                  # Static template & vendor data
│   ├── checklist-template.ts  # 35 checklist templates + labels
│   └── vendors.ts         # 25 vendors across 5 categories
├── lib/                   # Business logic & utilities
│   ├── checklist.ts       # Checklist generation & manipulation
│   ├── storage.ts         # localStorage CRUD operations
│   └── utils.ts           # Helper functions (cn utility)
└── types/                 # TypeScript type definitions
    └── index.ts           # All interfaces & types
```

## Module Responsibilities

### `/app` — Page Routes & Layout
See `app/AGENTS.md` for details.

**Files:**
- `layout.tsx` — Root layout with header, nav, footer
- `page.tsx` — Home page with date input form
- `checklist/page.tsx` — Checklist display with state management
- `vendors/page.tsx` — Vendor directory with category tabs

### `/components/ui` — UI Component Library
See `components/AGENTS.md` for details.

**7 shadcn/ui components:**
- `badge.tsx` — Priority labels (high/medium/low)
- `button.tsx` — Call-to-action buttons
- `card.tsx` — Container for sections & vendor items
- `checkbox.tsx` — Checklist item toggles
- `progress.tsx` — Progress bar indicator
- `separator.tsx` — Visual dividers (if used)
- `tabs.tsx` — Vendor category tabs

### `/data` — Static Data
See `data/AGENTS.md` for details.

**Files:**
- `checklist-template.ts` — 35 checklist items + section labels
- `vendors.ts` — 25 vendors + category list

### `/lib` — Business Logic
See `lib/AGENTS.md` for details.

**Files:**
- `checklist.ts` — Core functions: generate, getSections, getProgress, toggleItem, getDaysUntilMove, isValidMoveDate
- `storage.ts` — localStorage operations: save, load, clear, export, import
- `utils.ts` — `cn()` utility for merging Tailwind classes

### `/types` — Type Definitions
**File:** `index.ts`

**Interfaces:**
- `ChecklistTemplate` — Template structure with id, title, description, daysBeforeMove, category, priority
- `ChecklistItem` — User's checked state: templateId, checked, checkedAt, note
- `UserChecklist` — Root object with id, moveDate, createdAt, schemaVersion, items[]
- `Vendor` — Vendor entry with id, name, description, url, category, tags[]
- `ChecklistSection` — Grouped items with label, daysBeforeMove, items[]

## Key Concepts

**Checklist Flow:**
1. User enters move date on home page
2. Date is passed as query param to `/checklist`
3. `generateChecklist()` creates new UserChecklist from templates
4. `getSections()` groups items by daysBeforeMove and sorts by priority
5. Checklist state persists to localStorage via `saveChecklist()`
6. Sections auto-collapse if past relative to current date

**Data Shape:**
- `checklistTemplates[]` — 35 templates, each with daysBeforeMove, category, priority
- Each checklist item maps templateId to user's checked state
- Vendors organized by category for tab-based display

**Storage Strategy:**
- Key: `"movement-checklist"` in localStorage
- Schema versioned for future migrations
- Supports JSON export/import for sharing

## Development Patterns

**Adding a new checklist item:**
```typescript
// src/data/checklist-template.ts
{
  id: "d{days}-{slug}",
  title: "Task title",
  description: "Task description",
  daysBeforeMove: -30, // or -14, -7, -3, -1, 0, 7
  category: "계약|정리|행정|청소|기타|이사",
  priority: "high" | "medium" | "low",
}
```

**Adding a new vendor:**
```typescript
// src/data/vendors.ts
{
  id: "v-{category}-{n}",
  name: "Vendor name",
  description: "Vendor description",
  url: "https://vendor-url.com",
  category: "이사업체|청소|인테리어|관공서|기타",
  tags: ["tag1", "tag2"],
}
```

**Modifying checklist logic:**
All core logic in `src/lib/checklist.ts`:
- Priority sort: `priorityOrder: { high: 0, medium: 1, low: 2 }`
- Day grouping: Filter templates by `daysBeforeMove`
- Progress calculation: `completed / total * 100`
- Date math: UTC-normalized, no timezone issues

## Type Safety Guidelines

- All data imports use explicit types: `ChecklistTemplate[]`, `Vendor[]`
- Components receive typed props
- localStorage operations validate schema version
- No `any` types; use union types for variants

## Import Paths

All code uses `@/` alias imports:
- `@/types` → `src/types`
- `@/lib` → `src/lib`
- `@/data` → `src/data`
- `@/components` → `src/components`

Configure in `tsconfig.json` and `next.config.ts`.
