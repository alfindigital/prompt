import { z } from "zod";
import { toast } from "sonner";
import { Prompt, Category, PromptRevision } from "./types";

// --- Backup schema (lenient, normalizes shape) ---
const RevisionSchema = z.object({
  title: z.string(),
  content: z.string(),
  tags: z.array(z.string()).default([]),
  category: z.string().nullable().optional().default(null),
  saved_at: z.string().optional().default(() => new Date().toISOString()),
});

const PromptSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1, "title required").max(200),
  content: z.string().min(1, "content required").max(50000),
  tags: z.array(z.string().trim().min(1).max(50)).max(50).default([]),
  category: z.string().nullable().optional().default(null),
  is_favorite: z.boolean().optional().default(false),
  created_at: z.string().min(1).optional().default(() => new Date().toISOString()),
  updated_at: z.string().optional(),
  last_used_at: z.string().nullable().optional().default(null),
  use_count: z.number().optional().default(0),
  sort_order: z.number().optional(),
  history: z.array(RevisionSchema).optional().default([]),
});

const CategorySchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(60),
  color: z.string().min(1),
  parent_id: z.string().nullable().optional().default(null),
});

const BackupSchema = z.union([
  z.array(PromptSchema),
  z.object({
    prompts: z.array(PromptSchema),
    categories: z.array(CategorySchema).optional().default([]),
  }),
]);

export type ImportResult = {
  promptsAdded: number;
  promptsUpdated: number;
  categoriesAdded: number;
  skipped: number;
};

const STORAGE_KEY = "prompt-library-prompts";
const CATEGORIES_KEY = "prompt-library-categories";
const MAX_HISTORY = 20;

const CATEGORY_COLORS = [
  "250 60% 52%", // purple
  "170 60% 42%", // teal
  "38 92% 50%",  // amber
  "0 72% 51%",   // red
  "210 80% 52%", // blue
  "330 65% 50%", // pink
  "145 60% 40%", // green
  "25 90% 52%",  // orange
];

// --- Low-level storage with normalization + quota safety ---

/** Normalize an arbitrary stored object into a valid Prompt, or null if unusable. */
function normalizePrompt(raw: unknown): Prompt | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== "string" || typeof r.title !== "string" || typeof r.content !== "string") {
    return null;
  }
  return {
    id: r.id,
    title: r.title,
    content: r.content,
    tags: Array.isArray(r.tags) ? (r.tags.filter((t) => typeof t === "string") as string[]) : [],
    category: typeof r.category === "string" ? r.category : null,
    is_favorite: r.is_favorite === true,
    created_at: typeof r.created_at === "string" ? r.created_at : new Date().toISOString(),
    updated_at: typeof r.updated_at === "string" ? r.updated_at : undefined,
    last_used_at: typeof r.last_used_at === "string" ? r.last_used_at : null,
    use_count: typeof r.use_count === "number" ? r.use_count : 0,
    sort_order: typeof r.sort_order === "number" ? r.sort_order : undefined,
    history: Array.isArray(r.history) ? (r.history as PromptRevision[]) : [],
  };
}

function read(): Prompt[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizePrompt).filter((p): p is Prompt => p !== null);
  } catch {
    return [];
  }
}

let quotaToastShown = false;

/** Persist prompts. Returns false (and warns the user) instead of throwing on quota errors. */
function write(prompts: Prompt[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
    quotaToastShown = false;
    return true;
  } catch (err) {
    const isQuota =
      err instanceof DOMException &&
      (err.name === "QuotaExceededError" || err.name === "NS_ERROR_DOM_QUOTA_REACHED");
    if (!quotaToastShown) {
      quotaToastShown = true;
      toast.error(
        isQuota ? "Storage is full" : "Could not save",
        {
          description: isQuota
            ? "Export a backup, then delete some prompts to free up space."
            : "Your browser blocked local storage. Changes were not saved.",
        }
      );
    }
    return false;
  }
}

export function getPrompts(): Prompt[] {
  return read().sort((a, b) => {
    if (a.is_favorite !== b.is_favorite) return a.is_favorite ? -1 : 1;
    const orderA = a.sort_order ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.sort_order ?? Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) return orderA - orderB;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export function reorderPrompts(orderedIds: string[]) {
  const all = read();
  orderedIds.forEach((id, index) => {
    const p = all.find((x) => x.id === id);
    if (p) p.sort_order = index;
  });
  write(all);
}

export function addPrompt(
  data: Omit<Prompt, "id" | "created_at" | "last_used_at" | "is_favorite" | "use_count" | "history">
): Prompt {
  const now = new Date().toISOString();
  const prompt: Prompt = {
    ...data,
    id: crypto.randomUUID(),
    is_favorite: false,
    created_at: now,
    updated_at: now,
    last_used_at: null,
    use_count: 0,
    history: [],
  };
  const all = read();
  all.push(prompt);
  write(all);
  return prompt;
}

export function duplicatePrompt(id: string): Prompt | null {
  const all = read();
  const original = all.find((p) => p.id === id);
  if (!original) return null;
  const now = new Date().toISOString();
  const copy: Prompt = {
    ...original,
    id: crypto.randomUUID(),
    title: `${original.title} (copy)`,
    is_favorite: false,
    created_at: now,
    updated_at: now,
    last_used_at: null,
    use_count: 0,
    sort_order: undefined,
    history: [],
  };
  all.push(copy);
  write(all);
  return copy;
}

const CONTENT_FIELDS: (keyof Prompt)[] = ["title", "content", "tags", "category"];

function contentChanged(a: Prompt, updates: Partial<Prompt>): boolean {
  return CONTENT_FIELDS.some((f) => {
    if (!(f in updates)) return false;
    return JSON.stringify(a[f]) !== JSON.stringify(updates[f]);
  });
}

export function updatePrompt(id: string, updates: Partial<Prompt>): Prompt | null {
  const all = read();
  const idx = all.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const prev = all[idx];

  // Snapshot the previous content state into history when content fields change.
  let history = prev.history ?? [];
  if (contentChanged(prev, updates)) {
    const revision: PromptRevision = {
      title: prev.title,
      content: prev.content,
      tags: prev.tags,
      category: prev.category,
      saved_at: prev.updated_at ?? prev.created_at,
    };
    history = [revision, ...history].slice(0, MAX_HISTORY);
    updates = { ...updates, updated_at: new Date().toISOString(), history };
  }

  all[idx] = { ...prev, ...updates };
  write(all);
  return all[idx];
}

/** Record a "use" of a prompt: bump count + timestamp. Kept separate so it never pollutes history. */
export function markUsed(id: string): Prompt | null {
  const all = read();
  const idx = all.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  all[idx] = {
    ...all[idx],
    last_used_at: new Date().toISOString(),
    use_count: (all[idx].use_count ?? 0) + 1,
  };
  write(all);
  return all[idx];
}

export function restoreRevision(id: string, index: number): Prompt | null {
  const all = read();
  const idx = all.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const p = all[idx];
  const rev = p.history?.[index];
  if (!rev) return null;
  // Snapshot current state before restoring so the restore itself is undoable.
  const current: PromptRevision = {
    title: p.title,
    content: p.content,
    tags: p.tags,
    category: p.category,
    saved_at: p.updated_at ?? p.created_at,
  };
  const history = [current, ...(p.history ?? [])].slice(0, MAX_HISTORY);
  all[idx] = {
    ...p,
    title: rev.title,
    content: rev.content,
    tags: rev.tags,
    category: rev.category,
    updated_at: new Date().toISOString(),
    history,
  };
  write(all);
  return all[idx];
}

export function deletePrompt(id: string): Prompt | null {
  const all = read();
  const idx = all.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const [removed] = all.splice(idx, 1);
  write(all);
  return removed;
}

export function deletePrompts(ids: string[]): Prompt[] {
  const all = read();
  const idSet = new Set(ids);
  const removed: Prompt[] = [];
  const remaining = all.filter((p) => {
    if (idSet.has(p.id)) {
      removed.push(p);
      return false;
    }
    return true;
  });
  write(remaining);
  return removed;
}

/** Re-insert previously removed prompts (used by Undo). */
export function restorePrompts(prompts: Prompt[]) {
  const all = read();
  const existing = new Set(all.map((p) => p.id));
  prompts.forEach((p) => {
    if (!existing.has(p.id)) all.push(p);
  });
  write(all);
}

// --- Bulk operations ---

export function bulkSetCategory(ids: string[], category: string | null) {
  const all = read();
  const idSet = new Set(ids);
  all.forEach((p) => {
    if (idSet.has(p.id)) p.category = category;
  });
  write(all);
}

export function bulkAddTags(ids: string[], tags: string[]) {
  const clean = tags.map((t) => t.trim().toLowerCase()).filter(Boolean);
  if (clean.length === 0) return;
  const all = read();
  const idSet = new Set(ids);
  all.forEach((p) => {
    if (idSet.has(p.id)) {
      const set = new Set(p.tags);
      clean.forEach((t) => set.add(t));
      p.tags = Array.from(set);
    }
  });
  write(all);
}

export function bulkSetFavorite(ids: string[], value: boolean) {
  const all = read();
  const idSet = new Set(ids);
  all.forEach((p) => {
    if (idSet.has(p.id)) p.is_favorite = value;
  });
  write(all);
}

// --- Import / export ---

export function importPrompts(data: unknown): ImportResult {
  const parsed = BackupSchema.safeParse(data);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    const path = first.path.length ? first.path.join(".") : "root";
    throw new Error(`Invalid backup at "${path}": ${first.message}`);
  }

  const value = parsed.data;
  const promptsRaw = Array.isArray(value) ? value : value.prompts;
  const cats = Array.isArray(value) ? [] : value.categories ?? [];

  const result: ImportResult = {
    promptsAdded: 0,
    promptsUpdated: 0,
    categoriesAdded: 0,
    skipped: 0,
  };

  if (cats.length > 0) {
    const existing = readCategories();
    const existingIds = new Set(existing.map((c) => c.id));
    for (const c of cats) {
      if (!existingIds.has(c.id)) {
        existing.push(c as Category);
        result.categoriesAdded++;
      }
    }
    writeCategories(existing);
  }

  const all = read();
  const byId = new Map(all.map((p) => [p.id, p] as const));
  for (const p of promptsRaw) {
    const prompt: Prompt = {
      id: p.id,
      title: p.title,
      content: p.content,
      tags: p.tags,
      category: p.category ?? null,
      is_favorite: p.is_favorite,
      created_at: p.created_at,
      updated_at: p.updated_at,
      last_used_at: p.last_used_at ?? null,
      use_count: p.use_count ?? 0,
      sort_order: p.sort_order,
      history: (p.history ?? []) as PromptRevision[],
    };
    if (byId.has(prompt.id)) {
      const idx = all.findIndex((x) => x.id === prompt.id);
      all[idx] = prompt;
      result.promptsUpdated++;
    } else {
      all.push(prompt);
      byId.set(prompt.id, prompt);
      result.promptsAdded++;
    }
  }
  write(all);
  return result;
}

/**
 * Import loose prompts from Markdown / plain text. Splits on level-1/2 headings
 * (e.g. "# Title" or "## Title"); content following each heading becomes the body.
 * If there are no headings, the whole text is imported as a single prompt.
 */
export function importFromText(text: string, defaultTitle = "Imported prompt"): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;

  const lines = trimmed.split("\n");
  const blocks: { title: string; content: string[] }[] = [];
  let current: { title: string; content: string[] } | null = null;

  for (const line of lines) {
    const heading = line.match(/^#{1,2}\s+(.+)$/);
    if (heading) {
      if (current) blocks.push(current);
      current = { title: heading[1].trim(), content: [] };
    } else if (current) {
      current.content.push(line);
    } else {
      current = { title: defaultTitle, content: [line] };
    }
  }
  if (current) blocks.push(current);

  let added = 0;
  for (const b of blocks) {
    const content = b.content.join("\n").trim();
    if (!content) continue;
    addPrompt({ title: b.title || defaultTitle, content, tags: [], category: null });
    added++;
  }
  return added;
}

export function exportPrompts(): { prompts: Prompt[]; categories: Category[] } {
  return { prompts: read(), categories: readCategories() };
}

// --- Tags ---

export function getAllTags(): string[] {
  const all = read();
  const tagSet = new Set<string>();
  all.forEach((p) => p.tags.forEach((t) => tagSet.add(t)));
  return Array.from(tagSet).sort();
}

export function getTagCounts(): { tag: string; count: number }[] {
  const all = read();
  const counts = new Map<string, number>();
  all.forEach((p) => p.tags.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function renameTag(oldTag: string, newTag: string) {
  const target = newTag.trim().toLowerCase();
  if (!target || target === oldTag) return;
  const all = read();
  all.forEach((p) => {
    if (p.tags.includes(oldTag)) {
      const set = new Set(p.tags.map((t) => (t === oldTag ? target : t)));
      p.tags = Array.from(set);
    }
  });
  write(all);
}

export function deleteTag(tag: string) {
  const all = read();
  all.forEach((p) => {
    if (p.tags.includes(tag)) p.tags = p.tags.filter((t) => t !== tag);
  });
  write(all);
}

// --- Categories ---

function readCategories(): Category[] {
  try {
    const raw = localStorage.getItem(CATEGORIES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((c) => c && typeof c.id === "string" && typeof c.name === "string")
      .map((c) => ({
        id: c.id,
        name: c.name,
        color: typeof c.color === "string" ? c.color : CATEGORY_COLORS[0],
        parent_id: typeof c.parent_id === "string" ? c.parent_id : null,
      }));
  } catch {
    return [];
  }
}

function writeCategories(cats: Category[]) {
  try {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(cats));
  } catch {
    /* surfaced by prompt write path */
  }
}

export function getCategories(): Category[] {
  return readCategories().sort((a, b) => a.name.localeCompare(b.name));
}

/** Categories returned in tree order (parents before children) with a depth marker. */
export function getCategoryTree(): { category: Category; depth: number }[] {
  const cats = getCategories();
  const byParent = new Map<string | null, Category[]>();
  cats.forEach((c) => {
    const key = c.parent_id ?? null;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(c);
  });
  const out: { category: Category; depth: number }[] = [];
  const walk = (parent: string | null, depth: number) => {
    (byParent.get(parent) ?? []).forEach((c) => {
      out.push({ category: c, depth });
      walk(c.id, depth + 1);
    });
  };
  walk(null, 0);
  return out;
}

/** Returns the id plus all descendant category ids. */
export function getCategoryWithDescendants(id: string): string[] {
  const cats = readCategories();
  const result = [id];
  const collect = (parent: string) => {
    cats.filter((c) => c.parent_id === parent).forEach((c) => {
      result.push(c.id);
      collect(c.id);
    });
  };
  collect(id);
  return result;
}

export function addCategory(name: string, parentId: string | null = null): Category {
  const all = readCategories();
  const colorIndex = all.length % CATEGORY_COLORS.length;
  const cat: Category = {
    id: crypto.randomUUID(),
    name: name.trim(),
    color: CATEGORY_COLORS[colorIndex],
    parent_id: parentId,
  };
  all.push(cat);
  writeCategories(all);
  return cat;
}

export function deleteCategory(id: string) {
  const cats = readCategories();
  // Re-parent direct children to the deleted category's parent (or root).
  const deleted = cats.find((c) => c.id === id);
  const newParent = deleted?.parent_id ?? null;
  const remaining = cats
    .filter((c) => c.id !== id)
    .map((c) => (c.parent_id === id ? { ...c, parent_id: newParent } : c));
  writeCategories(remaining);

  const all = read();
  let changed = false;
  all.forEach((p) => {
    if (p.category === id) {
      p.category = null;
      changed = true;
    }
  });
  if (changed) write(all);
}

export function renameCategory(id: string, newName: string) {
  const cats = readCategories();
  const idx = cats.findIndex((c) => c.id === id);
  if (idx !== -1) {
    cats[idx].name = newName.trim();
    writeCategories(cats);
  }
}

export function setCategoryParent(id: string, parentId: string | null) {
  if (id === parentId) return;
  // Prevent cycles: a category cannot be moved under one of its own descendants.
  if (parentId && getCategoryWithDescendants(id).includes(parentId)) return;
  const cats = readCategories();
  const idx = cats.findIndex((c) => c.id === id);
  if (idx !== -1) {
    cats[idx].parent_id = parentId;
    writeCategories(cats);
  }
}
