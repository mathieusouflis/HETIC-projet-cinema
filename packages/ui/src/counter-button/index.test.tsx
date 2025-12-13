import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CounterButton } from ".";

describe("CounterButton", () => {
  it("renders without crashing", () => {
    render(<CounterButton />);
  });

  it("renders the component description text", () => {
    render(<CounterButton />);
    expect(screen.getByText(/This component is from/i)).toBeInTheDocument();
    expect(screen.getByText("ui")).toBeInTheDocument();
  });

  it("renders button with initial count of 0", () => {
    render(<CounterButton />);
    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("Count: 0");
  });

  it("increments count when button is clicked", async () => {
    const user = userEvent.setup();
    render(<CounterButton />);

    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("Count: 0");

    await user.click(button);
    expect(button).toHaveTextContent("Count: 1");
  });

  it("increments count multiple times", async () => {
    const user = userEvent.setup();
    render(<CounterButton />);

    const button = screen.getByRole("button");

    await user.click(button);
    await user.click(button);
    await user.click(button);

    expect(button).toHaveTextContent("Count: 3");
  });

  it("has correct button type attribute", () => {
    render(<CounterButton />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("type", "button");
  });

  it("renders with correct styles", () => {
    render(<CounterButton />);
    const button = screen.getByRole("button");

    expect(button).toHaveStyle({
      background: "black",
      cursor: "pointer",
    });
    // Color is computed as rgb value
    expect(button).toHaveStyle("color: rgb(255, 255, 255)");
  });
});
