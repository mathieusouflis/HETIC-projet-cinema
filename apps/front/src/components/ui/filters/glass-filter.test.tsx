import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GlassFilter } from "./glass-filter";

describe("GlassFilter", () => {
  it("renders children and glass markup", () => {
    render(
      <GlassFilter>
        <span>inner</span>
      </GlassFilter>
    );
    expect(screen.getByText("inner")).toBeDefined();
    expect(document.querySelector("filter#glass")).toBeTruthy();
  });
});
