import { Prompt, Category } from "./types";

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

export function importPrompts(prompts: Prompt[]): number {
  const all = read();
  const existingIds = new Set(all.map((p) => p.id));
  let count = 0;
  for (const p of prompts) {
    // Ensure category field exists for older imports
    const prompt = { ...p, category: p.category ?? null };
    if (existingIds.has(prompt.id)) {
      const idx = all.findIndex((x) => x.id === prompt.id);
      all[idx] = prompt;
    } else {
      all.push(prompt);
    }
    count++;
  }
  write(all);
  return count;
}

export function exportPrompts(): Prompt[] {
  return read();
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
