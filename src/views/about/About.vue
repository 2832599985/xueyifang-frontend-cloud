<template>
  <div class="about-page">
    <div class="container">
      <h1>关于学艺坊</h1>

      <el-card class="info-card">
        <h2>项目简介</h2>
        <p>
          学艺坊是一个基于Spring Boot + Vue 3的校园技能服务平台，
          旨在帮助大学生将学习成果（编程、设计、翻译等）安全地变现。
        </p>
      </el-card>

      <el-card class="info-card">
        <h2>技术架构</h2>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="前端框架">
            Vue 3.3.4 + TypeScript + Composition API
          </el-descriptions-item>
          <el-descriptions-item label="构建工具">
            Vite 4.4.9
          </el-descriptions-item>
          <el-descriptions-item label="UI组件库">
            Element Plus 2.3.14
          </el-descriptions-item>
          <el-descriptions-item label="状态管理">
            Pinia 2.1.6
          </el-descriptions-item>
          <el-descriptions-item label="路由管理">
            Vue Router 4.2.4
          </el-descriptions-item>
          <el-descriptions-item label="HTTP客户端">
            Axios 1.5.0
          </el-descriptions-item>
          <el-descriptions-item label="后端框架">
            Spring Boot 2.7.2 + MyBatis Plus 3.5.2
          </el-descriptions-item>
          <el-descriptions-item label="数据库">
            MySQL 5.7/8.0 + Redis 6.0+
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card class="info-card">
        <h2>开发说明</h2>
        <ul>
          <li>本项目采用前后端分离架构</li>
          <li>前端开发服务器运行在端口 <code>3000</code></li>
          <li>后端API服务运行在端口 <code>8080</code></li>
          <li>通过 <code>/backend</code> 代理访问后端接口</li>
          <li>API文档地址：<code>http://localhost:8080/api/doc.html</code></li>
        </ul>
      </el-card>

      <div class="back-button">
        <el-button type="primary" @click="goHome">
          返回首页
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
</script>

<style scoped lang="scss">
.about-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 40px 20px;
}

.container {
  max-width: 900px;
  margin: 0 auto;

  h1 {
    font-size: 36px;
    text-align: center;
    margin-bottom: 40px;
    color: #333;
  }
}

.info-card {
  margin-bottom: 30px;

  h2 {
    font-size: 24px;
    margin-bottom: 20px;
    color: #409eff;
  }

  p {
    font-size: 16px;
    line-height: 1.8;
    color: #666;
  }

  ul {
    list-style: none;
    padding: 0;

    li {
      font-size: 16px;
      line-height: 2;
      color: #666;
      padding-left: 20px;
      position: relative;

      &::before {
        content: '•';
        position: absolute;
        left: 0;
        color: #409eff;
        font-weight: bold;
      }

      code {
        background: #f5f7fa;
        padding: 2px 8px;
        border-radius: 3px;
        color: #e96900;
        font-family: 'Courier New', monospace;
      }
    }
  }
}

.back-button {
  text-align: center;
  margin-top: 40px;
}
</style>
