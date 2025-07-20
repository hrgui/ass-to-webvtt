import type { ParsedASS } from "ass-compiler";
import { eventEmitter } from "../events";
import { FileOutputEvents, type FileOutputEventDetail } from "./fileWriters";

export function emitOutputParsedASSFileEvent(parsedASS: ParsedASS, outputFileName: string) {
  const fileOutputEventDetail: FileOutputEventDetail<ParsedASS> = {
    data: parsedASS,
    filename: `${outputFileName}.json`,
  };
  return eventEmitter.emit(FileOutputEvents.OutputParsedASSFile, fileOutputEventDetail);
}
