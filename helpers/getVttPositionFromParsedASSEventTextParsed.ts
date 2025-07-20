import type { ParsedASSEventTextParsed } from "ass-compiler";

/**
 * Line alignment
 *
 * \an<pos>
 * Specify the alignment of the line. The alignment specifies the position of the line when no position override or movement is in effect, and otherwise specifies the anchor point of positioning and rotation.
 * The \an tag uses "numpad" values for the pos, ie. the alignment values correspond to the positions of the digits on the numeric keypad on a regular keyboard:
 */
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

/**
 * Line alignment (legacy)
 *
 * \a<pos>
 *
 * Specify the alignment of the line using legacy alignment codes from SubStation Alpha. This tag is supported but considered deprecated; you should usually use \an in new scripts instead, as it is more intuitive.
 *
 * The exception is that \a6 should be used for lazy sign translating, because if you're going to be lazy you should do it right and save the extra character.
 *
 * Calculate pos as follows: Use 1 for left-alignment, 2 for center alignment and 3 for right-alignment. If you want sub-titles you're done. To get top-titles, add 4 to the number, to get mid-titles add 8 to the number:
 */
enum LegacyAssAlignment {
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

const legacyToAnMapping: Record<LegacyAssAlignment, AssAlignment> = {
  [LegacyAssAlignment.BOTTOM_LEFT]: AssAlignment.BOTTOM_LEFT,
  [LegacyAssAlignment.BOTTOM_CENTER]: AssAlignment.BOTTOM_CENTER,
  [LegacyAssAlignment.BOTTOM_RIGHT]: AssAlignment.BOTTOM_RIGHT,
  [LegacyAssAlignment.TOP_LEFT]: AssAlignment.TOP_LEFT,
  [LegacyAssAlignment.TOP_CENTER]: AssAlignment.TOP_CENTER,
  [LegacyAssAlignment.TOP_RIGHT]: AssAlignment.TOP_RIGHT,
  [LegacyAssAlignment.MIDDLE_LEFT]: AssAlignment.MIDDLE_LEFT,
  [LegacyAssAlignment.MIDDLE_CENTER]: AssAlignment.MIDDLE_CENTER,
  [LegacyAssAlignment.MIDDLE_RIGHT]: AssAlignment.MIDDLE_RIGHT,
};

// Use parsed property for alignment and text formatting
export function getVTTPositionFromParsedASSEventTextParsed(
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
          an = legacyToAnMapping[tag.a as LegacyAssAlignment];
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

  return settings.length ? settings.join(" ") : "";
}
