const cheerio = require("cheerio");
function parseMovies(html) {
  const $ = cheerio.load(html);
  const movies = [];
  $(".item").each((_, element) => {
    const title = $(element).find(".title").first().text().trim();
    const rating = $(element).find(".rating_num").text().trim();
    const quote = $(element).find(".inq").text().trim();
    movies.push({ 电影名: title, 评分: rating, 短评: quote || "无" });
  });
  return movies;
}
module.exports = { parseMovies };
