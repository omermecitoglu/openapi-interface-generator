import yargs from "yargs";

const argv = yargs
  .option("source", {
    alias: "s",
    describe: "Specify the source URL (swagger.json)",
    type: "string",
    demandOption: false,
  })
  .option("output", {
    alias: "o",
    describe: "Specify the output directory",
    type: "string",
    demandOption: false,
  })
  .option("framework", {
    alias: "f",
    describe: "Specify the target framework",
    type: "string",
    demandOption: false,
  })
  .argv;

export default async function getArgument(name: string) {
  const a = argv instanceof Promise ? await argv : argv;
  return a[name] as string | undefined;
}
