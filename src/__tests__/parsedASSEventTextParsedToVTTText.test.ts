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
});
