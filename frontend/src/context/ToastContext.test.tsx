import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { ToastProvider } from "./ToastProvider";
import { useToast } from "../hooks/useToast";

function TestConsumer() {
  const { toasts, showToast, dismissToast } = useToast();
  return (
    <div>
      <button onClick={() => showToast("Test error", "error")}>
        Show Error
      </button>
      <button onClick={() => showToast("Test success", "success")}>
        Show Success
      </button>
      {toasts.map((t) => (
        <div key={t.id} data-testid={`toast-${t.id}`}>
          <span>{t.message}</span>
          <button onClick={() => dismissToast(t.id)}>Dismiss</button>
        </div>
      ))}
    </div>
  );
}

describe("ToastContext", () => {
  it("shows a toast when showToast is called", () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>,
    );

    act(() => {
      screen.getByText("Show Error").click();
    });

    expect(screen.getByText("Test error")).toBeInTheDocument();
  });

  it("dismisses a toast when dismissToast is called", () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>,
    );

    act(() => {
      screen.getByText("Show Error").click();
    });
    expect(screen.getByText("Test error")).toBeInTheDocument();

    act(() => {
      screen.getByText("Dismiss").click();
    });
    expect(screen.queryByText("Test error")).not.toBeInTheDocument();
  });

  it("auto-dismisses after timeout", () => {
    vi.useFakeTimers();

    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>,
    );

    act(() => {
      screen.getByText("Show Error").click();
    });
    expect(screen.getByText("Test error")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.queryByText("Test error")).not.toBeInTheDocument();

    vi.useRealTimers();
  });

  it("throws when useToast is used outside ToastProvider", () => {
    expect(() => render(<TestConsumer />)).toThrow(
      "useToast must be used within ToastProvider",
    );
  });
});
