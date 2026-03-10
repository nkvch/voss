import { describe, it, expect } from "vitest";
import {
  formatFileSize,
  formatDuration,
  formatMs,
  truncateId,
} from "./format";

describe("formatFileSize", () => {
  it("returns 0 B for zero bytes", () => {
    expect(formatFileSize(0)).toBe("0 B");
  });

  it("formats bytes", () => {
    expect(formatFileSize(500)).toBe("500.0 B");
  });

  it("formats kilobytes", () => {
    expect(formatFileSize(1024)).toBe("1.0 KB");
    expect(formatFileSize(1536)).toBe("1.5 KB");
  });

  it("formats megabytes", () => {
    expect(formatFileSize(1048576)).toBe("1.0 MB");
    expect(formatFileSize(2621440)).toBe("2.5 MB");
  });
});

describe("formatDuration", () => {
  it("formats zero", () => {
    expect(formatDuration(0)).toBe("00:00.0");
  });

  it("formats seconds", () => {
    expect(formatDuration(5000)).toBe("00:05.0");
    expect(formatDuration(5500)).toBe("00:05.5");
  });

  it("formats minutes and seconds", () => {
    expect(formatDuration(65000)).toBe("01:05.0");
    expect(formatDuration(125300)).toBe("02:05.3");
  });
});

describe("formatMs", () => {
  it("returns dash for null", () => {
    expect(formatMs(null)).toBe("—");
  });

  it("formats milliseconds", () => {
    expect(formatMs(500)).toBe("500ms");
    expect(formatMs(0)).toBe("0ms");
  });

  it("formats seconds for values >= 1000", () => {
    expect(formatMs(1000)).toBe("1.0s");
    expect(formatMs(2500)).toBe("2.5s");
  });
});

describe("truncateId", () => {
  it("returns first 8 characters", () => {
    expect(truncateId("abcdefgh-1234-5678")).toBe("abcdefgh");
  });

  it("handles short ids", () => {
    expect(truncateId("abc")).toBe("abc");
  });
});
