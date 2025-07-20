import { parse } from "ass-compiler";
import { readFileSync } from "node:fs";

export const sampleParsedASS = parse(readFileSync("./sample.ass", "utf-8"));
