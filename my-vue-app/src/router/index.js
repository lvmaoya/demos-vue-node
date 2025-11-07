import { createRouter, createWebHistory } from 'vue-router'
// 首页保持同步加载，因为是首屏必需的
import Home from '../views/Home.vue'

// 路由懒加载配置
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/excel',
    name: 'ExcelDemo',
    // 懒加载：只有访问时才加载组件
    component: () => import('../views/ExcelDemo.vue')
  },
  {
    path: '/html2canvas',
    name: 'Html2CanvasDemo',
    // 懒加载：只有访问时才加载组件
    component: () => import('../views/Html2CanvasDemo.vue')
  },
  {
    path: '/jspdf',
    name: 'JsPdfDemo',
    // 懒加载：只有访问时才加载组件
    component: () => import('../views/JsPdfDemo.vue')
  },
  {
    path: '/upload',
    name: 'FileUploadDemo',
    // 懒加载：只有访问时才加载组件
    component: () => import('../views/FileUploadDemo.vue')
  },
  {
    path: '/scroll-demo',
    name: 'ScrollDemo',
    // 懒加载：只有访问时才加载组件
    component: () => import('../views/ScrollDemo.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router