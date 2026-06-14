<template>
  <div class="admin-service-detail-page" v-loading="loading">
    <!-- 标题区域 -->
    <section class="page-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" @click="goBack">返回列表</el-button>
        <h2>服务详情</h2>
      </div>
      <div class="header-actions" v-if="service">
        <el-button
          type="success"
          :icon="Check"
          @click="handleApprove"
          v-if="service.reviewStatus === ReviewStatus.PENDING"
        >
          通过审核
        </el-button>
        <el-button
          type="danger"
          :icon="Close"
          @click="handleReject"
          v-if="service.reviewStatus === ReviewStatus.PENDING"
        >
          拒绝审核
        </el-button>
      </div>
    </section>

    <!-- 无数据提示 -->
    <el-empty v-if="!loading && !service" description="服务不存在或已删除" />

    <!-- 服务详情卡片 -->
    <template v-if="service">
      <!-- 状态提示栏 -->
      <el-alert
        v-if="service.reviewStatus === ReviewStatus.PENDING"
        title="该服务正在等待审核"
        type="warning"
        :closable="false"
        show-icon
        class="status-alert"
      />
      <el-alert
        v-else-if="service.reviewStatus === ReviewStatus.REJECTED"
        :title="`审核已拒绝：${service.reviewReason || '无'}`"
        type="error"
        :closable="false"
        show-icon
        class="status-alert"
      />
      <el-alert
        v-else-if="service.reviewStatus === ReviewStatus.APPROVED"
        title="该服务已通过审核"
        type="success"
        :closable="false"
        show-icon
        class="status-alert"
      />

      <div class="detail-content">
        <!-- 左侧：图片区域 -->
        <div class="image-section">
          <div class="main-image">
            <img
              :src="buildImageUrl(currentImage)"
              :alt="service.serviceTitle"
              @error="handleImageError"
            />
          </div>
          <div class="image-thumbnails" v-if="service.images && service.images.length > 1">
            <div
              v-for="(img, index) in service.images"
              :key="index"
              class="thumbnail"
              :class="{ active: currentImage === img }"
              @click="currentImage = img"
            >
              <img :src="buildImageUrl(img)" :alt="`图片${index + 1}`" />
            </div>
          </div>
        </div>

        <!-- 右侧：信息区域 -->
        <div class="info-section">
          <el-card class="info-card" shadow="never">
            <h1 class="service-title">{{ service.serviceTitle }}</h1>

            <div class="price-row">
              <span class="price">¥ {{ service.price?.toFixed(2) }}</span>
              <div class="status-tags">
                <el-tag :type="getServiceStatusType(service.status)" size="small">
                  {{ getServiceStatusText(service.status) }}
                </el-tag>
                <el-tag :type="getReviewStatusType(service.reviewStatus)" size="small">
                  {{ getReviewStatusText(service.reviewStatus) }}
                </el-tag>
              </div>
            </div>

            <el-divider />

            <!-- 基本信息 -->
            <div class="info-grid">
              <div class="info-item">
                <span class="label">服务ID</span>
                <span class="value">{{ service.id }}</span>
              </div>
              <div class="info-item">
                <span class="label">服务分类</span>
                <span class="value">{{ service.tagName || '未分类' }}</span>
              </div>
              <div class="info-item">
                <span class="label">交易方式</span>
                <span class="value">{{ getTradeTypeText(service.tradeType) }}</span>
              </div>
              <div class="info-item">
                <span class="label">是否实物</span>
                <span class="value">{{ service.isPhysical === 1 ? '是' : '否' }}</span>
              </div>
              <div class="info-item">
                <span class="label">购买限制</span>
                <span class="value">
                  {{ service.maxPurchases === -1 ? '不限' : `${service.currentPurchaseCount || 0}/${service.maxPurchases}` }}
                </span>
              </div>
              <div class="info-item">
                <span class="label">浏览量</span>
                <span class="value">{{ service.viewCount || 0 }}</span>
              </div>
              <div class="info-item">
                <span class="label">收藏量</span>
                <span class="value">{{ service.collectionCount || 0 }}</span>
              </div>
              <div class="info-item">
                <span class="label">销量</span>
                <span class="value">{{ service.salesCount || 0 }}</span>
              </div>
              <div class="info-item">
                <span class="label">创建时间</span>
                <span class="value">{{ formatTime(service.createTime) }}</span>
              </div>
              <div class="info-item">
                <span class="label">更新时间</span>
                <span class="value">{{ formatTime(service.updateTime) }}</span>
              </div>
            </div>
          </el-card>

          <!-- 卖家信息卡片 -->
          <el-card class="seller-card" shadow="never">
            <template #header>
              <span class="card-title">卖家信息</span>
            </template>
            <div class="seller-info">
              <el-avatar
                :src="buildImageUrl(service.sellerAvatar)"
                :size="64"
                class="seller-avatar"
              >
                {{ service.sellerName?.charAt(0) || 'U' }}
              </el-avatar>
              <div class="seller-details">
                <div class="seller-name">{{ service.sellerName || '未知用户' }}</div>
                <div class="seller-meta">
                  <span v-if="service.sellerProfessional">
                    专业：{{ service.sellerProfessional }}
                  </span>
                  <span v-if="service.sellerRating">
                    评分：{{ service.sellerRating.toFixed(1) }}
                  </span>
                </div>
                <div class="seller-id">用户ID：{{ service.sellerId }}</div>
              </div>
            </div>
          </el-card>
        </div>
      </div>

      <!-- 服务描述 -->
      <el-card class="description-card" shadow="never">
        <template #header>
          <span class="card-title">服务描述</span>
        </template>
        <div class="description-content">
          {{ service.serviceDescription || '暂无描述' }}
        </div>
      </el-card>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Check, Close } from '@element-plus/icons-vue'
import { getServiceDetail, buildImageUrl } from '@/api/service'
import { reviewService } from '@/api/adminService'
import type { ServiceDetail } from '@/types/service'
import {
  ReviewStatus,
  getServiceStatusText,
  getServiceStatusType,
  getReviewStatusText,
  getReviewStatusType,
  getTradeTypeText
} from '@/types/service'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const service = ref<ServiceDetail | null>(null)
const currentImage = ref<string>('')

/**
 * 加载服务详情
 */
const loadService = async () => {
  const serviceId = route.params.id as string
  if (!serviceId) {
    ElMessage.error('服务ID无效')
    return
  }

  try {
    loading.value = true
    service.value = await getServiceDetail(serviceId)
    // 设置默认展示第一张图片
    if (service.value?.images?.length > 0) {
      currentImage.value = service.value.images[0]
    }
  } catch (error: any) {
    console.error('Failed to load service:', error)
    ElMessage.error(error.message || '加载服务详情失败')
  } finally {
    loading.value = false
  }
}

/**
 * 格式化时间
 */
const formatTime = (timeStr?: string): string => {
  if (!timeStr) return '-'
  const date = new Date(timeStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * 图片加载失败处理
 */
const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.src = 'https://picsum.photos/seed/service/400/400'
}

/**
 * 返回列表
 */
const goBack = () => {
  router.push('/admin/services')
}

/**
 * 通过审核
 */
const handleApprove = () => {
  if (!service.value) return

  ElMessageBox.confirm(
    `确认通过服务「${service.value.serviceTitle}」的发布申请吗？通过后服务将自动上架。`,
    '审核通过',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      loading.value = true
      await reviewService({
        serviceId: service.value!.id,
        approved: true
      })
      ElMessage.success('已通过服务审核')
      // 重新加载数据
      await loadService()
    } catch (error: any) {
      ElMessage.error(error.message || '操作失败')
    } finally {
      loading.value = false
    }
  }).catch(() => {
    // 用户取消
  })
}

/**
 * 拒绝审核
 */
const handleReject = () => {
  if (!service.value) return

  ElMessageBox.prompt(
    `请填写拒绝服务「${service.value.serviceTitle}」的原因`,
    '拒绝服务发布',
    {
      confirmButtonText: '确认拒绝',
      cancelButtonText: '取消',
      inputType: 'textarea',
      inputPlaceholder: '例如：服务描述不清、价格异常、内容不合规等（至少5个字）',
      inputValidator: (value: string) => {
        if (!value || value.trim().length < 5) {
          return '拒绝原因至少5个字'
        }
        return true
      }
    }
  ).then(async ({ value }) => {
    try {
      loading.value = true
      await reviewService({
        serviceId: service.value!.id,
        approved: false,
        reason: value.trim()
      })
      ElMessage.success('已拒绝服务发布')
      // 重新加载数据
      await loadService()
    } catch (error: any) {
      ElMessage.error(error.message || '操作失败')
    } finally {
      loading.value = false
    }
  }).catch(() => {
    // 用户取消
  })
}

onMounted(loadService)
</script>

<style scoped lang="scss">
.admin-service-detail-page {
  // Page Header
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;

      h2 {
        font-size: 24px;
        font-weight: 700;
        color: #1f2937;
        margin: 0;
      }
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }

  // Status Alert
  .status-alert {
    margin-bottom: 24px;
    border-radius: 8px;
  }

  // Detail Content
  .detail-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-bottom: 24px;
  }

  // Image Section
  .image-section {
    .main-image {
      width: 100%;
      aspect-ratio: 1;
      border-radius: 16px;
      overflow: hidden;
      background: #f3f4f6;
      margin-bottom: 16px;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .image-thumbnails {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;

      .thumbnail {
        width: 80px;
        height: 80px;
        border-radius: 8px;
        overflow: hidden;
        cursor: pointer;
        border: 2px solid transparent;
        transition: all 0.2s;

        &:hover {
          border-color: #c7d2fe;
        }

        &.active {
          border-color: #4f46e5;
        }

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }
  }

  // Info Section
  .info-section {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .info-card,
  .seller-card,
  .description-card {
    border: none;
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

    :deep(.el-card__header) {
      padding: 16px 24px;
      border-bottom: 1px solid #e5e7eb;
    }

    :deep(.el-card__body) {
      padding: 24px;
    }

    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
    }
  }

  .info-card {
    .service-title {
      font-size: 24px;
      font-weight: 700;
      color: #1f2937;
      margin: 0 0 16px;
      line-height: 1.4;
    }

    .price-row {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .price {
        font-size: 28px;
        font-weight: 700;
        color: #4f46e5;
      }

      .status-tags {
        display: flex;
        gap: 8px;
      }
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;

      .info-item {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .label {
          font-size: 13px;
          color: #9ca3af;
        }

        .value {
          font-size: 15px;
          color: #1f2937;
          font-weight: 500;
        }
      }
    }
  }

  .seller-card {
    .seller-info {
      display: flex;
      gap: 16px;
      align-items: center;

      .seller-avatar {
        flex-shrink: 0;
        background: #4f46e5;
        color: white;
        font-size: 24px;
      }

      .seller-details {
        flex: 1;

        .seller-name {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 4px;
        }

        .seller-meta {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 4px;

          span + span {
            margin-left: 16px;
          }
        }

        .seller-id {
          font-size: 13px;
          color: #9ca3af;
        }
      }
    }
  }

  .description-card {
    .description-content {
      font-size: 15px;
      color: #4b5563;
      line-height: 1.8;
      white-space: pre-wrap;
      word-break: break-word;
    }
  }
}

// Override Element Plus
:deep(.el-button--success) {
  background-color: #10b981;
  border-color: #10b981;

  &:hover {
    background-color: #059669;
    border-color: #059669;
  }
}

:deep(.el-button--danger) {
  background-color: #ef4444;
  border-color: #ef4444;

  &:hover {
    background-color: #dc2626;
    border-color: #dc2626;
  }
}

:deep(.el-divider) {
  margin: 20px 0;
}

// Responsive
@media (max-width: 1024px) {
  .admin-service-detail-page {
    .detail-content {
      grid-template-columns: 1fr;
    }

    .image-section {
      .main-image {
        max-width: 500px;
        margin: 0 auto 16px;
      }

      .image-thumbnails {
        justify-content: center;
      }
    }
  }
}

@media (max-width: 768px) {
  .admin-service-detail-page {
    .page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;

      .header-actions {
        width: 100%;

        .el-button {
          flex: 1;
        }
      }
    }

    .info-card {
      .info-grid {
        grid-template-columns: 1fr;
      }
    }
  }
}
</style>
