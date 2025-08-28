<template>
  <div class="jspdf-demo">
    <div class="header">
      <router-link to="/" class="back-btn">← 返回首页</router-link>
      <h1>📄 PDF生成演示</h1>
    </div>

    <div class="demo-section">
      <h2>1. 生成基本文本PDF</h2>
      <div class="form-group">
        <label>PDF标题：</label>
        <input v-model="pdfData.title" placeholder="请输入PDF标题" />
      </div>
      <div class="form-group">
        <label>内容：</label>
        <textarea v-model="pdfData.content" rows="4" placeholder="请输入PDF内容"></textarea>
      </div>
      <div class="form-group">
        <label>作者：</label>
        <input v-model="pdfData.author" placeholder="请输入作者姓名" />
      </div>
      <button @click="generateBasicPDF" class="btn btn-primary">生成基本PDF</button>
    </div>

    <div class="demo-section">
      <h2>2. 生成表格PDF</h2>
      <div class="table-controls">
        <div class="form-group">
          <label>添加表格数据：</label>
          <input v-model="newTableRow.name" placeholder="姓名" />
          <input v-model="newTableRow.position" placeholder="职位" />
          <input v-model="newTableRow.salary" placeholder="薪资" />
          <button @click="addTableRow" class="btn btn-sm btn-success">添加</button>
        </div>
      </div>
      
      <div class="table-preview">
        <table>
          <thead>
            <tr>
              <th>姓名</th>
              <th>职位</th>
              <th>薪资</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in tableData" :key="index">
              <td>{{ row.name }}</td>
              <td>{{ row.position }}</td>
              <td>{{ row.salary }}</td>
              <td>
                <button @click="removeTableRow(index)" class="btn btn-sm btn-danger">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <button @click="generateTablePDF" class="btn btn-success">生成表格PDF</button>
    </div>

    <div class="demo-section">
      <h2>3. 生成图表PDF</h2>
      <div class="chart-preview" ref="chartContainer">
        <h3>销售数据图表</h3>
        <div class="simple-chart">
          <div class="chart-bar" v-for="(item, index) in chartData" :key="index">
            <div class="bar" :style="{ height: item.value + '%', backgroundColor: item.color }">
              <span class="bar-value">{{ item.value }}%</span>
            </div>
            <span class="bar-label">{{ item.label }}</span>
          </div>
        </div>
      </div>
      <button @click="generateChartPDF" class="btn btn-info">生成图表PDF</button>
    </div>

    <div class="demo-section">
      <h2>4. 生成多页PDF报告</h2>
      <div class="report-form">
        <div class="form-group">
          <label>报告标题：</label>
          <input v-model="reportData.title" placeholder="请输入报告标题" />
        </div>
        <div class="form-group">
          <label>报告日期：</label>
          <input v-model="reportData.date" type="date" />
        </div>
        <div class="form-group">
          <label>部门：</label>
          <select v-model="reportData.department">
            <option value="">请选择部门</option>
            <option value="销售部">销售部</option>
            <option value="技术部">技术部</option>
            <option value="市场部">市场部</option>
            <option value="人事部">人事部</option>
          </select>
        </div>
        <div class="form-group">
          <label>报告摘要：</label>
          <textarea v-model="reportData.summary" rows="3" placeholder="请输入报告摘要"></textarea>
        </div>
      </div>
      <button @click="generateReportPDF" class="btn btn-warning">生成完整报告PDF</button>
    </div>

    <div class="demo-section">
      <h2>5. PDF设置选项</h2>
      <div class="pdf-options">
        <div class="option-group">
          <label>页面方向：</label>
          <select v-model="pdfOptions.orientation">
            <option value="portrait">纵向</option>
            <option value="landscape">横向</option>
          </select>
        </div>
        <div class="option-group">
          <label>页面大小：</label>
          <select v-model="pdfOptions.format">
            <option value="a4">A4</option>
            <option value="a3">A3</option>
            <option value="letter">Letter</option>
          </select>
        </div>
        <div class="option-group">
          <label>单位：</label>
          <select v-model="pdfOptions.unit">
            <option value="mm">毫米 (mm)</option>
            <option value="pt">点 (pt)</option>
            <option value="in">英寸 (in)</option>
          </select>
        </div>
      </div>
      <button @click="generateCustomPDF" class="btn btn-secondary">使用自定义设置生成PDF</button>
    </div>

    <!-- PDF预览区域 -->
    <div v-if="generatedPDFs.length > 0" class="demo-section">
      <h2>生成的PDF文件</h2>
      <div class="pdf-list">
        <div v-for="(pdf, index) in generatedPDFs" :key="index" class="pdf-item">
          <div class="pdf-info">
            <h4>{{ pdf.name }}</h4>
            <p>生成时间: {{ pdf.timestamp }}</p>
            <p>文件大小: {{ pdf.size }}</p>
          </div>
          <div class="pdf-actions">
            <button @click="downloadPDF(pdf)" class="btn btn-sm btn-primary">下载PDF</button>
            <button @click="removePDF(index)" class="btn btn-sm btn-danger">删除</button>
          </div>
        </div>
      </div>
      <button @click="clearAllPDFs" class="btn btn-secondary">清空所有PDF</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

// PDF基本数据
const pdfData = ref({
  title: 'Vue.js PDF 演示文档',
  content: '这是一个使用 jsPDF 生成的示例PDF文档。\n\n您可以在这里添加任何文本内容，支持多行文本和基本格式。\n\njsPDF 是一个强大的客户端PDF生成库，可以帮助您在浏览器中创建PDF文档。',
  author: '开发者'
})

// 表格数据
const tableData = ref([
  { name: '张三', position: '前端工程师', salary: '15000' },
  { name: '李四', position: '后端工程师', salary: '18000' },
  { name: '王五', position: '产品经理', salary: '20000' }
])

const newTableRow = ref({
  name: '',
  position: '',
  salary: ''
})

// 图表数据
const chartData = ref([
  { label: 'Q1', value: 65, color: '#3498db' },
  { label: 'Q2', value: 80, color: '#27ae60' },
  { label: 'Q3', value: 45, color: '#e74c3c' },
  { label: 'Q4', value: 90, color: '#f39c12' }
])

// 报告数据
const reportData = ref({
  title: '2024年度工作报告',
  date: new Date().toISOString().split('T')[0],
  department: '技术部',
  summary: '本报告总结了2024年度的主要工作成果和发展方向，包括技术创新、团队建设、项目进展等方面的详细分析。'
})

// PDF选项
const pdfOptions = ref({
  orientation: 'portrait',
  format: 'a4',
  unit: 'mm'
})

// 生成的PDF列表
const generatedPDFs = ref([])

// 图表容器引用
const chartContainer = ref(null)

// 生成基本PDF
const generateBasicPDF = () => {
  const doc = new jsPDF(pdfOptions.value.orientation, pdfOptions.value.unit, pdfOptions.value.format)
  
  // 设置字体（支持中文）
  doc.setFont('helvetica', 'normal')
  
  // 添加标题
  doc.setFontSize(20)
  doc.text(pdfData.value.title, 20, 30)
  
  // 添加作者信息
  doc.setFontSize(12)
  doc.text(`作者: ${pdfData.value.author}`, 20, 45)
  doc.text(`生成时间: ${new Date().toLocaleString()}`, 20, 55)
  
  // 添加内容
  doc.setFontSize(14)
  const splitContent = doc.splitTextToSize(pdfData.value.content, 170)
  doc.text(splitContent, 20, 75)
  
  // 保存PDF
  const pdfBlob = doc.output('blob')
  const pdfData_generated = {
    name: `${pdfData.value.title}.pdf`,
    blob: pdfBlob,
    timestamp: new Date().toLocaleString(),
    size: formatFileSize(pdfBlob.size)
  }
  
  generatedPDFs.value.push(pdfData_generated)
  
  // 直接下载
  doc.save(`${pdfData.value.title}.pdf`)
}

// 添加表格行
const addTableRow = () => {
  if (newTableRow.value.name && newTableRow.value.position && newTableRow.value.salary) {
    tableData.value.push({ ...newTableRow.value })
    newTableRow.value = { name: '', position: '', salary: '' }
  } else {
    alert('请填写完整信息')
  }
}

// 删除表格行
const removeTableRow = (index) => {
  tableData.value.splice(index, 1)
}

// 生成表格PDF
const generateTablePDF = () => {
  const doc = new jsPDF()
  
  // 标题
  doc.setFontSize(18)
  doc.text('员工信息表', 20, 20)
  
  // 表格头部
  doc.setFontSize(12)
  let yPosition = 40
  
  // 表格头
  doc.text('姓名', 20, yPosition)
  doc.text('职位', 70, yPosition)
  doc.text('薪资', 120, yPosition)
  
  // 画线
  doc.line(20, yPosition + 2, 180, yPosition + 2)
  
  yPosition += 10
  
  // 表格数据
  tableData.value.forEach((row) => {
    doc.text(row.name, 20, yPosition)
    doc.text(row.position, 70, yPosition)
    doc.text(row.salary, 120, yPosition)
    yPosition += 10
    
    // 如果超出页面，添加新页
    if (yPosition > 270) {
      doc.addPage()
      yPosition = 20
    }
  })
  
  const pdfBlob = doc.output('blob')
  const pdfData_generated = {
    name: '员工信息表.pdf',
    blob: pdfBlob,
    timestamp: new Date().toLocaleString(),
    size: formatFileSize(pdfBlob.size)
  }
  
  generatedPDFs.value.push(pdfData_generated)
  doc.save('员工信息表.pdf')
}

// 生成图表PDF
const generateChartPDF = async () => {
  try {
    // 先将图表转换为图片
    const canvas = await html2canvas(chartContainer.value)
    const imgData = canvas.toDataURL('image/png')
    
    const doc = new jsPDF()
    
    // 添加标题
    doc.setFontSize(18)
    doc.text('销售数据图表报告', 20, 20)
    
    // 添加图表
    doc.addImage(imgData, 'PNG', 20, 40, 170, 100)
    
    // 添加数据说明
    doc.setFontSize(12)
    let yPos = 160
    doc.text('数据说明:', 20, yPos)
    yPos += 10
    
    chartData.value.forEach((item) => {
      doc.text(`${item.label}: ${item.value}%`, 30, yPos)
      yPos += 8
    })
    
    const pdfBlob = doc.output('blob')
    const pdfData_generated = {
      name: '销售数据图表.pdf',
      blob: pdfBlob,
      timestamp: new Date().toLocaleString(),
      size: formatFileSize(pdfBlob.size)
    }
    
    generatedPDFs.value.push(pdfData_generated)
    doc.save('销售数据图表.pdf')
  } catch (error) {
    console.error('生成图表PDF失败:', error)
    alert('生成图表PDF失败，请检查控制台错误信息')
  }
}

// 生成完整报告PDF
const generateReportPDF = () => {
  const doc = new jsPDF()
  
  // 封面页
  doc.setFontSize(24)
  doc.text(reportData.value.title, 20, 50)
  
  doc.setFontSize(16)
  doc.text(`部门: ${reportData.value.department}`, 20, 80)
  doc.text(`日期: ${reportData.value.date}`, 20, 100)
  
  // 添加新页
  doc.addPage()
  
  // 内容页
  doc.setFontSize(18)
  doc.text('报告摘要', 20, 30)
  
  doc.setFontSize(12)
  const splitSummary = doc.splitTextToSize(reportData.value.summary, 170)
  doc.text(splitSummary, 20, 50)
  
  // 添加表格数据页
  doc.addPage()
  doc.setFontSize(18)
  doc.text('员工数据', 20, 30)
  
  let yPos = 50
  doc.setFontSize(12)
  doc.text('姓名', 20, yPos)
  doc.text('职位', 70, yPos)
  doc.text('薪资', 120, yPos)
  doc.line(20, yPos + 2, 180, yPos + 2)
  
  yPos += 10
  tableData.value.forEach((row) => {
    doc.text(row.name, 20, yPos)
    doc.text(row.position, 70, yPos)
    doc.text(row.salary, 120, yPos)
    yPos += 10
  })
  
  const pdfBlob = doc.output('blob')
  const pdfData_generated = {
    name: `${reportData.value.title}.pdf`,
    blob: pdfBlob,
    timestamp: new Date().toLocaleString(),
    size: formatFileSize(pdfBlob.size)
  }
  
  generatedPDFs.value.push(pdfData_generated)
  doc.save(`${reportData.value.title}.pdf`)
}

// 使用自定义设置生成PDF
const generateCustomPDF = () => {
  const doc = new jsPDF(pdfOptions.value.orientation, pdfOptions.value.unit, pdfOptions.value.format)
  
  doc.setFontSize(20)
  doc.text('自定义设置PDF', 20, 30)
  
  doc.setFontSize(12)
  doc.text(`页面方向: ${pdfOptions.value.orientation === 'portrait' ? '纵向' : '横向'}`, 20, 50)
  doc.text(`页面大小: ${pdfOptions.value.format.toUpperCase()}`, 20, 65)
  doc.text(`单位: ${pdfOptions.value.unit}`, 20, 80)
  doc.text(`生成时间: ${new Date().toLocaleString()}`, 20, 95)
  
  const pdfBlob = doc.output('blob')
  const pdfData_generated = {
    name: '自定义设置PDF.pdf',
    blob: pdfBlob,
    timestamp: new Date().toLocaleString(),
    size: formatFileSize(pdfBlob.size)
  }
  
  generatedPDFs.value.push(pdfData_generated)
  doc.save('自定义设置PDF.pdf')
}

// 下载PDF
const downloadPDF = (pdf) => {
  const url = URL.createObjectURL(pdf.blob)
  const link = document.createElement('a')
  link.href = url
  link.download = pdf.name
  link.click()
  URL.revokeObjectURL(url)
}

// 删除PDF
const removePDF = (index) => {
  generatedPDFs.value.splice(index, 1)
}

// 清空所有PDF
const clearAllPDFs = () => {
  generatedPDFs.value = []
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped>
.jspdf-demo {
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
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.table-controls {
  margin-bottom: 1rem;
}

.table-controls .form-group {
  display: flex;
  gap: 1rem;
  align-items: end;
}

.table-controls input {
  flex: 1;
}

.table-preview {
  overflow-x: auto;
  margin: 1rem 0;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

th, td {
  border: 1px solid #ddd;
  padding: 0.8rem;
  text-align: left;
}

th {
  background-color: #f8f9fa;
  font-weight: bold;
}

.chart-preview {
  background: #f8f9fa;
  padding: 2rem;
  border-radius: 8px;
  margin: 1rem 0;
}

.simple-chart {
  display: flex;
  align-items: end;
  height: 200px;
  gap: 2rem;
  justify-content: center;
  margin-top: 2rem;
}

.chart-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  max-width: 80px;
}

.bar {
  width: 60px;
  border-radius: 4px 4px 0 0;
  display: flex;
  align-items: start;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.9rem;
  padding-top: 8px;
  min-height: 30px;
}

.bar-label {
  margin-top: 8px;
  font-weight: bold;
  color: #2c3e50;
}

.pdf-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.option-group label {
  font-weight: bold;
  color: #2c3e50;
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

.pdf-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
}

.pdf-item {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pdf-info h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.pdf-info p {
  margin: 0.25rem 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.pdf-actions {
  display: flex;
  gap: 0.5rem;
}
</style>