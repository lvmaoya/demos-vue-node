const express = require('express');
const router = express.Router();

// GET /api/cookies/data - 获取数据并设置Cookie，打印请求中的Cookie
router.get('/data', (req, res) => {
  // 打印请求中的Cookie
  console.log('\n=== 请求中的Cookie信息 ===');
  console.log('req.cookies:', req.cookies);
  console.log('Cookie header:', req.headers.cookie);
  console.log('========================\n');
  
  // 设置一个测试Cookie
  res.cookie('testCookie', 'cookieValue123', {
    // domain: '127.0.0.1',
    httpOnly: false,
    // secure: false,
    sameSite: 'Lax',
    path: 'http://127.0.0.1:5500',
    maxAge: 24 * 60 * 60 * 1000 // 24小时
  });
  
  // 返回数据123
  res.json({
    success: true,
    data: 123,
    message: '数据获取成功，已设置Cookie',
    receivedCookies: req.cookies
  });
});















module.exports = router;