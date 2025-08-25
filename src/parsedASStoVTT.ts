import type { ParsedASS, ParsedASSEvent } from "ass-compiler";
import type { ParsedASSStyle } from "./executable";
import { secondsToHHMMSS } from "./secondsToHHMMSS";
import { getVTTPositionFromParsedASSEventTextParsed } from "./getVTTPositionFromParsedASSEventTextParsed";
import { parsedASSEventTextParsedToVTTText } from "./parsedASSEventTextParsedToVTTText";
import { createASSStyleMap } from "./createASSStyleMap";
import { createLogger } from "./logger/logger";
import { parsedASSEventStrContainsUnsupportedTag } from "./parsedASSEventStrContainsUnsupportedTag";

export interface ParsedASStoVTTOptions {
  type?: "subtitles" | "captions" | "metadata";
}

export function parsedASStoVTT(
  parsedASS: ParsedASS,
  options: ParsedASStoVTTOptions = { type: "subtitles" }
) {
  const logger = createLogger("parsedASStoVTT");

  if (parsedASS.events.format.length === 0) {
    throw new Error("[parsedASStoVTT]: Invalid ASS file - missing events format");
  }

  // Read the generated JSON and convert to WebVTT
  const dialogues = parsedASS.events.dialogue;

  // Build a style lookup map
  const styleMap = createASSStyleMap(parsedASS);

  // Track omitted lines
  const impactedLines: {
    start: number;
    end: number;
    raw: string;
    omitted: boolean;
  }[] = [];

  const cues = dialogues
    .map((d: ParsedASSEvent, index) => {
      const start = secondsToHHMMSS(d.Start);
      const end = secondsToHHMMSS(d.End);
      const parsed = d.Text?.parsed || [];
      const style: Partial<ParsedASSStyle> = styleMap[d.Style] || {};
      const styleAlignment = style.Alignment ? parseInt(style.Alignment, 10) : undefined;
      const vttPos = getVTTPositionFromParsedASSEventTextParsed(parsed, styleAlignment);
      // Omit if unsupported ASS features are present in any parsed segment
      const raw = d.Text?.raw || d.Text?.combined || "";
      const containsUnsupportedOverride = parsedASSEventStrContainsUnsupportedTag(raw);

      const text = parsedASSEventTextParsedToVTTText(parsed);
      if (!text) {
        // Omit if unsupported ASS features are present in any parsed segment
        impactedLines.push({
          start: d.Start,
          end: d.End,
          omitted: true,
          raw,
        });
        return null;
      } else if (containsUnsupportedOverride) {
        impactedLines.push({
          start: d.Start,
          end: d.End,
          omitted: false,
          raw,
        });
      }
      // Add isUnsupported to d for the comment
      const dWithFlag = { ...d, isUnsupported: containsUnsupportedOverride };
      return `
${index + 1}
${start} --> ${end} ${vttPos}
${
  containsUnsupportedOverride && options.type === "subtitles"
    ? " "
    : options.type === "metadata"
    ? JSON.stringify(dWithFlag)
    : text
}`;
    })
    .filter(Boolean);

  const vtt = `WEBVTT\n\n${cues.join("\n\n")}`;

  if (impactedLines.length > 0) {
    const omittedLines = impactedLines.filter((l) => l.omitted);
    if (omittedLines.length) {
      logger.warn("OMITTED LINES (nothing can be outputted, possibly this is an image):");
      omittedLines.forEach((l) => {
        logger.warn(
          `Start: ${secondsToHHMMSS(l.start)}, End: ${secondsToHHMMSS(l.end)}, Raw: ${l.raw}`
        );
      });
      logger.log("--------------------\n\n");
    }

    const otherLines = impactedLines.filter((l) => !l.omitted);

    logger.warn("OTHER LINES (text was preserved as much as possible):");
    otherLines.forEach((l) => {
      logger.warn(
        `Start: ${secondsToHHMMSS(l.start)}, End: ${secondsToHHMMSS(l.end)}, Raw: ${l.raw}`
      );
    });
  }

  return vtt;
}
