<template>
  <div class="home">
    <div class="demo-cards">
      <div class="card">
        <h3>📊 Excel 操作演示</h3>
        <p>使用 xlsx 插件进行 Excel 文件的读取、写入和导出</p>
        <router-link to="/excel" class="btn">查看演示</router-link>
      </div>
      
      <div class="card">
        <h3>📸 HTML转图片演示</h3>
        <p>使用 html2canvas 插件将 HTML 元素转换为图片</p>
        <router-link to="/html2canvas" class="btn">查看演示</router-link>
      </div>
      
      <div class="card">
        <h3>📄 PDF生成演示</h3>
        <p>使用 jsPDF 插件生成和导出 PDF 文档</p>
        <router-link to="/jspdf" class="btn">查看演示</router-link>
      </div>
      
      <div class="card">
        <h3>📤 文件上传演示</h3>
        <p>多种文件上传方案：单文件、多文件、拖拽上传等</p>
        <router-link to="/upload" class="btn">查看演示</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
// 首页不需要额外的逻辑
</script>

<style scoped>
.home {
  /* padding: 2rem; */
  text-align: center;
  background: linear-gradient(135deg, var(--bg-color) 0%, var(--page-bg) 100%);
  min-height: 100vh;
}

h1 {
  color: var(--text-color);
  margin-bottom: 1rem;
  font-size: 2.5rem;
  font-weight: 700;
}

.home > p {
  color: var(--text-muted);
  font-size: 1.2rem;
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.demo-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, 320px);
  gap: 2rem;
  margin-top: 2rem;
  max-width: none;
  justify-content: center;
}

.card {
  background: var(--page-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  padding: 2rem;
  box-shadow: var(--shadow-sm);
  transition: var(--transition);
  position: relative;
  overflow: hidden;
  height: 280px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  text-align: center;
}

.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-lg);
}

.card:hover::before {
  transform: scaleX(1);
}

.card h3 {
  color: var(--text-color);
  margin-bottom: 1rem;
  font-size: 1.4rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.card p {
  color: var(--text-muted);
  margin-bottom: 2rem;
  line-height: 1.6;
  font-size: 1rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-color);
  color: white;
  padding: 0.8rem 2rem;
  text-decoration: none;
  border-radius: var(--border-radius);
  transition: var(--transition);
  font-weight: 500;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s ease;
}

.btn:hover::before {
  left: 100%;
}

.btn:hover {
  background: #2980b9;
  transform: translateY(-2px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .home {
    /* padding: 1rem; */
  }
  
  .demo-cards {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    margin-top: 2rem;
    justify-content: stretch;
  }
  
  .card {
    height: auto;
    min-height: 200px;
  }
  
  h1 {
    font-size: 2rem;
  }
  
  .home > p {
    font-size: 1.1rem;
  }
}

@media (min-width: 769px) and (max-width: 1200px) {
  .demo-cards {
    grid-template-columns: repeat(auto-fill, 300px);
  }
  
  .card {
    height: 260px;
  }
}

@media (min-width: 1201px) {
  .demo-cards {
    grid-template-columns: repeat(auto-fill, 320px);
  }
}
</style>