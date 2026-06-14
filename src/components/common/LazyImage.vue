<script setup lang="ts">
/**
 * 懒加载图片组件
 *
 * 功能：
 * - 图片懒加载（进入视口才加载）
 * - 加载中显示骨架屏占位
 * - 加载失败显示默认图片
 * - 支持自定义宽高和圆角
 *
 * @example
 * <LazyImage
 *   :src="service.coverImage"
 *   :width="200"
 *   :height="150"
 *   :radius="8"
 *   alt="服务封面"
 * />
 */
import { ref, onMounted, onUnmounted, computed } from 'vue'

interface Props {
  /** 图片地址 */
  src?: string | null
  /** 图片宽度 */
  width?: number | string
  /** 图片高度 */
  height?: number | string
  /** 圆角大小 */
  radius?: number | string
  /** 替代文本 */
  alt?: string
  /** 加载失败时的默认图片 */
  fallback?: string
  /** 是否启用懒加载 */
  lazy?: boolean
  /** 对象适应方式 */
  fit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down'
}

const props = withDefaults(defineProps<Props>(), {
  src: '',
  width: '100%',
  height: 'auto',
  radius: 0,
  alt: '图片',
  fallback: '',
  lazy: true,
  fit: 'cover'
})

// 状态
const loading = ref(true)
const error = ref(false)
const imageRef = ref<HTMLDivElement | null>(null)
const isInView = ref(!props.lazy) // 非懒加载模式直接设为 true

// 计算当前显示的图片地址
const currentSrc = computed(() => {
  if (error.value && props.fallback) {
    return props.fallback
  }
  return props.src || ''
})

// 样式计算
const containerStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
  borderRadius: typeof props.radius === 'number' ? `${props.radius}px` : props.radius
}))

const imageStyle = computed(() => ({
  objectFit: props.fit,
  borderRadius: typeof props.radius === 'number' ? `${props.radius}px` : props.radius
}))

// 图片加载完成
function handleLoad() {
  loading.value = false
  error.value = false
}

// 图片加载失败
function handleError() {
  loading.value = false
  error.value = true
}

// IntersectionObserver 懒加载
let observer: IntersectionObserver | null = null

onMounted(() => {
  if (!props.lazy || !imageRef.value) {
    isInView.value = true
    return
  }

  // 创建观察器
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          isInView.value = true
          // 进入视口后停止观察
          observer?.disconnect()
        }
      })
    },
    {
      rootMargin: '50px', // 提前 50px 开始加载
      threshold: 0.1
    }
  )

  observer.observe(imageRef.value)
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<template>
  <div
    ref="imageRef"
    class="lazy-image-container"
    :style="containerStyle"
  >
    <!-- 骨架屏占位 -->
    <div
      v-if="loading && isInView"
      class="lazy-image-skeleton"
    >
      <div class="skeleton-animation" />
    </div>

    <!-- 未进入视口时的占位 -->
    <div
      v-if="!isInView"
      class="lazy-image-placeholder"
    >
      <svg
        class="placeholder-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </svg>
    </div>

    <!-- 实际图片 -->
    <img
      v-if="isInView && currentSrc"
      :src="currentSrc"
      :alt="alt"
      :style="imageStyle"
      class="lazy-image"
      :class="{ 'lazy-image-loaded': !loading && !error }"
      @load="handleLoad"
      @error="handleError"
    >

    <!-- 无图片时的占位 -->
    <div
      v-if="!currentSrc || (error && !fallback)"
      class="lazy-image-empty"
    >
      <svg
        class="empty-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </svg>
      <span class="empty-text">暂无图片</span>
    </div>
  </div>
</template>

<style scoped>
.lazy-image-container {
  position: relative;
  overflow: hidden;
  background-color: #f5f7fa;
}

.lazy-image-skeleton {
  position: absolute;
  inset: 0;
  background-color: #e4e7ed;
  overflow: hidden;
}

.skeleton-animation {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.4) 50%,
    transparent 100%
  );
  animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.lazy-image-placeholder,
.lazy-image-empty {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  color: #c0c4cc;
}

.placeholder-icon,
.empty-icon {
  width: 32px;
  height: 32px;
  stroke-width: 1.5;
}

.empty-text {
  margin-top: 8px;
  font-size: 12px;
}

.lazy-image {
  width: 100%;
  height: 100%;
  display: block;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.lazy-image-loaded {
  opacity: 1;
}
</style>
