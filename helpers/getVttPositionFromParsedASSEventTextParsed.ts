import type { ParsedASSEventTextParsed } from "ass-compiler";

enum AssAlignment {
  BOTTOM_LEFT = 1,
  BOTTOM_CENTER = 2,
  BOTTOM_RIGHT = 3,
  CENTER_LEFT = 4,
  CENTER_CENTER = 5,
  CENTER_RIGHT = 6,
  TOP_LEFT = 7,
  TOP_CENTER = 8,
  TOP_RIGHT = 9,
}

// Use parsed property for alignment and text formatting
export function getVttPositionFromParsedASSEventTextParsed(
  parsed: ParsedASSEventTextParsed[],
  styleAlignment?: number
): string {
  let align: "start" | "center" | "end" = "center";
  let line: number | undefined = undefined;
  let position: number | undefined = undefined;
  let an: number | undefined = undefined;
  // Check all parsed segments for alignment tags, use the last one found
  for (const seg of parsed) {
    if (seg.tags) {
      for (const tag of seg.tags) {
        if (tag.an) {
          an = tag.an;
        }
        if (tag.a) {
          const legacyToAn: Record<number, number> = {
            1: 1,
            2: 2,
            3: 3,
            5: 7,
            6: 8,
            7: 9,
            9: 4,
            10: 5,
            11: 6,
          };
          an = legacyToAn[tag.a];
        }
      }
    }
  }
  if (!an && styleAlignment) {
    an = styleAlignment;
  }

  switch (an) {
    case AssAlignment.BOTTOM_LEFT:
      align = "start";
      line = 90;
      position = 0;
      break;
    case AssAlignment.BOTTOM_CENTER:
      align = "center";
      line = 90;
      position = 50;
      break;
    case AssAlignment.BOTTOM_RIGHT:
      align = "end";
      line = 90;
      position = 100;
      break;
    case AssAlignment.CENTER_LEFT:
      align = "start";
      line = 50;
      position = 0;
      break;
    case AssAlignment.CENTER_CENTER:
      align = "center";
      line = 50;
      position = 50;
      break;
    case AssAlignment.CENTER_RIGHT:
      align = "end";
      line = 50;
      position = 100;
      break;
    case AssAlignment.TOP_LEFT:
      align = "start";
      line = 10;
      position = 0;
      break;
    case AssAlignment.TOP_CENTER:
      align = "center";
      line = 10;
      position = 50;
      break;
    case AssAlignment.TOP_RIGHT:
      align = "end";
      line = 10;
      position = 100;
      break;
  }

  const settings = [];
  if (line !== undefined && !isNaN(line)) {
    settings.push(`line:${line}%`);
  }
  if (position !== undefined && !isNaN(position)) {
    settings.push(`position:${position}%`);
  }
  if (align !== undefined) {
    settings.push(`align:${align}`);
  }

  return settings.length ? " " + settings.join(" ") : "";
}
