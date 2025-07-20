import { describe, it, expect } from "vitest";
import { parsedASSEventTextParsedToVTTText } from "../parsedASSEventTextParsedToVTTText";
import { createParsedASS } from "./helpers/createParsedASS";

describe("parsedASSEventTextParsedToVTTText", () => {
  it("converts parsed ASS to VTT text with formatting", () => {
    const parsedAss = createParsedASS(
      `Dialogue: 0,0:00:40.00,0:00:42.00,Default,,0000,0000,0000,,Some other basic font style tests:\\N Normal, {\\b1}Boldface{\\r}, {\\i1}Italics{\\r}, {\\u1}Underline{\\r}, {\\s1}Strikethrough`,
      `Style: Default,Arial,20,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,2,2,10,10,10,0`
    );

    const vtt = parsedASSEventTextParsedToVTTText(parsedAss.events.dialogue[0]?.Text.parsed!);
    expect(vtt).toMatchInlineSnapshot(
      `
      "Some other basic font style tests:
       Normal, <b>Boldface</b>, <i>Italics</i>, <u>Underline</u>, Strikethrough"
    `
    );
  });

  it("handles line breaks", () => {
    const parsedAss = createParsedASS(
      `Dialogue: 0,0:00:40.00,0:00:42.00,Default,,0000,0000,0000,,Line1\\NLine2`,
      `Style: Default,Arial,20,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,2,2,10,10,10,0`
    );
    const vtt = parsedASSEventTextParsedToVTTText(parsedAss.events.dialogue[0]?.Text.parsed!);
    expect(vtt).toMatchInlineSnapshot(`
      "Line1
      Line2"
    `);
  });

  it("returns empty string for an embedded image", () => {
    const parsedAss = createParsedASS(
      `Dialogue: 0,0:00:38.00,0:00:40.00,Default,,0000,0000,0000,,{\\an5\\bord1\\shad0\\p1\\fscx300\\fscy300\\pos(316,312)}m 0 0 b 33 -3 48 -7 61 -19 b 53 -7 31 -1 1 2 m 9 0 b 9 -5 10 -6 14 -12 b 9 -5 10 -3 10 0 m 10 -1 b 10 -5 11 -8 16 -12 b 17 -12 18 -13 22 -14 b 18 -10 16 -6 15 -1 b 17 -6 19 -10 23 -14 l 26 -15 b 22 -11 20 -6 19 -2 b 24 -11 27 -14 28 -15 b 31 -16 35 -16 39 -16 b 37 -14 36 -10 36 -5 b 36 -9 38 -14 39 -16 b 41 -16 43 -16 45 -15 b 44 -13 43 -10 43 -7 l 29 -3 m 43 -7 b 44 -11 45 -13 47 -15 b 46 -13 46 -11 46 -9 b 46 -11 47 -13 49 -15 b 51 -15 48 -13 48 -9 b 49 -11 49 -14 52 -16 b 55 -16 53 -17 51 -11 l 48 -8 m 54 -13 b 53 -14 54 -15 54 -16 b 54 -15 54 -14 55 -13 b 57 -13 60 -12 62 -14 b 61 -12 55 -12 53 -12 b 55 -11 56 -10 61 -10 b 61 -7 53 -9 52 -11 b 53 -8 55 -7 58 -6 b 57 -5 56 -4 54 -3 b 49 -5 48 -6 47 -9 b 47 -6 50 -4 53 -2 b 49 -3 47 -6 45 -8 b 46 -6 49 -3 52 -1 b 46 2 45 3 43 3 b 40 0 39 -3 40 -6 b 39 -3 39 1 42 3 b 40 6 36 1 34 -4 b 35 -1 36 2 38 5 b 32 7 26 9 22 8 b 19 5 17 2 16 -1 b 17 3 19 5 20 7 b 17 4 16 2 15 0 b 15 2 17 5 19 8 b 15 9 13 3 12 0 l 25 -2 l 42 -7 m 12 0 b 13 3 13 7 17 9 b 12 7 10 1 10 0`,
      `Style: Default,Arial,20,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,2,2,10,10,10,0`
    );
    const vtt = parsedASSEventTextParsedToVTTText(parsedAss.events.dialogue[0]?.Text.parsed!);
    expect(vtt).toMatchInlineSnapshot(`""`);
  });
});
