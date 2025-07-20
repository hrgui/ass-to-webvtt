import type { ParsedASS } from "ass-compiler";
import { eventEmitter } from "../events";
import { writeFile } from "node:fs/promises";
import { createLogger } from "../logger/logger";

export type FileOutputEventDetail<T> = {
  data: T;
  filename: string;
};

export enum FileOutputEvents {
  OutputParsedASSFile = "OutputParsedASSFile",
  OutputVTTFile = "OutputVTTFile",
}
const outputVTTFileLogger = createLogger(`FileWriter-${FileOutputEvents.OutputVTTFile}`);
const outputASSFileLogger = createLogger(`FileWriter-${FileOutputEvents.OutputParsedASSFile}`);

export function setupFileWriterEventListeners() {
  eventEmitter.addListener(
    FileOutputEvents.OutputParsedASSFile,
    async (x: FileOutputEventDetail<ParsedASS>) => {
      await writeFile(x.filename, JSON.stringify(x.data, null, 2), "utf-8");
      outputASSFileLogger.log("Written " + x.filename);
    }
  );

  eventEmitter.addListener(
    FileOutputEvents.OutputVTTFile,
    async (x: FileOutputEventDetail<string>) => {
      await writeFile(x.filename, x.data, "utf-8");
      outputVTTFileLogger.log("Written " + x.filename);
    }
  );
}
