import type { ParsedASSEventTextParsed } from "ass-compiler";

enum AssAlignment {
  BOTTOM_LEFT = 1,
  BOTTOM_CENTER = 2,
  BOTTOM_RIGHT = 3,
  MIDDLE_LEFT = 4,
  MIDDLE_CENTER = 5,
  MIDDLE_RIGHT = 6,
  TOP_LEFT = 7,
  TOP_CENTER = 8,
  TOP_RIGHT = 9,
}

enum AssLegacyAlignment {
  BOTTOM_LEFT = 1,
  BOTTOM_CENTER = 2,
  BOTTOM_RIGHT = 3,
  TOP_LEFT = 5,
  TOP_CENTER = 6,
  TOP_RIGHT = 7,
  MIDDLE_LEFT = 9,
  MIDDLE_CENTER = 10,
  MIDDLE_RIGHT = 11,
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
          const legacyToAn: Record<AssLegacyAlignment, AssAlignment> = {
            [AssLegacyAlignment.BOTTOM_LEFT]: AssAlignment.BOTTOM_LEFT,
            [AssLegacyAlignment.BOTTOM_CENTER]: AssAlignment.BOTTOM_CENTER,
            [AssLegacyAlignment.BOTTOM_RIGHT]: AssAlignment.BOTTOM_RIGHT,
            [AssLegacyAlignment.TOP_LEFT]: AssAlignment.TOP_LEFT,
            [AssLegacyAlignment.TOP_CENTER]: AssAlignment.TOP_CENTER,
            [AssLegacyAlignment.TOP_RIGHT]: AssAlignment.TOP_RIGHT,
            [AssLegacyAlignment.MIDDLE_LEFT]: AssAlignment.MIDDLE_LEFT,
            [AssLegacyAlignment.MIDDLE_CENTER]: AssAlignment.MIDDLE_CENTER,
            [AssLegacyAlignment.MIDDLE_RIGHT]: AssAlignment.MIDDLE_RIGHT,
          };
          an = legacyToAn[tag.a as AssLegacyAlignment];
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
    case AssAlignment.MIDDLE_LEFT:
      align = "start";
      line = 50;
      position = 0;
      break;
    case AssAlignment.MIDDLE_CENTER:
      align = "center";
      line = 50;
      position = 50;
      break;
    case AssAlignment.MIDDLE_RIGHT:
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
