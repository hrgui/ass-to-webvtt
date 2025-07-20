import type { ParsedASSEventTextParsed } from "ass-compiler";
import { createLogger } from "./logger/logger";

const logger = createLogger("parsedASSEventTextParsedToVTTText");

export function parsedASSEventTextParsedToVTTText(parsed: ParsedASSEventTextParsed[]): string {
  // Only allow <b>, <i>, <u> tags since that's what is only is supported
  let out = "";
  for (const seg of parsed) {
    let segText = seg.text || "";
    // Replace \N with real newlines
    segText = segText.replace(/\\N/g, "\n");
    let openTags = "";
    let closeTags = "";
    if (seg.tags) {
      for (const tag of seg.tags) {
        let hasOperatedOnTag = false;

        // is done in getVTTPositionFromParsedASSEventTextParsed
        if (tag.an !== undefined || tag.a !== undefined) {
          hasOperatedOnTag = true;
        }

        if (tag.b === 1) {
          hasOperatedOnTag = true;
          openTags += "<b>";
          closeTags = "</b>" + closeTags;
        }
        if (tag.i === 1) {
          hasOperatedOnTag = true;
          openTags += "<i>";
          closeTags = "</i>" + closeTags;
        }
        if (tag.u === 1) {
          hasOperatedOnTag = true;
          openTags += "<u>";
          closeTags = "</u>" + closeTags;
        }

        if (!hasOperatedOnTag) {
          logger.debug(
            `[WARN] Unhandled tag in parsed text: ${JSON.stringify(seg.text)} ${JSON.stringify(
              tag
            )}`
          );
        }
      }
    }
    out += openTags + segText + closeTags;
  }
  return out;
}
