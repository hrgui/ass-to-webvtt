import { getVTTPositionFromParsedASSEventTextParsed } from "../getVTTPositionFromParsedASSEventTextParsed";
import { describe, expect, it, test } from "vitest";
import { createParsedASS } from "./helpers/createParsedASS";
import { createASSStyleMap } from "../createASSStyleMap";
import type { ParsedASSStyle } from "../..";

function createTestSuite(dialogue: string, styles: string) {
  const parsedASS = createParsedASS(dialogue, styles);
  const styleMap = createASSStyleMap(parsedASS);
  const dialogueEvent = parsedASS.events.dialogue[0];

  if (!dialogueEvent) {
    throw new Error(`createTestSuite: did not find any dialogue events`);
  }

  const currentStyle: Partial<ParsedASSStyle> | undefined = dialogueEvent?.Style
    ? styleMap[dialogueEvent?.Style]
    : {};
  const styleAlignment = currentStyle?.Alignment ? parseInt(currentStyle.Alignment, 10) : undefined;

  return { parsed: dialogueEvent?.Text.parsed!, styleAlignment };
}

describe("getVTTPositionFromParsedASSEventTextParsed", () => {
  it("should inherit the alignment from the style, which was position 2 => BOTTOM_CENTER", () => {
    const { parsed, styleAlignment } = createTestSuite(
      `Dialogue: 0,0:00:00.00,0:00:05.00,Default,,0000,0000,0000,,This is a test of the ASS format and some basic features in it.`,
      `Style: Default,Arial,20,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,2,2,10,10,10,0`
    );
    expect(
      getVTTPositionFromParsedASSEventTextParsed(parsed, styleAlignment)
    ).toMatchInlineSnapshot(`"line:90% position:50% align:center"`);
  });

  it("should override due to the alignment, which was position 2 => BOTTOM_CENTER from Style but now uses {\\an1} = BOTTOM_LEFT", () => {
    const { parsed, styleAlignment } = createTestSuite(
      `Dialogue: 0,0:00:00.00,0:00:05.00,Default,,0000,0000,0000,,{\\an1}This is a test of the ASS format and some basic features in it.`,
      `Style: Default,Arial,20,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,2,2,10,10,10,0`
    );
    expect(
      getVTTPositionFromParsedASSEventTextParsed(parsed, styleAlignment)
    ).toMatchInlineSnapshot(`"line:90% position:0% align:start"`);
  });

  it("should override due to the legacy alignment, which was position 2 => BOTTOM_CENTER from Style but now uses {\\a5} = TOP_LEFT", () => {
    const { parsed, styleAlignment } = createTestSuite(
      `Dialogue: 0,0:00:00.00,0:00:05.00,Default,,0000,0000,0000,,{\\a5}This is a test of the ASS format and some basic features in it.`,
      `Style: Default,Arial,20,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,2,2,10,10,10,0`
    );
    expect(
      getVTTPositionFromParsedASSEventTextParsed(parsed, styleAlignment)
    ).toMatchInlineSnapshot(`"line:10% position:0% align:start"`);
  });
});
