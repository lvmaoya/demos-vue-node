<template>
  <div class="file-upload-demo">
    <div class="header">
      <router-link to="/" class="back-btn">← 返回首页</router-link>
      <h1>📁 文件上传演示</h1>
    </div>
    <!-- 传统表单上传 -->
    <div class="demo-section">
      <h2>1. 传统表单上传</h2>
      <div class="upload-area">
        <form ref="traditionalForm" :action="`${apiBaseUrl}/upload/traditional`" method="post" enctype="multipart/form-data" target="uploadFrame">
          <input type="file" name="file" accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.zip,.rar" required>
          <button type="submit" class="btn btn-primary">传统表单上传</button>
        </form>
        <iframe name="uploadFrame" style="display: none;"></iframe>
        <p class="upload-note">注意：传统表单上传会在隐藏iframe中处理，避免页面刷新</p>
      </div>
    </div>

    <!-- Ajax/Fetch异步上传 -->
    <div class="demo-section">
      <h2>2. Ajax/Fetch异步上传</h2>
      <div class="upload-area">
        <input 
          ref="singleFileInput" 
          type="file" 
          @change="handleSingleFileSelect"
          accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.zip,.rar"
          style="display: none"
        >
        <button @click="$refs.singleFileInput.click()" class="btn btn-primary">
          选择文件
        </button>
        <div v-if="singleFile" class="file-info">
          <p>已选择: {{ singleFile.name }} ({{ formatFileSize(singleFile.size) }})</p>
          <button @click="uploadSingleFile" :disabled="uploading" class="btn btn-primary">
            {{ uploading ? '上传中...' : '上传文件' }}
          </button>
        </div>
      </div>
    </div>



    <!-- 断点续传 -->
    <div class="demo-section">
      <h2>3. 断点续传</h2>
      <div class="upload-area">
        <input 
          ref="resumeFileInput" 
          type="file" 
          @change="handleResumeFileSelect"
          accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.zip,.rar"
          style="display: none"
        >
        <button @click="$refs.resumeFileInput.click()" class="btn btn-primary">
          选择文件（断点续传）
        </button>
        <div v-if="resumeFile" class="file-info">
          <p>已选择: {{ resumeFile.name }} ({{ formatFileSize(resumeFile.size) }})</p>
          <div class="resume-controls">
            <button @click="startResumeUpload" :disabled="resumeUploading" class="btn btn-success">
              {{ resumeUploading ? '上传中...' : '开始上传' }}
            </button>
            <button @click="pauseResumeUpload" :disabled="!resumeUploading" class="btn btn-danger">
              暂停上传
            </button>
            <button @click="resumeUpload" :disabled="resumeUploading || !resumePaused" class="btn btn-info">
              继续上传
            </button>
          </div>
          <div v-if="resumeProgress > 0" class="progress-bar">
            <div class="progress-fill" :style="{ width: resumeProgress + '%' }"></div>
          </div>
          <p v-if="resumeProgress > 0">断点续传进度: {{ resumeProgress }}%</p>
        </div>
      </div>
    </div>

    <!-- 流式上传 -->
    <div class="demo-section">
      <h2>4. 流式上传</h2>
      <div class="upload-area">
        <input 
          ref="streamFileInput" 
          type="file" 
          @change="handleStreamFileSelect"
          accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.zip,.rar"
          style="display: none"
        >
        <button @click="$refs.streamFileInput.click()" class="btn btn-primary">
          选择文件（流式上传）
        </button>
        <div v-if="streamFile" class="file-info">
          <p>已选择: {{ streamFile.name }} ({{ formatFileSize(streamFile.size) }})</p>
          <button @click="uploadStreamFile" :disabled="streamUploading" class="btn btn-primary">
            {{ streamUploading ? '流式上传中...' : '开始流式上传' }}
          </button>
          <div v-if="streamProgress > 0" class="progress-bar">
            <div class="progress-fill" :style="{ width: streamProgress + '%' }"></div>
          </div>
          <p v-if="streamProgress > 0">流式上传进度: {{ streamProgress }}%</p>
        </div>
      </div>
    </div>

    <!-- 分片上传 -->
    <div class="demo-section">
      <h2>5. 分片上传</h2>
      <div class="upload-area">
        <input 
          ref="chunkFileInput" 
          type="file" 
          @change="handleChunkFileSelect"
          accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.zip,.rar"
          style="display: none"
        >
        <button @click="$refs.chunkFileInput.click()" class="btn btn-primary">
          选择文件（分片上传）
        </button>
        <div v-if="chunkFile" class="file-info">
          <p>已选择: {{ chunkFile.name }} ({{ formatFileSize(chunkFile.size) }})</p>
          <p>分片大小: {{ formatFileSize(chunkSize) }}</p>
          <p>总分片数: {{ totalChunks }}</p>
          <button @click="uploadChunkFile" :disabled="chunkUploading" class="btn btn-primary">
            {{ chunkUploading ? '分片上传中...' : '开始分片上传' }}
          </button>
          <div v-if="chunkProgress > 0" class="progress-bar">
            <div class="progress-fill" :style="{ width: chunkProgress + '%' }"></div>
          </div>
          <p v-if="chunkProgress > 0">分片上传进度: {{ chunkProgress }}% ({{ currentChunk }}/{{ totalChunks }})</p>
        </div>
      </div>
    </div>

    <!-- 上传进度 -->
    <div v-if="uploadProgress > 0" class="progress-section">
      <h3>上传进度</h3>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
      </div>
      <p>{{ uploadProgress }}%</p>
    </div>

    <!-- 上传结果 -->
    <div v-if="uploadResults.length > 0" class="results-section">
      <h2>上传结果</h2>
      <div v-for="(result, index) in uploadResults" :key="index" class="result-item">
        <div class="result-info">
          <h4>{{ result.originalname }}</h4>
          <p>文件大小: {{ formatFileSize(result.size) }}</p>
          <p>文件类型: {{ result.mimetype }}</p>
          <a :href="result.url" target="_blank" class="download-link">查看/下载</a>
        </div>
      </div>
    </div>

    <!-- 已上传文件列表 -->
    <div class="demo-section">
      <h2>服务器文件列表</h2>
      <div class="file-list-controls">
        <button @click="loadFileList" class="btn btn-primary">刷新列表</button>
        <button v-if="serverFiles.length > 0" @click="deleteAllFiles" class="btn btn-danger">🗑️ 全部删除</button>
      </div>
      <div v-if="serverFiles.length > 0" class="server-files">
        <div class="files-header">
          <span>共 {{ serverFiles.length }} 个文件</span>
        </div>
        <div v-for="file in serverFiles" :key="file.filename" class="server-file-item">
          <div class="file-details">
            <h4>{{ file.filename }}</h4>
            <p>大小: {{ formatFileSize(file.size) }}</p>
            <p>上传时间: {{ formatDate(file.uploadTime) }}</p>
          </div>
          <div class="file-actions">
            <a :href="file.url" target="_blank" class="btn btn-info btn-sm">查看</a>
            <button @click="deleteFile(file.filename)" class="btn btn-danger btn-sm">删除</button>
          </div>
        </div>
      </div>
      <p v-else class="no-files">暂无文件</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 单文件上传
const singleFile = ref(null)
const uploading = ref(false)
const uploadProgress = ref(0)

// 断点续传相关
const resumeFile = ref(null)
const resumeUploading = ref(false)
const resumePaused = ref(false)
const resumeProgress = ref(0)
const resumeUploadId = ref(null)
const resumeController = ref(null)

// 流式上传相关
const streamFile = ref(null)
const streamUploading = ref(false)
const streamProgress = ref(0)

// 分片上传相关
const chunkFile = ref(null)
const chunkUploading = ref(false)
const chunkProgress = ref(0)
const chunkSize = ref(1024 * 1024) // 1MB per chunk
const currentChunk = ref(0)
const uploadedChunks = ref([])

// 上传结果和文件列表
const uploadResults = ref([])
const serverFiles = ref([])

// API配置
const apiBaseUrl = '/api'

// 计算属性
const totalChunks = computed(() => {
  if (!chunkFile.value) return 0
  return Math.ceil(chunkFile.value.size / chunkSize.value)
})

// 生命周期
onMounted(() => {
  loadFileList()
  
  // 监听传统表单上传的结果
  window.addEventListener('message', (event) => {
    if (event.data.type === 'upload') {
      if (event.data.success) {
        uploadResults.value.push(event.data.data)
        alert('传统表单上传成功！')
        loadFileList()
      } else {
        alert('传统表单上传失败: ' + event.data.message)
      }
    }
  })
})

// 单文件选择
const handleSingleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    singleFile.value = file
  }
}

// 单文件上传
const uploadSingleFile = async () => {
  if (!singleFile.value) return

  uploading.value = true
  uploadProgress.value = 0

  const formData = new FormData()
  formData.append('file', singleFile.value)

  try {
    const response = await fetch(`${apiBaseUrl}/upload/single`, {
      method: 'POST',
      body: formData
    })

    const result = await response.json()
    if (result.success) {
      uploadProgress.value = 100
      uploadResults.value.push(result.data)
      alert('文件上传成功！')
      loadFileList()
    } else {
      alert('上传失败: ' + result.message)
    }
  } catch (error) {
    console.error('上传失败:', error)
    alert('上传失败: ' + error.message)
  } finally {
    uploading.value = false
  }
}

// 断点续传文件选择
const handleResumeFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    resumeFile.value = file
    resumeProgress.value = 0
    resumeUploadId.value = null
  }
}

// 流式上传文件选择
const handleStreamFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    streamFile.value = file
    streamProgress.value = 0
  }
}

// 分片上传文件选择
const handleChunkFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    chunkFile.value = file
    chunkProgress.value = 0
    currentChunk.value = 0
    uploadedChunks.value = []
  }
}

// 断点续传 - 开始上传
const startResumeUpload = async () => {
  if (!resumeFile.value) return

  resumeUploading.value = true
  resumePaused.value = false
  resumeController.value = new AbortController()

  try {
    // 检查服务器上是否已有部分文件
    const checkResponse = await fetch(`${apiBaseUrl}/upload/resume/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filename: resumeFile.value.name,
        filesize: resumeFile.value.size,
        lastModified: resumeFile.value.lastModified
      })
    })

    const checkResult = await checkResponse.json()
    const startByte = checkResult.uploadedSize || 0
    resumeUploadId.value = checkResult.uploadId
    
    if (startByte > 0) {
      resumeProgress.value = Math.round((startByte / resumeFile.value.size) * 100)
    }

    // 从断点开始上传
    await uploadFromByte(startByte)
  } catch (error) {
    console.error('断点续传失败:', error)
    alert('断点续传失败: ' + error.message)
  } finally {
    resumeUploading.value = false
  }
}

// 断点续传 - 从指定字节开始上传
const uploadFromByte = async (startByte) => {
  const chunkSize = 1024 * 1024 // 1MB chunks
  let currentByte = startByte

  while (currentByte < resumeFile.value.size && !resumePaused.value) {
    const chunk = resumeFile.value.slice(currentByte, Math.min(currentByte + chunkSize, resumeFile.value.size))
    
    const formData = new FormData()
    formData.append('chunk', chunk)
    formData.append('uploadId', resumeUploadId.value)
    formData.append('filename', resumeFile.value.name)
    formData.append('currentByte', currentByte)
    formData.append('totalSize', resumeFile.value.size)

    try {
      const response = await fetch(`${apiBaseUrl}/upload/resume/chunk`, {
        method: 'POST',
        body: formData,
        signal: resumeController.value.signal
      })

      if (!response.ok) {
        throw new Error('分片上传失败')
      }

      const result = await response.json()
      currentByte = result.uploadedSize
      resumeProgress.value = Math.round((currentByte / resumeFile.value.size) * 100)
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('上传已暂停')
        return
      }
      throw error
    }
  }

  // 完成上传
  if (currentByte >= resumeFile.value.size) {
    const completeResponse = await fetch(`${apiBaseUrl}/upload/resume/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        uploadId: resumeUploadId.value,
        filename: resumeFile.value.name
      })
    })

    const completeResult = await completeResponse.json()
    if (completeResult.success) {
      uploadResults.value.push(completeResult.data)
      alert('断点续传完成！')
      loadFileList()
    }
  }
}

// 暂停断点续传
const pauseResumeUpload = () => {
  resumePaused.value = true
  if (resumeController.value) {
    resumeController.value.abort()
  }
}

// 恢复断点续传
const resumeUpload = async () => {
  if (!resumeFile.value || !resumeUploadId.value) return
  
  resumePaused.value = false
  resumeController.value = new AbortController()
  
  const currentByte = Math.round((resumeProgress.value / 100) * resumeFile.value.size)
  await uploadFromByte(currentByte)
}

// 流式上传
const uploadStreamFile = async () => {
  if (!streamFile.value) return

  streamUploading.value = true
  streamProgress.value = 0

  try {
    const response = await fetch(`${apiBaseUrl}/upload/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'X-File-Name': encodeURIComponent(streamFile.value.name),
        'X-File-Size': streamFile.value.size,
        'X-File-Type': streamFile.value.type
      },
      body: streamFile.value
    })

    if (!response.ok) {
      throw new Error('流式上传失败')
    }

    const result = await response.json()
    if (result.success) {
      streamProgress.value = 100
      uploadResults.value.push(result.data)
      alert('流式上传完成！')
      loadFileList()
    }
  } catch (error) {
    console.error('流式上传失败:', error)
    alert('流式上传失败: ' + error.message)
  } finally {
    streamUploading.value = false
  }
}

// 分片上传
const uploadChunkFile = async () => {
  if (!chunkFile.value) return

  chunkUploading.value = true
  chunkProgress.value = 0
  currentChunk.value = 0
  uploadedChunks.value = []

  try {
    // 初始化分片上传
    const initResponse = await fetch(`${apiBaseUrl}/upload/chunk/init`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filename: chunkFile.value.name,
        filesize: chunkFile.value.size,
        chunkSize: chunkSize.value,
        totalChunks: totalChunks.value
      })
    })

    const initResult = await initResponse.json()
    const uploadId = initResult.uploadId

    // 上传每个分片
    for (let i = 0; i < totalChunks.value; i++) {
      const start = i * chunkSize.value
      const end = Math.min(start + chunkSize.value, chunkFile.value.size)
      const chunk = chunkFile.value.slice(start, end)

      const formData = new FormData()
      formData.append('chunk', chunk)
      formData.append('uploadId', uploadId)
      formData.append('chunkIndex', i)
      formData.append('totalChunks', totalChunks.value)
      formData.append('filename', chunkFile.value.name)

      const chunkResponse = await fetch(`${apiBaseUrl}/upload/chunk/upload`, {
        method: 'POST',
        body: formData
      })

      if (!chunkResponse.ok) {
        throw new Error(`分片 ${i + 1} 上传失败`)
      }

      currentChunk.value = i + 1
      chunkProgress.value = Math.round((currentChunk.value / totalChunks.value) * 100)
      uploadedChunks.value.push(i)
    }

    // 合并分片
    const mergeResponse = await fetch(`${apiBaseUrl}/upload/chunk/merge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        uploadId: uploadId,
        filename: chunkFile.value.name,
        totalChunks: totalChunks.value
      })
    })

    const mergeResult = await mergeResponse.json()
    if (mergeResult.success) {
      uploadResults.value.push(mergeResult.data)
      alert('分片上传完成！')
      loadFileList()
    }
  } catch (error) {
    console.error('分片上传失败:', error)
    alert('分片上传失败: ' + error.message)
  } finally {
    chunkUploading.value = false
  }
}

// 加载文件列表
const loadFileList = async () => {
  try {
    const response = await fetch(`${apiBaseUrl}/files`)
    const result = await response.json()
    if (result.success) {
      serverFiles.value = result.data
    }
  } catch (error) {
    console.error('加载文件列表失败:', error)
  }
}

// 删除文件
const deleteFile = async (filename) => {
  if (!confirm('确定要删除这个文件吗？')) return
  
  try {
    const response = await fetch(`${apiBaseUrl}/files/${filename}`, {
      method: 'DELETE'
    })
    const result = await response.json()
    if (result.success) {
      alert('文件删除成功！')
      loadFileList()
    } else {
      alert('删除失败: ' + result.message)
    }
  } catch (error) {
    console.error('删除失败:', error)
    alert('删除失败: ' + error.message)
  }
}

// 删除所有文件
const deleteAllFiles = async () => {
  if (!confirm(`确定要删除所有 ${serverFiles.value.length} 个文件吗？此操作不可恢复！`)) return
  
  try {
    const response = await fetch(`${apiBaseUrl}/files/all`, {
      method: 'DELETE'
    })
    const result = await response.json()
    if (result.success) {
      alert('所有文件删除成功！')
      loadFileList()
    } else {
      alert('批量删除失败: ' + result.message)
    }
  } catch (error) {
    console.error('批量删除失败:', error)
    alert('批量删除失败: ' + error.message)
  }
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 格式化日期
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('zh-CN')
}
</script>

<style scoped>
.file-upload-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: inherit;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
}

.back-btn {
  background: var(--primary-color);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  text-decoration: none;
  font-weight: 500;
  transition: var(--transition);
}

.back-btn:hover {
  /* background: var(--primary-dark); */
  transform: translateY(-1px);
}

h1 {
  color: var(--text-color);
  margin: 0;
  font-size: 2.2rem;
  font-weight: 600;
}

h2 {
  color: var(--text-color);
  border-bottom: 2px solid var(--primary-color);
  padding-bottom: 10px;
  margin-top: 40px;
  font-size: 1.6rem;
  font-weight: 600;
}

.upload-methods {
  margin-bottom: 40px;
}

.method-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 20px;
}



.demo-section {
  background: var(--page-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow-sm);
}

.upload-area {
  border: 2px dashed var(--border-color);
  border-radius: var(--border-radius);
  padding: 30px;
  text-align: center;
  background: var(--bg-color);
}



.btn {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  margin: 0.25rem;
  font-weight: 500;
  transition: var(--transition);
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-success {
  background: #27ae60;
  color: white;
}

.btn-info {
  background: #17a2b8;
  color: white;
}

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-sm {
  padding: 0.4rem 0.8rem;
  font-size: 0.875rem;
}

.btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn:disabled {
  background: #95a5a6;
  cursor: not-allowed;
  transform: none;
  opacity: 0.6;
}

.file-info {
  margin-top: 15px;
  padding: 15px;
  background: #e8f5e8;
  border-radius: 5px;
}





.progress-section {
  margin: 20px 0;
}

.progress-bar {
  width: 100%;
  height: 20px;
  background: var(--bg-color);
  border-radius: var(--border-radius);
  overflow: hidden;
  margin: 10px 0;
  border: 1px solid var(--border-color);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--success-color));
  transition: width 0.3s ease;
}

.results-section {
  background: var(--success-light);
  border: 1px solid var(--success-color);
  border-radius: var(--border-radius);
  padding: 20px;
  margin: 20px 0;
}

.result-item {
  background: var(--page-bg);
  border-radius: var(--border-radius);
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: var(--shadow-sm);
  transition: var(--transition);
}

.result-item:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.result-info h4 {
  margin: 0 0 10px 0;
  color: var(--text-color);
  font-weight: 600;
}

.download-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
  transition: var(--transition);
}

.download-link:hover {
  color: var(--primary-dark);
  text-decoration: underline;
}



.file-list-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  align-items: center;
}

.files-header {
  padding: 10px 15px;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  margin-bottom: 10px;
  font-weight: 600;
  color: var(--text-color);
}

.server-files {
  margin-top: 20px;
}

.server-file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 5px;
  padding: 15px;
  margin-bottom: 10px;
}

.file-details h4 {
  margin: 0 0 5px 0;
  color: #2c3e50;
}

.file-details p {
  margin: 2px 0;
  color: #6c757d;
  font-size: 14px;
}

.file-actions {
  display: flex;
  gap: 10px;
}



.no-files {
  text-align: center;
  color: #6c757d;
  font-style: italic;
  margin-top: 20px;
}

/* 新增功能样式 */
.upload-note {
  font-size: 14px;
  color: #6c757d;
  margin-top: 10px;
  font-style: italic;
}

.resume-controls {
  display: flex;
  gap: 10px;
  margin: 10px 0;
  flex-wrap: wrap;
}

.resume-controls .btn {
  min-width: 80px;
}

.file-info {
  margin-top: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 5px;
  border: 1px solid #dee2e6;
}

.file-info p {
  margin: 5px 0;
  color: #495057;
}

.progress-bar {
  width: 100%;
  height: 20px;
  background: #e9ecef;
  border-radius: 10px;
  overflow: hidden;
  margin: 10px 0;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007bff, #0056b3);
  transition: width 0.3s ease;
  border-radius: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .file-upload-demo {
    padding: 1rem;
  }
  
  .upload-area {
    padding: 20px;
  }
  
  .btn {
    width: 100%;
    margin: 5px 0;
  }
  
  .file-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  h1 {
    font-size: 1.8rem;
  }
  
  h2 {
    font-size: 1.4rem;
  }
  
  .method-cards {
    grid-template-columns: 1fr;
  }
  
  .server-file-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .file-actions {
    margin-top: 10px;
    width: 100%;
    justify-content: flex-end;
  }
}
</style>