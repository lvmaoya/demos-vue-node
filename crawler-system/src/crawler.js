const { getWithRetry, sleep } = require("./request");
const { parseMovies } = require("./parser");
const { BASE_URL, HEADERS, PAGE_SIZE } = require("./config");
async function crawlPage(start, options) {
  const url = `${BASE_URL}?start=${start}`;
  const html = await getWithRetry(url, {
    headers: HEADERS,
    retries: options.retries,
    delayMs: options.delayMs,
    timeout: options.timeout,
  });
  return parseMovies(html);
}
async function crawlAll(options = {}) {
  const pages = Array.from({ length: 10 }, (_, i) => i * PAGE_SIZE);
  const concurrency = options.concurrency ?? 3;
  const results = [];
  let index = 0;
  async function worker() {
    while (index < pages.length) {
      const myIndex = index;
      index += 1;
      const start = pages[myIndex];
      const pageMovies = await crawlPage(start, options);
      results.push(...pageMovies);
      if (options.rateDelayMs) await sleep(options.rateDelayMs);
    }
  }
  const pool = Array.from({ length: concurrency }, () => worker());
  await Promise.all(pool);
  return results.slice(0, 250);
}
module.exports = { crawlAll, crawlPage };
