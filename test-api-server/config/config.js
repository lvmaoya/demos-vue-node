const path = require('path');

module.exports = {
  // 服务器配置
  PORT: 3000,
  
  // CORS 配置
  CORS: {
    origins: [
      'http://localhost:5173', 
      'http://127.0.0.1:5500', 
      'http://127.0.0.1:5173',
      'http://localhost:8080',
      'http://127.0.0.1:8080',
      'http://localhost:8081',
      'http://127.0.0.1:8081',
      'http://localhost:8082',
      'http://127.0.0.1:8082'
    ],
    credentials: true
  },
  
  // 文件上传配置
  UPLOAD_LIMITS: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  
  // 允许的文件类型
  ALLOWED_FILE_TYPES: /\.(jpeg|jpg|png|gif|pdf|doc|docx|txt|zip|rar)$/i,
  
  // 目录配置
  DIRECTORIES: {
    uploads: path.join(__dirname, '..', 'uploads'),
    temp: path.join(__dirname, '..', 'temp')
  },
  
  // 服务器URL配置
  getServerUrl: function() {
    return `http://localhost:${this.PORT}`;
  }
};