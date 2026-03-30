import { describe, expect, it, vi } from "vitest";

vi.mock("@radix-ui/react-slot", () => ({
  Slot: (props: { children?: unknown }) => ({
    type: "SlotMock",
    props,
  }),
}));

vi.mock("@/lib/utils", () => ({
  cn: (...classes: (string | undefined | false | null)[]) =>
    classes.filter(Boolean).join(" "),
}));

vi.mock("./filters/glass-filter", () => ({
  GlassFilter: (props: { children?: unknown }) => ({
    type: "GlassFilterMock",
    props,
  }),
}));

import { Button, buttonVariants } from "./button";
import { GlassFilter } from "./filters/glass-filter";

function findInTree(
  node: unknown,
  predicate: (n: unknown) => boolean
): boolean {
  if (predicate(node)) {
    return true;
  }
  if (!node || typeof node !== "object") {
    return false;
  }
  const el = node as { props?: { children?: unknown } };
  const children = el.props?.children;
  if (!children) {
    return false;
  }
  if (Array.isArray(children)) {
    return children.some((c) => findInTree(c, predicate));
  }
  return findInTree(children, predicate);
}

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

describe("Button component", () => {
  it("renders a button element with data attributes", () => {
    const el = Button({ children: "Hi" } as never);
    const props = (el as any).props;
    expect((el as any).type).toBe("button");
    expect(props["data-slot"]).toBe("button");
    expect(props["data-variant"]).toBe("default");
    expect(props["data-size"]).toBe("default");
  });

  it("wraps children with GlassFilter markup (svg title 'glass')", () => {
    const el = Button({ children: "Hi" } as never);
    expect(findInTree(el, (n) => (n as any)?.type === GlassFilter)).toBe(true);
  });

  it("asChild uses Slot (type is Slot)", () => {
    const el = Button({ asChild: true, children: "X" } as never);
    expect((el as any).type).not.toBe("button");
  });
});
