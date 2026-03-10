import { describe, it, expect, vi, beforeEach } from "vitest";
import { request } from "./client";

describe("request", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns parsed JSON on success", async () => {
    const mockData = { upload_id: "123", status: "queued" };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData),
      }),
    );

    const result = await request("/api/uploads");
    expect(result).toEqual(mockData);
    expect(fetch).toHaveBeenCalledWith("/api/uploads", undefined);
  });

  it("throws on non-ok response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      }),
    );

    await expect(request("/api/uploads")).rejects.toThrow(
      "API error: 500 Internal Server Error",
    );
  });

  it("passes options to fetch", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      }),
    );

    const opts: RequestInit = { method: "POST", body: "data" };
    await request("/api/upload", opts);
    expect(fetch).toHaveBeenCalledWith("/api/upload", opts);
  });
});
