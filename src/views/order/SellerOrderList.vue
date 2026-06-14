<template>
  <div class="seller-order-list-page">
    <div class="page-container">
      <!-- Page Header -->
      <div class="page-header">
        <h1 class="page-title">我的销售订单</h1>
        <p class="page-subtitle">管理您销售的所有服务订单</p>
      </div>

      <!-- Main Card -->
      <el-card class="order-list-card" shadow="never">
        <!-- Status Tabs -->
        <div class="order-tabs">
          <button
            v-for="tab in statusTabs"
            :key="tab.value ?? 'all'"
            :class="['tab-item', { active: currentStatus === tab.value }]"
            @click="handleTabChange(tab.value)"
          >
            {{ tab.label }}
            <span v-if="tab.count" class="tab-count">({{ tab.count }})</span>
          </button>
        </div>

        <!-- Order List -->
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="5" animated />
        </div>

        <div v-else-if="orders.length === 0" class="empty-container">
          <el-empty description="暂无订单">
            <el-button type="primary" @click="router.push('/my-services')">
              管理我的服务
            </el-button>
          </el-empty>
        </div>

        <div v-else class="order-list">
          <div v-for="order in orders" :key="order.id" class="order-card">
            <!-- Order Header -->
            <div class="order-header">
              <div class="header-left">
                <span class="order-time">{{ formatTime(order.createTime) }}</span>
                <span class="order-number">订单号：{{ order.orderNumber }}</span>
                <div class="buyer-info">
                  <el-avatar
                    :size="24"
                    :src="order.buyerAvatar ? buildImageUrl(order.buyerAvatar) : undefined"
                    style="margin-right: 8px"
                  >
                    {{ order.buyerName?.charAt(0) }}
                  </el-avatar>
                  <span class="buyer-name">买家：{{ order.buyerName }}</span>
                </div>
              </div>
              <div class="header-right">
                <el-tag :type="getStatusTagType(order.orderStatus)" size="small">
                  {{ getOrderStatusText(order.orderStatus) }}
                </el-tag>
                <el-tag
                  v-if="order.paymentStatus === PaymentStatus.REFUNDED"
                  type="warning"
                  size="small"
                  class="refund-tag"
                >
                  已退款
                </el-tag>
              </div>
            </div>

            <!-- Order Body -->
            <div class="order-body">
              <div class="order-content">
                <img
                  :src="buildImageUrl(order.serviceImage)"
                  :alt="order.serviceTitle"
                  class="service-image"
                  @click="router.push(`/services/${order.serviceId}`)"
                />
                <div class="service-info">
                  <h4 @click="router.push(`/services/${order.serviceId}`)">
                    {{ order.serviceTitle }}
                  </h4>
                  <div class="price-info">
                    <span>¥{{ order.unitPrice.toFixed(2) }}</span>
                    <span class="quantity">× {{ order.quantity }}</span>
                  </div>
                  <div class="total-amount">
                    总额：<span class="amount">¥{{ order.totalAmount.toFixed(2) }}</span>
                  </div>
                  <div v-if="order.remark" class="order-remark">
                    备注：{{ order.remark }}
                  </div>
                </div>
              </div>

              <!-- Order Actions (v2.0 updated) -->
              <div class="order-actions">
                <template v-if="order.orderStatus === OrderStatus.PENDING_SHIP">
                  <el-button type="success" size="small" @click="handleConfirmOrder(order)">
                    发货
                  </el-button>
                </template>

                <template v-else-if="order.orderStatus === OrderStatus.PENDING_RECEIPT">
                  <el-button size="small" @click="handleContactBuyer(order)">
                    联系买家
                  </el-button>
                  <el-tag
                    v-if="order.refundStatus === RefundStatus.PENDING"
                    type="warning"
                    size="small"
                  >
                    退款申请中
                  </el-tag>
                  <el-button
                    v-if="order.refundStatus === RefundStatus.PENDING"
                    type="danger"
                    size="small"
                    @click="handleRefund(order)"
                  >
                    处理退款
                  </el-button>
                </template>

                <template v-else-if="order.orderStatus === OrderStatus.COMPLETED">
                  <el-button size="small" @click="handleViewReview(order)">
                    查看评价
                  </el-button>
                </template>

                <el-button
                  text
                  type="primary"
                  size="small"
                  @click="router.push(`/orders/${order.id}`)"
                >
                  查看详情
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="orders.length > 0" class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 30, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
            background
          />
        </div>
      </el-card>

      <!-- Refund Dialog (v2.0 new) -->
      <el-dialog
        v-model="refundDialogVisible"
        title="处理退款申请"
        width="500px"
        :close-on-click-modal="false"
      >
        <div class="refund-dialog-content">
          <div class="refund-info">
            <p><strong>订单号：</strong>{{ currentRefundOrder?.orderNumber }}</p>
            <p><strong>服务：</strong>{{ currentRefundOrder?.serviceTitle }}</p>
            <p><strong>金额：</strong>¥{{ currentRefundOrder?.totalAmount?.toFixed(2) }}</p>
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
            <el-button type="danger" @click="handleRejectRefund">
              拒绝退款
            </el-button>
            <el-button type="success" @click="handleApproveRefund">
              同意退款
            </el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  listSellerOrders,
  sellerShip,
  sellerHandleRefund
} from '@/api/order'
import { buildImageUrl } from '@/api/service'
import type { OrderListItem } from '@/types/order'
import {
  OrderStatus,
  PaymentStatus,
  RefundStatus,
  getOrderStatusText,
  getRefundStatusText,
  getRefundStatusType
} from '@/types/order'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()

// Data
const loading = ref(false)
const orders = ref<OrderListItem[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const currentStatus = ref<OrderStatus | null>(null)

// Refund dialog
const refundDialogVisible = ref(false)
const currentRefundOrder = ref<OrderListItem | null>(null)
const rejectReason = ref('')

// Status tabs (v2.0 updated)
const statusTabs = reactive([
  { label: '全部', value: null, count: 0 },
  { label: '待发货', value: OrderStatus.PENDING_SHIP, count: 0 },
  { label: '待收货', value: OrderStatus.PENDING_RECEIPT, count: 0 },
  { label: '已完成', value: OrderStatus.COMPLETED, count: 0 },
  { label: '已取消', value: OrderStatus.CANCELLED, count: 0 }
])

// Methods
const fetchOrders = async () => {
  loading.value = true
  try {
    const result = await listSellerOrders({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      orderStatus: currentStatus.value || undefined
    })

    orders.value = result.records
    total.value = result.total
  } catch (error) {
    console.error('Failed to fetch orders:', error)
    ElMessage.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

const handleTabChange = (status: OrderStatus | null) => {
  currentStatus.value = status
  currentPage.value = 1
  fetchOrders()
}

const handlePageChange = () => fetchOrders()
const handleSizeChange = () => {
  currentPage.value = 1
  fetchOrders()
}

const handleConfirmOrder = async (order: OrderListItem) => {
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

    appStore.setLoading(true)
    await sellerShip(order.id)
    ElMessage.success('已发货，等待买家确认收货')
    fetchOrders()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '发货失败')
    }
  } finally {
    appStore.setLoading(false)
  }
}

const handleRejectOrder = async (order: OrderListItem) => {
  // 待发货状态下不支持卖家拒绝，买家可自行申请退款
  ElMessage.info('买家可在待发货状态下直接申请退款，无需卖家拒绝')
}

const handleRefund = async (order: OrderListItem) => {
  currentRefundOrder.value = order
  rejectReason.value = ''
  refundDialogVisible.value = true
}

const handleApproveRefund = async () => {
  if (!currentRefundOrder.value) return

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

    appStore.setLoading(true)
    await sellerHandleRefund(currentRefundOrder.value.id, { approve: true })
    ElMessage.success('已同意退款')
    refundDialogVisible.value = false
    fetchOrders()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  } finally {
    appStore.setLoading(false)
  }
}

const handleRejectRefund = async () => {
  if (!currentRefundOrder.value) return

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

    appStore.setLoading(true)
    await sellerHandleRefund(currentRefundOrder.value.id, {
      approve: false,
      rejectReason: rejectReason.value
    })
    ElMessage.success('已拒绝退款')
    refundDialogVisible.value = false
    fetchOrders()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  } finally {
    appStore.setLoading(false)
  }
}

const handleContactBuyer = (order: OrderListItem) => {
  // 卖家联系买家
  router.push({
    name: 'ChatWithUser',
    params: { userId: order.buyerId },
    query: { relatedOrderId: order.id }
  })
}

const handleViewReview = (order: OrderListItem) => {
  ElMessage.info('评价功能暂未开发')
}

const getStatusTagType = (status: OrderStatus): string => {
  const typeMap: Record<OrderStatus, string> = {
    [OrderStatus.UNPAID]: 'info',
    [OrderStatus.PENDING_SHIP]: 'warning',
    [OrderStatus.PENDING_RECEIPT]: '',
    [OrderStatus.COMPLETED]: 'success',
    [OrderStatus.CANCELLED]: 'info',
    [OrderStatus.FAILED]: 'danger'
  }
  return typeMap[status] || 'info'
}

const formatTime = (time: string): string => {
  return new Date(time).toLocaleString('zh-CN')
}

// Lifecycle
onMounted(() => {
  if (!userStore.isLogin) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  fetchOrders()
})
</script>

<style scoped lang="scss">
.seller-order-list-page {
  min-height: 100vh;
  background: #f9fafb;
  padding: 24px 0 60px;

  .page-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .page-header {
    text-align: center;
    margin-bottom: 32px;

    .page-title {
      font-size: 32px;
      font-weight: 700;
      color: #303133;
      margin: 0 0 8px;
    }

    .page-subtitle {
      font-size: 16px;
      color: #4b5563;
    }
  }

  .order-list-card {
    border-radius: 16px;
    border: none;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  }

  .order-tabs {
    display: flex;
    gap: 24px;
    margin-bottom: 24px;
    border-bottom: 1px solid #e5e7eb;

    .tab-item {
      position: relative;
      padding: 12px 0;
      font-size: 15px;
      color: #6b7280;
      font-weight: 500;
      background: none;
      border: none;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        color: #4f46e5;
      }

      &.active {
        color: #4f46e5;

        &::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 2px;
          background: #4f46e5;
        }
      }

      .tab-count {
        color: #9ca3af;
        font-weight: 400;
        font-size: 14px;
      }
    }
  }

  .order-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    margin-bottom: 16px;
    overflow: hidden;

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 20px;
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;

      .header-left {
        display: flex;
        gap: 24px;
        font-size: 13px;
        color: #6b7280;

        .order-number {
          font-family: monospace;
        }

        .buyer-name {
          color: #4f46e5;
          font-weight: 500;
        }
      }

      .header-right {
        display: flex;
        gap: 8px;
        align-items: center;

        .refund-tag {
          background: #fef3c7;
          color: #d97706;
          border: 1px solid #fbbf24;
        }
      }
    }

    .order-body {
      display: flex;
      justify-content: space-between;
      padding: 20px;

      .order-content {
        display: flex;
        gap: 16px;
        flex: 1;

        .service-image {
          width: 100px;
          height: 80px;
          object-fit: cover;
          border-radius: 8px;
          cursor: pointer;
        }

        .service-info {
          flex: 1;

          h4 {
            margin: 0 0 8px;
            font-size: 16px;
            font-weight: 600;
            color: #303133;
            cursor: pointer;
            transition: color 0.3s;

            &:hover {
              color: #4f46e5;
            }
          }

          .price-info {
            font-size: 14px;
            color: #6b7280;
            margin: 4px 0;

            .quantity {
              margin-left: 8px;
              color: #9ca3af;
            }
          }

          .total-amount {
            font-size: 14px;
            color: #6b7280;
            margin-top: 8px;

            .amount {
              color: #4f46e5;
              font-weight: 600;
              font-size: 16px;
            }
          }

          .order-remark {
            font-size: 13px;
            color: #9ca3af;
            margin-top: 8px;
            padding: 8px;
            background: #f9fafb;
            border-radius: 4px;
          }
        }
      }

      .order-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
        max-width: 300px;
        justify-content: flex-end;
      }
    }
  }

  .pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 32px;

    :deep(.el-pagination) {
      .el-pager li.active {
        background: #4f46e5;
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
}
</style>
