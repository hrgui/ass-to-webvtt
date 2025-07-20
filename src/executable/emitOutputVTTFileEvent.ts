import type { ParsedASS } from "ass-compiler";
import { eventEmitter } from "../events";
import { FileOutputEvents, type FileOutputEventDetail } from "./fileWriters";

export function emitOutputVTTFileEvent(vtt: string, outputFileName: string) {
  const fileOutputEventDetail: FileOutputEventDetail<string> = {
    data: vtt,
    filename: `${outputFileName}.vtt`,
  };
  return eventEmitter.emit(FileOutputEvents.OutputVTTFile, fileOutputEventDetail);
}
