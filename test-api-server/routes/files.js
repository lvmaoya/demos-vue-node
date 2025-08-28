const express = require('express');
const fs = require('fs');
const path = require('path');
const config = require('../config/config');
const router = express.Router();

const uploadDir = config.DIRECTORIES.uploads;
const PORT = config.PORT;

// 获取已上传文件列表
router.get('/', (req, res) => {
  try {
    const files = fs.readdirSync(uploadDir).map(filename => {
      const filePath = path.join(uploadDir, filename);
      const stats = fs.statSync(filePath);
      return {
        filename,
        size: stats.size,
        uploadTime: stats.birthtime,
        url: `${config.getServerUrl()}/uploads/${filename}`
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

// 删除所有文件接口
router.delete('/all', (req, res) => {
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

// 删除单个文件接口
router.delete('/:filename', (req, res) => {
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

module.exports = router;