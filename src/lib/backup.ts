import { exportPrompts } from "./prompts-store";
import type { Prompt, Category } from "./types";

const SNAPSHOT_KEY = "prompt-library-snapshots";
const LAST_EXPORT_KEY = "prompt-library-last-export";
const SAFETY_DISMISSED_KEY = "prompt-library-safety-dismissed";
const MAX_SNAPSHOTS = 3;
const EXPORT_REMINDER_DAYS = 14;

export interface Snapshot {
  saved_at: string;
  prompts: Prompt[];
  categories: Category[];
}

function readSnapshots(): Snapshot[] {
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Take a local snapshot of all data if it differs from the most recent one.
 * Keeps a small ring buffer so a bad import/delete can be rolled back even
 * without an exported file. Best-effort: silently no-ops if storage is full.
 */
export function maybeSnapshot(): void {
  try {
    const data = exportPrompts();
    if (data.prompts.length === 0) return;
    const snapshots = readSnapshots();
    const last = snapshots[0];
    const fingerprint = (s: { prompts: Prompt[]; categories: Category[] }) =>
      JSON.stringify({ p: s.prompts.length, c: s.categories.length, hash: s.prompts.map((x) => x.updated_at ?? x.created_at).join("|") });
    if (last && fingerprint(last) === fingerprint(data)) return;
    const next: Snapshot[] = [
      { saved_at: new Date().toISOString(), prompts: data.prompts, categories: data.categories },
      ...snapshots,
    ].slice(0, MAX_SNAPSHOTS);
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(next));
  } catch {
    /* snapshots are best-effort */
  }
}

export function getSnapshots(): Snapshot[] {
  return readSnapshots();
}

export function markExported(): void {
  try {
    localStorage.setItem(LAST_EXPORT_KEY, new Date().toISOString());
  } catch {
    /* ignore */
  }
}

export function getLastExport(): Date | null {
  const raw = localStorage.getItem(LAST_EXPORT_KEY);
  return raw ? new Date(raw) : null;
}

/** True when the user has prompts but hasn't exported a backup recently. */
export function shouldRemindExport(promptCount: number): boolean {
  if (promptCount === 0) return false;
  const last = getLastExport();
  if (!last) return true;
  const days = (Date.now() - last.getTime()) / 86_400_000;
  return days >= EXPORT_REMINDER_DAYS;
}

export function isSafetyDismissed(): boolean {
  return localStorage.getItem(SAFETY_DISMISSED_KEY) === "1";
}

export function dismissSafety(): void {
  try {
    localStorage.setItem(SAFETY_DISMISSED_KEY, "1");
  } catch {
    /* ignore */
  }
}
