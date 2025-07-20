import { describe, it, expect } from "vitest";
import { secondsToHHMMSS } from "../secondsToHHMMSS";

describe("secondsToHHMMSS", () => {
  it("formats seconds as HH:MM:SS.MMM", () => {
    expect(secondsToHHMMSS(3661.5)).toBe("01:01:01.500");
    expect(secondsToHHMMSS(0)).toBe("00:00:00.000");
  });
});
