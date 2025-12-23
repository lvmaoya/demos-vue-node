const axios = require('axios');
const cheerio = require('cheerio');

async function crawlZhihuHot() {
    const url = 'https://www.zhihu.com/hot';
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
        'Cookie': '_zap=87417ad2-8c91-4768-8e88-084914b91d36; d_c0=27YTdTtgRRuPTrOb7iecN8r4Ixdm6MJcFuw=|1761292206; __snaker__id=aZr2AP3z7iaGpMdf; _xsrf=NXIqDE99wmSmelJXbngk9E6ZX7YOk1Lh; q_c1=889a9f230c6a4855bb0bb38f076e19c4|1762407345000|1762407345000; Hm_lvt_98beee57fd2ef70ccdd5ca52b9740c49=1763704787,1763966765,1764118845,1764894994; captcha_session_v2=2|1:0|10:1764894993|18:captcha_session_v2|88:N3RoLy9DWWpZTWlGdUJZcjFSanZMeHJ6cEpQR3BLRUdWR29kcGw2ZEU2SS9mVTlMS1hzNmQwNWtNSldUbkMyMg==|9ab62658fc44296e111d3ba90d5f92480c663249f6b8c8b6b15e90ec373f3a5c; gdxidpyhxdE=jOSKnColGLd%2BQ8Sq%2BOs3cPcaMKrALJGWX0NKeRNS0DttCG719g%2B2PLT%5CJHof0g2We8QtIC69htZzrlaCfe36uHQIcRSpL%2BQyT33knZyorx5dA%2F3i6Y%2Bl%5Cwn6awt%2FUJL%2Bw9xJ82Blj8EEG2z%2F%5Cmb08va13ckve9tvCjUXgbI%2FV%2FCzQ66I%3A1764895895067; captcha_ticket_v2=2|1:0|10:1764895064|17:captcha_ticket_v2|728:eyJ2YWxpZGF0ZSI6IkNOMzFfWTBaUXpkTVo0T2xJVkJTM0I4bVdZdGNoV0NuRERlQzBNVERCcVVKbFJPOXVzbnFlUFdkbWpLX1k2NlNoQjJkRnhxM1BMcE5pTEFNSVUzRGpSYW42MElzKlNvVGRUVTNHb2loLlppNmhuVWNWRTJhUzZWOFkwa1ZLblFSMFo2ZFhJa0JNR3NLNlBhMm4ud0VwVjUyeGVJOEdaVVBqdERqYjNCY0pKLnNkKmZzblR5XzBFWUdtV05wWHdIMHZLNEdkeUFmdjRlZ2dOTWY2d3BrVG5zc1VzMWVIQkNXMXRsSl8uNDZXR0liSDVYc2U2MDAubXJpb2hMaTU4TW5Vb2h2WEV5MVVMWGM0ZWJmREMxYVNBYWtER1JRckN3cjlRM1Z1VnZZT1daZDJRRkJaNTU2ZXZpT0Frd201V1hVa3FqODlxcHBDYmxkTlZmYkRZX2dfQ2NBTkd5RnV4VVBYbGwqUk54eVN2cWpVbVAwSDJPRjZVVFMyS09peksxOGJIaHk0bG95NXVCaGFFdzU1WHY0QzBpbmJaRUdzM0JTSk1NaElteVNqZEYzVW9LY1dzM21wM3ZSZmk2dmFiWW45VE5iS1ZDc2JKTTZqRFRRUnRDRHRUVEdSTWRDdUREaWJHRVR4WW5ucm5XT1J3RC4zTnB3d0lUOW8xai41ZXFRT3Z5dlNHX1Fndmc3N192X2lfMSJ9|2c743eeb5baf761658453b0c04d07ba40e45aad67de74134cac27dc054130cac; z_c0=2|1:0|10:1765264688|4:z_c0|92:Mi4xaXZkYlh3QUFBQURidGhOMU8yQkZHeVlBQUFCZ0FsVk5aM2NmYWdEbVNuUGRRN2xDRDZtTE9mMzRnU1E4WUc3RkJR|62e5a126d11534fc617a87788118a894b57f26b494f9a7ed8bfc1320035cc289; SESSIONID=POUhFgyQ4v974sNqCT4O2pKm8BL3xHws4AnnLghY29K; JOID=VVAdAkIhczXr2nj8HH3j7jIdcYYIfjxpi5IQhUQbCgzV5gW9bXV9foTbd_Ud3UviJwy2zAxWmFi4g0f5HpCA_RA=; osd=V18cB0gjfDTu0HrzHXjp7D0cdIwKcT1sgZAfhEERCAPU4w-_YnR4dIbUdvAX30TjIga0ww1Tklq3gkLzHJ-B-Bo=; BEC=244e292b1eefcef20c9b81b1d9777823; __zse_ck=004_fWgAx2k7a3cF6X/MV3MLwHvDmZMRqtUNQ8LkzOUIsQXu4JvTeze/xY/9OTGY0hkqBal9i8Z/lD=54se3CrIt68r/NZ4HyJfCmuyW=0HzGhHA5OUnGU1Hb5QDuLfSpoOk-Fin0sFeND/D8aTxzr3fimY2PUn2uKY/eWdPbniYnKhuVqxNCAEI2i6RXdamXBDXTHYATHTnLJ3Uycn8iTKhV46/xslvv5VIH9s5QMG9HloBYdO27ucruvBKZVfeXKBH5' // 需要实际cookie
    };

    try {
        const response = await axios.get(url, { headers });
        const $ = cheerio.load(response.data);
        const hotItems = [];

        $('.HotItem-content').each((index, element) => {
            const title = $(element).find('a').text().trim();
            const link = $(element).find('a').attr('href');
            const fullLink = link.startsWith('http') ? link : `https://www.zhihu.com${link}`;
            
            hotItems.push({
                问题: title,
                链接: fullLink
            });
        });

        console.log('知乎热榜:');
        hotItems.forEach((item, index) => {
            console.log(`${index + 1}. ${item.问题}`);
            console.log(`   链接: ${item.链接}`);
        });

        return hotItems;
    } catch (error) {
        console.error('爬取知乎热榜失败:', error.message);
        return [];
    }
}
crawlZhihuHot()