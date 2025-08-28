<template>
  <div class="layout">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <h2>🚀 Vue 演示项目</h2>
        </div>
        <nav class="nav">
          <router-link to="/" class="nav-link" :class="{ active: $route.path === '/' }">
            <span class="nav-icon">🏠</span>
            首页
          </router-link>
          <router-link to="/excel" class="nav-link" :class="{ active: $route.path === '/excel' }">
            <span class="nav-icon">📊</span>
            Excel演示
          </router-link>
          <router-link to="/html2canvas" class="nav-link" :class="{ active: $route.path === '/html2canvas' }">
            <span class="nav-icon">📸</span>
            HTML转图片
          </router-link>
          <router-link to="/jspdf" class="nav-link" :class="{ active: $route.path === '/jspdf' }">
            <span class="nav-icon">📄</span>
            PDF生成
          </router-link>
          <router-link to="/upload" class="nav-link" :class="{ active: $route.path === '/upload' }">
            <span class="nav-icon">📤</span>
            文件上传
          </router-link>
        </nav>
        <div class="header-actions">
          <button @click="toggleTheme" class="theme-toggle">
            {{ isDark ? '🌞' : '🌙' }}
          </button>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <div class="main-container">
      <!-- 侧边栏 -->
      <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
        <div class="sidebar-header">
          <button @click="toggleSidebar" class="sidebar-toggle">
            {{ sidebarCollapsed ? '→' : '←' }}
          </button>
        </div>
        <div class="sidebar-content">
          <div class="sidebar-section">
            <h3 v-if="!sidebarCollapsed">快速导航</h3>
            <div class="sidebar-links">
              <router-link to="/" class="sidebar-link" :class="{ active: $route.path === '/' }">
                <span class="sidebar-icon">🏠</span>
                <span v-if="!sidebarCollapsed" class="sidebar-text">项目首页</span>
              </router-link>
              <router-link to="/excel" class="sidebar-link" :class="{ active: $route.path === '/excel' }">
                <span class="sidebar-icon">📊</span>
                <span v-if="!sidebarCollapsed" class="sidebar-text">Excel操作</span>
              </router-link>
              <router-link to="/html2canvas" class="sidebar-link" :class="{ active: $route.path === '/html2canvas' }">
                <span class="sidebar-icon">📸</span>
                <span v-if="!sidebarCollapsed" class="sidebar-text">HTML转图片</span>
              </router-link>
              <router-link to="/jspdf" class="sidebar-link" :class="{ active: $route.path === '/jspdf' }">
                <span class="sidebar-icon">📄</span>
                <span v-if="!sidebarCollapsed" class="sidebar-text">PDF生成</span>
              </router-link>
              <router-link to="/upload" class="sidebar-link" :class="{ active: $route.path === '/upload' }">
                <span class="sidebar-icon">📤</span>
                <span v-if="!sidebarCollapsed" class="sidebar-text">文件上传</span>
              </router-link>
            </div>
          </div>
          
          <div v-if="!sidebarCollapsed" class="sidebar-section">
            <h3>功能特性</h3>
            <div class="feature-list">
              <div class="feature-item">
                <span class="feature-icon">⚡</span>
                <span class="feature-text">快速响应</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">🎨</span>
                <span class="feature-text">现代设计</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">📱</span>
                <span class="feature-text">响应式布局</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- 主内容区域 -->
      <main class="content" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
        <div class="content-wrapper">
          <!-- 面包屑导航 -->
          <div class="breadcrumb">
            <span class="breadcrumb-item">首页</span>
            <span v-if="currentPageName" class="breadcrumb-separator">></span>
            <span v-if="currentPageName" class="breadcrumb-item current">{{ currentPageName }}</span>
          </div>
          
          <!-- 页面内容 -->
          <div class="page-content">
            <router-view />
          </div>
        </div>
      </main>
    </div>

    <!-- 底部信息 -->
    <footer class="footer">
      <div class="footer-content">
        <p>&copy; 2024 Vue 演示项目 - 展示现代前端技术栈</p>
        <div class="footer-links">
          <a href="#" class="footer-link">关于项目</a>
          <a href="#" class="footer-link">技术文档</a>
          <a href="#" class="footer-link">GitHub</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'Layout',
  data() {
    return {
      sidebarCollapsed: false,
      isDark: false
    }
  },
  computed: {
    currentPageName() {
      const routeNames = {
        '/': '',
        '/excel': 'Excel演示',
        '/html2canvas': 'HTML转图片',
        '/jspdf': 'PDF生成',
        '/upload': '文件上传'
      }
      return routeNames[this.$route.path] || ''
    }
  },
  methods: {
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },
    toggleTheme() {
      this.isDark = !this.isDark
      document.documentElement.setAttribute('data-theme', this.isDark ? 'dark' : 'light')
    }
  },
  mounted() {
    // 检测系统主题偏好
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.isDark = true
      document.documentElement.setAttribute('data-theme', 'dark')
    }
  }
}
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--bg-color, #f8f9fa);
  color: var(--text-color, #2c3e50);
  transition: all 0.3s ease;
}

/* 顶部导航栏 */
.header {
  background: var(--header-bg, #ffffff);
  border-bottom: 1px solid var(--border-color, #e9ecef);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  height: 64px;
}

.logo h2 {
  margin: 0;
  color: var(--primary-color, #3498db);
  font-size: 1.5rem;
  font-weight: 600;
}

.nav {
  display: flex;
  gap: 20px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  text-decoration: none;
  color: var(--text-color, #6c757d);
  border-radius: 6px;
  transition: all 0.2s ease;
  font-weight: 500;
}

.nav-link:hover {
  background: var(--hover-bg, #f8f9fa);
  color: var(--primary-color, #3498db);
}

.nav-link.active {
  background: var(--primary-color, #3498db);
  color: white;
}

.nav-icon {
  font-size: 1.1rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.theme-toggle {
  background: none;
  border: 1px solid var(--border-color, #dee2e6);
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.2s ease;
}

.theme-toggle:hover {
  background: var(--hover-bg, #f8f9fa);
}

/* 主容器 */
.main-container {
  display: flex;
  flex: 1;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

/* 侧边栏 */
.sidebar {
  width: 280px;
  background: var(--sidebar-bg, #ffffff);
  border-right: 1px solid var(--border-color, #e9ecef);
  transition: width 0.3s ease;
  overflow: hidden;
}

.sidebar.collapsed {
  width: 60px;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid var(--border-color, #e9ecef);
}

.sidebar-toggle {
  background: none;
  border: 1px solid var(--border-color, #dee2e6);
  border-radius: 4px;
  padding: 6px 10px;
  cursor: pointer;
  font-size: 14px;
  width: 100%;
  transition: all 0.2s ease;
}

.sidebar-toggle:hover {
  background: var(--hover-bg, #f8f9fa);
}

.sidebar-content {
  padding: 20px 0;
}

.sidebar-section {
  margin-bottom: 30px;
}

.sidebar-section h3 {
  padding: 0 20px;
  margin: 0 0 15px 0;
  font-size: 0.9rem;
  color: var(--text-muted, #6c757d);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sidebar-links {
  display: flex;
  flex-direction: column;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  text-decoration: none;
  color: var(--text-color, #495057);
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.sidebar-link:hover {
  background: var(--hover-bg, #f8f9fa);
  border-left-color: var(--primary-color, #3498db);
}

.sidebar-link.active {
  background: var(--primary-light, #e3f2fd);
  color: var(--primary-color, #3498db);
  border-left-color: var(--primary-color, #3498db);
  font-weight: 600;
}

.sidebar-icon {
  font-size: 1.2rem;
  min-width: 20px;
}

.sidebar-text {
  font-size: 0.95rem;
}

.feature-list {
  padding: 0 20px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  color: var(--text-muted, #6c757d);
  font-size: 0.9rem;
}

.feature-icon {
  font-size: 1rem;
}

/* 主内容区域 */
.content {
  flex: 1;
  background: var(--content-bg, #ffffff);
  transition: margin-left 0.3s ease;
}

.content-wrapper {
  padding: 24px;
  min-height: calc(100vh - 64px - 60px); /* 减去header和footer高度 */
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color, #e9ecef);
}

.breadcrumb-item {
  color: var(--text-muted, #6c757d);
  font-size: 0.9rem;
}

.breadcrumb-item.current {
  color: var(--primary-color, #3498db);
  font-weight: 600;
}

.breadcrumb-separator {
  color: var(--text-muted, #6c757d);
}

.page-content {
  background: var(--page-bg, #ffffff);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
}

/* 底部 */
.footer {
  background: var(--footer-bg, #f8f9fa);
  border-top: 1px solid var(--border-color, #e9ecef);
  padding: 20px 0;
  margin-top: auto;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-content p {
  margin: 0;
  color: var(--text-muted, #6c757d);
  font-size: 0.9rem;
}

.footer-links {
  display: flex;
  gap: 20px;
}

.footer-link {
  color: var(--text-muted, #6c757d);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: var(--primary-color, #3498db);
}

/* 暗色主题 */
[data-theme="dark"] {
  --bg-color: #1a1a1a;
  --text-color: #e9ecef;
  --text-muted: #adb5bd;
  --header-bg: #2d3748;
  --sidebar-bg: #2d3748;
  --content-bg: #1a1a1a;
  --page-bg: #2d3748;
  --footer-bg: #2d3748;
  --border-color: #4a5568;
  --hover-bg: #4a5568;
  --primary-light: #2d3748;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .main-container {
    max-width: 100%;
  }
  
  .header-content {
    padding: 0 16px;
  }
  
  .content-wrapper {
    padding: 20px;
  }
}

@media (max-width: 768px) {
  .nav {
    display: none;
  }
  
  .sidebar {
    position: fixed;
    left: -280px;
    top: 64px;
    height: calc(100vh - 64px);
    z-index: 999;
    transition: left 0.3s ease;
  }
  
  .sidebar.show {
    left: 0;
  }
  
  .content {
    width: 100%;
  }
  
  .footer-content {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .header-content {
    padding: 0 12px;
  }
  
  .logo h2 {
    font-size: 1.3rem;
  }
  
  .content-wrapper {
    padding: 16px;
  }
  
  .breadcrumb {
    margin-bottom: 16px;
  }
}
</style>