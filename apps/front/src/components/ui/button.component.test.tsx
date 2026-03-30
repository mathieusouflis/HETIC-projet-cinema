import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  it("renders a native button by default", () => {
    render(<Button type="button">Hello</Button>);
    const btn = screen.getByRole("button", { name: /Hello/ });
    expect(btn.getAttribute("data-slot")).toBe("button");
  });

  it("uses Slot when asChild is true", () => {
    render(
      <Button asChild>
        <a href="/x">Link</a>
      </Button>
    );
    const link = screen.getByRole("link", { name: /Link/ });
    expect(link.getAttribute("href")).toBe("/x");
  });
});
