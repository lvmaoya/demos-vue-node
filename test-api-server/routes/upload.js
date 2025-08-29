const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const config = require("../config/config");
const { upload, chunkUpload } = require("../middleware/upload");
const router = express.Router();

const uploadDir = config.DIRECTORIES.uploads;
const tempDir = config.DIRECTORIES.temp;
const PORT = config.PORT;

// 存储上传会话信息
const uploadSessions = new Map();

// 单文件上传接口
router.post("/single", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "没有文件被上传",
      });
    }

    res.json({
      success: true,
      message: "文件上传成功",
      data: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: `${config.getServerUrl()}/uploads/${req.file.filename}`,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "文件上传失败",
      error: error.message,
    });
  }
});

// 多文件上传接口
router.post("/multiple", upload.array("files", 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "没有文件被上传",
      });
    }

    const files = req.files.map((file) => ({
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `${config.getServerUrl()}/uploads/${file.filename}`,
    }));

    res.json({
      success: true,
      message: `成功上传 ${files.length} 个文件`,
      data: files,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "文件上传失败",
      error: error.message,
    });
  }
});

// 传统表单上传接口
router.post("/traditional", upload.single("file"), (req, res) => {
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
      message: "传统表单上传成功",
      data: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: `${config.getServerUrl()}/uploads/${req.file.filename}`,
      },
    };

    res.send(`
      <script>
        parent.postMessage({type: 'upload', success: true, data: ${JSON.stringify(
          result.data
        )}}, '*');
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
router.post("/resume/check", (req, res) => {
  try {
    const { filename, filesize, lastModified, chunkSize, totalChunks } =
      req.body;
    const fileId = crypto
      .createHash("md5")
      .update(`${filename}-${filesize}-${lastModified}`)
      .digest("hex");
    const tempFilePath = path.join(tempDir, `${fileId}.tmp`);
    const chunkDir = path.join(tempDir, fileId);

    let uploadedChunks = [];
    let uploadedSize = 0;

    // 检查是否有分片目录（新的分片方式）
    if (fs.existsSync(chunkDir)) {
      const chunkFiles = fs.readdirSync(chunkDir);
      uploadedChunks = chunkFiles
        .filter((file) => file.startsWith("chunk-"))
        .map((file) => parseInt(file.split("-")[1]))
        .sort((a, b) => a - b);
      uploadedSize = uploadedChunks.length * chunkSize;
    }
    // 检查是否有旧的临时文件（兼容旧方式）
    else if (fs.existsSync(tempFilePath)) {
      const stats = fs.statSync(tempFilePath);
      uploadedSize = stats.size;
      // 根据文件大小计算已上传的分片数
      const uploadedChunkCount = Math.floor(uploadedSize / chunkSize);
      uploadedChunks = Array.from({ length: uploadedChunkCount }, (_, i) => i);
    }

    res.json({
      success: true,
      uploadId: fileId,
      uploadedSize: uploadedSize,
      uploadedChunks: uploadedChunks,
      message:
        uploadedChunks.length > 0
          ? `发现断点文件，已上传 ${uploadedChunks.length} 个分片`
          : "开始新上传",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// 断点续传 - 上传分片
router.post("/resume/chunk", chunkUpload.single("chunk"), (req, res) => {
  try {
    const {
      uploadId,
      filename,
      chunkIndex,
      totalChunks,
      currentByte,
      totalSize,
    } = req.body;
    const chunkDir = path.join(tempDir, uploadId);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "没有分片数据",
      });
    }

    // 确保分片目录存在
    if (!fs.existsSync(chunkDir)) {
      fs.mkdirSync(chunkDir, { recursive: true });
    }

    // 保存分片到指定位置
    const chunkPath = path.join(chunkDir, `chunk-${chunkIndex}`);
    fs.renameSync(req.file.path, chunkPath);

    // 计算已上传的总大小
    const chunkFiles = fs.readdirSync(chunkDir);
    const uploadedChunks = chunkFiles
      .filter((file) => file.startsWith("chunk-"))
      .map((file) => parseInt(file.split("-")[1]))
      .sort((a, b) => a - b);

    const uploadedSize = uploadedChunks.reduce((total, chunkIdx) => {
      const chunkFilePath = path.join(chunkDir, `chunk-${chunkIdx}`);
      return total + fs.statSync(chunkFilePath).size;
    }, 0);

    res.json({
      success: true,
      message: `分片 ${parseInt(chunkIndex) + 1} 上传成功`,
      uploadedSize: uploadedSize,
      uploadedChunks: uploadedChunks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// 断点续传 - 完成上传
router.post("/resume/complete", async (req, res) => {
  try {
    const { uploadId, filename, totalChunks } = req.body;
    const chunkDir = path.join(tempDir, uploadId);
    const tempFilePath = path.join(tempDir, `${uploadId}.tmp`);

    // 检查分片目录是否存在（新方式）
    if (fs.existsSync(chunkDir)) {
      // 验证所有分片是否都已上传
      const chunkFiles = fs.readdirSync(chunkDir);
      const uploadedChunks = chunkFiles
        .filter((file) => file.startsWith("chunk-"))
        .map((file) => parseInt(file.split("-")[1]))
        .sort((a, b) => a - b);

      // 检查分片完整性
      const expectedChunks = Array.from({ length: totalChunks }, (_, i) => i);
      const missingChunks = expectedChunks.filter(
        (i) => !uploadedChunks.includes(i)
      );

      if (missingChunks.length > 0) {
        return res.status(400).json({
          success: false,
          message: `缺少分片: ${missingChunks.join(", ")}`,
        });
      }

      // 生成最终文件名
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const finalFilename = "resume-" + uniqueSuffix + path.extname(filename);
      const finalPath = path.join(uploadDir, finalFilename);
      // 按顺序合并分片
      const writeStream = fs.createWriteStream(finalPath);

      // 等待写入完成
      await new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
        
        for (let i = 0; i < totalChunks; i++) {
          const chunkPath = path.join(chunkDir, `chunk-${i}`);
          const chunkData = fs.readFileSync(chunkPath);
          writeStream.write(chunkData);
        }
        writeStream.end();
      });

      // 清理分片目录
      fs.rmSync(chunkDir, { recursive: true, force: true });

      const stats = fs.statSync(finalPath);

      res.json({
        success: true,
        message: "断点续传完成",
        data: {
          originalname: filename,
          filename: finalFilename,
          size: stats.size,
          mimetype: "application/octet-stream",
          url: `http://localhost:${PORT}/uploads/${finalFilename}`,
          uploadTime: new Date().toISOString(),
        },
      });
    }
    // 兼容旧的临时文件方式
    else if (fs.existsSync(tempFilePath)) {
      // 生成最终文件名
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const finalFilename = "resume-" + uniqueSuffix + path.extname(filename);
      const finalPath = path.join(uploadDir, finalFilename);

      // 移动临时文件到最终位置
      fs.renameSync(tempFilePath, finalPath);

      const stats = fs.statSync(finalPath);

      res.json({
        success: true,
        message: "断点续传完成",
        data: {
          originalname: filename,
          filename: finalFilename,
          size: stats.size,
          mimetype: "application/octet-stream",
          url: `http://localhost:${PORT}/uploads/${finalFilename}`,
          uploadTime: new Date().toISOString(),
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "临时文件不存在",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// 流式上传接口
router.post("/stream", (req, res) => {
  try {
    const filename = decodeURIComponent(req.headers["x-file-name"]);
    const fileSize = parseInt(req.headers["x-file-size"]);
    const fileType = req.headers["x-file-type"];

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const finalFilename = "stream-" + uniqueSuffix + path.extname(filename);
    const finalPath = path.join(uploadDir, finalFilename);

    const writeStream = fs.createWriteStream(finalPath);

    req.pipe(writeStream);

    writeStream.on("finish", () => {
      res.json({
        success: true,
        message: "流式上传完成",
        data: {
          filename: finalFilename,
          originalname: filename,
          mimetype: fileType,
          size: fileSize,
          url: `${config.getServerUrl()}/uploads/${finalFilename}`,
        },
      });
    });

    writeStream.on("error", (error) => {
      res.status(500).json({
        success: false,
        message: "流式上传失败: " + error.message,
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// 分片上传 - 初始化
router.post("/chunk/init", (req, res) => {
  try {
    const { filename, filesize, chunkSize, totalChunks } = req.body;

    // 添加文件类型检查
    if (!config.ALLOWED_FILE_TYPES.test(filename)) {
      return res.status(400).json({
        success: false,
        message: "不支持的文件类型",
      });
    }

    const uploadId = crypto
      .createHash("md5")
      .update(`${filename}-${filesize}-${Date.now()}`)
      .digest("hex");

    // 创建分片目录
    const chunkDir = path.join(tempDir, uploadId);
    if (!fs.existsSync(chunkDir)) {
      fs.mkdirSync(chunkDir, { recursive: true });
    }

    // 从文件扩展名推断 MIME 类型
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".pdf": "application/pdf",
      ".txt": "text/plain",
      ".doc": "application/msword",
      ".docx":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".zip": "application/zip",
    };
    const mimetype = mimeTypes[ext] || "application/octet-stream";

    // 存储上传会话信息
    uploadSessions.set(uploadId, {
      filename,
      filesize,
      chunkSize,
      totalChunks,
      mimetype,
      uploadedChunks: [],
      chunkDir,
    });

    res.json({
      success: true,
      uploadId: uploadId,
      message: "分片上传初始化成功",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// 分片上传 - 上传分片
router.post("/chunk/upload", chunkUpload.single("chunk"), (req, res) => {
  try {
    const { uploadId, chunkIndex, totalChunks, filename } = req.body;
    const session = uploadSessions.get(uploadId);

    if (!session) {
      return res.status(400).json({
        success: false,
        message: "上传会话不存在",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "没有分片数据",
      });
    }

    // 确保分片目录存在
    if (!fs.existsSync(session.chunkDir)) {
      fs.mkdirSync(session.chunkDir, { recursive: true });
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
      totalChunks: parseInt(totalChunks),
    });
  } catch (error) {
    console.error(`Chunk upload error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// 分片上传 - 合并分片
router.post("/chunk/merge", (req, res) => {
  try {
    const { uploadId, filename, totalChunks } = req.body;
    const session = uploadSessions.get(uploadId);

    if (!session) {
      return res.status(400).json({
        success: false,
        message: "上传会话不存在",
      });
    }

    // 检查所有分片是否都已上传
    if (session.uploadedChunks.length !== parseInt(totalChunks)) {
      return res.status(400).json({
        success: false,
        message: "分片不完整",
      });
    }

    // 生成最终文件名
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const finalFilename = "chunk-" + uniqueSuffix + path.extname(filename);
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

    // 等待文件写入完成
    writeStream.on("finish", () => {
      try {
        // 清理临时文件
        fs.rmSync(session.chunkDir, { recursive: true, force: true });
        uploadSessions.delete(uploadId);

        const stats = fs.statSync(finalPath);

        res.json({
          success: true,
          message: "分片合并完成",
          data: {
            filename: finalFilename,
            originalname: filename,
            mimetype: session.mimetype || "application/octet-stream",
            size: stats.size,
            url: `${config.getServerUrl()}/uploads/${finalFilename}`,
          },
        });
      } catch (error) {
        console.error("分片合并完成后处理错误:", error);
        res.status(500).json({
          success: false,
          message: "文件处理失败",
          error: error.message,
        });
      }
    });

    writeStream.on("error", (error) => {
      // 清理临时文件
      if (fs.existsSync(session.chunkDir)) {
        fs.rmSync(session.chunkDir, { recursive: true, force: true });
      }
      uploadSessions.delete(uploadId);

      res.status(500).json({
        success: false,
        message: "分片合并失败: " + error.message,
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
