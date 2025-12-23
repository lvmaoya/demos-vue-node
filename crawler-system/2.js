const axios = require('axios');
const cheerio = require('cheerio');

async function crawlWeather(city = '北京') {
    const url = `https://tianqi.so.com/weather/${encodeURIComponent(city)}`;
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
    };

    try {
        const response = await axios.get(url, { headers });
        const $ = cheerio.load(response.data);
        
        // 实际网站结构可能不同，这里使用示例选择器
        const weather = $('.nowtemp').text().trim() || 
                       $('.weather-now .temp').text().trim() ||
                       $('.temp').first().text().trim();
        
        console.log(`${city}当前天气: ${weather}`);
        return { city, weather };
    } catch (error) {
        console.error('获取天气失败:', error.message);
        return null;
    }
}
crawlWeather()