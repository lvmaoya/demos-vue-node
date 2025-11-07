<template>
  <div
    class="auto-scroll-list"
    :class="[directionClass, props.heavyPaint ? 'heavy-paint' : '']"
    :style="containerStyle"
    @mouseenter="pause"
    @mouseleave="resume"
  >
    <div class="viewport" ref="viewportRef" @wheel.prevent.stop="onWheel">
      <ul
        class="list"
        :style="listStyle"
        ref="listRef"
        @transitionend="onTransitionEnd"
      >
        <!-- 双份渲染，避免重排带来的回弹 -->
        <li v-for="(item, idx) in renderItems" :key="idx" class="item">
          <slot name="item" :item="item" :index="idx">{{ item }}</slot>
        </li>
      </ul>
    </div>
  </div>
  
  <!-- 提示文案：悬停暂停 -->
  <div class="hint">悬停暂停 · 每2秒滚动一次</div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'

  const props = defineProps({
    items: {
      type: Array,
      default: () => Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`)
    },
    direction: {
      type: String,
      default: 'vertical', // 'vertical' | 'horizontal'
      validator: v => ['vertical', 'horizontal'].includes(v)
    },
    mode: {
      type: String,
      default: 'continuous', // 'step' | 'continuous'
      validator: v => ['step', 'continuous'].includes(v)
    },
    heavyPaint: {
      type: Boolean,
      default: false // 为演示强制重绘：禁用transform、使用left/top并叠加滤镜
    },
    interval: {
      type: Number,
      default: 2000
    },
    transitionMs: {
      type: Number,
      default: 400
    },
    timing: {
      type: String,
      default: 'linear' // 更平滑的线性过渡
    }
  })

const listRef = ref(null)
const viewportRef = ref(null)
const timer = ref(null)
const paused = ref(false)
const noTransition = ref(false)
const offsetPx = ref(0) // 累计偏移量（始终为正或负，取决于方向）
const stepPx = ref(0)
const isTransitioning = ref(false)
const lastDirection = ref('forward') // 'forward' | 'backward'
const currentSign = ref(-1) // transform方向：forward为-1（向上/向左），backward为+1（向下/向右）
const rafId = ref(0)
const lastTs = ref(0)
const speedPxPerSec = ref(0)
const paintHue = ref(0)

const workingItems = ref([...props.items])
const renderItems = computed(() => [...workingItems.value, ...workingItems.value])
const totalSpan = computed(() => stepPx.value * workingItems.value.length)

const directionClass = computed(() => props.direction === 'horizontal' ? 'horizontal' : 'vertical')

const listStyle = computed(() => {
  const span = totalSpan.value || 1
  const raw = props.mode === 'continuous' ? (offsetPx.value % span) : offsetPx.value
  const delta = (currentSign.value === -1) ? -raw : raw
  const transform = props.heavyPaint ? 'none' : (
    props.direction === 'horizontal'
      ? `translateX(${delta}px)`
      : `translateY(${delta}px)`
  )
  const transitionNeeded = props.mode === 'step' && !noTransition.value
  const transition = transitionNeeded ? `transform ${props.transitionMs}ms ${props.timing}` : 'none'
  const posProp = props.direction === 'horizontal' ? 'left' : 'top'
  const posStyle = props.heavyPaint ? { position: 'relative', [posProp]: `${delta}px` } : {}
  return { transform, transition, willChange: 'transform', ...posStyle }
})

const containerStyle = computed(() => {
  return props.heavyPaint ? { '--paintHue': `${paintHue.value}deg` } : {}
})

function computeStep() {
  nextTick(() => {
    const list = listRef.value
    if (!list || list.children.length === 0) return
    const first = list.children[0]
    const rect = first.getBoundingClientRect()
    stepPx.value = props.direction === 'horizontal' ? rect.width : rect.height
    // 连续模式下，根据 interval 推导每秒速度：每 interval 滚动一个 item
    if (props.mode === 'continuous') {
      const sec = Math.max(props.interval, 16) / 1000
      speedPxPerSec.value = stepPx.value / sec
    }
  })
}

function moveOnce() {
  if (paused.value || isTransitioning.value) return
  if (!stepPx.value) computeStep()
  lastDirection.value = 'forward'
  currentSign.value = -1
  noTransition.value = false
  offsetPx.value += stepPx.value
  isTransitioning.value = true
}

function movePrev() {
  if (paused.value || isTransitioning.value) return
  if (!stepPx.value) computeStep()
  lastDirection.value = 'backward'
  currentSign.value = 1
  noTransition.value = false
  offsetPx.value += stepPx.value
  isTransitioning.value = true
}

function onTransitionEnd() {
  // 使用累计偏移 + 双份渲染，不再重排数据，避免回弹
  isTransitioning.value = false
  if (!stepPx.value) return
  const span = totalSpan.value
  if (lastDirection.value === 'forward') {
    // forward方向：偏移累积到超过一套长度则回绕
    if (offsetPx.value >= span) {
      noTransition.value = true
      offsetPx.value -= span
      void listRef.value?.offsetHeight
      noTransition.value = false
    }
  } else {
    // backward方向：偏移累积到负一套长度则回绕到正向区间
    if (offsetPx.value >= span) {
      noTransition.value = true
      offsetPx.value -= span
      void listRef.value?.offsetHeight
      noTransition.value = false
    }
  }
}

function start() {
  stop()
  if (props.mode === 'continuous') {
    // 连续模式使用 RAF，无过渡
    noTransition.value = true
    lastTs.value = performance.now()
    rafId.value = requestAnimationFrame(loop)
  } else {
    // 步进模式使用定时器
    noTransition.value = false
    timer.value = setInterval(moveOnce, props.interval)
  }
}

function stop() {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
  if (rafId.value) {
    cancelAnimationFrame(rafId.value)
    rafId.value = 0
  }
}

function pause() {
  paused.value = true
  stop()
}

function resume() {
  paused.value = false
  start()
}

function onWheel(e) {
  const deltaPrimary = props.direction === 'horizontal' ? (e.deltaX || e.deltaY) : e.deltaY
  if (props.mode === 'continuous') {
    // 连续模式：通过滚轮切换方向
    currentSign.value = deltaPrimary > 0 ? -1 : 1
  } else {
    // 步进模式：滚一项
    if (deltaPrimary > 0) moveOnce()
    else if (deltaPrimary < 0) movePrev()
  }
}

function loop(ts) {
  if (paused.value) {
    rafId.value = requestAnimationFrame(loop)
    lastTs.value = ts
    return
  }
  const dt = Math.max(0, ts - lastTs.value) / 1000
  lastTs.value = ts
  // 累计位移
  const delta = speedPxPerSec.value * dt
  offsetPx.value += delta
  // 重绘演示：滚动时不断改变滤镜色相
  if (props.heavyPaint) {
    paintHue.value = (paintHue.value + dt * 120) % 360
  }
  // 防止数字过大，进行适当压缩（不影响视觉，因为使用 % span）
  const span = totalSpan.value || 1
  if (offsetPx.value > span * 1000) {
    offsetPx.value = offsetPx.value % span
  }
  rafId.value = requestAnimationFrame(loop)
}

onMounted(() => {
  computeStep()
  start()
})

onBeforeUnmount(() => {
  stop()
})

watch(() => props.items, (val) => {
  workingItems.value = [...val]
  computeStep()
})
</script>

<style scoped>
.auto-scroll-list {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.viewport {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
}

.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid; /* 改用 Grid 布局 */
  grid-auto-flow: row; /* 默认纵向排布 */
}

.horizontal .list {
  grid-auto-flow: column; /* 横向排布 */
}

.item {
  /* 固定尺寸以便计算步长 */
  min-height: 44px;
  min-width: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  box-sizing: border-box;
  color: var(--text-color);
  background: var(--page-bg);
  border: 1px solid var(--border-color);
}

/* 让相邻项区分更清晰 */
.item:nth-child(odd) {
  background: rgba(0, 0, 0, 0.06);
}

.hint {
  margin-top: 8px;
  color: var(--text-muted);
  font-size: 12px;
}

/* 重绘演示模式：对每帧应用色相旋转滤镜以触发重绘 */
.heavy-paint .item {
  filter: hue-rotate(var(--paintHue, 0deg));
}
</style>