<template>
  <div class="scroll-demo">
    <h2>大屏 · 无限列表滚动演示</h2>
    
    <!-- 顶部三块：左右滚动 -->
    <div class="top-row">
      <div class="block" v-for="n in 3" :key="'top-'+n">
        <AutoScrollList :items="items" direction="horizontal" mode="continuous" :interval="2000" />
      </div>
    </div>

    <!-- 底部六块：上下滚动（两行×三列） -->
    <div class="bottom-grid">
      <div class="block" v-for="n in 6" :key="'bottom-'+n">
        <AutoScrollList :items="items" direction="vertical" mode="continuous" :interval="2000" :heavyPaint="n === 6" />
      </div>
    </div>
  </div>
</template>

<script setup>
import AutoScrollList from '../components/AutoScrollList.vue'

// 统一的20项数据
const items = Array.from({ length: 20 }, (_, i) => `项目 ${i + 1}`)
</script>

<style scoped>
.scroll-demo {
  min-height: 100vh;
  padding: 24px;
  background: linear-gradient(135deg, var(--bg-color) 0%, var(--page-bg) 100%);
  color: var(--text-color);
}

h2 {
  margin: 0 0 16px;
  font-size: 22px;
  font-weight: 600;
}

.top-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.bottom-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 220px; /* 两行 */
  gap: 16px;
}

.block {
  background: var(--page-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  height: 160px; /* 顶部块高度默认 */
}

/* 底部块更高一些 */
.bottom-grid .block {
  height: 220px;
}

/* 让滚动列表在块内占满空间 */
.block .auto-scroll-list,
.block .viewport {
  width: 100%;
  height: 100%;
}

/* 响应式优化 */
@media (max-width: 1024px) {
  .top-row,
  .bottom-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .top-row,
  .bottom-grid {
    grid-template-columns: 1fr;
  }
}
</style>