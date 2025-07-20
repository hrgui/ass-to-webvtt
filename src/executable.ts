import { parse, type ParsedASS, type ParsedASSStyles } from "ass-compiler";
import EventEmitter from "node:events";
import { readFile, writeFile } from "node:fs/promises";
import { parsedASStoVTT } from "./parsedASStoVTT";

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

async function main() {
  const fileName = process.argv[2];

  if (!fileName) {
    console.error("Please provide a file name as an argument.");
    return;
  }

  const outputFileName = fileName.split(".").slice(0, -1).join(".");

  const parsedAss = await convertToParsedAssJson(fileName);
  events.emit("OutputASS", { data: parsedAss, filename: `${outputFileName}.json` });

  const vttString = parsedASStoVTT(parsedAss);
  events.emit("OutputVTT", { data: vttString, filename: `${outputFileName}.vtt` });
}

main();
