<template>
  <div class="not-found-page">
    <div class="content">
      <div class="error-code">404</div>
      <h1 class="title">页面未找到</h1>
      <p class="description">抱歉，您访问的页面不存在</p>
      <div class="actions">
        <el-button type="primary" size="large" @click="goHome">
          返回首页
        </el-button>
        <el-button size="large" @click="goBack">
          返回上一页
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.back()
}
</script>

<style scoped lang="scss">
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.content {
  text-align: center;
  padding: 40px;
}

.error-code {
  font-size: 120px;
  font-weight: 700;
  margin-bottom: 20px;
  opacity: 0.8;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.title {
  font-size: 36px;
  margin-bottom: 20px;
}

.description {
  font-size: 18px;
  margin-bottom: 40px;
  opacity: 0.9;
}

.actions {
  display: flex;
  gap: 20px;
  justify-content: center;
}
</style>
