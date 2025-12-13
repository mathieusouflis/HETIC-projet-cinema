import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Link } from ".";

describe("Link", () => {
  it("renders without crashing", () => {
    render(<Link href="https://turborepo.com">Turborepo Docs</Link>);
  });

  it("renders children correctly", () => {
    render(<Link href="https://example.com">Click me</Link>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("renders with correct href", () => {
    render(<Link href="https://example.com">Link</Link>);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://example.com");
  });

  it("does not add target or rel attributes when newTab is false", () => {
    render(
      <Link href="https://example.com" newTab={false}>
        Link
      </Link>
    );
    const link = screen.getByRole("link");
    expect(link).not.toHaveAttribute("target");
    expect(link).not.toHaveAttribute("rel");
  });

  it("adds target and rel attributes when newTab is true", () => {
    render(
      <Link href="https://example.com" newTab={true}>
        Link
      </Link>
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
  });

  it("does not add target or rel attributes when newTab is undefined", () => {
    render(<Link href="https://example.com">Link</Link>);
    const link = screen.getByRole("link");
    expect(link).not.toHaveAttribute("target");
    expect(link).not.toHaveAttribute("rel");
  });

  it("spreads additional props to anchor element", () => {
    render(
      <Link href="https://example.com" className="custom-class" data-testid="custom-link">
        Link
      </Link>
    );
    const link = screen.getByRole("link");
    expect(link).toHaveClass("custom-class");
    expect(link).toHaveAttribute("data-testid", "custom-link");
  });

  it("renders complex children", () => {
    render(
      <Link href="https://example.com">
        <span>Visit</span> <strong>our site</strong>
      </Link>
    );
    expect(screen.getByText("Visit")).toBeInTheDocument();
    expect(screen.getByText("our site")).toBeInTheDocument();
  });
});
