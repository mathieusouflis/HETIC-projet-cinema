import { describe, expect, it } from "vitest";
import { buttonVariants } from "./button";

describe("buttonVariants", () => {
  it("should return default variant and size classes", () => {
    const classes = buttonVariants({});

    expect(classes).toContain("bg-primary");
    expect(classes).toContain("h-9");
  });

  it("should apply ghost variant with icon size", () => {
    const classes = buttonVariants({ variant: "ghost", size: "icon" });

    expect(classes).toContain("hover:bg-accent");
    expect(classes).toContain("size-9");
  });

  it("should apply compound variant for blue + default", () => {
    const classes = buttonVariants({ variant: "default", color: "blue" });

    expect(classes).toContain("bg-blue-600");
    expect(classes).toContain("text-white");
  });

  it("should apply compound variant for blue + outline", () => {
    const classes = buttonVariants({ variant: "outline", color: "blue" });

    expect(classes).toContain("border-blue-600");
    expect(classes).toContain("text-blue-600");
  });
});
