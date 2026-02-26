import { render, screen, act } from "@testing-library/react";
import { expect, it, describe, vi } from "vitest";
import { DateDisplay } from "./DateDisplay";

describe("DateDisplay Component (WIB)", () => {
  it("should render the span as visible after mount (happy-dom runs effects synchronously)", () => {
    const utcDate = "2026-02-23T00:00:00Z"; // 07:00 WIB
    const { container } = render(<DateDisplay date={utcDate} />);

    // In happy-dom (the Vitest environment), useEffect fires synchronously
    // right after render, so the component is always in the "mounted" state
    // by the time we query the DOM. The hidden/placeholder span is only
    // relevant in a real browser during SSR hydration.
    const span = container.querySelector("span");
    expect(span).toBeInTheDocument();
    // The span should NOT have visibility:hidden — it should be fully visible
    expect(span).not.toHaveStyle({ visibility: "hidden" });
  });

  it("should render the correct WIB time after mounting", async () => {
    const utcDate = "2026-02-23T00:00:00Z"; // 07:00 WIB
    render(<DateDisplay date={utcDate} />);

    // Wait for useEffect to trigger mounting (which switches visibility)
    // In Vitest with happy-dom, effects run synchronously or we can wait
    const text = await screen.findByText(/23 Februari 2026/);
    expect(text).toBeInTheDocument();
    expect(text).toHaveTextContent(/07[.:]00/);
    expect(text).toHaveTextContent("WIB");
  });

  it("should handle different time formats", async () => {
    const utcDate = "2026-02-23T15:30:00Z"; // 22:30 WIB
    render(
      <DateDisplay
        date={utcDate}
        format={{
          hour: "numeric",
          minute: "numeric",
          timeZone: "Asia/Jakarta",
        }}
        showTimezone={false}
      />,
    );

    const text = await screen.findByText(/22[.:]30/);
    expect(text).toBeInTheDocument();
    expect(text).not.toHaveTextContent("WIB");
  });

  it("should display fallback for empty date", () => {
    render(<DateDisplay date={undefined} />);
    expect(screen.getByText("--")).toBeInTheDocument();
  });
});
