# src/components — React UI Components

Reusable UI components built with shadcn/ui patterns (base-ui backed).

## Directory Structure

```
src/components/
└── ui/
    ├── badge.tsx        # Priority & tag labels
    ├── button.tsx       # Call-to-action buttons
    ├── card.tsx         # Container & section cards
    ├── checkbox.tsx     # Checklist item toggles
    ├── progress.tsx     # Progress bar indicator
    ├── separator.tsx    # Visual dividers
    └── tabs.tsx         # Category tab navigation
```

## Component Library

All components follow shadcn/ui conventions:
- Base component from `@base-ui/react/*`
- Class variance authority (CVA) for variants
- `cn()` utility for class merging
- TypeScript props with proper typing
- Tailwind CSS for styling

### badge.tsx

**Purpose:** Display labels for priority levels and vendor tags

**Variants:**
- `default` — Primary color (blue)
- `secondary` — Muted color
- `destructive` — Red for high-priority items
- `outline` — Bordered style

**Usage in App:**
- Priority badges: `getPriorityBadge()` function in checklist/page.tsx
  - High priority: `<Badge variant="destructive">필수</Badge>`
  - Medium priority: Custom bg-yellow-500
  - Low priority: `<Badge variant="secondary">선택</Badge>`
- Vendor tags: Blue outline badges in vendors/page.tsx

**Styling:**
- Small font (xs), padded
- Rounded corners
- Applies color schemes via Tailwind

### button.tsx

**Purpose:** Interactive buttons for forms and navigation

**Variants:**
- `default` — Primary blue background
- `outline` — Bordered, secondary style
- `secondary` — Alternative color
- `ghost` — Minimal, hover-only background
- `destructive` — Red warning style
- `link` — Underlined text

**Sizes:**
- `default` — Standard height
- `xs` — Extra small
- `sm` — Small
- `lg` — Large
- `icon` — Square for icon-only buttons
- `icon-xs`, `icon-sm`, `icon-lg` — Icon sizes

**Usage in App:**
- Home page: Submit button for date form
- Checklist page: Link to vendors page (styled as button)
- Vendor cards: External link via anchor tag styled as button

**Accessibility:**
- Focus ring: `focus-visible:ring-3`
- Disabled state: Opacity 50%, pointer-events none
- aria-invalid for validation errors

### card.tsx

**Purpose:** Container component for grouped content

**Sub-components:**
- `Card` — Root container
- `CardHeader` — Title & description area
- `CardTitle` — Main heading
- `CardDescription` — Subtitle/helper text
- `CardContent` — Body content
- `CardAction` — Right-aligned action area
- `CardFooter` — Bottom bar with border

**Sizes:**
- `default` — Standard padding & gap
- `sm` — Smaller padding (py-3, px-3)

**Usage in App:**
- Checklist sections: Each daysBeforeMove group is a Card
- Vendor items: Each vendor link is a Card
- Home page: Date input form in Card

**Styling:**
- Rounded corners (rounded-xl)
- Ring border: `ring-1 ring-foreground/10`
- Flexible gap (4 units default, 3 if sm)
- Shadow optional via `shadow-md` on page

### checkbox.tsx

**Purpose:** Toggle checklist items as complete/incomplete

**State:**
- `checked` — Boolean
- `onCheckedChange` — Callback handler

**Usage in App:**
- Checklist page: Each item has a checkbox
- Calls `handleToggle(templateId)` on change
- Toggles `item.checked` and updates `checkedAt` timestamp

**Styling:**
- Square shape (h-5 w-5)
- Focus ring
- Indeterminate state support

**Accessibility:**
- Label association via `htmlFor`
- Keyboard accessible

### progress.tsx

**Purpose:** Show completion percentage in header

**Props:**
- `value` — Percentage 0-100

**Usage in App:**
- Checklist header: Shows `{completed}/{total}` with visual bar
- Progress calculated by `getProgress()`
- Animated width change via CSS transition

**Styling:**
- Horizontal bar
- Background color (muted)
- Foreground color (primary, white)
- Rounded corners

### separator.tsx

**Purpose:** Visual divider between sections (optional)

**Props:**
- `orientation` — Horizontal (default) or vertical
- `className` — Custom styling

**Usage in App:**
- Not heavily used; cards have built-in dividers
- Could be used for visual separation between major page areas

**Styling:**
- Border line (1px)
- Foreground/10 opacity color

### tabs.tsx

**Purpose:** Category-based navigation on vendors page

**Sub-components:**
- `Tabs` — Root container
- `TabsList` — Tab button group
- `TabsTrigger` — Individual tab button
- `TabsContent` — Content panel per tab

**Props:**
- `value` — Active tab identifier
- `onValueChange` — Callback when tab changes

**Usage in App:**
- Vendors page: 5 tabs for categories
  - 이사업체 (moving companies)
  - 청소 (cleaning)
  - 인테리어 (interior)
  - 관공서 (government)
  - 기타 (other)

**Styling:**
- TabsList with flex-wrap for responsive layout
- TabsTrigger with emoji icon + text
- Full-width layout with gap between triggers
- Active tab styling (background change)

## Component Design Patterns

**Props Pattern:**
```typescript
// Extend HTML element props + add custom props
interface CardProps extends React.ComponentProps<"div"> {
  size?: "default" | "sm";
}
```

**Class Merging:**
```typescript
// Use cn() to merge Tailwind classes safely
className={cn(defaultClasses, className)}
```

**Variant System:**
```typescript
// CVA for managing style variants
const buttonVariants = cva(baseClasses, {
  variants: {
    variant: { default: "...", outline: "..." },
    size: { default: "...", sm: "..." },
  },
})
```

## Styling Guidelines

- Use Tailwind CSS utility classes
- Primary color via `--primary` CSS variable
- Responsive prefixes: `sm:`, `md:`, `lg:`
- Dark mode support via `dark:` prefix (if needed)
- Avoid hardcoded colors; use semantic color names

## Adding New Components

To add a new shadcn/ui component:

1. Check shadcn/ui documentation for desired component
2. Adapt from base-ui primitive
3. Create file in `src/components/ui/{name}.tsx`
4. Export from `src/components/ui/` or create barrel export
5. Import in page/layout as needed
6. Document in this AGENTS.md

Example additions to consider:
- `input.tsx` — Text input (if custom date input needed)
- `dialog.tsx` — Modal for confirmations
- `dropdown-menu.tsx` — Context menus
- `tooltip.tsx` — Hover hints

## Maintenance Notes

- All components are manually maintained (not auto-generated by CLI)
- Update base-ui library version in package.json as needed
- Keep in sync with Tailwind CSS v4 syntax
- Ensure accessibility (ARIA labels, keyboard navigation)
