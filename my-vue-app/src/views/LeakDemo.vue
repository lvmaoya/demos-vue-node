<template>
  <div class="leak-demo">
    <header class="hero">
      <h2>🧪 内存泄露研究 Demo</h2>
      <p>可控制造多种泄露场景，配合浏览器 DevTools 观察内存变化与回收。</p>
    </header>

    <section class="metrics">
      <div class="metric">
        <div class="label">采样状态</div>
        <div class="value" :class="{ on: sampling }">{{ sampling ? '采样中' : '已停止' }}</div>
        <div class="actions">
          <button class="btn" @click="startSampling" :disabled="sampling">开始采样</button>
          <button class="btn" @click="stopSampling" :disabled="!sampling">停止采样</button>
        </div>
      </div>

      <div class="metric">
        <div class="label">JS 堆占用</div>
        <div class="value">
          <template v-if="heapSupported">
            {{ formatMB(usedHeapBytes) }}
          </template>
          <template v-else>
            不支持 performance.memory（使用估算）
          </template>
        </div>
        <div class="sub">估算保留：{{ formatMB(estimatedHeldBytes) }}（数组 + 监听 + 节点）</div>
      </div>
    </section>

    <section class="controls">
      <h3>泄露类型</h3>
      <div class="cards">
        <div class="card">
          <h4>① 持有数组泄露（Retained allocations）</h4>
          <p>周期性分配并保留 TypedArray，持续增加堆占用。</p>
          <div class="row">
            <label>每次分配</label>
            <input type="range" min="1" max="16" v-model="allocMBPerTick"> <span>{{ allocMBPerTick }} MB</span>
          </div>
          <div class="row">
            <label>周期</label>
            <input type="range" min="100" max="2000" step="100" v-model="allocTickMs"> <span>{{ allocTickMs }} ms</span>
          </div>
          <div class="actions">
            <button class="btn" @click="startAllocationLeak" :disabled="!!allocTimer">开始泄露</button>
            <button class="btn" @click="stopAllocationLeak" :disabled="!allocTimer">停止</button>
            <button class="btn danger" @click="holders = []">释放引用（允许回收）</button>
          </div>
          <div class="stat">块数：{{ holders.length }}，保留：{{ formatMB(holderBytes) }}</div>
        </div>

        <div class="card">
          <h4>② 事件监听泄露（Listener leak）</h4>
          <p>批量添加 window.resize 监听，每个监听闭包持有 256KB 数据，不移除则持续保留。</p>
          <div class="actions">
            <button class="btn" @click="addListenerBatch">添加一批监听（50个）</button>
            <button class="btn" @click="clearListeners" :disabled="resizeHandlers.length === 0">清理监听</button>
          </div>
          <div class="stat">监听数：{{ resizeHandlers.length }}，估算保留：{{ formatMB(listenerHeldBytes) }}</div>
        </div>

        <div class="card">
          <h4>③ 脱离 DOM 节点泄露（Detached nodes）</h4>
          <p>创建临时节点并移除，但保留其引用；真实应用中常见于缓存未清理。</p>
          <div class="actions">
            <button class="btn" @click="createDetachedNodes">创建 200 个节点</button>
            <button class="btn" @click="clearDetachedNodes" :disabled="detachedNodes.length === 0">清理节点引用</button>
          </div>
          <div class="stat">节点数：{{ detachedNodes.length }}（估算 {{ formatMB(detachedHeldBytes) }}）</div>
        </div>
      </div>
    </section>

    <section class="tips">
      <h3>使用建议</h3>
      <ul>
        <li>推荐使用 Chrome，在 DevTools 的 Performance/Memory 面板中观察堆曲线。</li>
        <li>在 Memory 面板使用 "Allocation sampling" 或 "Heap snapshot" 检查保留对象。</li>
        <li>点击 “释放引用”/“清理监听”/“清理节点” 后，内存不会立刻下降，需等待 GC 或在 DevTools 触发 GC。</li>
        <li>若内存增长过快，请立即点击停止，避免页面崩溃。</li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

// 采样与堆信息
const sampling = ref(false)
const sampleTimer = ref(null)
const usedHeapBytes = ref(0)
const heapSupported = typeof performance !== 'undefined' && performance && performance.memory && typeof performance.memory.usedJSHeapSize === 'number'

function sampleOnce() {
  if (heapSupported) {
    usedHeapBytes.value = performance.memory.usedJSHeapSize
  }
}

function startSampling() {
  if (sampling.value) return
  sampling.value = true
  sampleOnce()
  sampleTimer.value = setInterval(sampleOnce, 1000)
}

function stopSampling() {
  sampling.value = false
  if (sampleTimer.value) {
    clearInterval(sampleTimer.value)
    sampleTimer.value = null
  }
}

// ① 保留数组泄露
let holders = [] // 非响应式，避免额外开销；统计时读取长度与字节数
const holderBytes = computed(() => holders.reduce((s, a) => s + (a?.byteLength || 0), 0))
const allocTimer = ref(null)
const allocMBPerTick = ref(4)
const allocTickMs = ref(500)

function startAllocationLeak() {
  if (allocTimer.value) return
  const bytesPerTick = allocMBPerTick.value * 1024 * 1024
  allocTimer.value = setInterval(() => {
    // 使用 TypedArray 生成可控大小的块
    const buf = new Uint8Array(bytesPerTick)
    // 轻度填充，避免被引擎优化为稀疏对象
    for (let i = 0; i < buf.length; i += 4096) buf[i] = (i % 256)
    holders.push(buf) // 保留引用：造成泄露
    // 采样一次，用于观察堆曲线
    sampleOnce()
  }, allocTickMs.value)
}

function stopAllocationLeak() {
  if (allocTimer.value) {
    clearInterval(allocTimer.value)
    allocTimer.value = null
  }
}

// ② 事件监听泄露：每个监听持有 256KB 数据
const resizeHandlers = ref([])
const LISTENER_BLOCK_BYTES = 256 * 1024
const listenerHeldBytes = computed(() => resizeHandlers.value.length * LISTENER_BLOCK_BYTES)

function addListenerBatch() {
  for (let i = 0; i < 50; i++) {
    const payload = new Uint8Array(LISTENER_BLOCK_BYTES)
    const handler = () => {
      // 使用闭包引用 payload，确保其被保留
      payload[0] = (payload[0] + 1) % 255
    }
    window.addEventListener('resize', handler)
    resizeHandlers.value.push(handler)
  }
  sampleOnce()
}

function clearListeners() {
  resizeHandlers.value.forEach(h => window.removeEventListener('resize', h))
  resizeHandlers.value = []
  sampleOnce()
}

// ③ 脱离 DOM 节点泄露：保留引用到已移除的节点
const detachedNodes = ref([])
const DETACHED_NODE_EST_BYTES = 8 * 1024 // 估算每节点约占用 8KB（仅用于展示）
const detachedHeldBytes = computed(() => detachedNodes.value.length * DETACHED_NODE_EST_BYTES)

function createDetachedNodes() {
  for (let i = 0; i < 200; i++) {
    const el = document.createElement('div')
    el.textContent = 'leak-node-' + (detachedNodes.value.length + i)
    el.style.cssText = 'position:absolute;left:-9999px;top:-9999px;'
    document.body.appendChild(el)
    document.body.removeChild(el) // 从 DOM 移除
    detachedNodes.value.push(el)  // 保留引用，造成泄露
  }
  sampleOnce()
}

function clearDetachedNodes() {
  detachedNodes.value = []
  sampleOnce()
}

const estimatedHeldBytes = computed(() => holderBytes.value + listenerHeldBytes.value + detachedHeldBytes.value)

function formatMB(bytes) {
  const mb = bytes / (1024 * 1024)
  return mb.toFixed(2) + ' MB'
}

onMounted(() => {
  startSampling()
})

onBeforeUnmount(() => {
  stopAllocationLeak()
  clearListeners()
  clearDetachedNodes()
  stopSampling()
  holders = []
})
</script>

<style scoped>
.leak-demo {
  padding: 24px;
  max-width: 1100px;
  margin: 0 auto;
}

.hero {
  margin-bottom: 16px;
}

.hero h2 {
  margin: 0 0 8px;
  color: var(--text-color);
}

.hero p {
  margin: 0;
  color: var(--text-muted);
}

.metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
  margin: 16px 0 24px;
}

.metric {
  background: var(--page-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 16px;
}

.metric .label { color: var(--text-muted); margin-bottom: 8px; }
.metric .value { font-size: 20px; font-weight: 600; color: var(--text-color); }
.metric .value.on { color: #2ecc71; }
.metric .sub { margin-top: 8px; color: var(--text-muted); font-size: 12px; }

.controls h3 { margin: 0 0 12px; }

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
}

.card {
  background: var(--page-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 16px;
}

.card h4 { margin: 0 0 8px; color: var(--text-color); }
.card p { margin: 0 0 12px; color: var(--text-muted); }
.row { display: flex; align-items: center; gap: 8px; margin: 8px 0; }
.row label { width: 80px; color: var(--text-muted); }
.row input[type="range"] { flex: 1; }

.actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
.btn {
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  padding: 8px 14px;
  cursor: pointer;
}
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
.btn.danger { background: #e74c3c; }
.stat { margin-top: 8px; color: var(--text-color); font-size: 13px; }

.tips { margin-top: 24px; }
.tips h3 { margin: 0 0 8px; }
.tips ul { margin: 0; padding-left: 18px; color: var(--text-muted); }
</style>