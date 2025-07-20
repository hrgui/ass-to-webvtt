import type { ParsedASS, ParsedASSEvent } from "ass-compiler";
import type { ParsedASSStyle } from "./executable";
import { secondsToHHMMSS } from "./secondsToHHMMSS";
import { getVTTPositionFromParsedASSEventTextParsed } from "./getVTTPositionFromParsedASSEventTextParsed";
import { parsedASSEventTextParsedToVTTText } from "./parsedASSEventTextParsedToVTTText";
import { createASSStyleMap } from "./createASSStyleMap";

export function parsedASStoVTT(parsedASS: ParsedASS) {
  if (parsedASS.events.format.length === 0) {
    throw new Error("Invalid ASS file - missing events format");
  }

  // Read the generated JSON and convert to WebVTT
  const dialogues = parsedASS.events.dialogue;

  // Build a style lookup map
  const styleMap = createASSStyleMap(parsedASS);

  // Track omitted lines
  const omittedLines: { start: number; end: number; reason: string; raw: string }[] = [];

  const cues = dialogues
    .map((d: ParsedASSEvent) => {
      const start = secondsToHHMMSS(d.Start);
      const end = secondsToHHMMSS(d.End);
      const parsed = d.Text?.parsed || [];
      const style: Partial<ParsedASSStyle> = styleMap[d.Style] || {};
      const styleAlignment = style.Alignment ? parseInt(style.Alignment, 10) : undefined;
      const vttPos = getVTTPositionFromParsedASSEventTextParsed(parsed, styleAlignment);
      // Omit if unsupported ASS features are present in any parsed segment
      const raw = d.Text?.raw || d.Text?.combined || "";
      if (
        /\\p[1-9]/.test(raw) ||
        /\\clip/.test(raw) ||
        /\\move/.test(raw) ||
        /\\pos/.test(raw) ||
        /\\org/.test(raw) ||
        /\\fad/.test(raw) ||
        /\\fade/.test(raw) ||
        /\\t\(/.test(raw) ||
        /\\be/.test(raw) ||
        /\\blur/.test(raw) ||
        /\\shad[1-9]/.test(raw) ||
        /\\bord[1-9]/.test(raw) ||
        /\\frx/.test(raw) ||
        /\\fry/.test(raw) ||
        /\\frz/.test(raw) ||
        /\\fax/.test(raw) ||
        /\\fay/.test(raw) ||
        /\\xbord/.test(raw) ||
        /\\ybord/.test(raw) ||
        /\\xshad/.test(raw) ||
        /\\yshad/.test(raw)
      ) {
        omittedLines.push({ start: d.Start, end: d.End, reason: "unsupported ASS feature", raw });
        // Try to keep the plain text (strip all override tags and drawing commands)
        let plain = parsed
          .map((seg) => seg.text || "")
          .join("")
          .replace(/\\N/g, "\n")
          .trim();
        if (plain) {
          return `${start} --> ${end} ${vttPos}\n${plain}`;
        }
        return null;
      }
      const text = parsedASSEventTextParsedToVTTText(parsed);
      return `${start} --> ${end} ${vttPos}\n${text}`;
    })
    .filter(Boolean);

  const vtt = `WEBVTT\n\n${cues.join("\n\n")}`;

  if (omittedLines.length > 0) {
    console.warn("OMITTED LINES (not supported in WebVTT):");
    omittedLines.forEach((l) => {
      console.warn(
        `Start: ${secondsToHHMMSS(l.start)}, End: ${secondsToHHMMSS(l.end)}, Reason: ${
          l.reason
        }, Raw: ${l.raw}`
      );
    });
  }

  return vtt;
}
