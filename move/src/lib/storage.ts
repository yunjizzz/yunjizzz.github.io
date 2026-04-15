import { UserChecklist } from "@/types";

const STORAGE_KEY = "movement-checklist";

export function saveChecklist(checklist: UserChecklist): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checklist));
  } catch {
    console.error("Failed to save checklist to localStorage");
  }
}

export function loadChecklist(): UserChecklist | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    const parsed = JSON.parse(data) as UserChecklist;
    if (parsed.schemaVersion !== 1) {
      console.warn("Unknown schema version:", parsed.schemaVersion);
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearChecklist(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    console.error("Failed to clear checklist from localStorage");
  }
}

export function exportChecklist(checklist: UserChecklist): string {
  return JSON.stringify(checklist, null, 2);
}

export function importChecklist(json: string): UserChecklist | null {
  try {
    const parsed = JSON.parse(json) as UserChecklist;
    if (!parsed.id || !parsed.moveDate || !parsed.items) return null;
    return parsed;
  } catch {
    return null;
  }
}
