const axios = require("axios");
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function getWithRetry(url, options) {
  const retries = options.retries ?? 3;
  const delayMs = options.delayMs ?? 500;
  const timeout = options.timeout ?? 15000;
  const headers = options.headers ?? {};
  let attempt = 0;
  while (attempt <= retries) {
    try {
      const res = await axios.get(url, { headers, timeout });
      return res.data;
    } catch (e) {
      if (attempt === retries) throw e;
      await sleep(delayMs * Math.pow(2, attempt));
      attempt += 1;
    }
  }
}
module.exports = { getWithRetry, sleep };
