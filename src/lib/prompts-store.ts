import { z } from "zod";
import { Prompt, Category } from "./types";

// --- Backup schema (lenient, normalizes shape) ---
const PromptSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1, "title required").max(200),
  content: z.string().min(1, "content required").max(50000),
  tags: z.array(z.string().trim().min(1).max(50)).max(50).default([]),
  category: z.string().nullable().optional().default(null),
  is_favorite: z.boolean().optional().default(false),
  created_at: z.string().min(1).optional().default(() => new Date().toISOString()),
  last_used_at: z.string().nullable().optional().default(null),
  sort_order: z.number().optional(),
});

const CategorySchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(60),
  color: z.string().min(1),
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

function read(): Prompt[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(prompts: Prompt[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
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

export function addPrompt(data: Omit<Prompt, "id" | "created_at" | "last_used_at" | "is_favorite">): Prompt {
  const prompt: Prompt = {
    ...data,
    id: crypto.randomUUID(),
    is_favorite: false,
    created_at: new Date().toISOString(),
    last_used_at: null,
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
  const copy: Prompt = {
    ...original,
    id: crypto.randomUUID(),
    title: `${original.title} (copy)`,
    is_favorite: false,
    created_at: new Date().toISOString(),
    last_used_at: null,
    sort_order: undefined,
  };
  all.push(copy);
  write(all);
  return copy;
}

export function updatePrompt(id: string, updates: Partial<Prompt>): Prompt | null {
  const all = read();
  const idx = all.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...updates };
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

  // Categories
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

  // Prompts
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
      last_used_at: p.last_used_at ?? null,
      sort_order: p.sort_order,
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


export function exportPrompts(): { prompts: Prompt[]; categories: Category[] } {
  return { prompts: read(), categories: readCategories() };
}

export function getAllTags(): string[] {
  const all = read();
  const tagSet = new Set<string>();
  all.forEach((p) => p.tags.forEach((t) => tagSet.add(t)));
  return Array.from(tagSet).sort();
}

// --- Category helpers ---

function readCategories(): Category[] {
  try {
    const raw = localStorage.getItem(CATEGORIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeCategories(cats: Category[]) {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(cats));
}

export function getCategories(): Category[] {
  return readCategories().sort((a, b) => a.name.localeCompare(b.name));
}

export function addCategory(name: string): Category {
  const all = readCategories();
  const colorIndex = all.length % CATEGORY_COLORS.length;
  const cat: Category = {
    id: crypto.randomUUID(),
    name: name.trim(),
    color: CATEGORY_COLORS[colorIndex],
  };
  all.push(cat);
  writeCategories(all);
  return cat;
}

export function deleteCategory(id: string) {
  const cats = readCategories().filter((c) => c.id !== id);
  writeCategories(cats);
  // Remove category from prompts that had it
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
