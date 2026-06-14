<template>
  <div class="order-detail-page">
    <div class="page-container">
      <!-- Breadcrumb -->
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item
          :to="{ path: isBuyer ? '/orders' : '/orders/sales' }"
        >
          {{ isBuyer ? '我的购买' : '我的销售' }}
        </el-breadcrumb-item>
        <el-breadcrumb-item>订单详情</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="10" animated />
      </div>

      <!-- Error/Empty State with Retry -->
      <div v-else-if="!orderDetail" class="empty-state">
        <el-empty description="加载订单详情失败">
          <el-button type="primary" @click="fetchOrderDetail">
            重新加载
          </el-button>
        </el-empty>
      </div>

      <!-- Order Detail Content -->
      <div v-else-if="orderDetail">
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
              <!-- v2.0: 显示退款状态 -->
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
              <div v-if="orderDetail.tradeType === TradeType.OFFLINE && orderDetail.tradeLocation" class="trade-location">
                <el-divider />
                <h4 class="section-title">交易地点</h4>
                <el-alert
                  :title="orderDetail.tradeLocation.locationName"
                  type="info"
                  :closable="false"
                  show-icon
                >
                  <template #default>
                    {{ orderDetail.tradeLocation.locationAddress }}
                  </template>
                </el-alert>
              </div>

              <!-- Remark -->
              <div v-if="orderDetail.remark" class="remark-section">
                <el-divider />
                <h4 class="section-title">备注信息</h4>
                <div class="remark-content">{{ orderDetail.remark }}</div>
              </div>
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
                <!-- Buyer Actions -->
                <template v-if="isBuyer">
                  <template v-if="orderDetail.orderStatus === OrderStatus.UNPAID">
                    <el-button type="primary" size="large" @click="handlePay" :loading="actionLoading">
                      立即支付
                    </el-button>
                    <el-button size="large" @click="handleCancel" :loading="actionLoading">
                      取消订单
                    </el-button>
                  </template>

                  <!-- 待发货: 可直接申请退款 -->
                  <template v-else-if="orderDetail.orderStatus === OrderStatus.PENDING_SHIP">
                    <el-button type="warning" size="large" @click="handleApplyRefund" :loading="actionLoading">
                      申请退款
                    </el-button>
                  </template>

                  <!-- 待收货: 可确认收货或申请退款 -->
                  <template v-else-if="orderDetail.orderStatus === OrderStatus.PENDING_RECEIPT">
                    <el-button
                      v-if="canBuyerConfirm(orderDetail.orderStatus, orderDetail.refundStatus)"
                      type="success"
                      size="large"
                      @click="handleConfirmComplete"
                      :loading="actionLoading"
                    >
                      确认收货
                    </el-button>
                    <el-button
                      v-if="canApplyRefund(orderDetail.orderStatus, orderDetail.refundStatus)"
                      type="warning"
                      size="large"
                      @click="handleApplyRefund"
                      :loading="actionLoading"
                    >
                      申请退款
                    </el-button>
                    <el-tag
                      v-if="orderDetail.refundStatus === RefundStatus.PENDING"
                      type="warning"
                      size="large"
                      class="refund-tag"
                    >
                      退款申请中，等待卖家处理
                    </el-tag>
                  </template>

                  <template v-else-if="orderDetail.orderStatus === OrderStatus.COMPLETED">
                    <!-- Review button for buyer -->
                    <el-button
                      v-if="!orderDetail.isReviewed"
                      type="primary"
                      size="large"
                      @click="reviewDialogVisible = true"
                    >
                      去评价
                    </el-button>
                    <el-tag
                      v-else
                      type="success"
                      size="large"
                      class="reviewed-tag"
                    >
                      已评价
                    </el-tag>
                  </template>
                </template>

                <!-- Seller Actions -->
                <template v-else>
                  <!-- 待发货: 可发货 -->
                  <template v-if="orderDetail.orderStatus === OrderStatus.PENDING_SHIP">
                    <el-button type="success" size="large" @click="handleShipOrder" :loading="actionLoading">
                      发货
                    </el-button>
                  </template>

                  <!-- 待收货: 处理退款或等待 -->
                  <template v-else-if="orderDetail.orderStatus === OrderStatus.PENDING_RECEIPT">
                    <el-tag
                      v-if="orderDetail.refundStatus === RefundStatus.PENDING"
                      type="warning"
                      size="large"
                      class="refund-tag"
                    >
                      买家申请退款中
                    </el-tag>
                    <el-button
                      v-if="canSellerHandleRefund(orderDetail.orderStatus, orderDetail.refundStatus)"
                      type="danger"
                      size="large"
                      @click="handleProcessRefund"
                      :loading="actionLoading"
                    >
                      处理退款
                    </el-button>
                    <el-button v-else size="large" disabled>
                      等待买家确认收货
                    </el-button>
                  </template>

                  <template v-else-if="orderDetail.orderStatus === OrderStatus.COMPLETED">
                    <el-button size="large" disabled>
                      订单已完成
                    </el-button>
                  </template>
                </template>

                <!-- Common Actions -->
                <el-button plain size="large" @click="handleContact">
                  {{ isBuyer ? '联系卖家' : '联系买家' }}
                </el-button>

                <!-- 发起纠纷: 只要订单已支付就可以发起 -->
                <el-button
                  v-if="orderDetail.orderStatus >= OrderStatus.PENDING_SHIP && orderDetail.orderStatus <= OrderStatus.FAILED"
                  type="danger"
                  plain
                  size="large"
                  @click="handleOpenDisputeDialog"
                >
                  发起纠纷
                </el-button>
              </div>
            </el-card>

            <!-- Contact Card -->
            <el-card class="contact-card" shadow="never">
              <template #header>
                <div class="card-header">
                  <span class="header-title">{{ isBuyer ? '卖家信息' : '买家信息' }}</span>
                </div>
              </template>

              <div class="contact-info">
                <el-avatar
                  :size="60"
                  :src="buildImageUrl(isBuyer ? orderDetail.sellerAvatar : orderDetail.buyerAvatar)"
                  class="user-avatar"
                >
                  {{ (isBuyer ? orderDetail.sellerName : orderDetail.buyerName)?.charAt(0) }}
                </el-avatar>
                <div class="user-info">
                  <h4 class="user-name">{{ isBuyer ? orderDetail.sellerName : orderDetail.buyerName }}</h4>
                  <p class="user-professional">
                    {{ isBuyer ? orderDetail.sellerProfessional : orderDetail.buyerProfessional }}
                  </p>
                </div>
              </div>

              <el-divider />

              <!-- Order Basic Info -->
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
      </div>

      <!-- Refund Dialog (v2.0 new, for seller) -->
      <el-dialog
        v-model="refundDialogVisible"
        title="处理退款申请"
        width="500px"
        :close-on-click-modal="false"
      >
        <div class="refund-dialog-content" v-if="orderDetail">
          <div class="refund-info">
            <p><strong>订单号：</strong>{{ orderDetail.orderNumber }}</p>
            <p><strong>服务：</strong>{{ orderDetail.serviceTitle }}</p>
            <p><strong>金额：</strong>¥{{ orderDetail.totalAmount?.toFixed(2) }}</p>
            <p v-if="orderDetail.refundReason"><strong>退款原因：</strong>{{ orderDetail.refundReason }}</p>
          </div>
          <el-divider />
          <div class="refund-actions">
            <p class="action-tip">请选择处理方式：</p>
            <el-input
              v-model="rejectReason"
              type="textarea"
              placeholder="如需拒绝退款，请填写拒绝原因..."
              :rows="3"
              maxlength="200"
              show-word-limit
            />
          </div>
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="refundDialogVisible = false">取消</el-button>
            <el-button type="danger" @click="handleRejectRefund" :loading="actionLoading">
              拒绝退款
            </el-button>
            <el-button type="success" @click="handleApproveRefund" :loading="actionLoading">
              同意退款
            </el-button>
          </span>
        </template>
      </el-dialog>

      <!-- Dispute Dialog -->
      <el-dialog
        v-model="disputeDialogVisible"
        title="发起纠纷"
        width="500px"
        :close-on-click-modal="false"
      >
        <div class="dispute-dialog-content" v-if="orderDetail">
          <div class="dispute-info">
            <p><strong>订单号：</strong>{{ orderDetail.orderNumber }}</p>
            <p><strong>服务：</strong>{{ orderDetail.serviceTitle }}</p>
            <p><strong>金额：</strong>¥{{ orderDetail.totalAmount?.toFixed(2) }}</p>
          </div>
          <el-divider />
          <el-form :model="disputeForm" label-position="top">
            <el-form-item label="纠纷类型" required>
              <el-select v-model="disputeForm.disputeType" placeholder="请选择纠纷类型" style="width: 100%">
                <el-option
                  v-for="item in disputeTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="问题描述" required>
              <el-input
                v-model="disputeForm.description"
                type="textarea"
                placeholder="请详细描述您遇到的问题..."
                :rows="4"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>
          </el-form>
          <el-alert
            type="info"
            :closable="false"
            show-icon
          >
            提交纠纷后，平台管理员将介入处理。请确保描述准确、完整。
          </el-alert>
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="disputeDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleSubmitDispute" :loading="actionLoading">
              提交纠纷
            </el-button>
          </span>
        </template>
      </el-dialog>

      <!-- Review Dialog -->
      <ServiceReviewDialog
        v-if="orderDetail"
        :order-id="orderDetail.id"
        :visible="reviewDialogVisible"
        @update:visible="reviewDialogVisible = $event"
        @success="handleReviewSuccess"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  CircleCheck,
  Clock,
  CircleClose,
  WarningFilled,
  ShoppingCart,
  RefreshRight,
  Van,
  Box
} from '@element-plus/icons-vue'
import {
  getOrderDetail,
  payOrder,
  cancelOrder,
  buyerConfirm,
  sellerShip,
  sellerHandleRefund,
  applyRefund
} from '@/api/order'
import { createDispute } from '@/api/dispute'
import ServiceReviewDialog from '@/components/review/ServiceReviewDialog.vue'
import {
  DISPUTE_TYPE,
  disputeTypeOptions,
  type DisputeCreateRequest
} from '@/types/dispute'
import { buildImageUrl } from '@/api/service'
import type { OrderDetail } from '@/types/order'
import {
  OrderStatus,
  PaymentStatus,
  RefundStatus,
  TradeType,
  getOrderStatusText as getStatusText,
  getRefundStatusText,
  getRefundStatusType,
  canApplyRefund,
  canBuyerConfirm,
  canSellerShip,
  canSellerHandleRefund
} from '@/types/order'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()

// Data
const loading = ref(true)
const actionLoading = ref(false)
const orderDetail = ref<OrderDetail | null>(null)

// Refund dialog (for seller)
const refundDialogVisible = ref(false)
const rejectReason = ref('')

// Dispute dialog
const disputeDialogVisible = ref(false)

// Review dialog
const reviewDialogVisible = ref(false)
const disputeForm = ref<DisputeCreateRequest>({
  orderId: 0,
  disputeType: DISPUTE_TYPE.SELLER_NOT_FULFILL,
  description: ''
})

// Computed
const orderId = computed(() => {
  const id = route.params.id
  return typeof id === 'string' ? parseInt(id) : 0
})

const isBuyer = computed(() => {
  if (!orderDetail.value || !userStore.userInfo) return false
  return orderDetail.value.buyerId === userStore.userInfo.id
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

  // v2.0: 退款相关时间线
  if (orderDetail.value.refundRequestTime && orderDetail.value.refundStatus) {
    timeline.push({
      label: '买家申请退款',
      time: orderDetail.value.refundRequestTime,
      type: 'warning'
    })

    if (orderDetail.value.refundStatus === RefundStatus.APPROVED) {
      timeline.push({
        label: '卖家同意退款',
        time: orderDetail.value.refundRequestTime, // 实际应该有单独字段
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
      time: orderDetail.value.createTime, // 实际应该有单独字段
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
    router.back()
    return
  }

  loading.value = true
  try {
    orderDetail.value = await getOrderDetail(orderId.value)
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

  // v2.0: 根据退款状态显示不同描述
  if (orderDetail.value.refundStatus === RefundStatus.PENDING) {
    return isBuyer.value ? '等待卖家处理退款申请' : '买家申请退款，请尽快处理'
  }

  const descMap: Record<OrderStatus, string> = {
    [OrderStatus.UNPAID]: isBuyer.value ? '请尽快完成支付' : '等待买家付款',
    [OrderStatus.PENDING_SHIP]: isBuyer.value ? '等待卖家发货' : '买家已付款，请尽快发货',
    [OrderStatus.PENDING_RECEIPT]: isBuyer.value ? '卖家已发货，请确认收货' : '等待买家确认收货',
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

// Action Handlers
const handlePay = async () => {
  if (!orderDetail.value) return

  try {
    await ElMessageBox.confirm(
      `确认支付 ¥${orderDetail.value.totalAmount.toFixed(2)}？`,
      '确认支付',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    actionLoading.value = true
    await payOrder(orderId.value)
    ElMessage.success('支付成功')
    fetchOrderDetail()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '支付失败')
    }
  } finally {
    actionLoading.value = false
  }
}

const handleCancel = async () => {
  try {
    await ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    actionLoading.value = true
    await cancelOrder(orderId.value)
    ElMessage.success('订单已取消')
    fetchOrderDetail()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '取消失败')
    }
  } finally {
    actionLoading.value = false
  }
}

const handleConfirmComplete = async () => {
  try {
    await ElMessageBox.confirm('确认已收到服务/商品？确认后资金将释放给卖家', '确认收货', {
      confirmButtonText: '确认收货',
      cancelButtonText: '取消',
      type: 'success'
    })

    actionLoading.value = true
    await buyerConfirm(orderId.value)
    ElMessage.success('订单已完成')
    fetchOrderDetail()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '确认失败')
    }
  } finally {
    actionLoading.value = false
  }
}

const handleApplyRefund = async () => {
  if (!orderDetail.value) return

  // v2.0: 根据订单状态给出不同提示
  const isPendingShip = orderDetail.value.orderStatus === OrderStatus.PENDING_SHIP
  const message = isPendingShip
    ? '待发货状态申请退款将直接退还资金'
    : '待收货状态申请退款需等待卖家处理（3天内）'

  try {
    const { value: reason } = await ElMessageBox.prompt(
      `请输入退款原因\n\n提示：${message}`,
      '申请退款',
      {
        confirmButtonText: '提交申请',
        cancelButtonText: '取消',
        inputPattern: /\S+/,
        inputErrorMessage: '请输入退款原因'
      }
    )

    actionLoading.value = true
    await applyRefund(orderId.value, reason)
    ElMessage.success(isPendingShip ? '退款成功' : '退款申请已提交，等待卖家处理')
    fetchOrderDetail()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '申请失败')
    }
  } finally {
    actionLoading.value = false
  }
}

const handleShipOrder = async () => {
  try {
    await ElMessageBox.confirm(
      '确认发货？发货后买家可确认收货完成交易',
      '确认发货',
      {
        confirmButtonText: '确认发货',
        cancelButtonText: '取消',
        type: 'success'
      }
    )

    actionLoading.value = true
    await sellerShip(orderId.value)
    ElMessage.success('已发货，等待买家确认收货')
    fetchOrderDetail()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '发货失败')
    }
  } finally {
    actionLoading.value = false
  }
}

const handleProcessRefund = async () => {
  refundDialogVisible.value = true
  rejectReason.value = ''
}

const handleApproveRefund = async () => {
  try {
    await ElMessageBox.confirm(
      '确认同意退款？资金将退还给买家',
      '同意退款',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    actionLoading.value = true
    await sellerHandleRefund(orderId.value, { approve: true })
    ElMessage.success('已同意退款')
    refundDialogVisible.value = false
    fetchOrderDetail()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  } finally {
    actionLoading.value = false
  }
}

const handleRejectRefund = async () => {
  if (!rejectReason.value.trim()) {
    ElMessage.warning('请填写拒绝原因')
    return
  }

  try {
    await ElMessageBox.confirm(
      '确认拒绝退款？买家可以发起纠纷',
      '拒绝退款',
      {
        confirmButtonText: '确认拒绝',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    actionLoading.value = true
    await sellerHandleRefund(orderId.value, {
      approve: false,
      rejectReason: rejectReason.value
    })
    ElMessage.success('已拒绝退款')
    refundDialogVisible.value = false
    fetchOrderDetail()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  } finally {
    actionLoading.value = false
  }
}

const handleContact = () => {
  if (!orderDetail.value) return

  // 获取对方用户ID（买家联系卖家，卖家联系买家）
  const targetUserId = isBuyer.value
    ? orderDetail.value.sellerId
    : orderDetail.value.buyerId

  // 跳转到聊天页面
  router.push({
    name: 'ChatWithUser',
    params: { userId: targetUserId },
    query: { relatedOrderId: orderDetail.value.id }
  })
}

// Dispute Handlers
const handleOpenDisputeDialog = () => {
  if (!orderDetail.value) return
  disputeForm.value = {
    orderId: orderDetail.value.id,
    disputeType: DISPUTE_TYPE.SELLER_NOT_FULFILL,
    description: ''
  }
  disputeDialogVisible.value = true
}

const handleSubmitDispute = async () => {
  if (!disputeForm.value.description.trim()) {
    ElMessage.warning('请填写问题描述')
    return
  }

  try {
    actionLoading.value = true
    const disputeId = await createDispute(disputeForm.value)
    ElMessage.success('纠纷已提交，等待管理员处理')
    disputeDialogVisible.value = false
    // 跳转到纠纷详情页
    router.push(`/disputes/${disputeId}`)
  } catch (error: any) {
    ElMessage.error(error.message || '提交纠纷失败')
  } finally {
    actionLoading.value = false
  }
}

// Review Handler
const handleReviewSuccess = () => {
  if (orderDetail.value) {
    orderDetail.value.isReviewed = true
  }
}

// Lifecycle
onMounted(() => {
  if (!userStore.isLogin) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  fetchOrderDetail()
})
</script>

<style scoped lang="scss">
.order-detail-page {
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

  // Empty/Error State
  .empty-state {
    background: white;
    border-radius: 16px;
    padding: 60px 40px;
    text-align: center;
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
      align-items: stretch;
      gap: 12px;

      .el-button {
        width: 100%;
        height: 44px;
        font-size: 15px;
        font-weight: 500;
        margin-left: 0;
      }

      .el-button--primary {
        background: #4f46e5;
        border-color: #4f46e5;

        &:hover:not(:disabled) {
          background: #4338ca;
          border-color: #4338ca;
        }
      }

      .refund-tag,
      .reviewed-tag {
        padding: 12px;
        font-size: 14px;
        width: 100%;
        text-align: center;
      }
    }
  }

  // Contact Card
  .contact-card {
    .contact-info {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;

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
  .order-detail-page {
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
  }
}

// Refund dialog styles (v2.0 new)
.refund-dialog-content {
  .refund-info {
    p {
      margin: 8px 0;
      font-size: 14px;
      color: #303133;

      strong {
        color: #6b7280;
      }
    }
  }

  .refund-actions {
    .action-tip {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 12px;
    }
  }
}

// Dispute dialog styles
.dispute-dialog-content {
  .dispute-info {
    p {
      margin: 8px 0;
      font-size: 14px;
      color: #303133;

      strong {
        color: #6b7280;
      }
    }
  }

  :deep(.el-form-item__label) {
    font-weight: 600;
    color: #303133;
  }

  :deep(.el-alert) {
    margin-top: 16px;
  }
}
</style>
