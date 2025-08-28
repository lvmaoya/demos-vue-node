const express = require('express');
const config = require('./config/config');
const { setupMiddleware } = require('./middleware');
const { initDirectories, setupGracefulShutdown } = require('./utils/init');

// 导入路由
const usersRouter = require('./routes/users');
const uploadRouter = require('./routes/upload');
const filesRouter = require('./routes/files');

const app = express();

// 初始化目录
initDirectories();

// 设置中间件
setupMiddleware(app);

// 注册路由
app.use('/api/users', usersRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/files', filesRouter);



// 启动服务器
app.listen(config.PORT, () => {
  console.log(`🚀 服务器运行在 ${config.getServerUrl()}`);
  console.log('📁 上传目录:', config.DIRECTORIES.uploads);
  console.log('📁 临时目录:', config.DIRECTORIES.temp);
  console.log('\n📋 可用接口:');
  console.log('  GET  /api/users - 获取用户列表');
  console.log('  POST /api/upload/single - 单文件上传');
  console.log('  POST /api/upload/multiple - 多文件上传');
  console.log('  POST /api/upload/traditional - 传统表单上传');
  console.log('  POST /api/upload/resume/check - 断点续传检查');
  console.log('  POST /api/upload/resume/chunk - 断点续传分片');
  console.log('  POST /api/upload/resume/complete - 断点续传完成');
  console.log('  POST /api/upload/stream - 流式上传');
  console.log('  POST /api/upload/chunk/init - 分片上传初始化');
  console.log('  POST /api/upload/chunk/upload - 分片上传');
  console.log('  POST /api/upload/chunk/merge - 分片合并');
  console.log('  GET  /api/files - 获取文件列表');
  console.log('  DELETE /api/files/all - 删除所有文件');
  console.log('  DELETE /api/files/:filename - 删除单个文件');
});

// 设置优雅关闭
setupGracefulShutdown();