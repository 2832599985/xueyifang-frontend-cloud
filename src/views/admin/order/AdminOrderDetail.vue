<template>
  <div class="admin-order-detail-page">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>

    <!-- Order Detail Content -->
    <template v-else-if="orderDetail">
      <!-- Order Status Card -->
      <el-card class="status-card" shadow="never">
        <div class="status-content">
          <div class="status-icon">
            <el-icon :size="40" :color="getStatusColor()">
              <component :is="getStatusIcon()" />
            </el-icon>
          </div>
          <div class="status-info">
            <h2 class="status-title">{{ getOrderStatusText(orderDetail.orderStatus) }}</h2>
            <p class="status-desc">{{ getStatusDescription() }}</p>
            <div v-if="orderDetail.paymentStatus === PaymentStatus.REFUNDED" class="refund-notice">
              <el-alert type="warning" :closable="false">
                该订单已退款，金额已返还至买家账户
              </el-alert>
            </div>
            <div v-else-if="Number(orderDetail.refundStatus || RefundStatus.NONE) > RefundStatus.NONE" class="refund-notice">
              <el-alert :type="orderDetail.refundStatus === RefundStatus.PENDING ? 'warning' : (orderDetail.refundStatus === RefundStatus.APPROVED ? 'success' : 'error')" :closable="false">
                {{ getRefundStatusText(orderDetail.refundStatus || RefundStatus.NONE) }}
                <span v-if="orderDetail.refundReason"> - {{ orderDetail.refundReason }}</span>
              </el-alert>
            </div>
          </div>
        </div>
      </el-card>

      <!-- Order Information -->
      <el-row :gutter="20">
        <!-- Left Column: Order & Service Details -->
        <el-col :xs="24" :md="16">
          <!-- Service Information Card -->
          <el-card class="info-card" shadow="never">
            <template #header>
              <div class="card-header">
                <span class="header-title">服务信息</span>
              </div>
            </template>

            <div class="service-detail">
              <el-image
                :src="buildImageUrl(orderDetail.serviceImage)"
                fit="cover"
                class="service-image"
                @click="router.push(`/services/${orderDetail.serviceId}`)"
              />
              <div class="service-info">
                <h3
                  class="service-title"
                  @click="router.push(`/services/${orderDetail.serviceId}`)"
                >
                  {{ orderDetail.serviceTitle }}
                </h3>
                <el-descriptions :column="2" size="small" class="service-desc">
                  <el-descriptions-item label="服务分类">
                    {{ orderDetail.serviceTagName || '未分类' }}
                  </el-descriptions-item>
                  <el-descriptions-item label="交易方式">
                    <el-tag size="small" :type="orderDetail.tradeType === TradeType.OFFLINE ? 'warning' : 'success'">
                      {{ orderDetail.tradeType === TradeType.OFFLINE ? '线下交易' : '线上担保' }}
                    </el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="单价">
                    ¥{{ orderDetail.unitPrice.toFixed(2) }}
                  </el-descriptions-item>
                  <el-descriptions-item label="数量">
                    {{ orderDetail.quantity }}
                  </el-descriptions-item>
                  <el-descriptions-item label="总金额" :span="2">
                    <span class="total-price">¥{{ orderDetail.totalAmount.toFixed(2) }}</span>
                  </el-descriptions-item>
                </el-descriptions>
              </div>
            </div>

            <!-- Trade Location for Offline -->
            <div v-if="orderDetail.tradeType === TradeType.OFFLINE && orderDetail.tradeLocationName" class="trade-location">
              <el-divider />
              <h4 class="section-title">交易地点</h4>
              <el-alert
                :title="orderDetail.tradeLocationName"
                type="info"
                :closable="false"
                show-icon
              />
            </div>

            <!-- Remark -->
            <div v-if="orderDetail.remark" class="remark-section">
              <el-divider />
              <h4 class="section-title">备注信息</h4>
              <div class="remark-content">{{ orderDetail.remark }}</div>
            </div>
          </el-card>

          <!-- Dispute Card (if exists) -->
          <el-card v-if="disputeDetail" class="dispute-card" shadow="never">
            <template #header>
              <div class="card-header">
                <span class="header-title">
                  纠纷信息
                  <el-tag
                    size="small"
                    :type="getDisputeStatusTagType(disputeDetail.disputeStatus)"
                    style="margin-left: 8px"
                  >
                    {{ getDisputeStatusText(disputeDetail.disputeStatus) }}
                  </el-tag>
                </span>
                <span :class="['type-badge', getTypeTagClass(disputeDetail.disputeType)]">
                  {{ getDisputeTypeText(disputeDetail.disputeType) }}
                </span>
              </div>
            </template>

            <!-- Dispute Description -->
            <div class="dispute-content">
              <div class="complaint-section">
                <h4 class="section-label">
                  {{ disputeDetail.disputeInitiatorId === disputeDetail.buyerId ? '买家' : '卖家' }}诉求
                  ({{ disputeDetail.disputeInitiatorId === disputeDetail.buyerId ? disputeDetail.buyerName : disputeDetail.sellerName }})
                </h4>
                <p class="complaint-text">{{ disputeDetail.description }}</p>
              </div>

              <!-- Existing Resolution (if already handled) -->
              <div v-if="disputeDetail.adminReply || disputeDetail.resolution" class="result-section">
                <el-divider />
                <h4 class="section-label">处理结果</h4>
                <div class="result-card">
                  <div v-if="disputeDetail.adminReply" class="result-item">
                    <label>管理员回复:</label>
                    <p>{{ disputeDetail.adminReply }}</p>
                  </div>
                  <div v-if="disputeDetail.resolution" class="result-item">
                    <label>解决方案:</label>
                    <p>{{ disputeDetail.resolution }}</p>
                  </div>
                </div>
              </div>

              <!-- Handle Form (only for pending/processing) -->
              <div
                v-if="disputeDetail.disputeStatus === DISPUTE_STATUS.PENDING || disputeDetail.disputeStatus === DISPUTE_STATUS.PROCESSING"
                class="handle-form-section"
              >
                <el-divider />
                <h4 class="section-label">处理纠纷</h4>
                <el-form :model="handleForm" label-position="top">
                  <el-form-item label="管理员回复" required>
                    <el-input
                      v-model="handleForm.adminReply"
                      type="textarea"
                      :rows="3"
                      placeholder="请输入对用户的回复..."
                      maxlength="500"
                      show-word-limit
                    />
                  </el-form-item>

                  <el-form-item label="解决方案" required>
                    <el-input
                      v-model="handleForm.resolution"
                      type="textarea"
                      :rows="3"
                      placeholder="请输入解决方案..."
                      maxlength="500"
                      show-word-limit
                    />
                  </el-form-item>

                  <el-form-item>
                    <el-checkbox v-model="handleForm.needRefund">
                      需要退款给买家
                    </el-checkbox>
                    <p v-if="handleForm.needRefund" class="refund-tip">
                      勾选后将自动退款 ¥{{ orderDetail.totalAmount.toFixed(2) }} 给买家
                    </p>
                  </el-form-item>

                  <div class="action-buttons">
                    <el-button
                      @click="handleSubmit(HANDLE_ACTION.REJECT)"
                      :loading="submitting"
                    >
                      驳回纠纷
                    </el-button>
                    <el-button
                      type="success"
                      @click="handleForm.needRefund = true; handleSubmit(HANDLE_ACTION.RESOLVE)"
                      :loading="submitting"
                    >
                      同意退款
                    </el-button>
                    <el-button
                      type="primary"
                      @click="handleForm.needRefund = false; handleSubmit(HANDLE_ACTION.RESOLVE)"
                      :loading="submitting"
                    >
                      强制完成
                    </el-button>
                  </div>
                </el-form>
              </div>
            </div>
          </el-card>

          <!-- No Dispute Notice -->
          <el-card v-else class="no-dispute-card" shadow="never">
            <el-empty description="该订单暂无纠纷记录" :image-size="80" />
          </el-card>

          <!-- Order Timeline -->
          <el-card class="timeline-card" shadow="never">
            <template #header>
              <div class="card-header">
                <span class="header-title">订单时间线</span>
              </div>
            </template>

            <el-timeline>
              <el-timeline-item
                v-for="(item, index) in orderTimeline"
                :key="index"
                :timestamp="formatDateTime(item.time)"
                :type="item.type"
                placement="top"
              >
                {{ item.label }}
              </el-timeline-item>
            </el-timeline>
          </el-card>
        </el-col>

        <!-- Right Column: Actions & Contact -->
        <el-col :xs="24" :md="8">
          <!-- Actions Card -->
          <el-card class="action-card" shadow="never">
            <template #header>
              <div class="card-header">
                <span class="header-title">操作</span>
              </div>
            </template>

            <div class="action-buttons">
              <el-button plain size="large" @click="handleContactSeller">
                <el-icon><ChatDotRound /></el-icon>
                联系卖家
              </el-button>
              <el-button plain size="large" @click="handleContactBuyer">
                <el-icon><ChatDotRound /></el-icon>
                联系买家
              </el-button>
              <el-button type="primary" plain size="large" @click="router.push('/admin/disputes')">
                <el-icon><Back /></el-icon>
                返回纠纷列表
              </el-button>
            </div>
          </el-card>

          <!-- Seller Info Card -->
          <el-card class="contact-card" shadow="never">
            <template #header>
              <div class="card-header">
                <span class="header-title">卖家信息</span>
              </div>
            </template>

            <div class="contact-info">
              <el-avatar
                :size="60"
                :src="buildImageUrl(orderDetail.sellerAvatar)"
                class="user-avatar"
              >
                {{ orderDetail.sellerName?.charAt(0) }}
              </el-avatar>
              <div class="user-info">
                <h4 class="user-name">{{ orderDetail.sellerName }}</h4>
                <p class="user-professional">
                  {{ orderDetail.sellerProfessional || '暂无专业信息' }}
                </p>
              </div>
            </div>
          </el-card>

          <!-- Buyer Info Card -->
          <el-card class="contact-card" shadow="never">
            <template #header>
              <div class="card-header">
                <span class="header-title">买家信息</span>
              </div>
            </template>

            <div class="contact-info">
              <el-avatar
                :size="60"
                :src="buildImageUrl(orderDetail.buyerAvatar)"
                class="user-avatar"
              >
                {{ orderDetail.buyerName?.charAt(0) }}
              </el-avatar>
              <div class="user-info">
                <h4 class="user-name">{{ orderDetail.buyerName }}</h4>
                <p class="user-professional">
                  {{ orderDetail.buyerProfessional || '暂无专业信息' }}
                </p>
              </div>
            </div>
          </el-card>

          <!-- Order Basic Info Card -->
          <el-card class="order-info-card" shadow="never">
            <template #header>
              <div class="card-header">
                <span class="header-title">订单信息</span>
              </div>
            </template>

            <el-descriptions :column="1" size="small">
              <el-descriptions-item label="订单编号">
                <span class="order-number">{{ orderDetail.orderNumber }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="下单时间">
                {{ formatDateTime(orderDetail.createTime) }}
              </el-descriptions-item>
              <el-descriptions-item label="支付方式">
                钱包余额
              </el-descriptions-item>
              <el-descriptions-item label="支付状态">
                <el-tag :type="getPaymentStatusType()" size="small">
                  {{ getPaymentStatusText() }}
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
        </el-col>
      </el-row>
    </template>

    <!-- Error State -->
    <el-card v-else class="error-card" shadow="never">
      <el-empty description="订单信息加载失败">
        <el-button type="primary" @click="router.push('/admin/disputes')">返回纠纷列表</el-button>
      </el-empty>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  CircleCheck,
  Clock,
  CircleClose,
  WarningFilled,
  Van,
  Box,
  ChatDotRound,
  Back
} from '@element-plus/icons-vue'
import { getOrderDetail } from '@/api/order'
import { getDisputeByOrderId, handleDispute } from '@/api/dispute'
import { buildImageUrl } from '@/api/service'
import type { OrderDetail } from '@/types/order'
import type { DisputeDetail, DisputeHandleRequest } from '@/types/dispute'
import {
  OrderStatus,
  PaymentStatus,
  RefundStatus,
  TradeType,
  getOrderStatusText as getStatusText,
  getRefundStatusText
} from '@/types/order'
import {
  DISPUTE_STATUS,
  DISPUTE_TYPE,
  HANDLE_ACTION,
  getDisputeTypeText,
  getDisputeStatusText,
  getDisputeStatusTagType
} from '@/types/dispute'

const route = useRoute()
const router = useRouter()

// Data
const loading = ref(true)
const submitting = ref(false)
const orderDetail = ref<OrderDetail | null>(null)
const disputeDetail = ref<DisputeDetail | null>(null)

const handleForm = reactive<DisputeHandleRequest>({
  actionType: HANDLE_ACTION.RESOLVE,
  adminReply: '',
  resolution: '',
  needRefund: false
})

// Computed
const orderId = computed(() => {
  const id = route.params.id
  return typeof id === 'string' ? parseInt(id) : 0
})

const orderTimeline = computed(() => {
  if (!orderDetail.value) return []

  const timeline = [
    {
      label: '订单创建',
      time: orderDetail.value.createTime,
      type: 'primary'
    }
  ]

  if (orderDetail.value.paymentTime) {
    timeline.push({
      label: '买家支付',
      time: orderDetail.value.paymentTime,
      type: 'success'
    })
  }

  if (orderDetail.value.sellerShipTime) {
    timeline.push({
      label: '卖家发货',
      time: orderDetail.value.sellerShipTime,
      type: 'success'
    })
  }

  if (orderDetail.value.refundRequestTime && orderDetail.value.refundStatus) {
    timeline.push({
      label: '买家申请退款',
      time: orderDetail.value.refundRequestTime,
      type: 'warning'
    })

    if (orderDetail.value.refundStatus === RefundStatus.APPROVED) {
      timeline.push({
        label: '卖家同意退款',
        time: orderDetail.value.refundRequestTime,
        type: 'danger'
      })
    } else if (orderDetail.value.refundStatus === RefundStatus.REJECTED) {
      timeline.push({
        label: '卖家拒绝退款',
        time: orderDetail.value.refundRequestTime,
        type: 'warning'
      })
    }
  }

  if (orderDetail.value.buyerConfirmTime) {
    timeline.push({
      label: '买家确认收货',
      time: orderDetail.value.buyerConfirmTime,
      type: 'success'
    })
  }

  if (orderDetail.value.orderStatus === OrderStatus.COMPLETED) {
    timeline.push({
      label: '交易完成',
      time: orderDetail.value.buyerConfirmTime || orderDetail.value.createTime,
      type: 'success'
    })
  }

  if (orderDetail.value.orderStatus === OrderStatus.CANCELLED) {
    timeline.push({
      label: '订单取消',
      time: orderDetail.value.createTime,
      type: 'danger'
    })
  }

  if (orderDetail.value.orderStatus === OrderStatus.FAILED) {
    timeline.push({
      label: '交易失败（退款完成）',
      time: orderDetail.value.createTime,
      type: 'danger'
    })
  }

  return timeline
})

// Methods
const fetchOrderDetail = async () => {
  if (!orderId.value) {
    ElMessage.error('订单ID无效')
    router.push('/admin/disputes')
    return
  }

  loading.value = true
  try {
    // Fetch order detail and dispute in parallel
    const [orderData, disputeData] = await Promise.all([
      getOrderDetail(orderId.value),
      getDisputeByOrderId(orderId.value)
    ])
    orderDetail.value = orderData
    disputeDetail.value = disputeData
  } catch (error: any) {
    console.error('Failed to fetch order detail:', error)
    ElMessage.error(error.message || '获取订单详情失败')
  } finally {
    loading.value = false
  }
}

const getOrderStatusText = (status: OrderStatus): string => {
  return getStatusText(status)
}

const getStatusColor = (): string => {
  if (!orderDetail.value) return '#909399'

  const colorMap: Record<OrderStatus, string> = {
    [OrderStatus.UNPAID]: '#E6A23C',
    [OrderStatus.PENDING_SHIP]: '#409EFF',
    [OrderStatus.PENDING_RECEIPT]: '#409EFF',
    [OrderStatus.COMPLETED]: '#67C23A',
    [OrderStatus.CANCELLED]: '#909399',
    [OrderStatus.FAILED]: '#F56C6C'
  }

  return colorMap[orderDetail.value.orderStatus] || '#909399'
}

const getStatusIcon = () => {
  if (!orderDetail.value) return Clock

  const iconMap: Record<OrderStatus, any> = {
    [OrderStatus.UNPAID]: Clock,
    [OrderStatus.PENDING_SHIP]: Box,
    [OrderStatus.PENDING_RECEIPT]: Van,
    [OrderStatus.COMPLETED]: CircleCheck,
    [OrderStatus.CANCELLED]: CircleClose,
    [OrderStatus.FAILED]: WarningFilled
  }

  return iconMap[orderDetail.value.orderStatus] || Clock
}

const getStatusDescription = (): string => {
  if (!orderDetail.value) return ''

  if (orderDetail.value.refundStatus === RefundStatus.PENDING) {
    return '买家已申请退款，等待卖家处理'
  }

  const descMap: Record<OrderStatus, string> = {
    [OrderStatus.UNPAID]: '等待买家付款',
    [OrderStatus.PENDING_SHIP]: '买家已付款，等待卖家发货',
    [OrderStatus.PENDING_RECEIPT]: '卖家已发货，等待买家确认收货',
    [OrderStatus.COMPLETED]: '交易已完成',
    [OrderStatus.CANCELLED]: '订单已取消',
    [OrderStatus.FAILED]: '交易失败，资金已退还买家'
  }

  return descMap[orderDetail.value.orderStatus] || ''
}

const getPaymentStatusType = (): string => {
  if (!orderDetail.value) return 'info'

  const typeMap: Record<PaymentStatus, string> = {
    [PaymentStatus.UNPAID]: 'warning',
    [PaymentStatus.PAID]: 'success',
    [PaymentStatus.REFUNDED]: 'danger'
  }

  return typeMap[orderDetail.value.paymentStatus] || 'info'
}

const getPaymentStatusText = (): string => {
  if (!orderDetail.value) return '未知'

  const textMap: Record<PaymentStatus, string> = {
    [PaymentStatus.UNPAID]: '未支付',
    [PaymentStatus.PAID]: '已支付',
    [PaymentStatus.REFUNDED]: '已退款'
  }

  return textMap[orderDetail.value.paymentStatus] || '未知'
}

const formatDateTime = (dateStr: string): string => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

// Dispute type tag class
const getTypeTagClass = (type: number): string => {
  const classMap: Record<number, string> = {
    [DISPUTE_TYPE.SELLER_NOT_FULFILL]: 'type-danger',
    [DISPUTE_TYPE.MISMATCH]: 'type-warning',
    [DISPUTE_TYPE.QUALITY]: 'type-warning',
    [DISPUTE_TYPE.OTHER]: 'type-info'
  }
  return classMap[type] || 'type-info'
}

// Contact Handlers
const handleContactSeller = () => {
  if (!orderDetail.value) return
  router.push({
    name: 'ChatWithUser',
    params: { userId: orderDetail.value.sellerId },
    query: { relatedOrderId: orderDetail.value.id }
  })
}

const handleContactBuyer = () => {
  if (!orderDetail.value) return
  router.push({
    name: 'ChatWithUser',
    params: { userId: orderDetail.value.buyerId },
    query: { relatedOrderId: orderDetail.value.id }
  })
}

// Dispute Handle
const handleSubmit = async (actionType: number) => {
  if (!handleForm.adminReply.trim()) {
    ElMessage.warning('请输入管理员回复')
    return
  }

  if (!handleForm.resolution.trim()) {
    ElMessage.warning('请输入解决方案')
    return
  }

  if (!disputeDetail.value) return

  const actionText = actionType === HANDLE_ACTION.RESOLVE ? '处理' : '驳回'
  const confirmMessage = handleForm.needRefund
    ? `确认${actionText}此纠纷并退款 ¥${orderDetail.value?.totalAmount.toFixed(2)} 给买家？`
    : `确认${actionText}此纠纷？`

  try {
    await ElMessageBox.confirm(confirmMessage, '确认处理', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })

    submitting.value = true
    handleForm.actionType = actionType
    await handleDispute(disputeDetail.value.disputeId, handleForm)
    ElMessage.success('纠纷处理成功')
    // Refresh data
    fetchOrderDetail()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '处理失败')
    }
  } finally {
    submitting.value = false
  }
}

// Lifecycle
onMounted(() => {
  fetchOrderDetail()
})
</script>

<style scoped lang="scss">
.admin-order-detail-page {
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

        .refund-notice {
          margin-top: 16px;

          :deep(.el-alert) {
            background: rgba(255, 255, 255, 0.95);
            border: none;
          }
        }
      }
    }
  }

  // Info Cards
  .info-card,
  .timeline-card,
  .action-card,
  .contact-card,
  .order-info-card,
  .dispute-card,
  .no-dispute-card,
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
    }
  }

  // Service Detail
  .service-detail {
    display: flex;
    gap: 20px;

    .service-image {
      width: 120px;
      height: 90px;
      border-radius: 8px;
      cursor: pointer;
      flex-shrink: 0;
    }

    .service-info {
      flex: 1;

      .service-title {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
        margin: 0 0 12px;
        cursor: pointer;
        transition: color 0.3s;

        &:hover {
          color: #4f46e5;
        }
      }

      .service-desc {
        :deep(.el-descriptions__label) {
          color: #6b7280;
          font-weight: 400;
        }

        :deep(.el-descriptions__content) {
          color: #303133;
        }
      }

      .total-price {
        color: #4f46e5;
        font-size: 18px;
        font-weight: 600;
      }
    }
  }

  // Trade Location
  .trade-location {
    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 12px;
    }

    :deep(.el-alert) {
      border-radius: 8px;
    }
  }

  // Remark Section
  .remark-section {
    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 12px;
    }

    .remark-content {
      padding: 12px;
      background: #f9fafb;
      border-radius: 8px;
      color: #4b5563;
      line-height: 1.6;
    }
  }

  // Dispute Card
  .dispute-card {
    .type-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;

      &.type-danger {
        background: #fee2e2;
        color: #dc2626;
      }

      &.type-warning {
        background: #fef3c7;
        color: #d97706;
      }

      &.type-info {
        background: #dbeafe;
        color: #2563eb;
      }
    }

    .dispute-content {
      .complaint-section {
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 16px;

        .section-label {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 12px;
        }

        .complaint-text {
          font-size: 14px;
          color: #4b5563;
          line-height: 1.6;
          margin: 0;
        }
      }

      .result-section {
        .section-label {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 12px;
        }

        .result-card {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 12px;
          padding: 16px;

          .result-item {
            margin-bottom: 12px;

            &:last-child {
              margin-bottom: 0;
            }

            label {
              font-size: 13px;
              font-weight: 600;
              color: #166534;
              display: block;
              margin-bottom: 4px;
            }

            p {
              font-size: 14px;
              color: #15803d;
              margin: 0;
              line-height: 1.6;
            }
          }
        }
      }

      .handle-form-section {
        .section-label {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 16px;
        }

        .refund-tip {
          font-size: 13px;
          color: #dc2626;
          margin-top: 8px;
        }

        .action-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 16px;

          .el-button {
            padding: 10px 24px;
          }

          :deep(.el-button--primary) {
            background: #4f46e5;
            border-color: #4f46e5;

            &:hover:not(:disabled) {
              background: #4338ca;
              border-color: #4338ca;
            }
          }

          :deep(.el-button--success) {
            background: #059669;
            border-color: #059669;

            &:hover:not(:disabled) {
              background: #047857;
              border-color: #047857;
            }
          }
        }
      }
    }
  }

  // No Dispute Card
  .no-dispute-card {
    :deep(.el-empty__description) {
      color: #9ca3af;
    }
  }

  // Timeline
  .timeline-card {
    :deep(.el-timeline) {
      padding-left: 0;

      .el-timeline-item__wrapper {
        padding-left: 32px;
      }

      .el-timeline-item__timestamp {
        color: #6b7280;
        font-size: 13px;
      }

      .el-timeline-item__content {
        color: #303133;
        font-weight: 500;
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

        &.is-plain {
          background: transparent;
          color: #4f46e5;
          border-color: #4f46e5;

          &:hover:not(:disabled) {
            background: #eef2ff;
          }
        }
      }
    }
  }

  // Contact Card
  .contact-card {
    .contact-info {
      display: flex;
      align-items: center;
      gap: 16px;

      .user-avatar {
        background: #4f46e5;
        color: white;
        font-size: 20px;
        font-weight: 600;
      }

      .user-info {
        flex: 1;

        .user-name {
          font-size: 16px;
          font-weight: 600;
          color: #303133;
          margin: 0 0 4px;
        }

        .user-professional {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }
      }
    }
  }

  // Order Info Card
  .order-info-card {
    :deep(.el-descriptions) {
      .el-descriptions__label {
        color: #6b7280;
        font-weight: 400;
        font-size: 13px;
      }

      .el-descriptions__content {
        color: #303133;
        font-size: 13px;
      }
    }

    .order-number {
      font-family: monospace;
      color: #4f46e5;
    }
  }
}

// Responsive
@media (max-width: 768px) {
  .admin-order-detail-page {
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

    .service-detail {
      flex-direction: column;

      .service-image {
        width: 100%;
        height: 200px;
      }
    }

    .dispute-card {
      .dispute-content {
        .handle-form-section {
          .action-buttons {
            flex-direction: column;

            .el-button {
              width: 100%;
            }
          }
        }
      }
    }
  }
}
</style>
