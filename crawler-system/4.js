const axios = require('axios');
const cheerio = require('cheerio');

async function crawlNews(url) {
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
    };

    try {
        const response = await axios.get(url, { headers });
        const $ = cheerio.load(response.data);
        const newsList = [];

        $('.news-item').each((index, element) => {
            const title = $(element).find('.news-title').text().trim() ||
                         $(element).find('h2').text().trim();
            
            const time = $(element).find('.news-time').text().trim() ||
                        $(element).find('.time').text().trim();
            
            const content = $(element).find('.news-content').text().trim() ||
                           $(element).find('p').first().text().trim();

            if (title) {
                newsList.push({
                    新闻标题: title,
                    发布时间: time || '未知时间',
                    内容: content || '无内容'
                });
            }
        });

        console.log('新闻信息:');
        newsList.forEach((news, index) => {
            console.log(`${index + 1}. ${news.新闻标题}`);
            console.log(`   时间: ${news.发布时间}`);
            console.log(`   内容: ${news.内容.substring(0, 100)}...`);
        });

        return newsList;
    } catch (error) {
        console.error('爬取新闻失败:', error.message);
        return [];
    }
}
crawlNews()