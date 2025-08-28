const multer = require('multer');
const path = require('path');
const config = require('../config/config');

// 配置multer存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, config.DIRECTORIES.uploads);
  },
  filename: function (req, file, cb) {
    // 生成唯一文件名：时间戳 + 随机数 + 原始扩展名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  // 允许的文件类型
  const extname = config.ALLOWED_FILE_TYPES.test(path.extname(file.originalname).toLowerCase());
  const allowedMimeTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip|rar/;
  const mimetype = allowedMimeTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('不支持的文件类型'));
  }
};

// 标准文件上传配置
const upload = multer({ 
  storage: storage,
  limits: config.UPLOAD_LIMITS,
  fileFilter: fileFilter
});

// 分片上传配置（跳过文件类型检查）
const chunkUpload = multer({ 
  storage: storage,
  limits: config.UPLOAD_LIMITS
  // 注意：这里不使用fileFilter，因为分片没有原始文件的扩展名和MIME类型信息
});

module.exports = {
  upload,
  chunkUpload
};