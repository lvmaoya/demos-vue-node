# 项目结构说明

本项目已完成模块化重构，将原本的单文件 `server.js` 拆分为多个模块，提高了代码的可维护性和可扩展性。

## 目录结构

```
test-api-server/
├── config/
│   └── config.js           # 配置文件（端口、CORS、文件类型等）
├── middleware/
│   ├── index.js            # 中间件配置（CORS、JSON解析、静态文件）
│   └── upload.js           # 文件上传中间件（multer配置）
├── routes/
│   ├── users.js            # 用户相关路由
│   ├── upload.js           # 文件上传相关路由
│   └── files.js            # 文件管理相关路由
├── utils/
│   └── init.js             # 初始化工具（目录创建、优雅关闭）
├── uploads/                # 上传文件存储目录
├── temp/                   # 临时文件目录（分片、断点续传）
├── server.js               # 主服务器文件
└── PROJECT_STRUCTURE.md    # 项目结构说明
```

## 模块说明

### 1. config/config.js
- 集中管理所有配置项
- 包含端口、CORS、文件上传限制、允许的文件类型等
- 提供获取服务器URL的工具函数

### 2. middleware/
- **index.js**: 设置通用中间件（CORS、JSON解析、静态文件服务）
- **upload.js**: 配置multer文件上传中间件，包含标准上传和分片上传两种配置

### 3. routes/
- **users.js**: 用户相关API接口
- **upload.js**: 所有文件上传相关接口（单文件、多文件、传统表单、断点续传、流式上传、分片上传）
- **files.js**: 文件管理接口（获取文件列表、删除文件）

### 4. utils/init.js
- 初始化必要目录
- 设置优雅关闭处理

### 5. server.js
- 主服务器文件，负责：
  - 导入各个模块
  - 初始化目录
  - 设置中间件
  - 注册路由
  - 启动服务器

## 模块化优势

1. **代码分离**: 不同功能模块独立，便于维护
2. **可重用性**: 配置和中间件可在其他项目中复用
3. **可扩展性**: 新增功能只需添加对应的路由模块
4. **可测试性**: 每个模块可独立进行单元测试
5. **团队协作**: 不同开发者可并行开发不同模块

## API 接口

### 用户接口
- `GET /api/users` - 获取用户列表

### 文件上传接口
- `POST /api/upload/single` - 单文件上传
- `POST /api/upload/multiple` - 多文件上传
- `POST /api/upload/traditional` - 传统表单上传
- `POST /api/upload/resume/check` - 断点续传检查
- `POST /api/upload/resume/chunk` - 断点续传分片
- `POST /api/upload/resume/complete` - 断点续传完成
- `POST /api/upload/stream` - 流式上传
- `POST /api/upload/chunk/init` - 分片上传初始化
- `POST /api/upload/chunk/upload` - 分片上传
- `POST /api/upload/chunk/merge` - 分片合并

### 文件管理接口
- `GET /api/files` - 获取文件列表
- `DELETE /api/files/all` - 删除所有文件
- `DELETE /api/files/:filename` - 删除单个文件

## 运行方式

```bash
node server.js
```

服务器将在 http://localhost:3000 启动。