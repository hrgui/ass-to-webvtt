import type { ParsedASSEventTextParsed } from "ass-compiler";

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
        if (tag.b === 1) {
          openTags += "<b>";
          closeTags = "</b>" + closeTags;
        }
        if (tag.i === 1) {
          openTags += "<i>";
          closeTags = "</i>" + closeTags;
        }
        if (tag.u === 1) {
          openTags += "<u>";
          closeTags = "</u>" + closeTags;
        }
      }
    }
    out += openTags + segText + closeTags;
  }
  return out;
}
