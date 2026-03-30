import { describe, expect, it } from "vitest";
import { GlassFilter } from "./glass-filter";

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

describe("GlassFilter", () => {
  it("renders children and the inline glass filter svg", () => {
    const el = GlassFilter({ children: "Child" } as never);
    expect(findInTree(el, (n) => n === "Child")).toBe(true);
    expect(findInTree(el, (n) => n === "glass")).toBe(true); // <title>glass</title>
  });
});
