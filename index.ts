import { parse } from "ass-compiler";
import { readFile, writeFile } from "node:fs/promises";

const rawAss = await readFile("./sample.ass", "utf-8");
const parsedAss = parse(rawAss);
await writeFile("./sample.json", JSON.stringify(parsedAss), "utf-8");

// Read the generated JSON and convert to WebVTT
const assJson = JSON.parse(await readFile("./sample.json", "utf-8"));
const dialogues = assJson.events.dialogue;

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

// Improved ASS to VTT HTML converter with proper tag closing and only allowed tags
function assToVttHtml(assRaw: string): string {
  // Replace ASS line breaks with real newlines for VTT
  let out = assRaw
    .replace(/\\N/g, "\n")
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/\\n/g, "");

  // Parse override tags
  // We'll use a stack to manage open tags
  const tagMap: Record<string, string> = { b: "b", i: "i", u: "u" }; // Only allowed tags
  let result = "";
  let tagStack: string[] = [];
  let i = 0;
  while (i < out.length) {
    if (out[i] === "{" && out[i + 1] === "\\") {
      // Find end of tag
      const end = out.indexOf("}", i);
      if (end === -1) break;
      const tagContent = out.slice(i + 2, end);
      // Handle resets
      if (/^r/.test(tagContent)) {
        // Close all open tags
        while (tagStack.length) {
          result += `</${tagStack.pop()}>`;
        }
      } else {
        // Handle style tags
        const match = tagContent.match(/([bius])([01])/);
        if (match) {
          const tag = match[1] as keyof typeof tagMap;
          const on = match[2];
          // Only handle allowed tags (b, i, u)
          if (tagMap.hasOwnProperty(tag)) {
            if (on === "1") {
              const htmlTag = tagMap[tag];
              if (htmlTag) {
                result += `<${htmlTag}>`;
                tagStack.push(htmlTag);
              }
            } else if (on === "0") {
              const htmlTag = tagMap[tag];
              if (htmlTag) {
                // Close the last matching tag
                for (let j = tagStack.length - 1; j >= 0; j--) {
                  if (tagStack[j] === htmlTag) {
                    result += `</${htmlTag}>`;
                    tagStack.splice(j, 1);
                    break;
                  }
                }
              }
            }
          }
        }
      }
      i = end + 1;
    } else {
      result += out[i];
      i++;
    }
  }
  // Close any remaining open tags
  while (tagStack.length) {
    result += `</${tagStack.pop()}>`;
  }
  // Remove any unsupported tags (like <s>, <span>, etc.)
  result = result.replace(/<\/?s>/g, "");
  result = result.replace(/<\/?span.*?>/g, "");
  // Remove any <br> that may have slipped through
  result = result.replace(/<br\s*\/?\s*>/gi, "\n");
  return result;
}

// Map ASS alignment (\an or style Alignment) to WebVTT line/position/align settings
function getVttPositionSettings(raw: string, styleAlignment?: number): string {
  // Default: bottom center
  let align: "start" | "center" | "end" = "center";
  let line: string | undefined = undefined;
  let position: string | undefined = undefined;
  // Look for \anN override
  let an: number | undefined = undefined;
  const anMatch = raw.match(/\\an(\d)/);
  if (anMatch && anMatch[1]) {
    an = parseInt(anMatch[1], 10);
  } else if (styleAlignment) {
    // Map ASS Alignment (1-9) to \anN
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

// Build a style lookup map
const styleMap: Record<string, any> = {};
for (const style of assJson.styles.style) {
  styleMap[style.Name] = style;
}

// Track omitted lines
const omittedLines: { start: number; end: number; reason: string; raw: string }[] = [];

const cues = dialogues
  .map((d: any) => {
    const start = secondsToVttTime(d.Start);
    const end = secondsToVttTime(d.End);
    const raw = d.Text?.raw || d.Text?.combined || "";
    const style = styleMap[d.Style] || {};
    const styleAlignment = style.Alignment ? parseInt(style.Alignment, 10) : undefined;
    const vttPos = getVttPositionSettings(raw, styleAlignment);
    // Omit if unsupported ASS features are present
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
      let plain = raw
        .replace(/\{[^}]*\}/g, "") // remove all override tags
        .replace(/<br\s*\/?\s*>/gi, "\n") // replace <br> with newlines
        .replace(/\\N/g, "\n") // keep line breaks as newlines
        .replace(/\\n/g, "") // remove soft line breaks
        .replace(/m [^\\]+/, "") // remove drawing commands
        .trim();
      if (plain) {
        return `${start} --> ${end}${vttPos}\n${plain}`;
      }
      return null;
    }
    const text = assToVttHtml(raw);
    return `${start} --> ${end}${vttPos}\n${text}`;
  })
  .filter(Boolean);

const vtt = `WEBVTT\n\n${cues.join("\n\n")}`;
await writeFile("./output.vtt", vtt, "utf-8");

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
