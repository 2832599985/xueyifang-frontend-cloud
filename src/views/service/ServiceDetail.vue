<template>
  <div class="service-detail-page">
    <div class="page-container">
      <!-- Breadcrumb -->
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/services' }">服务列表</el-breadcrumb-item>
        <el-breadcrumb-item v-if="serviceDetail">{{ serviceDetail.serviceTitle }}</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- Main Content -->
      <div class="detail-content" v-loading="loading">
        <el-row :gutter="24" v-if="serviceDetail">
          <!-- Left Column: Service Content -->
          <el-col :xs="24" :sm="24" :md="16" :lg="16">
            <el-card class="service-main-card" shadow="never">
              <!-- Image Gallery -->
              <div class="image-gallery">
                <el-carousel
                  v-if="processedImages.length > 1"
                  :interval="4000"
                  type="card"
                  height="400px"
                  class="service-carousel"
                >
                  <el-carousel-item v-for="(image, index) in processedImages" :key="index">
                    <el-image
                      :src="image"
                      fit="cover"
                      class="gallery-image"
                      :preview-src-list="processedImages"
                      :initial-index="index"
                      preview-teleported
                    />
                  </el-carousel-item>
                </el-carousel>
                <el-image
                  v-else
                  :src="coverImageUrl"
                  fit="cover"
                  class="single-image"
                  :preview-src-list="processedImages.length > 0 ? processedImages : undefined"
                  preview-teleported
                >
                  <template #error>
                    <div class="image-error">
                      <el-icon size="50"><Picture /></el-icon>
                      <span>图片加载失败</span>
                    </div>
                  </template>
                </el-image>
              </div>

              <!-- Service Title and Tags -->
              <div class="service-header">
                <h1 class="service-title">{{ serviceDetail.serviceTitle }}</h1>
                <div class="service-meta">
                  <el-tag type="info" class="service-tag">
                    {{ serviceDetail.tagName || '未分类' }}
                  </el-tag>
                  <span class="trade-type">
                    <el-icon><Location /></el-icon>
                    {{ getTradeTypeText(serviceDetail.tradeType) }}
                  </span>
                  <span class="view-count">
                    <el-icon><View /></el-icon>
                    {{ serviceDetail.viewCount }} 次浏览
                  </span>
                </div>
              </div>

              <!-- Tabs for Details and Reviews -->
              <el-tabs v-model="activeTab" class="service-tabs">
                <el-tab-pane label="服务详情" name="details">
                  <!-- Service Description -->
                  <div class="service-section">
                    <h2 class="section-title">服务详情</h2>
                    <div class="service-description">
                      {{ serviceDetail.serviceDescription }}
                    </div>
                  </div>

                  <!-- Service Requirements -->
                  <div class="service-section" v-if="serviceDetail.requirements">
                    <h2 class="section-title">服务要求</h2>
                    <div class="service-requirements">
                      {{ serviceDetail.requirements }}
                    </div>
                  </div>

                  <!-- Service Info -->
                  <div class="service-section">
                    <h2 class="section-title">服务信息</h2>
                    <el-descriptions :column="2" border>
                      <el-descriptions-item label="服务类型">
                        {{ serviceDetail.isPhysical === 1 ? '实物商品' : '虚拟服务' }}
                      </el-descriptions-item>
                      <el-descriptions-item label="交易方式">
                        {{ getTradeTypeText(serviceDetail.tradeType) }}
                      </el-descriptions-item>
                      <el-descriptions-item label="最大购买数">
                        {{ serviceDetail.maxPurchases === -1 ? '不限' : serviceDetail.maxPurchases }}
                      </el-descriptions-item>
                      <el-descriptions-item label="已售数量">
                        {{ serviceDetail.currentPurchaseCount || 0 }}
                      </el-descriptions-item>
                      <el-descriptions-item label="收藏人数">
                        {{ serviceDetail.collectionCount || 0 }}
                      </el-descriptions-item>
                      <el-descriptions-item label="发布时间">
                        {{ formatDate(serviceDetail.createTime) }}
                      </el-descriptions-item>
                    </el-descriptions>
                  </div>

                  <!-- Trade Location for Offline Services -->
                  <div class="service-section" v-if="serviceDetail.tradeType === 1 && serviceDetail.tradeLocation">
                    <h2 class="section-title">交易地点</h2>
                    <el-alert type="info" :closable="false">
                      <template #title>
                        <div class="location-info">
                          <el-icon><LocationInformation /></el-icon>
                          <span>{{ serviceDetail.tradeLocation.locationName }}</span>
                        </div>
                      </template>
                      {{ serviceDetail.tradeLocation.locationAddress }}
                    </el-alert>
                  </div>
                </el-tab-pane>

                <el-tab-pane name="reviews">
                  <template #label>
                    <span class="reviews-tab-label">
                      评价
                      <el-badge
                        v-if="serviceDetail.reviewCount && serviceDetail.reviewCount > 0"
                        :value="serviceDetail.reviewCount"
                        :max="99"
                        class="review-count-badge"
                      />
                    </span>
                  </template>
                  <ServiceReviewList :service-id="serviceDetail.id" />
                </el-tab-pane>
              </el-tabs>
            </el-card>
          </el-col>

          <!-- Right Column: Purchase Card -->
          <el-col :xs="24" :sm="24" :md="8" :lg="8">
            <!-- Price Card -->
            <el-card class="service-sidebar-card price-card" shadow="never">
              <div class="price-section">
                <div class="price-label">服务价格</div>
                <div class="price-value">{{ formatPrice(serviceDetail.price) }}</div>
              </div>

              <div class="service-stats">
                <div class="stat-item">
                  <span class="stat-label">销量</span>
                  <span class="stat-value">{{ serviceDetail.salesCount || 0 }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">评分</span>
                  <span class="stat-value">
                    <el-rate
                      v-model="serviceDetail.averageRating"
                      disabled
                      show-score
                      :colors="['#4f46e5', '#4f46e5', '#4f46e5']"
                      :void-color="'#e5e7eb'"
                      text-color="#4f46e5"
                      score-template="{value}"
                    />
                  </span>
                </div>
              </div>

              <el-divider />

              <!-- Action Buttons -->
              <div class="action-buttons">
                <el-button
                  type="primary"
                  size="large"
                  class="primary-action"
                  @click="handlePurchase"
                  :disabled="serviceDetail.status !== 1"
                >
                  <el-icon><ShoppingCart /></el-icon>
                  立即下单
                </el-button>

                <el-button
                  plain
                  size="large"
                  class="secondary-action"
                  @click="handleContact"
                >
                  <el-icon><ChatDotRound /></el-icon>
                  联系卖家
                </el-button>

                <el-button
                  :type="serviceDetail.isCollected ? 'danger' : 'default'"
                  text
                  class="favorite-btn"
                  @click="handleCollect"
                >
                  <el-icon>
                    <StarFilled v-if="serviceDetail.isCollected" />
                    <Star v-else />
                  </el-icon>
                  {{ serviceDetail.isCollected ? '已收藏' : '收藏' }}
                </el-button>
              </div>

              <!-- Service Status Alert -->
              <el-alert
                v-if="serviceDetail.status !== 1"
                :type="getAlertType(serviceDetail.status)"
                :closable="false"
                class="status-alert"
              >
                <template #title>
                  {{ getServiceStatusText(serviceDetail.status) }}
                </template>
                <span v-if="serviceDetail.reviewReason">
                  原因：{{ serviceDetail.reviewReason }}
                </span>
              </el-alert>
            </el-card>

            <!-- Seller Card -->
            <el-card class="service-sidebar-card seller-card" shadow="never">
              <div class="seller-header">
                <el-avatar
                  :size="50"
                  :src="buildImageUrl(serviceDetail.sellerAvatar)"
                  class="seller-avatar"
                >
                  {{ serviceDetail.sellerName?.charAt(0) }}
                </el-avatar>
                <div class="seller-info">
                  <div class="seller-name">{{ serviceDetail.sellerName }}</div>
                  <div class="seller-professional">
                    {{ serviceDetail.sellerProfessional || '暂无专业信息' }}
                  </div>
                </div>
              </div>

              <div class="seller-stats">
                <div class="stat-row">
                  <span class="stat-label">卖家评分</span>
                  <el-rate
                    v-model="serviceDetail.sellerRating"
                    disabled
                    show-score
                    text-color="#ff9900"
                    :score-template="`${serviceDetail.sellerRating || 0}分`"
                  />
                </div>
              </div>

              <el-button
                plain
                size="default"
                class="view-seller-btn"
                @click="viewSellerServices"
              >
                查看该卖家其他服务
              </el-button>
            </el-card>
          </el-col>
        </el-row>

        <!-- Error State -->
        <el-empty
          v-else-if="!loading && loadError"
          description="服务加载失败"
          class="error-state"
        >
          <el-button type="primary" @click="router.push('/services')">
            返回服务列表
          </el-button>
        </el-empty>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Picture,
  Location,
  View,
  LocationInformation,
  ShoppingCart,
  ChatDotRound,
  Star,
  StarFilled
} from '@element-plus/icons-vue'
import { getServiceDetail, buildImageUrl } from '@/api/service'
import { toggleCollection } from '@/api/favorite'
import ServiceReviewList from './components/ServiceReviewList.vue'
import type { ServiceDetail } from '@/types/service'
import {
  formatPrice,
  getTradeTypeText,
  getServiceStatusText,
  ServiceStatus
} from '@/types/service'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()

// Data
const serviceDetail = ref<ServiceDetail | null>(null)
const loading = ref(false)
const loadError = ref(false)
const activeTab = ref('details')

// Computed: Process images with proper URLs
const processedImages = computed(() => {
  if (!serviceDetail.value?.images || serviceDetail.value.images.length === 0) {
    return []
  }
  return serviceDetail.value.images.map(img => buildImageUrl(img))
})

const coverImageUrl = computed(() => {
  if (processedImages.value.length > 0) {
    return processedImages.value[0]
  }
  return buildImageUrl(serviceDetail.value?.coverImage || '')
})

// Methods
const fetchServiceDetail = async () => {
  const id = route.params.id as string
  if (!id) {
    ElMessage.error('服务ID无效')
    router.push('/services')
    return
  }

  loading.value = true
  loadError.value = false
  appStore.setLoading(true)

  try {
    serviceDetail.value = await getServiceDetail(id)
  } catch (error: any) {
    console.error('Failed to fetch service detail:', error)
    loadError.value = true
    ElMessage.error(error.message || '获取服务详情失败')
  } finally {
    loading.value = false
    appStore.setLoading(false)
  }
}

const handlePurchase = () => {
  if (!userStore.isLogin) {
    ElMessage.warning('请先登录')
    router.push({
      path: '/login',
      query: { redirect: route.fullPath }
    })
    return
  }

  // Check if user is trying to buy their own service
  if (serviceDetail.value?.sellerId === userStore.userInfo?.id) {
    ElMessage.error('不能购买自己的服务')
    return
  }

  // Navigate to order confirmation page
  const serviceId = route.params.id
  router.push({
    name: 'OrderConfirm',
    params: { serviceId }
  })
}

const handleContact = () => {
  if (!userStore.isLogin) {
    ElMessage.warning('请先登录')
    router.push({
      path: '/login',
      query: { redirect: route.fullPath }
    })
    return
  }

  // 不能给自己发消息
  if (serviceDetail.value?.sellerId === userStore.userInfo?.id) {
    ElMessage.warning('不能给自己发消息')
    return
  }

  // 跳转到聊天页面
  router.push({
    name: 'ChatWithUser',
    params: { userId: serviceDetail.value?.sellerId },
    query: { relatedServiceId: serviceDetail.value?.id }
  })
}

const handleCollect = async () => {
  if (!userStore.isLogin) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  if (!serviceDetail.value) return

  const isCollected = serviceDetail.value.isCollected || false
  loading.value = true

  try {
    await toggleCollection(serviceDetail.value.id, isCollected)
    serviceDetail.value.isCollected = !isCollected

    // Update collection count
    if (serviceDetail.value.isCollected) {
      serviceDetail.value.collectionCount++
      ElMessage.success('收藏成功')
    } else {
      serviceDetail.value.collectionCount--
      ElMessage.success('取消收藏成功')
    }
  } catch (error: any) {
    console.error('Collection operation failed:', error)
    ElMessage.error(error.message || '操作失败')
  } finally {
    loading.value = false
  }
}

const viewSellerServices = () => {
  if (!serviceDetail.value) return
  router.push({
    path: '/services',
    query: { sellerId: serviceDetail.value.sellerId }
  })
}

const getAlertType = (status: number) => {
  switch (status) {
    case ServiceStatus.OFFLINE:
      return 'info'
    case ServiceStatus.PENDING_REVIEW:
      return 'warning'
    case ServiceStatus.REJECTED:
      return 'error'
    default:
      return 'info'
  }
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(() => {
  fetchServiceDetail()
})
</script>

<style scoped lang="scss">
.service-detail-page {
  min-height: 100vh;
  background: #f9fafb;
  padding: 24px 0 40px;

  .page-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  // Breadcrumb
  .breadcrumb {
    margin-bottom: 24px;

    :deep(.el-breadcrumb__inner) {
      &.is-link {
        color: #4f46e5;
        font-weight: 400;

        &:hover {
          color: #4338ca;
        }
      }
    }
  }

  // Main Content
  .detail-content {
    min-height: 500px;

    // Main Service Card
    .service-main-card {
      border-radius: 16px;
      border: none;
      margin-bottom: 24px;
      padding: 24px;

      // Image Gallery
      .image-gallery {
        margin: -24px -24px 24px;
        border-radius: 16px 16px 0 0;
        overflow: hidden;
        background: #f3f4f6;

        .service-carousel {
          :deep(.el-carousel__item) {
            .gallery-image {
              width: 100%;
              height: 100%;
              object-fit: cover;
              cursor: pointer;
            }
          }
        }

        .single-image {
          width: 100%;
          height: 400px;
          object-fit: cover;
          cursor: pointer;
        }

        .image-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 400px;
          color: #9ca3af;
          gap: 12px;
        }
      }

      // Service Header
      .service-header {
        margin-bottom: 24px;

        .service-title {
          margin: 0 0 16px;
          font-size: 28px;
          font-weight: bold;
          color: #303133;
          line-height: 1.4;
        }

        .service-meta {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;

          .service-tag {
            background: #eef2ff;
            color: #4f46e5;
            border: 1px solid #c7d2fe;
          }

          .trade-type,
          .view-count {
            display: flex;
            align-items: center;
            gap: 4px;
            color: #4b5563;
            font-size: 14px;
          }
        }
      }

      // Service Sections
      .service-section {
        margin-bottom: 32px;

        .section-title {
          margin: 0 0 16px;
          font-size: 20px;
          font-weight: 600;
          color: #303133;
        }

        .service-description,
        .service-requirements {
          line-height: 1.8;
          color: #4b5563;
          white-space: pre-wrap;
        }

        :deep(.el-descriptions) {
          .el-descriptions__label {
            background: #f9fafb;
            color: #4b5563;
            font-weight: 500;
          }
        }

        .location-info {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
        }
      }

      // Service Tabs
      .service-tabs {
        margin-top: 24px;

        :deep(.el-tabs__header) {
          margin-bottom: 24px;
        }

        :deep(.el-tabs__nav-wrap::after) {
          height: 1px;
          background: #e5e7eb;
        }

        :deep(.el-tabs__item) {
          font-size: 16px;
          font-weight: 500;
          color: #6b7280;
          padding: 0 24px;

          &.is-active {
            color: #4f46e5;
          }

          &:hover {
            color: #4f46e5;
          }
        }

        :deep(.el-tabs__active-bar) {
          background-color: #4f46e5;
          height: 3px;
        }

        .reviews-tab-label {
          display: flex;
          align-items: center;
          gap: 8px;

          .review-count-badge {
            :deep(.el-badge__content) {
              background-color: #4f46e5;
              font-size: 11px;
            }
          }
        }
      }
    }

    // Sidebar Cards
    .service-sidebar-card {
      border-radius: 16px;
      border: none;
      margin-bottom: 24px;
      padding: 24px;

      &.price-card {
        .price-section {
          text-align: center;
          margin-bottom: 20px;

          .price-label {
            font-size: 14px;
            color: #4b5563;
            margin-bottom: 8px;
          }

          .price-value {
            font-size: 32px;
            font-weight: bold;
            color: #dc2626;
          }
        }

        .service-stats {
          display: flex;
          justify-content: space-around;
          margin-bottom: 20px;

          .stat-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;

            .stat-label {
              font-size: 14px;
              color: #4b5563;
            }

            .stat-value {
              font-size: 18px;
              font-weight: 600;
              color: #303133;

              :deep(.el-rate) {
                line-height: 1;
              }
            }
          }
        }

        .action-buttons {
          display: flex;
          flex-direction: column;
          align-items: stretch;
          gap: 12px;

          .el-button {
            margin-left: 0;
          }

          .primary-action {
            background: #4f46e5;
            border-color: #4f46e5;
            font-weight: 600;
            height: 48px;
            font-size: 16px;

            &:hover:not(:disabled) {
              background: #4338ca;
              border-color: #4338ca;
            }

            &:disabled {
              opacity: 0.5;
              cursor: not-allowed;
            }
          }

          .secondary-action {
            color: #4f46e5;
            border-color: #4f46e5;
            height: 44px;

            &:hover {
              color: white;
              background: #4f46e5;
              border-color: #4f46e5;
            }
          }

          .favorite-btn {
            font-size: 14px;

            &:hover {
              color: #dc2626;
            }
          }
        }

        .status-alert {
          margin-top: 16px;
          border-radius: 8px;
        }
      }

      &.seller-card {
        .seller-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;

          .seller-avatar {
            background: #4f46e5;
            flex-shrink: 0;
          }

          .seller-info {
            flex: 1;
            min-width: 0;

            .seller-name {
              font-size: 18px;
              font-weight: 600;
              color: #303133;
              margin-bottom: 4px;
            }

            .seller-professional {
              font-size: 14px;
              color: #4b5563;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }
        }

        .seller-stats {
          margin-bottom: 20px;

          .stat-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;

            .stat-label {
              font-size: 14px;
              color: #4b5563;
            }

            :deep(.el-rate) {
              line-height: 1;
            }
          }
        }

        .view-seller-btn {
          width: 100%;
          color: #4f46e5;
          border-color: #4f46e5;

          &:hover {
            color: white;
            background: #4f46e5;
            border-color: #4f46e5;
          }
        }
      }
    }
  }

  // Error State
  .error-state {
    padding: 80px 0;
  }
}

// Responsive adjustments
@media (max-width: 768px) {
  .service-detail-page {
    .service-main-card {
      padding: 16px;

      .image-gallery {
        margin: -16px -16px 16px;

        .single-image,
        .image-error {
          height: 250px;
        }
      }

      .service-header {
        .service-title {
          font-size: 22px;
        }

        .service-meta {
          gap: 12px;
        }
      }
    }

    .service-sidebar-card {
      padding: 16px;

      &.price-card {
        .price-section .price-value {
          font-size: 28px;
        }
      }
    }
  }
}
</style>
