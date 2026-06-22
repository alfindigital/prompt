import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Index from "@/pages/Index";

describe("Index page (render smoke)", () => {
  it("renders the empty state, loads the starter pack, and shows cards + search", () => {
    render(<Index />);

    // Empty state copy
    expect(screen.getByText(/always one tap away/i)).toBeInTheDocument();

    // Load starter pack
    fireEvent.click(screen.getByRole("button", { name: /load starter pack/i }));

    // Starter prompts now render as cards
    expect(screen.getByText("Polished email rewrite")).toBeInTheDocument();
    expect(screen.getByText("Code reviewer")).toBeInTheDocument();

    // Toolbar search is now visible (discoverability fix)
    expect(screen.getByRole("searchbox", { name: /search prompts/i })).toBeInTheDocument();
  });

  it("filters prompts via the search box", () => {
    render(<Index />);
    fireEvent.click(screen.getByRole("button", { name: /load starter pack/i }));

    const search = screen.getByRole("searchbox", { name: /search prompts/i });
    fireEvent.change(search, { target: { value: "regex" } });

    expect(screen.getByText("Regex builder")).toBeInTheDocument();
    expect(screen.queryByText("Polished email rewrite")).not.toBeInTheDocument();
  });
});
