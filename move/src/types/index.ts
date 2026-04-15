export interface ChecklistTemplate {
  id: string;
  title: string;
  description: string;
  daysBeforeMove: number;
  category: string;
  priority: "high" | "medium" | "low";
}

export interface ChecklistItem {
  templateId: string;
  checked: boolean;
  checkedAt: string | null;
  note: string | null;
}

export interface UserChecklist {
  id: string;
  moveDate: string;
  createdAt: string;
  schemaVersion: number;
  items: ChecklistItem[];
}

export interface Vendor {
  id: string;
  name: string;
  description: string;
  url: string;
  category: string;
  tags: string[];
}

export type ChecklistSection = {
  label: string;
  daysBeforeMove: number;
  items: (ChecklistTemplate & { checked: boolean; checkedAt: string | null; note: string | null })[];
};
