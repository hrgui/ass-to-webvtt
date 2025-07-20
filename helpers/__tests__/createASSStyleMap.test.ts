import { expect, it } from "vitest";
import { createParsedASS } from "./helpers/createParsedASS";
import { createASSStyleMap } from "../createASSStyleMap";

it("Given a ParsedASS, Should create a style map", () => {
  const parsedASS = createParsedASS(
    `Dialogue: 0,0:00:00.00,0:00:05.00,Default,,0000,0000,0000,,This is a test of the ASS format and some basic features in it.`,
    `Style: Default,Arial,20,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,2,2,10,10,10,0`
  );

  const styleMap = createASSStyleMap(parsedASS);
  expect(styleMap).toMatchInlineSnapshot(`
    {
      "Default": {
        "Alignment": "2",
        "Angle": "0",
        "BackColour": "&H00000000",
        "Bold": "0",
        "BorderStyle": "1",
        "Encoding": "0",
        "Fontname": "Arial",
        "Fontsize": "20",
        "Italic": "0",
        "MarginL": "10",
        "MarginR": "10",
        "MarginV": "10",
        "Name": "Default",
        "Outline": "2",
        "OutlineColour": "&H00000000",
        "PrimaryColour": "&H00FFFFFF",
        "ScaleX": "100",
        "ScaleY": "100",
        "SecondaryColour": "&H000000FF",
        "Shadow": "2",
        "Spacing": "0",
        "StrikeOut": "0",
        "Underline": "0",
      },
    }
  `);
});
