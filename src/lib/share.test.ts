import { describe, it, expect } from "vitest";
import { encodeSharedPrompt, decodeSharedPrompt, estimateTokens } from "./share";

describe("share encoding", () => {
  it("round-trips a payload including unicode", () => {
    const payload = { title: "Café ☕ Prompt", content: "Halo dunia — {{name}} 🎉", tags: ["a", "b"], category: null };
    const encoded = encodeSharedPrompt(payload);
    expect(encoded).not.toMatch(/[+/=]/); // url-safe, unpadded
    const decoded = decodeSharedPrompt(encoded);
    expect(decoded?.title).toBe(payload.title);
    expect(decoded?.content).toBe(payload.content);
    expect(decoded?.tags).toEqual(payload.tags);
  });

  it("returns null for garbage", () => {
    expect(decodeSharedPrompt("!!!notbase64!!!")).toBeNull();
    expect(decodeSharedPrompt(encodeSharedPrompt({ title: "", content: "", tags: [] }))).toBeNull();
  });
});

describe("estimateTokens", () => {
  it("approximates ~4 chars per token", () => {
    expect(estimateTokens("12345678")).toBe(2);
    expect(estimateTokens("")).toBe(0);
  });
});
