const fs = require('fs');
const config = require('../config/config');

// 初始化必要的目录
const initDirectories = () => {
  const directories = Object.values(config.DIRECTORIES);
  
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 创建目录: ${dir}`);
    }
  });
};

// 优雅关闭处理
const setupGracefulShutdown = () => {
  process.on('SIGINT', () => {
    console.log('\n🛑 正在关闭服务器...');
    process.exit(0);
  });
};

module.exports = {
  initDirectories,
  setupGracefulShutdown
};