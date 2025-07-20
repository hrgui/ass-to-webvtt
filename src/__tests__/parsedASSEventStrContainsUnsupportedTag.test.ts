import { describe, expect, it } from "vitest";
import { parsedASSEventStrContainsUnsupportedTag } from "../parsedASSEventStrContainsUnsupportedTag";

describe("parsedASSEventStrContainsUnsupportedTag", () => {
  it("should return true for this string containing unsupported tags", () => {
    expect(
      parsedASSEventStrContainsUnsupportedTag(
        `Dialogue: 0,0:00:26.00,0:00:28.00,Default,,0000,0000,0000,,{\\an5\\pos(222,338)\\frz29.559}So should this one, and be rotated`
      )
    ).toEqual(true);
  });
  it("returns true for \\p1", () => {
    expect(parsedASSEventStrContainsUnsupportedTag("{\\p1}drawing")).toBe(true);
  });
  it("returns true for \\clip", () => {
    expect(parsedASSEventStrContainsUnsupportedTag("{\\clip(1,2,3,4)}foo")).toBe(true);
  });
  it("returns true for \\move", () => {
    expect(parsedASSEventStrContainsUnsupportedTag("{\\move(1,2,3,4)}foo")).toBe(true);
  });
  it("returns true for \\pos", () => {
    expect(parsedASSEventStrContainsUnsupportedTag("{\\pos(1,2)}foo")).toBe(true);
  });
  it("returns true for \\org", () => {
    expect(parsedASSEventStrContainsUnsupportedTag("{\\org(1,2)}foo")).toBe(true);
  });
  it("returns true for \\fad", () => {
    expect(parsedASSEventStrContainsUnsupportedTag("{\\fad(1,2)}foo")).toBe(true);
  });
  it("returns true for \\fade", () => {
    expect(parsedASSEventStrContainsUnsupportedTag("{\\fade(1,2,3,4,5,6,7,8,9,10)}foo")).toBe(true);
  });
  it("returns true for \\t()", () => {
    expect(parsedASSEventStrContainsUnsupportedTag("{\\t()}foo")).toBe(true);
  });
  it("returns true for \\be", () => {
    expect(parsedASSEventStrContainsUnsupportedTag("{\\be1}foo")).toBe(true);
  });
  it("returns true for \\blur", () => {
    expect(parsedASSEventStrContainsUnsupportedTag("{\\blur1}foo")).toBe(true);
  });
  it("returns true for \\shad", () => {
    expect(parsedASSEventStrContainsUnsupportedTag("{\\shad1}foo")).toBe(true);
  });
  it("returns true for \\bord", () => {
    expect(parsedASSEventStrContainsUnsupportedTag("{\\bord1}foo")).toBe(true);
  });
  it("returns true for \\frx", () => {
    expect(parsedASSEventStrContainsUnsupportedTag("{\\frx1}foo")).toBe(true);
  });
  it("returns true for \\fry", () => {
    expect(parsedASSEventStrContainsUnsupportedTag("{\\fry1}foo")).toBe(true);
  });
  it("returns true for \\frz", () => {
    expect(parsedASSEventStrContainsUnsupportedTag("{\\frz1}foo")).toBe(true);
  });
  it("returns true for \\fax", () => {
    expect(parsedASSEventStrContainsUnsupportedTag("{\\fax1}foo")).toBe(true);
  });
  it("returns true for \\fay", () => {
    expect(parsedASSEventStrContainsUnsupportedTag("{\\fay1}foo")).toBe(true);
  });
  it("returns true for \\xbord", () => {
    expect(parsedASSEventStrContainsUnsupportedTag("{\\xbord1}foo")).toBe(true);
  });
  it("returns true for \\ybord", () => {
    expect(parsedASSEventStrContainsUnsupportedTag("{\\ybord1}foo")).toBe(true);
  });
  it("returns true for \\xshad", () => {
    expect(parsedASSEventStrContainsUnsupportedTag("{\\xshad1}foo")).toBe(true);
  });
  it("returns true for \\yshad", () => {
    expect(parsedASSEventStrContainsUnsupportedTag("{\\yshad1}foo")).toBe(true);
  });
  it("returns false for supported tags", () => {
    expect(parsedASSEventStrContainsUnsupportedTag("{\\b1}bold")).toBe(false);
    expect(parsedASSEventStrContainsUnsupportedTag("{\\i1}italic")).toBe(false);
    expect(parsedASSEventStrContainsUnsupportedTag("{\\u1}underline")).toBe(false);
    expect(parsedASSEventStrContainsUnsupportedTag("plain text")).toBe(false);
  });
});
