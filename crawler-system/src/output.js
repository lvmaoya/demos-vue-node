const fs = require("fs");
const path = require("path");
function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}
function toCSV(rows) {
  const header = ["电影名", "评分", "短评"];
  const lines = [header.join(",")].concat(
    rows.map((r) =>
      [r["电影名"], r["评分"], (r["短评"] || "").replace(/\r?\n/g, " ")].join(",")
    )
  );
  return lines.join("\n");
}
function writeResults(rows, options) {
  const format = options.format ?? "json";
  const outputPath = options.outputPath ?? path.join(process.cwd(), "outputs", "douban-top250." + format);
  ensureDir(path.dirname(outputPath));
  if (format === "csv") {
    const csv = toCSV(rows);
    fs.writeFileSync(outputPath, csv, "utf8");
    return outputPath;
  }
  fs.writeFileSync(outputPath, JSON.stringify(rows, null, 2), "utf8");
  return outputPath;
}
module.exports = { writeResults };
