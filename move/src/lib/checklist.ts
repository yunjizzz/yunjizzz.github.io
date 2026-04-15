import { checklistTemplates, sectionLabels } from "@/data/checklist-template";
import { ChecklistItem, ChecklistSection, UserChecklist } from "@/types";

export function generateChecklist(moveDate: Date): UserChecklist {
  const items: ChecklistItem[] = checklistTemplates.map((t) => ({
    templateId: t.id,
    checked: false,
    checkedAt: null,
    note: null,
  }));

  return {
    id: crypto.randomUUID(),
    moveDate: moveDate.toISOString(),
    createdAt: new Date().toISOString(),
    schemaVersion: 1,
    items,
  };
}

export function getSections(checklist: UserChecklist): ChecklistSection[] {
  const dayGroups = [...new Set(checklistTemplates.map((t) => t.daysBeforeMove))].sort(
    (a, b) => a - b
  );

  const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };

  return dayGroups.map((days) => {
    const templates = checklistTemplates.filter((t) => t.daysBeforeMove === days);
    const items = templates
      .map((t) => {
        const item = checklist.items.find((i) => i.templateId === t.id);
        return {
          ...t,
          checked: item?.checked ?? false,
          checkedAt: item?.checkedAt ?? null,
          note: item?.note ?? null,
        };
      })
      .sort((a, b) => (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1));

    return {
      label: sectionLabels[days] ?? `D${days >= 0 ? "+" : ""}${days}`,
      daysBeforeMove: days,
      items,
    };
  });
}

export function getProgress(checklist: UserChecklist): {
  total: number;
  completed: number;
  percent: number;
} {
  const total = checklist.items.length;
  const completed = checklist.items.filter((i) => i.checked).length;
  return {
    total,
    completed,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

export function toggleItem(checklist: UserChecklist, templateId: string): UserChecklist {
  return {
    ...checklist,
    items: checklist.items.map((item) =>
      item.templateId === templateId
        ? {
            ...item,
            checked: !item.checked,
            checkedAt: !item.checked ? new Date().toISOString() : null,
          }
        : item
    ),
  };
}

export function isValidMoveDate(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
}

export function getDaysUntilMove(moveDate: string): number {
  const move = new Date(moveDate);
  const now = new Date();
  move.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.ceil((move.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
