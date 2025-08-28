<template>
  <div class="html2canvas-demo">
    <div class="header">
      <router-link to="/" class="back-btn">← 返回首页</router-link>
      <h1>📸 HTML转图片演示</h1>
    </div>

    <div class="demo-section">
      <h2>1. 截图基本元素</h2>
      <div ref="basicElement" class="capture-area basic-card">
        <h3>这是一个基本的HTML元素</h3>
        <p>包含文字、颜色和样式</p>
        <div class="color-boxes">
          <div class="color-box red"></div>
          <div class="color-box green"></div>
          <div class="color-box blue"></div>
        </div>
      </div>
      <button @click="captureBasic" class="btn btn-primary">截图此元素</button>
    </div>

    <div class="demo-section">
      <h2>2. 截图图表/数据可视化</h2>
      <div ref="chartElement" class="capture-area chart-container">
        <h3>销售数据图表</h3>
        <div class="chart">
          <div class="bar-chart">
            <div class="bar" style="height: 60%">
              <span class="bar-label">1月</span>
              <span class="bar-value">60%</span>
            </div>
            <div class="bar" style="height: 80%">
              <span class="bar-label">2月</span>
              <span class="bar-value">80%</span>
            </div>
            <div class="bar" style="height: 45%">
              <span class="bar-label">3月</span>
              <span class="bar-value">45%</span>
            </div>
            <div class="bar" style="height: 90%">
              <span class="bar-label">4月</span>
              <span class="bar-value">90%</span>
            </div>
            <div class="bar" style="height: 75%">
              <span class="bar-label">5月</span>
              <span class="bar-value">75%</span>
            </div>
          </div>
        </div>
      </div>
      <button @click="captureChart" class="btn btn-success">截图图表</button>
    </div>

    <div class="demo-section">
      <h2>3. 截图表单内容</h2>
      <div ref="formElement" class="capture-area form-container">
        <h3>用户信息表单</h3>
        <form @submit.prevent>
          <div class="form-group">
            <label>姓名：</label>
            <input v-model="formData.name" type="text" placeholder="请输入姓名" />
          </div>
          <div class="form-group">
            <label>邮箱：</label>
            <input v-model="formData.email" type="email" placeholder="请输入邮箱" />
          </div>
          <div class="form-group">
            <label>城市：</label>
            <select v-model="formData.city">
              <option value="">请选择城市</option>
              <option value="北京">北京</option>
              <option value="上海">上海</option>
              <option value="广州">广州</option>
              <option value="深圳">深圳</option>
            </select>
          </div>
          <div class="form-group">
            <label>兴趣爱好：</label>
            <div class="checkbox-group">
              <label><input type="checkbox" v-model="formData.hobbies" value="读书"> 读书</label>
              <label><input type="checkbox" v-model="formData.hobbies" value="运动"> 运动</label>
              <label><input type="checkbox" v-model="formData.hobbies" value="音乐"> 音乐</label>
              <label><input type="checkbox" v-model="formData.hobbies" value="旅行"> 旅行</label>
            </div>
          </div>
        </form>
      </div>
      <button @click="captureForm" class="btn btn-info">截图表单</button>
    </div>

    <div class="demo-section">
      <h2>4. 自定义截图选项</h2>
      <div class="options-group">
        <label>
          <input type="checkbox" v-model="captureOptions.useCORS"> 启用 CORS
        </label>
        <label>
          <input type="checkbox" v-model="captureOptions.allowTaint"> 允许污染画布
        </label>
        <label>
          背景色：<input type="color" v-model="captureOptions.backgroundColor">
        </label>
        <label>
          图片质量：<input type="range" v-model="captureOptions.quality" min="0.1" max="1" step="0.1">
          {{ captureOptions.quality }}
        </label>
      </div>
      <button @click="captureWithOptions" class="btn btn-warning">使用自定义选项截图整个页面</button>
    </div>

    <!-- 显示截图结果 -->
    <div v-if="capturedImages.length > 0" class="demo-section">
      <h2>截图结果</h2>
      <div class="captured-images">
        <div v-for="(image, index) in capturedImages" :key="index" class="captured-image">
          <h4>{{ image.title }}</h4>
          <img :src="image.dataUrl" :alt="image.title" />
          <div class="image-actions">
            <button @click="downloadImage(image)" class="btn btn-sm btn-primary">下载图片</button>
            <button @click="removeImage(index)" class="btn btn-sm btn-danger">删除</button>
          </div>
        </div>
      </div>
      <button @click="clearAllImages" class="btn btn-secondary">清空所有截图</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import html2canvas from 'html2canvas'

// 引用DOM元素
const basicElement = ref(null)
const chartElement = ref(null)
const formElement = ref(null)

// 表单数据
const formData = ref({
  name: '张三',
  email: 'zhangsan@example.com',
  city: '北京',
  hobbies: ['读书', '运动']
})

// 截图选项
const captureOptions = ref({
  useCORS: true,
  allowTaint: false,
  backgroundColor: '#ffffff',
  quality: 0.9
})

// 存储截图结果
const capturedImages = ref([])

// 截图基本元素
const captureBasic = async () => {
  try {
    const canvas = await html2canvas(basicElement.value)
    const dataUrl = canvas.toDataURL('image/png')
    capturedImages.value.push({
      title: '基本HTML元素截图',
      dataUrl,
      timestamp: new Date().toLocaleString()
    })
  } catch (error) {
    console.error('截图失败:', error)
    alert('截图失败，请检查控制台错误信息')
  }
}

// 截图图表
const captureChart = async () => {
  try {
    const canvas = await html2canvas(chartElement.value, {
      backgroundColor: '#f8f9fa'
    })
    const dataUrl = canvas.toDataURL('image/png')
    capturedImages.value.push({
      title: '图表截图',
      dataUrl,
      timestamp: new Date().toLocaleString()
    })
  } catch (error) {
    console.error('截图失败:', error)
    alert('截图失败，请检查控制台错误信息')
  }
}

// 截图表单
const captureForm = async () => {
  try {
    const canvas = await html2canvas(formElement.value)
    const dataUrl = canvas.toDataURL('image/png')
    capturedImages.value.push({
      title: '表单截图',
      dataUrl,
      timestamp: new Date().toLocaleString()
    })
  } catch (error) {
    console.error('截图失败:', error)
    alert('截图失败，请检查控制台错误信息')
  }
}

// 使用自定义选项截图
const captureWithOptions = async () => {
  try {
    const canvas = await html2canvas(document.body, {
      useCORS: captureOptions.value.useCORS,
      allowTaint: captureOptions.value.allowTaint,
      backgroundColor: captureOptions.value.backgroundColor,
      quality: parseFloat(captureOptions.value.quality)
    })
    const dataUrl = canvas.toDataURL('image/png', captureOptions.value.quality)
    capturedImages.value.push({
      title: '整页截图（自定义选项）',
      dataUrl,
      timestamp: new Date().toLocaleString()
    })
  } catch (error) {
    console.error('截图失败:', error)
    alert('截图失败，请检查控制台错误信息')
  }
}

// 下载图片
const downloadImage = (image) => {
  const link = document.createElement('a')
  link.download = `${image.title}_${image.timestamp}.png`
  link.href = image.dataUrl
  link.click()
}

// 删除图片
const removeImage = (index) => {
  capturedImages.value.splice(index, 1)
}

// 清空所有图片
const clearAllImages = () => {
  capturedImages.value = []
}
</script>

<style scoped>
.html2canvas-demo {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
}

.back-btn {
  background: #95a5a6;
  color: white;
  padding: 0.5rem 1rem;
  text-decoration: none;
  border-radius: 5px;
  margin-right: 1rem;
}

.back-btn:hover {
  background: #7f8c8d;
}

.demo-section {
  background: white;
  padding: 2rem;
  margin-bottom: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.capture-area {
  border: 2px dashed #ddd;
  padding: 1.5rem;
  margin: 1rem 0;
  border-radius: 8px;
}

.basic-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
}

.color-boxes {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

.color-box {
  width: 50px;
  height: 50px;
  border-radius: 8px;
}

.red { background: #e74c3c; }
.green { background: #27ae60; }
.blue { background: #3498db; }

.chart-container {
  background: #f8f9fa;
}

.chart {
  margin-top: 1rem;
}

.bar-chart {
  display: flex;
  align-items: end;
  height: 200px;
  gap: 1rem;
  padding: 1rem;
}

.bar {
  flex: 1;
  background: linear-gradient(to top, #3498db, #5dade2);
  border-radius: 4px 4px 0 0;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  color: white;
  font-weight: bold;
  min-height: 40px;
}

.bar-label {
  position: absolute;
  bottom: -25px;
  color: #2c3e50;
  font-size: 0.9rem;
}

.bar-value {
  margin-top: 10px;
  font-size: 0.8rem;
}

.form-container {
  background: #ffffff;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #2c3e50;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.checkbox-group {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  font-weight: normal;
  margin-bottom: 0;
}

.checkbox-group input {
  width: auto;
  margin-right: 0.5rem;
}

.options-group {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin: 1rem 0;
  align-items: center;
}

.options-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  margin: 0.25rem;
  font-size: 1rem;
}

.btn-primary { background: #3498db; color: white; }
.btn-success { background: #27ae60; color: white; }
.btn-info { background: #17a2b8; color: white; }
.btn-warning { background: #f39c12; color: white; }
.btn-danger { background: #e74c3c; color: white; }
.btn-secondary { background: #95a5a6; color: white; }

.btn-sm {
  padding: 0.4rem 0.8rem;
  font-size: 0.875rem;
}

.btn:hover {
  opacity: 0.9;
}

.captured-images {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
}

.captured-image {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
}

.captured-image img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 0.5rem 0;
}

.image-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-top: 0.5rem;
}
</style>