import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "./StatusBadge";

describe("StatusBadge", () => {
  it("renders complete status with correct label", () => {
    render(<StatusBadge status="complete" />);
    expect(screen.getByText("Complete")).toBeInTheDocument();
  });

  it("renders error status with correct label", () => {
    render(<StatusBadge status="error" />);
    expect(screen.getByText("Error")).toBeInTheDocument();
  });

  it("renders processing status", () => {
    render(<StatusBadge status="processing" />);
    expect(screen.getByText("Processing")).toBeInTheDocument();
  });

  it("renders finalizing status", () => {
    render(<StatusBadge status="finalizing" />);
    expect(screen.getByText("Finalizing")).toBeInTheDocument();
  });

  it("applies green styling for complete", () => {
    render(<StatusBadge status="complete" />);
    const badge = screen.getByText("Complete");
    expect(badge.className).toContain("text-voss-green");
  });

  it("applies red styling for error", () => {
    render(<StatusBadge status="error" />);
    const badge = screen.getByText("Error");
    expect(badge.className).toContain("text-voss-red");
  });
});
