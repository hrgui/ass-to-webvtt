import {
  parse,
  type ParsedASS,
  type ParsedASSEvent,
  type ParsedASSEventTextParsed,
  type ParsedASSStyles,
} from "ass-compiler";
import EventEmitter from "node:events";
import { readFile, writeFile } from "node:fs/promises";

const events = new EventEmitter();

export type ParsedASSStyle = ParsedASSStyles["style"][0];

export type FileOutputEvent<T> = {
  data: T;
  filename: string;
};

events.addListener("OutputASS", async (x: FileOutputEvent<ParsedASS>) => {
  await writeFile(x.filename, JSON.stringify(x.data, null, 2), "utf-8");
  console.log("Written " + x.filename);
});

events.addListener("OutputVTT", async (x: FileOutputEvent<string>) => {
  await writeFile(x.filename, x.data, "utf-8");
  console.log("Written " + x.filename);
});

async function convertToParsedAssJson(file: string): Promise<ParsedASS> {
  const rawAss = await readFile(file, "utf-8");
  return parse(rawAss);
}

function parsedAssToVtt(parsedAss: ParsedASS) {
  if (parsedAss.events.format.length === 0) {
    throw new Error("Invalid ASS file - missing events format");
  }

  // Read the generated JSON and convert to WebVTT
  const assJson = parsedAss;
  const dialogues = assJson.events.dialogue;

  // Build a style lookup map
  const styleMap: Record<string, ParsedASSStyle> = {};
  for (const style of assJson.styles.style) {
    styleMap[style.Name] = style;
  }

  // Track omitted lines
  const omittedLines: { start: number; end: number; reason: string; raw: string }[] = [];

  const cues = dialogues
    .map((d: ParsedASSEvent) => {
      const start = secondsToVttTime(d.Start);
      const end = secondsToVttTime(d.End);
      const parsed = d.Text?.parsed || [];
      const style: Partial<ParsedASSStyle> = styleMap[d.Style] || {};
      const styleAlignment = style.Alignment ? parseInt(style.Alignment, 10) : undefined;
      const vttPos = getVttPositionSettingsFromParsed(parsed, styleAlignment);
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
          return `${start} --> ${end}${vttPos}\n${plain}`;
        }
        return null;
      }
      const text = assParsedToVttText(parsed);
      return `${start} --> ${end}${vttPos}\n${text}`;
    })
    .filter(Boolean);

  const vtt = `WEBVTT\n\n${cues.join("\n\n")}`;

  if (omittedLines.length > 0) {
    console.warn("OMITTED LINES (not supported in WebVTT):");
    omittedLines.forEach((l) => {
      console.warn(
        `Start: ${secondsToVttTime(l.start)}, End: ${secondsToVttTime(l.end)}, Reason: ${
          l.reason
        }, Raw: ${l.raw}`
      );
    });
  }

  return vtt;
}

async function main() {
  const fileName = process.argv[2];

  if (!fileName) {
    console.error("Please provide a file name as an argument.");
    return;
  }

  const outputFileName = fileName.split(".").slice(0, -1).join(".");

  const parsedAss = await convertToParsedAssJson(fileName);
  events.emit("OutputASS", { data: parsedAss, filename: `${outputFileName}.json` });

  const vttString = parsedAssToVtt(parsedAss);
  events.emit("OutputVTT", { data: vttString, filename: `${outputFileName}.vtt` });
}

function secondsToVttTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds - Math.floor(seconds)) * 1000);
  return (
    String(h).padStart(2, "0") +
    ":" +
    String(m).padStart(2, "0") +
    ":" +
    String(s).padStart(2, "0") +
    "." +
    String(ms).padStart(3, "0")
  );
}

// Use parsed property for alignment and text formatting
function getVttPositionSettingsFromParsed(
  parsed: ParsedASSEventTextParsed[],
  styleAlignment?: number
): string {
  let align: "start" | "center" | "end" = "center";
  let line: string | undefined = undefined;
  let position: string | undefined = undefined;
  let an: number | undefined = undefined;
  // Check all parsed segments for alignment tags, use the last one found
  for (const seg of parsed) {
    if (seg.tags) {
      for (const tag of seg.tags) {
        if (tag.an) an = tag.an;
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
  if (an) {
    switch (an) {
      case 1:
        align = "start";
        line = "90%";
        position = "0%";
        break;
      case 2:
        align = "center";
        line = "90%";
        position = "50%";
        break;
      case 3:
        align = "end";
        line = "90%";
        position = "100%";
        break;
      case 4:
        align = "start";
        line = "50%";
        position = "0%";
        break;
      case 5:
        align = "center";
        line = "50%";
        position = "50%";
        break;
      case 6:
        align = "end";
        line = "50%";
        position = "100%";
        break;
      case 7:
        align = "start";
        line = "10%";
        position = "0%";
        break;
      case 8:
        align = "center";
        line = "10%";
        position = "50%";
        break;
      case 9:
        align = "end";
        line = "10%";
        position = "100%";
        break;
    }
  }
  let settings = [];
  if (line) settings.push(`line:${line}`);
  if (position) settings.push(`position:${position}`);
  if (align) settings.push(`align:${align}`);
  return settings.length ? " " + settings.join(" ") : "";
}

function assParsedToVttText(parsed: ParsedASSEventTextParsed[]): string {
  // Only allow <b>, <i>, <u> tags
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

main();
