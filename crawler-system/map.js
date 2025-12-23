const beginnerSites = [
    {
        name: '静态HTML页面',
        url: 'https://httpbin.org/html',
        skills: ['HTML解析', '基础选择器']
    },
    {
        name: '简单表格数据',
        url: 'https://httpbin.org/robots.txt',
        skills: ['文本提取', '正则表达式']
    },
    {
        name: '基础分页',
        url: 'http://books.toscrape.com/',
        skills: ['分页处理', '链接提取']
    }
];
const intermediateSites = [
    {
        name: '动态加载内容',
        url: 'http://quotes.toscrape.com/scroll',
        skills: ['无限滚动', 'AJAX处理']
    },
    {
        name: '需要登录的网站',
        url: 'http://quotes.toscrape.com/login',
        skills: ['会话管理', '表单提交']
    },
    {
        name: '复杂选择器',
        url: 'https://webscraper.io/test-sites/tables',
        skills: ['复杂CSS选择器', '表格解析']
    }
];
const advancedSites = [
    {
        name: '反爬虫网站',
        url: 'https://httpbin.org/status/429',
        skills: ['限速处理', '重试机制']
    },
    {
        name: '验证码测试',
        url: 'https://httpbin.org/anything',
        skills: ['验证码绕过', '请求模拟']
    },
    {
        name: 'WebSocket实时数据',
        url: 'wss://ws.postman-echo.com/raw',
        skills: ['WebSocket', '实时数据']
    }
];