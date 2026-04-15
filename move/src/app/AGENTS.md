# src/app — Next.js App Router Pages & Layout

Entry points for the application. Defines routes, layout structure, and page-level components.

## File Structure

```
src/app/
├── layout.tsx         # Root layout: header, nav, footer
├── page.tsx           # Home: date input form
├── globals.css        # Global styles & CSS variables
├── checklist/
│   └── page.tsx       # Checklist display & management
└── vendors/
    └── page.tsx       # Vendor directory with tabs
```

## Route Map

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | `page.tsx` | Date input form, hero section, steps overview |
| `/checklist` | `checklist/page.tsx` | Main checklist display with collapsible sections |
| `/vendors` | `vendors/page.tsx` | Vendor links organized by category tabs |

## layout.tsx — Root Layout

**Responsibilities:**
- Define HTML structure, language, font loading
- Render persistent header with navigation
- Render footer with attribution
- Provide `{children}` outlet for page content

**Key Elements:**
- **Header:** Logo, nav links (Checklist, Vendors)
- **Main:** Flexible container for page content
- **Footer:** Attribution text

**Fonts:**
- Geist Sans (body) and Geist Mono (monospace) from Google Fonts
- CSS variables: `--font-geist-sans`, `--font-geist-mono`

**Metadata:**
- Title: "이사 도우미"
- Description: "이사 준비를 체크리스트로 한눈에 관리하세요"
- Language: `lang="ko"`

**Styling:**
- Sticky header with `sticky top-0 z-50`
- Border-bottom separator
- Max-width container (4xl) with centered content
- Min-height layout for footer spacing

## page.tsx — Home Page

**Responsibilities:**
- Accept move date input
- Display hero section with value proposition
- Show preparation timeline steps
- Redirect to checklist with date query param

**Component State:**
- `date` — Selected date string (YYYY-MM-DD)
- `today` — Minimum selectable date (today)

**User Flow:**
1. User sees hero text and date picker
2. Selects future date
3. Clicks "체크리스트 시작하기" button
4. Redirected to `/checklist?date={date}`

**Key Features:**
- Date input with `min={today}` validation
- Disabled button if no date selected
- Three-step visual timeline (D-30, D-7, D-Day)
- Responsive layout (max-width 28rem)

**Styling:**
- Hero section centered with emoji icon
- Date input with focus ring
- Cards for each timeline step
- Gradient or colored backgrounds optional

## checklist/page.tsx — Checklist Display

**Responsibilities:**
- Load or generate checklist based on date param
- Display sections with collapsible headers
- Show items with checkboxes and priority badges
- Persist state to localStorage
- Calculate progress and display countdown
- Auto-collapse past sections

**Component Structure:**
- `ChecklistPage` (outer) — Suspense boundary
- `ChecklistContent` (inner) — State logic and rendering

**State Management:**
- `checklist` — Current UserChecklist object
- `sections` — Grouped and sorted items
- `collapsedSections` — Set of daysBeforeMove values for collapsed state

**Data Flow:**
1. Parse date from query param
2. Load or generate checklist
3. Save to localStorage
4. Calculate sections via `getSections()`
5. Determine which sections should be collapsed
6. Render sections with toggle handlers

**Key Features:**
- Header with move date, D-Day countdown, progress bar
- Celebration banner when 100% complete
- Collapsible sections by daysBeforeMove
- Checkbox toggle with `handleToggle()`
- Priority badges (필수/high, 권장/medium, 선택/low)
- Section progress (X/Y completed)
- Link to vendors page

**Auto-Collapse Logic:**
```javascript
// Sections are collapsed if their daysBeforeMove is in the past
const daysLeft = getDaysUntilMove(moveDate);
const pastSections = sections.filter(s => -s.daysBeforeMove > daysLeft);
```

**Styling:**
- Gradient header (blue-600 to blue-800)
- Cards with shadow and hover effects
- Checkbox styling with Tailwind
- Progress bar with smooth animation
- Line-through text for completed items
- Hover backgrounds by priority (red-50 for high)

## vendors/page.tsx — Vendor Directory

**Responsibilities:**
- Display vendors grouped by category
- Provide category tabs for filtering
- Show vendor cards with external links
- Display vendor tags and descriptions

**Component Structure:**
- `VendorCard` (sub-component) — Individual vendor link card
- `VendorsPage` (main) — Tab navigation and grid layout

**State Management:**
- `activeTab` — Currently selected category

**Data:**
- `vendors[]` — 25 vendor entries
- `vendorCategories` — 5 category names
- `categoryIcons` — Emoji icons per category

**Key Features:**
- Tab list with 5 categories (이사업체, 청소, 인테리어, 관공서, 기타)
- Responsive grid (1 col mobile, 2 sm, 3 lg)
- External links (`target="_blank"`, `rel="noopener noreferrer"`)
- Vendor card hover effects
- Badge-styled tags per vendor
- ExternalLink icon indicator

**Styling:**
- TabsList with wrapped flex layout
- TabsTrigger with emoji prefix
- VendorCard with shadow and border transitions
- Blue badge styling for tags
- Grid gap and responsive columns

## globals.css — Global Styles

**Contents:**
- CSS reset or base styles
- CSS variable definitions (colors, spacing, fonts)
- Dark mode settings (if applicable)

**Key Variables:**
- `--primary` — oklch(0.546 0.245 262.881) (blue)
- `--primary-foreground` — White text on primary
- Font variables from layout.tsx

## Routing Patterns

**Query Parameters:**
- `/checklist?date=YYYY-MM-DD` — Date is required; missing or invalid redirects home

**Navigation:**
- Header links point to `/checklist` and `/vendors`
- Home page form uses `router.push()` with date param
- Checklist page has link to vendors

## Client vs Server Components

- `layout.tsx` — Server component (exports metadata)
- `page.tsx` (home) — Client component (`"use client"`)
- `checklist/page.tsx` — Client component with Suspense boundary
- `vendors/page.tsx` — Client component

**Why Client:**
- Date input requires React hooks
- localStorage access needs browser context
- Interactive checkboxes and state management
- Tab state management

## Performance Considerations

- Suspense fallback for checklist loading
- Memoization opportunities in section rendering (consider if many items)
- localStorage is synchronous; keep data small
- Image optimization not needed (emoji icons only)

## Accessibility

- Semantic HTML (header, main, footer, nav)
- Label associations in date input
- Checkbox with htmlFor binding
- External link indicators (ExternalLink icon)
- Alt text in emoji-only UI (consider: span with role="img" aria-label)
