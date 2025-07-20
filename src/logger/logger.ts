import { eventEmitter } from "../events";

export enum LogEvents {
  log = "log",
  info = "info",
  warn = "warn",
  error = "error",
  debug = "debug",
}

export function createLogger(name: string = "DefaultLogger") {
  function emit(event: LogEvents, ...args: any[]) {
    eventEmitter.emit(event, [`[${name}]:`, ...args]);
  }
  return {
    log: (...args: any[]) => emit(LogEvents.log, ...args),
    info: (...args: any[]) => emit(LogEvents.info, ...args),
    warn: (...args: any[]) => emit(LogEvents.warn, ...args),
    error: (...args: any[]) => emit(LogEvents.error, ...args),
    debug: (...args: any[]) => emit(LogEvents.debug, ...args),
  };
}
