import { eventEmitter } from "../events";
import { LogEvents } from "./logger";

export function setupLogWriterEventListeners() {
  eventEmitter.addListener(LogEvents.log, (args) => {
    console.log(...args);
  });

  eventEmitter.addListener(LogEvents.info, (args) => {
    console.info(...args);
  });

  eventEmitter.addListener(LogEvents.warn, (args) => {
    console.warn(...args);
  });

  eventEmitter.addListener(LogEvents.error, (args) => {
    console.error(...args);
  });

  eventEmitter.addListener(LogEvents.debug, (args) => {
    console.debug(...args);
  });
}
