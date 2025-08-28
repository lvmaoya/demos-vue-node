const cors = require('cors');
const express = require('express');
const config = require('../config/config');

// CORS 配置
const corsOptions = {
  origin: config.CORS.origins,
  credentials: config.CORS.credentials
};

// 设置所有中间件
const setupMiddleware = (app) => {
  // CORS 配置
  app.use(cors(corsOptions));
  
  // 解析 JSON 请求体
  app.use(express.json());
  
  // 静态文件服务
  app.use('/uploads', express.static(config.DIRECTORIES.uploads));
};

module.exports = {
  setupMiddleware
};