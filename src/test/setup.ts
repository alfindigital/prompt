import "@testing-library/jest-dom";
import { beforeEach } from "vitest";

// Some jsdom builds expose crypto without randomUUID — guarantee it for the store.
const cryptoShim = globalThis as unknown as { crypto?: { randomUUID?: () => string } };
if (!cryptoShim.crypto) cryptoShim.crypto = {};
if (typeof cryptoShim.crypto.randomUUID !== "function") {
  let n = 0;
  cryptoShim.crypto.randomUUID = () => `00000000-0000-4000-8000-${String(n++).padStart(12, "0")}`;
}

// Each test starts from a clean local store.
beforeEach(() => {
  localStorage.clear();
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
