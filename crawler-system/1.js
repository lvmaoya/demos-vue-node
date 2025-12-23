const axios = require("axios");
const cheerio = require("cheerio");

async function crawlDoubanMovies() {
  const url = "https://movie.douban.com/top250";
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
  };

  try {
    const response = await axios.get(url, { headers });
    const $ = cheerio.load(response.data);
    const movies = [];

    $(".item").each((index, element) => {
      const title = $(element).find(".title").first().text().trim();
      const rating = $(element).find(".rating_num").text().trim();
      const quote = $(element).find(".inq").text().trim();

      movies.push({
        电影名: title,
        评分: rating,
        短评: quote || "无",
      });
    });

    console.log("豆瓣电影 Top250 爬取结果:");
    movies.forEach((movie, index) => {
      console.log(
        `${index + 1}. ${movie.电影名} - 评分: ${movie.评分} - ${movie.短评}`
      );
    });

    return movies;
  } catch (error) {
    console.error("爬取失败:", error.message);
    return [];
  }
}
crawlDoubanMovies()