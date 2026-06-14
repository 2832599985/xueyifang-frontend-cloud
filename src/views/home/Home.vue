<template>
  <div class="home-page">
    <div class="hero">
      <h1 class="title">欢迎来到学艺坊</h1>
      <p class="subtitle">校园技能服务与交易平台</p>
      <div class="description">
        <p>这是一个帮助大学生将学习成果变现的安全平台</p>
        <p>编程、设计、翻译等技能服务，都能在这里找到</p>
      </div>
      <div class="actions">
        <el-button type="primary" size="large" @click="goServices" class="primary-btn">
          <el-icon><Shop /></el-icon>
          浏览服务
        </el-button>
        <el-button plain size="large" @click="goAbout" class="secondary-btn">
          了解更多
        </el-button>
      </div>
    </div>

    <div class="features">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="8" :md="8">
          <el-card shadow="hover">
            <template #header>
              <div class="feature-header">
                <el-icon :size="30" color="#4f46e5"><Shop /></el-icon>
                <span>技能服务</span>
              </div>
            </template>
            <p>发布和浏览各类技能服务</p>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="8" :md="8">
          <el-card shadow="hover">
            <template #header>
              <div class="feature-header">
                <el-icon :size="30" color="#4f46e5"><TrendCharts /></el-icon>
                <span>安全交易</span>
              </div>
            </template>
            <p>托管支付，保障双方权益</p>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="8" :md="8">
          <el-card shadow="hover">
            <template #header>
              <div class="feature-header">
                <el-icon :size="30" color="#4f46e5"><ChatDotRound /></el-icon>
                <span>即时沟通</span>
              </div>
            </template>
            <p>实时聊天，快速对接需求</p>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- Featured Services Section -->
    <div class="featured-services" v-if="featuredServices.length > 0">
      <div class="section-header">
        <h2>精选服务</h2>
        <p class="section-subtitle">发现热门的校园技能服务</p>
      </div>

      <el-row :gutter="20" v-loading="servicesLoading">
        <el-col
          v-for="service in featuredServices"
          :key="service.id"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
        >
          <el-card shadow="hover" class="service-card" @click="goToServiceDetail(service.id)">
            <div class="service-image-wrapper">
              <LazyImage
                :src="buildImageUrl(service.coverImage)"
                :alt="service.serviceTitle"
                :height="160"
                :radius="0"
                fit="cover"
                class="service-image"
              />
              <div class="service-badge" v-if="service.tagName">
                {{ service.tagName }}
              </div>
            </div>
            <div class="service-content">
              <h4 class="service-title">{{ service.serviceTitle }}</h4>
              <div class="service-footer">
                <span class="price">{{ formatPrice(service.price) }}</span>
                <span class="stats">
                  <el-icon><View /></el-icon>
                  {{ service.viewCount || 0 }}
                </span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <div class="section-actions">
        <el-button type="primary" size="large" @click="goServices" class="view-more-btn">
          查看更多服务
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
    </div>

    <div class="tech-stack">
      <h2>技术栈</h2>
      <div class="stack-list">
        <el-tag v-for="tech in techStack" :key="tech" size="large">
          {{ tech }}
        </el-tag>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Shop,
  TrendCharts,
  ChatDotRound,
  View,
  ArrowRight
} from '@element-plus/icons-vue'
import { getRecommendedServices, buildImageUrl } from '@/api/service'
import type { ServiceListItem } from '@/types/service'
import { formatPrice } from '@/types/service'
import { useAppStore } from '@/stores/app'
import LazyImage from '@/components/common/LazyImage.vue'

const router = useRouter()
const appStore = useAppStore()

const techStack = ref([
  'Vue 3',
  'TypeScript',
  'Vite',
  'Element Plus',
  'Pinia',
  'Vue Router',
  'Axios',
  'Spring Boot',
  'MyBatis Plus',
  'MySQL',
  'Redis'
])

// Service data
const featuredServices = ref<ServiceListItem[]>([])
const servicesLoading = ref(false)

// Fetch featured services
const fetchFeaturedServices = async () => {
  servicesLoading.value = true
  try {
    featuredServices.value = await getRecommendedServices(6)
  } catch (error: any) {
    console.error('Failed to fetch featured services:', error)
    // Don't show error message on homepage, just log it
  } finally {
    servicesLoading.value = false
  }
}

const goAbout = () => {
  router.push('/about')
}

const goServices = () => {
  router.push('/services')
}

const goToServiceDetail = (id: number) => {
  router.push(`/services/${id}`)
}

// Lifecycle
onMounted(() => {
  fetchFeaturedServices()
})
</script>

<style scoped lang="scss">
.home-page {
  min-height: 100vh;
  background: #f9fafb; // Gray-50 as per DESIGN_GUIDELINES
}

.hero {
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); // Indigo gradient
  color: #fff;
  text-align: center;
  padding: 80px 20px 60px;

  .title {
    font-size: 48px;
    font-weight: 700;
    margin-bottom: 20px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  }

  .subtitle {
    font-size: 24px;
    margin-bottom: 30px;
    opacity: 0.95;
  }

  .description {
    font-size: 18px;
    margin-bottom: 40px;
    opacity: 0.9;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;

    p {
      margin: 10px 0;
    }
  }

  .actions {
    display: flex;
    gap: 20px;
    justify-content: center;
    flex-wrap: wrap;

    .primary-btn {
      background: white;
      color: #4f46e5;
      border: none;
      font-weight: 600;
      padding: 0 32px;
      height: 48px;

      &:hover {
        background: #f9fafb;
        color: #4338ca;
      }
    }

    .secondary-btn {
      background: transparent;
      color: white;
      border: 2px solid white;
      font-weight: 500;
      height: 48px;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: white;
        color: white;
      }
    }
  }
}

.features {
  max-width: 1200px;
  margin: -40px auto 60px;
  padding: 0 20px;
  position: relative;
  z-index: 1;

  .feature-header {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }

  :deep(.el-card) {
    background: white;
    border: none;
    border-radius: 16px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    margin-bottom: 20px;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 25px 30px -5px rgba(0, 0, 0, 0.15);
    }

    .el-card__header {
      border-bottom: 1px solid #e5e7eb;
      padding: 20px;
    }

    .el-card__body {
      padding: 20px;
      text-align: center;
      font-size: 16px;
      color: #4b5563;
      min-height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

// Featured Services Section
.featured-services {
  max-width: 1200px;
  margin: 60px auto;
  padding: 0 20px;

  .section-header {
    text-align: center;
    margin-bottom: 40px;

    h2 {
      font-size: 32px;
      font-weight: bold;
      color: #303133;
      margin-bottom: 12px;
    }

    .section-subtitle {
      font-size: 16px;
      color: #4b5563;
    }
  }

  .service-card {
    cursor: pointer;
    border-radius: 16px;
    border: none;
    overflow: hidden;
    transition: all 0.3s ease;
    height: 100%;
    margin-bottom: 20px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15);

      .service-image {
        transform: scale(1.05);
      }

      .service-title {
        color: #4f46e5;
      }
    }

    :deep(.el-card__body) {
      padding: 0;
    }

    .service-image-wrapper {
      position: relative;
      width: 100%;
      height: 160px;
      overflow: hidden;
      background: #f3f4f6;

      .service-image {
        width: 100%;
        height: 100%;
        transition: transform 0.3s ease;
      }

      .image-error {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        background: #f3f4f6;
        color: #9ca3af;
      }

      .service-badge {
        position: absolute;
        top: 12px;
        left: 12px;
        padding: 4px 12px;
        background: rgba(79, 70, 229, 0.9);
        color: white;
        font-size: 12px;
        border-radius: 12px;
        backdrop-filter: blur(4px);
      }
    }

    .service-content {
      padding: 16px;

      .service-title {
        margin: 0 0 12px;
        font-size: 16px;
        font-weight: 600;
        color: #303133;
        line-height: 1.4;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        transition: color 0.3s;
        min-height: 44px;
      }

      .service-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .price {
          font-size: 18px;
          font-weight: bold;
          color: #dc2626;
        }

        .stats {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 14px;
          color: #6b7280;

          .el-icon {
            font-size: 16px;
          }
        }
      }
    }
  }

  .section-actions {
    text-align: center;
    margin-top: 40px;

    .view-more-btn {
      background: #4f46e5;
      border-color: #4f46e5;
      font-weight: 600;
      padding: 0 32px;
      height: 48px;

      &:hover {
        background: #4338ca;
        border-color: #4338ca;
      }

      .el-icon {
        margin-left: 8px;
      }
    }
  }
}

.tech-stack {
  max-width: 1200px;
  margin: 60px auto;
  padding: 40px 20px;
  text-align: center;
  background: white;

  h2 {
    font-size: 32px;
    margin-bottom: 30px;
    color: #303133;
    font-weight: bold;
  }

  .stack-list {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    justify-content: center;

    :deep(.el-tag) {
      font-size: 16px;
      padding: 10px 20px;
      background: #eef2ff;
      color: #4f46e5;
      border: 1px solid #c7d2fe;
      border-radius: 20px;
    }
  }
}

// Responsive adjustments
@media (max-width: 768px) {
  .hero {
    padding: 60px 20px 40px;

    .title {
      font-size: 36px;
    }

    .subtitle {
      font-size: 20px;
    }

    .description {
      font-size: 16px;
    }

    .actions {
      flex-direction: column;
      align-items: center;

      .el-button {
        width: 200px;
      }
    }
  }

  .features {
    margin-top: 40px;
  }

  .featured-services {
    .section-header h2 {
      font-size: 28px;
    }
  }

  .tech-stack h2 {
    font-size: 28px;
  }
}
</style>
