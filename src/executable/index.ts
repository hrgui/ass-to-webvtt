import { parse, type ParsedASS, type ParsedASSStyles } from "ass-compiler";
import { readFile, writeFile } from "node:fs/promises";
import { parsedASStoVTT } from "../parsedASStoVTT";
import { setupFileWriterEventListeners } from "./fileWriters";
import { emitOutputParsedASSFileEvent } from "./emitOutputParsedASSFileEvent";
import { emitOutputVTTFileEvent } from "./emitOutputVTTFileEvent";
import { setupLogWriterEventListeners } from "../logger/logWriter";
import { createLogger } from "../logger/logger";

export type ParsedASSStyle = ParsedASSStyles["style"][0];

export type FileOutputEvent<T> = {
  data: T;
  filename: string;
};

async function convertToParsedAssJson(file: string): Promise<ParsedASS> {
  const rawAss = await readFile(file, "utf-8");
  return parse(rawAss);
}

async function main() {
  setupFileWriterEventListeners();
  setupLogWriterEventListeners();
  const fileName = process.argv[2];

  const logger = createLogger("Executable-Main");

  if (!fileName) {
    logger.error("Please provide a file name as an argument.");
    return;
  }

  const outputFileName = fileName.split(".").slice(0, -1).join(".");

  const parsedAss = await convertToParsedAssJson(fileName);
  emitOutputParsedASSFileEvent(parsedAss, outputFileName);

  const vttString = parsedASStoVTT(parsedAss);
  emitOutputVTTFileEvent(vttString, outputFileName);
}

main();
