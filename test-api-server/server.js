const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const app = express();
const PORT = 3000;

// 创建临时目录用于存储分片和断点续传文件
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// 存储上传会话信息
const uploadSessions = new Map();

// 确保上传目录存在
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置multer存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
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
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip|rar/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('不支持的文件类型'));
  }
};

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 限制文件大小为10MB
  },
  fileFilter: fileFilter
});

// 中间件：CORS配置
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// 中间件：解析 JSON 请求体
app.use(express.json());

// 静态文件服务 - 提供上传的文件访问
app.use('/uploads', express.static(uploadDir));

// 基础 GET 接口 - 返回用户列表
app.get('/api/users', (req, res) => {
  const users = [
    { id: 1, name: '张三', email: 'zhangsan@example.com', age: 25 },
    { id: 2, name: '李四', email: 'lisi@example.com', age: 30 },
    { id: 3, name: '王五', email: 'wangwu@example.com', age: 28 }
  ];
  
  res.json({
    success: true,
    message: '获取用户列表成功',
    data: users,
    timestamp: new Date().toISOString()
  });
});

// 单文件上传接口
app.post('/api/upload/single', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '没有文件被上传'
      });
    }

    res.json({
      success: true,
      message: '文件上传成功',
      data: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: `http://localhost:${PORT}/uploads/${req.file.filename}`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '文件上传失败',
      error: error.message
    });
  }
});

// 多文件上传接口
app.post('/api/upload/multiple', upload.array('files', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: '没有文件被上传'
      });
    }

    const files = req.files.map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `http://localhost:${PORT}/uploads/${file.filename}`
    }));

    res.json({
      success: true,
      message: `成功上传 ${files.length} 个文件`,
      data: files
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '文件上传失败',
      error: error.message
    });
  }
});

// 获取已上传文件列表
app.get('/api/files', (req, res) => {
  try {
    const files = fs.readdirSync(uploadDir).map(filename => {
      const filePath = path.join(uploadDir, filename);
      const stats = fs.statSync(filePath);
      return {
        filename,
        size: stats.size,
        uploadTime: stats.birthtime,
        url: `http://localhost:${PORT}/uploads/${filename}`
      };
    });

    res.json({
      success: true,
      message: '获取文件列表成功',
      data: files
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取文件列表失败',
      error: error.message
    });
  }
});

// 删除所有文件接口（必须在单个文件删除路由之前）
app.delete('/api/files/all', (req, res) => {
  try {
    const files = fs.readdirSync(uploadDir);
    
    if (files.length === 0) {
      return res.json({
        success: true,
        message: '没有文件需要删除',
        deletedCount: 0
      });
    }
    
    let deletedCount = 0;
    let errorCount = 0;
    
    files.forEach(filename => {
      try {
        const filePath = path.join(uploadDir, filename);
        fs.unlinkSync(filePath);
        deletedCount++;
      } catch (error) {
        console.error(`删除文件 ${filename} 失败:`, error);
        errorCount++;
      }
    });
    
    if (errorCount === 0) {
      res.json({
        success: true,
        message: `成功删除 ${deletedCount} 个文件`,
        deletedCount: deletedCount
      });
    } else {
      res.json({
        success: false,
        message: `删除完成，成功: ${deletedCount}，失败: ${errorCount}`,
        deletedCount: deletedCount,
        errorCount: errorCount
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '批量删除文件失败',
      error: error.message
    });
  }
});

// 传统表单上传接口
app.post('/api/upload/traditional', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send(`
        <script>
          parent.postMessage({type: 'upload', success: false, message: '没有文件被上传'}, '*');
        </script>
      `);
    }

    const result = {
      success: true,
      message: '传统表单上传成功',
      data: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: `http://localhost:${PORT}/uploads/${req.file.filename}`
      }
    };

    res.send(`
      <script>
        parent.postMessage({type: 'upload', success: true, data: ${JSON.stringify(result.data)}}, '*');
      </script>
    `);
  } catch (error) {
    res.status(500).send(`
      <script>
        parent.postMessage({type: 'upload', success: false, message: '${error.message}'}, '*');
      </script>
    `);
  }
});

// 断点续传 - 检查文件状态
app.post('/api/upload/resume/check', (req, res) => {
  try {
    const { filename, filesize, lastModified } = req.body;
    const fileId = crypto.createHash('md5').update(`${filename}-${filesize}-${lastModified}`).digest('hex');
    const tempFilePath = path.join(tempDir, `${fileId}.tmp`);
    
    let uploadedSize = 0;
    if (fs.existsSync(tempFilePath)) {
      const stats = fs.statSync(tempFilePath);
      uploadedSize = stats.size;
    }

    res.json({
      success: true,
      uploadId: fileId,
      uploadedSize: uploadedSize,
      message: uploadedSize > 0 ? '发现断点文件' : '开始新上传'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 断点续传 - 上传分片
app.post('/api/upload/resume/chunk', upload.single('chunk'), (req, res) => {
  try {
    const { uploadId, filename, currentByte, totalSize } = req.body;
    const tempFilePath = path.join(tempDir, `${uploadId}.tmp`);
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '没有分片数据'
      });
    }

    // 将分片追加到临时文件
    fs.appendFileSync(tempFilePath, fs.readFileSync(req.file.path));
    
    // 删除临时分片文件
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      message: '分片上传成功',
      uploadedSize: fs.statSync(tempFilePath).size
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 断点续传 - 完成上传
app.post('/api/upload/resume/complete', (req, res) => {
  try {
    const { uploadId, filename } = req.body;
    const tempFilePath = path.join(tempDir, `${uploadId}.tmp`);
    
    if (!fs.existsSync(tempFilePath)) {
      return res.status(400).json({
        success: false,
        message: '临时文件不存在'
      });
    }

    // 生成最终文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const finalFilename = 'resume-' + uniqueSuffix + path.extname(filename);
    const finalPath = path.join(uploadDir, finalFilename);
    
    // 移动临时文件到最终位置
    fs.renameSync(tempFilePath, finalPath);
    
    const stats = fs.statSync(finalPath);
    
    res.json({
      success: true,
      message: '断点续传完成',
      data: {
        filename: finalFilename,
        originalname: filename,
        size: stats.size,
        url: `http://localhost:${PORT}/uploads/${finalFilename}`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 流式上传接口
app.post('/api/upload/stream', (req, res) => {
  try {
    const filename = decodeURIComponent(req.headers['x-file-name']);
    const fileSize = parseInt(req.headers['x-file-size']);
    const fileType = req.headers['x-file-type'];
    
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const finalFilename = 'stream-' + uniqueSuffix + path.extname(filename);
    const finalPath = path.join(uploadDir, finalFilename);
    
    const writeStream = fs.createWriteStream(finalPath);
    
    req.pipe(writeStream);
    
    writeStream.on('finish', () => {
      res.json({
        success: true,
        message: '流式上传完成',
        data: {
          filename: finalFilename,
          originalname: filename,
          mimetype: fileType,
          size: fileSize,
          url: `http://localhost:${PORT}/uploads/${finalFilename}`
        }
      });
    });
    
    writeStream.on('error', (error) => {
      res.status(500).json({
        success: false,
        message: '流式上传失败: ' + error.message
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 分片上传 - 初始化
app.post('/api/upload/chunk/init', (req, res) => {
  try {
    const { filename, filesize, chunkSize, totalChunks } = req.body;
    const uploadId = crypto.createHash('md5').update(`${filename}-${filesize}-${Date.now()}`).digest('hex');
    
    // 创建分片目录
    const chunkDir = path.join(tempDir, uploadId);
    if (!fs.existsSync(chunkDir)) {
      fs.mkdirSync(chunkDir, { recursive: true });
    }
    
    // 存储上传会话信息
    uploadSessions.set(uploadId, {
      filename,
      filesize,
      chunkSize,
      totalChunks,
      uploadedChunks: [],
      chunkDir
    });
    
    res.json({
      success: true,
      uploadId: uploadId,
      message: '分片上传初始化成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 分片上传 - 上传单个分片
app.post('/api/upload/chunk/upload', upload.single('chunk'), (req, res) => {
  try {
    const { uploadId, chunkIndex, totalChunks, filename } = req.body;
    const session = uploadSessions.get(uploadId);
    
    if (!session) {
      return res.status(400).json({
        success: false,
        message: '上传会话不存在'
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '没有分片数据'
      });
    }
    
    // 移动分片到指定位置
    const chunkPath = path.join(session.chunkDir, `chunk-${chunkIndex}`);
    fs.renameSync(req.file.path, chunkPath);
    
    // 记录已上传的分片
    session.uploadedChunks.push(parseInt(chunkIndex));
    
    res.json({
      success: true,
      message: `分片 ${parseInt(chunkIndex) + 1} 上传成功`,
      uploadedChunks: session.uploadedChunks.length,
      totalChunks: parseInt(totalChunks)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 分片上传 - 合并分片
app.post('/api/upload/chunk/merge', (req, res) => {
  try {
    const { uploadId, filename, totalChunks } = req.body;
    const session = uploadSessions.get(uploadId);
    
    if (!session) {
      return res.status(400).json({
        success: false,
        message: '上传会话不存在'
      });
    }
    
    // 检查所有分片是否都已上传
    if (session.uploadedChunks.length !== parseInt(totalChunks)) {
      return res.status(400).json({
        success: false,
        message: '分片不完整'
      });
    }
    
    // 生成最终文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const finalFilename = 'chunk-' + uniqueSuffix + path.extname(filename);
    const finalPath = path.join(uploadDir, finalFilename);
    
    // 合并分片
    const writeStream = fs.createWriteStream(finalPath);
    
    for (let i = 0; i < parseInt(totalChunks); i++) {
      const chunkPath = path.join(session.chunkDir, `chunk-${i}`);
      if (fs.existsSync(chunkPath)) {
        const chunkData = fs.readFileSync(chunkPath);
        writeStream.write(chunkData);
      }
    }
    
    writeStream.end();
    
    // 清理临时文件
    fs.rmSync(session.chunkDir, { recursive: true, force: true });
    uploadSessions.delete(uploadId);
    
    const stats = fs.statSync(finalPath);
    
    res.json({
      success: true,
      message: '分片合并完成',
      data: {
        filename: finalFilename,
        originalname: filename,
        size: stats.size,
        url: `http://localhost:${PORT}/uploads/${finalFilename}`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 删除单个文件接口
app.delete('/api/files/:filename', (req, res) => {
  try {
    // 解码URL编码的文件名
    const filename = decodeURIComponent(req.params.filename);
    const filePath = path.join(uploadDir, filename);
    
    console.log('尝试删除文件:', filename);
    console.log('文件路径:', filePath);
    console.log('文件是否存在:', fs.existsSync(filePath));
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: '文件不存在'
      });
    }

    fs.unlinkSync(filePath);
    console.log('文件删除成功:', filename);
    
    res.json({
      success: true,
      message: '文件删除成功'
    });
  } catch (error) {
    console.error('删除文件时发生错误:', error);
    res.status(500).json({
      success: false,
      message: '文件删除失败',
      error: error.message
    });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 测试服务器已启动`);
  console.log(`📍 本地访问: http://localhost:${PORT}`);
  console.log(`📋 可用接口:`);
  console.log(`   GET  http://localhost:${PORT}/api/users - 获取用户列表`);
  console.log(`   POST http://localhost:${PORT}/api/upload/single - 单文件上传`);
  console.log(`   POST http://localhost:${PORT}/api/upload/multiple - 多文件上传`);
  console.log(`   GET  http://localhost:${PORT}/api/files - 获取文件列表`);
  console.log(`   DELETE http://localhost:${PORT}/api/files/:filename - 删除文件`);
  console.log(`📁 上传目录: ${uploadDir}`);
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n🛑 正在关闭服务器...');
  process.exit(0);
});