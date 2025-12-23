const { crawlAll } = require("./crawler");
const { writeResults } = require("./output");
function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const [k, v] = a.split("=");
      const key = k.replace(/^--/, "");
      args[key] = v === undefined ? true : v;
    }
  }
  return args;
}
function showHelp() {
  const text = [
    "Usage: node src/index.js [--output=path] [--format=json|csv] [--concurrency=n] [--retries=n] [--delay=ms] [--rate-delay=ms] [--timeout=ms] [--dry-run]",
  ].join("\n");
  console.log(text);
}
async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    showHelp();
    process.exit(0);
  }
  const options = {
    concurrency: args.concurrency ? Number(args.concurrency) : 3,
    retries: args.retries ? Number(args.retries) : 3,
    delayMs: args.delay ? Number(args.delay) : 500,
    rateDelayMs: args["rate-delay"] ? Number(args["rate-delay"]) : 300,
    timeout: args.timeout ? Number(args.timeout) : 15000,
  };
  const rows = await crawlAll(options);
  if (args["dry-run"]) {
    console.log(rows.slice(0, 10));
    return;
  }
  const outputPath = writeResults(rows, {
    format: args.format === "csv" ? "csv" : "json",
    outputPath: args.output,
  });
  console.log(outputPath);
}
main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
