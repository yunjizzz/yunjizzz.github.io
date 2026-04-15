# src/data — Static Templates & Vendor Data

Hardcoded data files containing checklist templates, vendor information, and related metadata.

## File Structure

```
src/data/
├── checklist-template.ts    # 35 checklist templates + section labels
└── vendors.ts               # 25 vendors + category list
```

## checklist-template.ts

**Purpose:** Define all 35 checklist items and their metadata

**Exports:**
- `checklistTemplates: ChecklistTemplate[]` — Array of 35 items
- `sectionLabels: Record<number, string>` — Localized labels by daysBeforeMove

**Data Structure:**

```typescript
interface ChecklistTemplate {
  id: string;                                    // Unique identifier
  title: string;                                 // Korean task title
  description: string;                           // Korean task description
  daysBeforeMove: number;                        // -30, -14, -7, -3, -1, 0, 7
  category: string;                              // Task category
  priority: "high" | "medium" | "low";          // Priority level
}
```

**Timeline Groups:**

| Days | Section | Count | Label |
|------|---------|-------|-------|
| -30 | D-30 | 5 | "D-30 \| 한 달 전" |
| -14 | D-14 | 5 | "D-14 \| 2주 전" |
| -7 | D-7 | 5 | "D-7 \| 일주일 전" |
| -3 | D-3 | 5 | "D-3 \| 3일 전" |
| -1 | D-1 | 5 | "D-1 \| 하루 전" |
| 0 | D-Day | 5 | "D-Day \| 이사 당일" |
| +7 | D+7 | 5 | "D+7 \| 일주일 후" |

**Categories (8 types):**
- 계약 — Contracts (mover agreements, lease terms)
- 정리 — Organization (packing, decluttering)
- 행정 — Administration (address changes, utilities)
- 청소 — Cleaning (post-move cleanup)
- 기타 — Other (neighbors, lock changes)
- 이사 — Moving day (actual move, inspections)

**Priority Distribution:**
- High (필수) — Essential tasks (contracts, payments, utilities)
- Medium (권장) — Recommended tasks (packing, mail, notifications)
- Low (선택) — Optional tasks (neighbors, decorations)

**ID Naming Convention:**
- Format: `d{days}{slug}`
- Examples: `d30-compare-movers`, `d7-start-packing`, `d0-moving`, `d7a-resident-register`

**Section Labels:**
- Keyed by `daysBeforeMove` value
- Korean localization with day count and description
- Used in checklist/page.tsx for section headers

## vendors.ts

**Purpose:** Define vendor links organized by category

**Exports:**
- `vendors: Vendor[]` — Array of 25 vendor entries
- `vendorCategories: string[]` — Category list for tab order

**Data Structure:**

```typescript
interface Vendor {
  id: string;              // Unique identifier
  name: string;            // Vendor name
  description: string;     // Korean description
  url: string;             // External website URL
  category: string;         // Category name
  tags: string[];          // Feature tags for filtering
}
```

**Categories & Count:**

| Category | Count | Icon | Purpose |
|----------|-------|------|---------|
| 이사업체 | 5 | 🚛 | Moving companies & quote platforms |
| 청소 | 5 | 🧹 | Cleaning services for move-in/out |
| 인테리어 | 5 | 🏠 | Interior design & furniture |
| 관공서 | 5 | 🏢 | Government services & official links |
| 기타 | 5 | 📌 | Miscellaneous services |

**Vendor Examples:**

**Moving Companies (이사업체):**
- 짐싸 — Quote comparison platform
- 다이사 — Matching service
- 미소 — Home service platform
- 아정당 — Non-face-to-face quotes
- 이사몰 — Real-time quotes and contract management

**Cleaning (청소):**
- 미소 — Move-in/out cleaning matching
- 숨고 — Cleaner matching platform
- 크린위드 — Eco-friendly cleaning
- 대리주부 — Housekeeping services
- 청소연구소 — Professional cleaning

**Interior (인테리어):**
- 오늘의집 — Interior portfolio and furniture shopping
- 집닥 — Quote comparison for contractors

(Continues with more vendors...)

**Tags Examples:**
- Functional: "견적비교", "매칭", "리뷰", "전문가매칭"
- Service type: "이사견적", "입주청소", "포장이사", "기가입인터넷"
- Features: "앱서비스", "365일운영", "비대면", "온라인신청"

**ID Naming Convention:**
- Format: `v-{category}-{n}`
- Examples: `v-mover-1`, `v-clean-3`, `v-interior-2`, `v-gov-1`

## Usage Patterns

**In checklist.ts:**
```typescript
import { checklistTemplates, sectionLabels } from "@/data/checklist-template";

// Map templates to user items
const items = checklistTemplates.map(t => ({
  templateId: t.id,
  checked: false,
  ...
}));

// Group by daysBeforeMove
const dayGroups = [...new Set(checklistTemplates.map(t => t.daysBeforeMove))];

// Get label for section
const label = sectionLabels[days] ?? `D${days >= 0 ? "+" : ""}${days}`;
```

**In vendors/page.tsx:**
```typescript
import { vendors, vendorCategories } from "@/data/vendors";

// Filter by category
const filtered = vendors.filter(v => v.category === activeTab);

// Get category icons
const icon = categoryIcons[category];
```

## Maintenance Notes

**Adding a Checklist Item:**
1. Determine `daysBeforeMove` (group placement)
2. Assign `category` from 8 existing types
3. Set `priority` based on importance
4. Use consistent ID format: `d{days}{slug}`
5. Write Korean title and description
6. Add to appropriate position in array (optional, auto-sorted in app)

**Adding a Vendor:**
1. Choose or create category from 5 existing types
2. Verify category count (currently 5 per category)
3. Use ID format: `v-{category}-{n}`
4. Include official website URL
5. Write Korean description
6. Add 2-3 relevant tags
7. Update `vendorCategories` if new category added

**Data Integrity:**
- No duplicate IDs
- All URLs are valid and accessible
- Korean text encoding (UTF-8)
- No null/undefined values in required fields
- Tags should be concise (1-3 words)

## Future Enhancements

- Add `lastUpdated` field to vendors for staleness detection
- Add `difficulty` field to checklist items (easy/medium/hard)
- Add `estimatedMinutes` to each checklist item
- Link vendors to relevant checklist items
- Support vendor rating/review data
- Internationalization support (translations)
