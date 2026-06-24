import { describe, it, expect } from "vitest";
import { extractVariables, hasVariables, fillVariables } from "./variables";

describe("variables", () => {
  it("extracts unique variables in order", () => {
    expect(extractVariables("Hi {{name}}, your {{topic}} and {{ name }} again")).toEqual(["name", "topic"]);
  });

  it("detects presence", () => {
    expect(hasVariables("no vars here")).toBe(false);
    expect(hasVariables("a {{x}} b")).toBe(true);
  });

  it("fills provided values and keeps blanks as placeholders", () => {
    const out = fillVariables("Dear {{name}}, about {{topic}}", { name: "Sam", topic: "" });
    expect(out).toBe("Dear Sam, about {{topic}}");
  });
});
