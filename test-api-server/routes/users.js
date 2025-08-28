const express = require('express');
const router = express.Router();

// 基础 GET 接口 - 返回用户列表
router.get('/', (req, res) => {
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

module.exports = router;