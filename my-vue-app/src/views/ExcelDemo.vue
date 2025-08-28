<template>
  <div class="excel-demo">
    <div class="header">
      <router-link to="/" class="back-btn">← 返回首页</router-link>
      <h1>📊 Excel 操作演示</h1>
    </div>

    <div class="demo-section">
      <h2>1. 创建并导出 Excel 文件</h2>
      <div class="form-group">
        <label>添加数据到表格：</label>
        <input v-model="newRow.name" placeholder="姓名" />
        <input v-model="newRow.age" placeholder="年龄" type="number" />
        <input v-model="newRow.city" placeholder="城市" />
        <button @click="addRow" class="btn btn-primary">添加行</button>
      </div>
      
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>姓名</th>
              <th>年龄</th>
              <th>城市</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in tableData" :key="index">
              <td>{{ row.name }}</td>
              <td>{{ row.age }}</td>
              <td>{{ row.city }}</td>
              <td>
                <button @click="removeRow(index)" class="btn btn-danger btn-sm">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <button @click="exportToExcel" class="btn btn-success">导出为 Excel 文件</button>
    </div>

    <div class="demo-section">
      <h2>2. 读取 Excel 文件</h2>
      <input type="file" @change="handleFileUpload" accept=".xlsx,.xls" class="file-input" />
      
      <div v-if="uploadedData.length > 0" class="uploaded-data">
        <h3>上传的文件内容：</h3>
        <table>
          <thead>
            <tr>
              <th v-for="(header, index) in uploadedHeaders" :key="index">{{ header }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in uploadedData" :key="index">
              <td v-for="(cell, cellIndex) in row" :key="cellIndex">{{ cell }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="demo-section">
      <h2>3. 生成示例报表</h2>
      <button @click="generateReport" class="btn btn-info">生成销售报表</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import * as XLSX from 'xlsx'

// 响应式数据
const tableData = ref([
  { name: '张三', age: 25, city: '北京' },
  { name: '李四', age: 30, city: '上海' },
  { name: '王五', age: 28, city: '广州' }
])

const newRow = ref({
  name: '',
  age: '',
  city: ''
})

const uploadedData = ref([])
const uploadedHeaders = ref([])

// 添加行
const addRow = () => {
  if (newRow.value.name && newRow.value.age && newRow.value.city) {
    tableData.value.push({ ...newRow.value })
    newRow.value = { name: '', age: '', city: '' }
  } else {
    alert('请填写完整信息')
  }
}

// 删除行
const removeRow = (index) => {
  tableData.value.splice(index, 1)
}

// 导出到Excel
const exportToExcel = () => {
  const ws = XLSX.utils.json_to_sheet(tableData.value)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '用户数据')
  XLSX.writeFile(wb, '用户数据.xlsx')
}

// 处理文件上传
const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result)
    const workbook = XLSX.read(data, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
    
    if (jsonData.length > 0) {
      uploadedHeaders.value = jsonData[0]
      uploadedData.value = jsonData.slice(1)
    }
  }
  reader.readAsArrayBuffer(file)
}

// 生成报表
const generateReport = () => {
  const reportData = [
    { 月份: '1月', 销售额: 50000, 订单数: 120, 客户数: 80 },
    { 月份: '2月', 销售额: 65000, 订单数: 150, 客户数: 95 },
    { 月份: '3月', 销售额: 72000, 订单数: 180, 客户数: 110 },
    { 月份: '4月', 销售额: 58000, 订单数: 140, 客户数: 88 },
    { 月份: '5月', 销售额: 81000, 订单数: 200, 客户数: 125 },
    { 月份: '6月', 销售额: 95000, 订单数: 230, 客户数: 145 }
  ]

  const ws = XLSX.utils.json_to_sheet(reportData)
  
  // 设置列宽
  ws['!cols'] = [
    { wch: 10 }, // 月份
    { wch: 15 }, // 销售额
    { wch: 10 }, // 订单数
    { wch: 10 }  // 客户数
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '销售报表')
  XLSX.writeFile(wb, '销售报表.xlsx')
}
</script>

<style scoped>
.excel-demo {
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
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: center;
}

.form-group input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  flex: 1;
}

.table-container {
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

.btn {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  margin: 0.25rem;
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
}

.file-input {
  margin: 1rem 0;
  padding: 0.5rem;
  border: 2px dashed #ddd;
  border-radius: 5px;
  width: 100%;
}

.uploaded-data {
  margin-top: 1rem;
}

.uploaded-data h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
}
</style>