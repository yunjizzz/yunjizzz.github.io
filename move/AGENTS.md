# Movement — Moving Preparation Assistant

A Next.js 15 MVP web service that helps users manage moving preparation with automated, timeline-based checklists and vendor links.

## Project Overview

**Movement** is a moving preparation helper that:
- Generates customized checklists based on a user's moving date
- Organizes tasks into time-based sections (D-30, D-14, D-7, D-3, D-1, D-Day, D+7)
- Sorts tasks by priority (high, medium, low)
- Persists checklist state to localStorage
- Provides curated links to moving-related vendors and services

**Tech Stack:**
- Next.js 15 with App Router
- TypeScript strict mode
- Tailwind CSS v4
- shadcn/ui (base-ui backed)
- localStorage (no backend database)

**Architecture:**
- 35 hardcoded checklist templates grouped by timeline
- 25 vendor entries across 5 categories
- Client-side state management via React hooks
- Static data files (TypeScript constants)
- Type-safe schema with versioning support

## Directory Structure

```
/
├── public/              # SVG assets (emoji icons used in code)
├── src/
│   ├── app/            # Next.js pages & layout
│   │   ├── page.tsx           # Home: date input form
│   │   ├── layout.tsx         # Root layout with header/footer/nav
│   │   ├── checklist/page.tsx # Checklist display & management
│   │   ├── vendors/page.tsx   # Vendor links organized by category
│   │   └── globals.css        # Global styles & CSS variables
│   ├── components/ui/  # shadcn/ui components (7 files)
│   ├── data/           # Static templates & vendor data
│   │   ├── checklist-template.ts  # 35 checklist items + section labels
│   │   └── vendors.ts  # 25 vendors + category definitions
│   ├── lib/            # Business logic
│   │   ├── checklist.ts       # Core checklist functions
│   │   ├── storage.ts         # localStorage CRUD operations
│   │   └── utils.ts           # Utility functions (cn helper)
│   └── types/          # TypeScript interfaces
│       └── index.ts    # All type definitions
└── AGENTS.md           # This file
```

## Key Responsibilities by Directory

| Directory | Purpose | Details |
|-----------|---------|---------|
| `src/app/` | Pages & layout | Routes, forms, checklist display, vendor listing |
| `src/components/ui/` | UI components | 7 shadcn/ui components for consistent styling |
| `src/data/` | Static data | 35 checklist templates, 25 vendors, categories |
| `src/lib/` | Business logic | Checklist generation, localStorage, utilities |
| `src/types/` | Type definitions | All TypeScript interfaces and types |

For detailed documentation, see:
- `src/AGENTS.md` — Overview of src folder modules
- `src/app/AGENTS.md` — Page routes and layout patterns
- `src/components/AGENTS.md` — UI component library reference
- `src/data/AGENTS.md` — Checklist templates and vendor data
- `src/lib/AGENTS.md` — Business logic and utilities

## Design Decisions

**Color Scheme:**
- Primary color: oklch(0.546 0.245 262.881) — blue
- CSS variable: `--primary`
- Set in `src/app/globals.css`

**Checklist Organization:**
- Grouped by `daysBeforeMove` (-30, -14, -7, -3, -1, 0, +7)
- Sorted within sections by priority (high → medium → low)
- Past sections auto-collapse based on current date

**Data Persistence:**
- localStorage key: `movement-checklist`
- Schema version: 1 (future-proofing for migrations)
- Supports export/import as JSON (not UI exposed yet)

**Vendor Categories:**
- 이사업체 (Moving companies)
- 청소 (Cleaning services)
- 인테리어 (Interior design)
- 관공서 (Government services)
- 기타 (Other)

## Critical Implementation Notes

1. **Client-Side Only:** No backend API calls. All state stored in localStorage.
2. **Date Validation:** Move date must be today or later (enforced in home form).
3. **Schema Versioning:** UserChecklist includes `schemaVersion: 1` for future migrations.
4. **TypeScript:** All code is type-safe; avoid `any` types.
5. **Tailwind v4:** Uses modern CSS variables; color references use `var()` syntax.
6. **shadcn/ui:** Based on base-ui; components are pre-generated and not auto-installed.

## Core Data Models

**ChecklistTemplate** — Template for a task:
```typescript
{
  id: string;                          // "d30-compare-movers"
  title: string;                       // "이사업체 견적 비교"
  description: string;                 // "최소 3곳 이상..."
  daysBeforeMove: number;              // -30 to +7
  category: string;                    // "계약", "정리", etc.
  priority: "high" | "medium" | "low"; // Task importance
}
```

**ChecklistItem** — User's state for a task:
```typescript
{
  templateId: string;        // Links to ChecklistTemplate
  checked: boolean;          // Completion status
  checkedAt: string | null;  // ISO timestamp when checked
  note: string | null;       // User notes (future feature)
}
```

**UserChecklist** — Root object:
```typescript
{
  id: string;              // UUID
  moveDate: string;        // ISO date string
  createdAt: string;       // ISO timestamp
  schemaVersion: number;   // 1 (for migrations)
  items: ChecklistItem[];  // 35 items
}
```

**ChecklistSection** — For display:
```typescript
{
  label: string;           // "D-30 | 한 달 전"
  daysBeforeMove: number;  // -30
  items: (ChecklistTemplate & ChecklistItem)[];  // Merged
}
```

**Vendor** — Vendor entry:
```typescript
{
  id: string;              // "v-mover-1"
  name: string;            // "짐싸"
  description: string;     // Korean description
  url: string;             // Website URL
  category: string;        // Category name
  tags: string[];          // Feature tags
}
```

## User Flow

### Home Page
1. User navigates to `/`
2. Sees hero section with moving preparation value prop
3. Selects move date (must be today or later)
4. Clicks "체크리스트 시작하기"
5. Redirected to `/checklist?date=YYYY-MM-DD`

### Checklist Page
1. Date param extracted from URL
2. Existing checklist loaded from localStorage (or new one generated)
3. Checklist persisted to localStorage
4. Sections calculated and sorted by priority
5. Past sections automatically collapsed
6. User toggles items as complete
7. Progress bar updates in real-time
8. Celebration message shows when 100% complete
9. User can navigate to vendors page via link

### Vendors Page
1. User navigates to `/vendors`
2. Vendor category tabs displayed (5 categories)
3. Active tab shows vendor grid (1/2/3 columns responsive)
4. Each vendor card is clickable link to external site
5. Vendor tags visible for quick filtering

## Development Workflow

1. **Adding a checklist item:**
   - Edit `src/data/checklist-template.ts`
   - Add new ChecklistTemplate object to array
   - Follow ID naming: `d{days}{slug}`

2. **Adding a vendor:**
   - Edit `src/data/vendors.ts`
   - Add new Vendor object to array
   - Use ID format: `v-{category}-{n}`

3. **Modifying checklist logic:**
   - Edit `src/lib/checklist.ts`
   - Update functions like generateChecklist, getSections, etc.
   - Keep immutable patterns

4. **Styling pages:**
   - Use Tailwind CSS classes
   - Reference colors via `--primary` CSS variable
   - Keep responsive (mobile-first)

5. **Testing:**
   - Manual testing in browser
   - Use localStorage inspector
   - Test date selection edge cases
   - Verify section collapse/expand

## File Conventions

| Pattern | Location | Usage |
|---------|----------|-------|
| Page component | `src/app/*/page.tsx` | Use `"use client"` if interactive |
| Layout | `src/app/layout.tsx` | Shared header, nav, footer |
| UI component | `src/components/ui/*.tsx` | shadcn patterns, reusable |
| Data file | `src/data/*.ts` | Const arrays, no mutations |
| Utility | `src/lib/*.ts` | Pure functions, no side effects |
| Types | `src/types/index.ts` | Single source of truth |

## Import Path Aliases

All code uses `@/` prefix aliases (configured in `tsconfig.json` and `next.config.ts`):
- `@/types` → `src/types`
- `@/lib` → `src/lib`
- `@/data` → `src/data`
- `@/components` → `src/components`

## Performance & Optimization

- Suspense boundary on checklist page for loading state
- localStorage is synchronous; data size is small (~10KB)
- No image optimization needed (emoji icons only)
- Client-side sorting/grouping is fast for 35 items
- Consider memoization if many sections added in future

## Accessibility Notes

- Semantic HTML: header, main, footer, nav
- Label associations in form inputs
- Checkbox labels via htmlFor
- External link indicators (ExternalLink icon)
- Color contrast meets WCAG standards
- Keyboard navigation supported

## Browser Support

- Modern browsers (ES2020+)
- localStorage required
- CSS Grid & Flexbox support
- No IE11 support

## Future Enhancements

- Backend API for data sync across devices
- User authentication and profiles
- Dark mode support
- Email reminders for upcoming tasks
- Custom checklist templates per user
- Vendor ratings and reviews
- International language support
- Mobile app (React Native)
- Offline support (service worker)

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   ```
   http://localhost:3000
   ```

4. **Build for production:**
   ```bash
   npm run build
   npm run start
   ```

## Environment

- Node.js 18+ required
- Next.js 15.x
- TypeScript 5.x
- No environment variables needed (client-side only)

## Notes for Agents

- **Writer:** Update AGENTS.md files when documenting new features or structure changes
- **Executor:** Implement features following checklist and vendor data patterns
- **Reviewer:** Verify type safety, schema compliance, and localStorage operations
- **Maintainer:** Keep checklist templates and vendors up-to-date; monitor localStorage quota
