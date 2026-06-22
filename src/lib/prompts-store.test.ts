import { describe, it, expect } from "vitest";
import {
  addPrompt, getPrompts, updatePrompt, markUsed, deletePrompts, restorePrompts,
  importPrompts, exportPrompts, getAllTags, getTagCounts, renameTag, deleteTag,
  bulkSetCategory, bulkAddTags, bulkSetFavorite, importFromText,
  addCategory, getCategories, getCategoryWithDescendants, deleteCategory,
} from "./prompts-store";

const STORAGE_KEY = "prompt-library-prompts";

describe("prompts-store: basics", () => {
  it("adds and reads back a prompt with sane defaults", () => {
    const p = addPrompt({ title: "Hello", content: "World", tags: ["a"], category: null });
    expect(p.id).toBeTruthy();
    expect(p.use_count).toBe(0);
    expect(p.is_favorite).toBe(false);
    const all = getPrompts();
    expect(all).toHaveLength(1);
    expect(all[0].title).toBe("Hello");
  });

  it("sorts favorites first", () => {
    const a = addPrompt({ title: "A", content: "x", tags: [], category: null });
    addPrompt({ title: "B", content: "y", tags: [], category: null });
    updatePrompt(a.id, { is_favorite: true });
    expect(getPrompts()[0].id).toBe(a.id);
  });
});

describe("prompts-store: history + usage", () => {
  it("records a revision only when content changes", () => {
    const p = addPrompt({ title: "T", content: "v1", tags: [], category: null });
    updatePrompt(p.id, { is_favorite: true }); // not a content change
    expect(getPrompts()[0].history).toHaveLength(0);
    updatePrompt(p.id, { content: "v2" });
    const updated = getPrompts()[0];
    expect(updated.history).toHaveLength(1);
    expect(updated.history?.[0].content).toBe("v1");
  });

  it("markUsed bumps count and timestamp", () => {
    const p = addPrompt({ title: "T", content: "c", tags: [], category: null });
    markUsed(p.id);
    markUsed(p.id);
    const updated = getPrompts()[0];
    expect(updated.use_count).toBe(2);
    expect(updated.last_used_at).toBeTruthy();
    // usage must never pollute history
    expect(updated.history).toHaveLength(0);
  });
});

describe("prompts-store: resilience", () => {
  it("drops malformed entries instead of crashing", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        { id: "1", title: "ok", content: "fine" },
        { id: "2", title: "missing content" },
        { nonsense: true },
        null,
      ])
    );
    const all = getPrompts();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe("1");
    expect(Array.isArray(all[0].tags)).toBe(true);
  });
});

describe("prompts-store: import/export", () => {
  it("round-trips an export", () => {
    addPrompt({ title: "One", content: "1", tags: ["x"], category: null });
    const data = exportPrompts();
    localStorage.clear();
    const result = importPrompts(data);
    expect(result.promptsAdded).toBe(1);
    expect(getPrompts()).toHaveLength(1);
  });

  it("updates existing prompts by id rather than duplicating", () => {
    const p = addPrompt({ title: "Orig", content: "c", tags: [], category: null });
    const result = importPrompts({ prompts: [{ ...p, title: "Changed" }] });
    expect(result.promptsUpdated).toBe(1);
    expect(result.promptsAdded).toBe(0);
    expect(getPrompts()[0].title).toBe("Changed");
  });

  it("rejects an invalid backup", () => {
    expect(() => importPrompts({ prompts: [{ id: "1" }] })).toThrow();
  });

  it("imports prompts from markdown headings", () => {
    const count = importFromText("# First\nbody one\n\n## Second\nbody two");
    expect(count).toBe(2);
    const titles = getPrompts().map((p) => p.title).sort();
    expect(titles).toEqual(["First", "Second"]);
  });
});

describe("prompts-store: tags + bulk", () => {
  it("counts, renames and deletes tags globally", () => {
    addPrompt({ title: "A", content: "c", tags: ["draft", "email"], category: null });
    addPrompt({ title: "B", content: "c", tags: ["draft"], category: null });
    expect(getTagCounts().find((t) => t.tag === "draft")?.count).toBe(2);
    renameTag("draft", "wip");
    expect(getAllTags()).toContain("wip");
    expect(getAllTags()).not.toContain("draft");
    deleteTag("email");
    expect(getAllTags()).not.toContain("email");
  });

  it("applies bulk operations", () => {
    const a = addPrompt({ title: "A", content: "c", tags: [], category: null });
    const b = addPrompt({ title: "B", content: "c", tags: [], category: null });
    const ids = [a.id, b.id];
    bulkAddTags(ids, ["shared"]);
    bulkSetFavorite(ids, true);
    bulkSetCategory(ids, "cat-1");
    for (const p of getPrompts()) {
      expect(p.tags).toContain("shared");
      expect(p.is_favorite).toBe(true);
      expect(p.category).toBe("cat-1");
    }
  });

  it("restores deleted prompts (undo)", () => {
    const a = addPrompt({ title: "A", content: "c", tags: [], category: null });
    const removed = deletePrompts([a.id]);
    expect(getPrompts()).toHaveLength(0);
    restorePrompts(removed);
    expect(getPrompts()).toHaveLength(1);
  });
});

describe("prompts-store: nested categories", () => {
  it("collects descendants and reparents on delete", () => {
    const parent = addCategory("Parent");
    const child = addCategory("Child", parent.id);
    const grandchild = addCategory("Grandchild", child.id);
    const ids = getCategoryWithDescendants(parent.id);
    expect(ids).toContain(child.id);
    expect(ids).toContain(grandchild.id);

    deleteCategory(parent.id);
    const remaining = getCategories();
    // child should now be top-level (parent_id null)
    const childAfter = remaining.find((c) => c.id === child.id);
    expect(childAfter?.parent_id ?? null).toBeNull();
  });
});
