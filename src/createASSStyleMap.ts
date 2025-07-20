import type { ParsedASS } from "ass-compiler";
import type { ParsedASSStyle } from "./executable";

export function createASSStyleMap(assJson: ParsedASS): Record<string, ParsedASSStyle> {
  const styleMap: Record<string, ParsedASSStyle> = {};
  for (const style of assJson.styles.style) {
    styleMap[style.Name] = style;
  }

  return styleMap;
}
