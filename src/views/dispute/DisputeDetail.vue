<template>
  <div class="dispute-detail-page">
    <div class="page-container">
      <!-- Breadcrumb -->
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/disputes' }">我的纠纷</el-breadcrumb-item>
        <el-breadcrumb-item>纠纷详情</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="10" animated />
      </div>

      <!-- Dispute Detail Content -->
      <template v-else-if="dispute">
        <!-- Status Card -->
        <el-card class="status-card" shadow="never">
          <div class="status-content">
            <div class="status-icon">
              <el-icon :size="40">
                <component :is="getStatusIcon()" />
              </el-icon>
            </div>
            <div class="status-info">
              <h2 class="status-title">{{ getDisputeStatusText(dispute.disputeStatus) }}</h2>
              <p class="status-desc">{{ getStatusDescription() }}</p>
            </div>
            <div class="status-tag">
              <el-tag
                size="large"
                :type="getDisputeStatusTagType(dispute.disputeStatus)"
              >
                {{ getDisputeTypeText(dispute.disputeType) }}
              </el-tag>
            </div>
          </div>
        </el-card>

        <el-row :gutter="20">
          <!-- Left Column: Dispute & Order Info -->
          <el-col :xs="24" :md="16">
            <!-- Dispute Description Card -->
            <el-card class="info-card" shadow="never">
              <template #header>
                <div class="card-header">
                  <span class="header-title">问题描述</span>
                  <span class="create-time">提交于 {{ formatDateTime(dispute.createTime) }}</span>
                </div>
              </template>

              <div class="description-content">
                {{ dispute.description }}
              </div>
            </el-card>

            <!-- Admin Reply Card (if resolved/rejected) -->
            <el-card
              v-if="dispute.adminReply || dispute.resolution"
              class="info-card reply-card"
              shadow="never"
            >
              <template #header>
                <div class="card-header">
                  <span class="header-title">处理结果</span>
                </div>
              </template>

              <div v-if="dispute.adminReply" class="reply-section">
                <h4 class="section-title">管理员回复</h4>
                <div class="reply-content">{{ dispute.adminReply }}</div>
              </div>

              <el-divider v-if="dispute.adminReply && dispute.resolution" />

              <div v-if="dispute.resolution" class="reply-section">
                <h4 class="section-title">解决方案</h4>
                <div class="reply-content">{{ dispute.resolution }}</div>
              </div>
            </el-card>

            <!-- Related Order Card -->
            <el-card class="info-card" shadow="never">
              <template #header>
                <div class="card-header">
                  <span class="header-title">关联订单</span>
                </div>
              </template>

              <el-descriptions :column="2" border>
                <el-descriptions-item label="订单编号" :span="2">
                  <el-link type="primary" @click="router.push(`/orders/${dispute.orderId}`)">
                    {{ dispute.orderNumber }}
                  </el-link>
                </el-descriptions-item>
                <el-descriptions-item label="服务名称" :span="2">
                  {{ dispute.serviceTitle }}
                </el-descriptions-item>
                <el-descriptions-item label="订单金额">
                  <span class="price">¥{{ dispute.totalAmount.toFixed(2) }}</span>
                </el-descriptions-item>
              </el-descriptions>
            </el-card>
          </el-col>

          <!-- Right Column: Parties Info -->
          <el-col :xs="24" :md="8">
            <!-- Buyer Info -->
            <el-card class="info-card party-card" shadow="never">
              <template #header>
                <div class="card-header">
                  <span class="header-title">买家信息</span>
                  <el-tag
                    v-if="dispute.disputeInitiatorId === dispute.buyerId"
                    type="danger"
                    size="small"
                  >
                    发起方
                  </el-tag>
                </div>
              </template>

              <div class="party-info">
                <el-avatar
                  :size="50"
                  class="party-avatar"
                  :src="dispute.buyerAvatar ? buildImageUrl(dispute.buyerAvatar) : undefined"
                >
                  {{ dispute.buyerName?.charAt(0) }}
                </el-avatar>
                <div class="party-detail">
                  <span class="party-name">{{ dispute.buyerName }}</span>
                  <span class="party-role">买家</span>
                </div>
              </div>
            </el-card>

            <!-- Seller Info -->
            <el-card class="info-card party-card" shadow="never">
              <template #header>
                <div class="card-header">
                  <span class="header-title">卖家信息</span>
                  <el-tag
                    v-if="dispute.disputeInitiatorId === dispute.sellerId"
                    type="danger"
                    size="small"
                  >
                    发起方
                  </el-tag>
                </div>
              </template>

              <div class="party-info">
                <el-avatar
                  :size="50"
                  class="party-avatar"
                  :src="dispute.sellerAvatar ? buildImageUrl(dispute.sellerAvatar) : undefined"
                >
                  {{ dispute.sellerName?.charAt(0) }}
                </el-avatar>
                <div class="party-detail">
                  <span class="party-name">{{ dispute.sellerName }}</span>
                  <span class="party-role">卖家</span>
                </div>
              </div>
            </el-card>

            <!-- Action Card -->
            <el-card class="info-card action-card" shadow="never">
              <template #header>
                <div class="card-header">
                  <span class="header-title">操作</span>
                </div>
              </template>

              <div class="action-buttons">
                <el-button
                  type="primary"
                  size="large"
                  @click="router.push(`/orders/${dispute.orderId}`)"
                >
                  查看订单详情
                </el-button>
                <el-button
                  plain
                  size="large"
                  @click="router.push('/disputes')"
                >
                  返回纠纷列表
                </el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </template>

      <!-- Error State -->
      <el-card v-else class="error-card" shadow="never">
        <el-empty description="纠纷信息加载失败">
          <el-button type="primary" @click="router.back()">返回</el-button>
        </el-empty>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Clock,
  CircleCheck,
  Warning,
  CircleClose
} from '@element-plus/icons-vue'
import { getDisputeDetail } from '@/api/dispute'
import {
  DISPUTE_STATUS,
  getDisputeTypeText,
  getDisputeStatusText,
  getDisputeStatusTagType,
  type DisputeDetail
} from '@/types/dispute'
import { useUserStore } from '@/stores/user'
import { buildImageUrl } from '@/api/service'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// Data
const loading = ref(true)
const dispute = ref<DisputeDetail | null>(null)

// Computed
const disputeId = computed(() => {
  const id = route.params.id
  return typeof id === 'string' ? parseInt(id) : 0
})

// Methods
const fetchDisputeDetail = async () => {
  if (!disputeId.value) {
    ElMessage.error('纠纷ID无效')
    router.back()
    return
  }

  loading.value = true
  try {
    dispute.value = await getDisputeDetail(disputeId.value)
  } catch (error: any) {
    console.error('Failed to fetch dispute detail:', error)
    ElMessage.error(error.message || '获取纠纷详情失败')
  } finally {
    loading.value = false
  }
}

const getStatusIcon = () => {
  if (!dispute.value) return Clock

  const iconMap: Record<number, any> = {
    [DISPUTE_STATUS.PENDING]: Clock,
    [DISPUTE_STATUS.PROCESSING]: Warning,
    [DISPUTE_STATUS.RESOLVED]: CircleCheck,
    [DISPUTE_STATUS.REJECTED]: CircleClose
  }

  return iconMap[dispute.value.disputeStatus] || Clock
}

const getStatusDescription = (): string => {
  if (!dispute.value) return ''

  const descMap: Record<number, string> = {
    [DISPUTE_STATUS.PENDING]: '您的纠纷已提交，等待管理员审核',
    [DISPUTE_STATUS.PROCESSING]: '管理员正在处理您的纠纷',
    [DISPUTE_STATUS.RESOLVED]: '纠纷已解决，请查看处理结果',
    [DISPUTE_STATUS.REJECTED]: '纠纷申请已被驳回，请查看原因'
  }

  return descMap[dispute.value.disputeStatus] || ''
}

const formatDateTime = (dateStr: string): string => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

// Lifecycle
onMounted(() => {
  if (!userStore.isLogin) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  fetchDisputeDetail()
})
</script>

<style scoped lang="scss">
.dispute-detail-page {
  min-height: 100vh;
  background: #f9fafb;
  padding: 24px 0 60px;

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

  // Loading
  .loading-container {
    background: white;
    border-radius: 16px;
    padding: 40px;
  }

  // Status Card
  .status-card {
    border-radius: 16px;
    border: none;
    margin-bottom: 24px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

    :deep(.el-card__body) {
      padding: 32px;
    }

    .status-content {
      display: flex;
      align-items: center;
      gap: 24px;

      .status-icon {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        width: 80px;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;

        :deep(.el-icon) {
          color: white !important;
        }
      }

      .status-info {
        flex: 1;

        .status-title {
          font-size: 28px;
          font-weight: 700;
          color: white;
          margin: 0 0 8px;
        }

        .status-desc {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.9);
          margin: 0;
        }
      }

      .status-tag {
        :deep(.el-tag) {
          padding: 8px 16px;
          font-size: 14px;
        }
      }
    }
  }

  // Info Cards
  .info-card,
  .error-card {
    border-radius: 16px;
    border: none;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;

    :deep(.el-card__header) {
      border-bottom: 1px solid #e5e7eb;
      padding: 20px 24px;
    }

    :deep(.el-card__body) {
      padding: 24px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-title {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }

      .create-time {
        font-size: 13px;
        color: #6b7280;
      }
    }
  }

  // Description
  .description-content {
    font-size: 15px;
    color: #303133;
    line-height: 1.8;
    white-space: pre-wrap;
  }

  // Reply Card
  .reply-card {
    .reply-section {
      .section-title {
        font-size: 14px;
        font-weight: 600;
        color: #6b7280;
        margin: 0 0 12px;
      }

      .reply-content {
        font-size: 15px;
        color: #303133;
        line-height: 1.8;
        padding: 16px;
        background: #f9fafb;
        border-radius: 8px;
        white-space: pre-wrap;
      }
    }
  }

  // Order Info
  .price {
    color: #4f46e5;
    font-weight: 600;
    font-size: 16px;
  }

  // Party Card
  .party-card {
    .party-info {
      display: flex;
      align-items: center;
      gap: 16px;

      .party-avatar {
        background: #4f46e5;
        color: white;
        font-size: 18px;
        font-weight: 600;
      }

      .party-detail {
        display: flex;
        flex-direction: column;

        .party-name {
          font-size: 16px;
          font-weight: 600;
          color: #303133;
        }

        .party-role {
          font-size: 13px;
          color: #6b7280;
          margin-top: 4px;
        }
      }
    }
  }

  // Action Card
  .action-card {
    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .el-button {
        width: 100%;
        height: 44px;
        font-size: 15px;
        font-weight: 500;
      }

      .el-button--primary {
        background: #4f46e5;
        border-color: #4f46e5;

        &:hover:not(:disabled) {
          background: #4338ca;
          border-color: #4338ca;
        }
      }
    }
  }
}

// Responsive
@media (max-width: 768px) {
  .dispute-detail-page {
    .status-card {
      .status-content {
        flex-direction: column;
        text-align: center;

        .status-info {
          .status-title {
            font-size: 24px;
          }

          .status-desc {
            font-size: 14px;
          }
        }
      }
    }
  }
}
</style>
