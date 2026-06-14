<template>
  <div class="buyer-order-list-page">
    <div class="page-container">
      <!-- Page Header -->
      <div class="page-header">
        <h1 class="page-title">我的购买订单</h1>
        <p class="page-subtitle">管理您购买的所有服务订单</p>
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
            <el-button type="primary" @click="router.push('/services')">
              去购买服务
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
                <div class="seller-info">
                  <el-avatar
                    :size="24"
                    :src="order.sellerAvatar ? buildImageUrl(order.sellerAvatar) : undefined"
                    style="margin-right: 8px"
                  >
                    {{ order.sellerName?.charAt(0) }}
                  </el-avatar>
                  <span class="seller-name">卖家：{{ order.sellerName }}</span>
                </div>
              </div>
              <div class="header-right">
                <el-tag :type="getStatusTagType(order.orderStatus)" size="small">
                  {{ getOrderStatusText(order.orderStatus) }}
                </el-tag>
                <!-- v2.0: 显示退款状态（优先显示已退款） -->
                <el-tag
                  v-if="order.paymentStatus === PaymentStatus.REFUNDED"
                  type="danger"
                  size="small"
                >
                  已退款
                </el-tag>
                <el-tag
                  v-else-if="Number(order.refundStatus || RefundStatus.NONE) > RefundStatus.NONE"
                  :type="getRefundStatusType(order.refundStatus || RefundStatus.NONE)"
                  size="small"
                >
                  {{ getRefundStatusText(order.refundStatus || RefundStatus.NONE) }}
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
                </div>
              </div>

              <!-- Order Actions (v2.0 updated) -->
              <div class="order-actions">
                <template v-if="order.orderStatus === OrderStatus.UNPAID">
                  <el-button type="primary" size="small" @click="handlePay(order)">
                    立即支付
                  </el-button>
                  <el-button size="small" @click="handleCancel(order)">
                    取消订单
                  </el-button>
                </template>

                <!-- 待发货: 可直接申请退款 -->
                <template v-else-if="order.orderStatus === OrderStatus.PENDING_SHIP">
                  <el-button size="small" @click="handleContact(order)">
                    联系卖家
                  </el-button>
                  <el-button type="warning" size="small" @click="handleRefund(order)">
                    申请退款
                  </el-button>
                </template>

                <!-- 待收货: 可确认收货或申请退款 -->
                <template v-else-if="order.orderStatus === OrderStatus.PENDING_RECEIPT">
                  <el-button
                    v-if="canBuyerConfirm(order.orderStatus, order.refundStatus)"
                    type="success"
                    size="small"
                    @click="handleConfirm(order)"
                  >
                    确认收货
                  </el-button>
                  <el-button size="small" @click="handleContact(order)">
                    联系卖家
                  </el-button>
                  <el-button
                    v-if="canApplyRefund(order.orderStatus, order.refundStatus)"
                    type="warning"
                    size="small"
                    @click="handleRefund(order)"
                  >
                    申请退款
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  listBuyerOrders,
  payOrder,
  cancelOrder,
  buyerConfirm,
  applyRefund
} from '@/api/order'
import { buildImageUrl } from '@/api/service'
import type { OrderListItem } from '@/types/order'
import {
  OrderStatus,
  PaymentStatus,
  RefundStatus,
  getOrderStatusText,
  getOrderStatusType,
  getRefundStatusText,
  getRefundStatusType,
  canApplyRefund,
  canBuyerConfirm
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

// Status tabs (v2.0 updated)
const statusTabs = reactive([
  { label: '全部', value: null, count: 0 },
  { label: '待支付', value: OrderStatus.UNPAID, count: 0 },
  { label: '待发货', value: OrderStatus.PENDING_SHIP, count: 0 },
  { label: '待收货', value: OrderStatus.PENDING_RECEIPT, count: 0 },
  { label: '已完成', value: OrderStatus.COMPLETED, count: 0 },
  { label: '已取消', value: OrderStatus.CANCELLED, count: 0 }
])

// Methods
const fetchOrders = async () => {
  loading.value = true
  try {
    const result = await listBuyerOrders({
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

const handlePay = async (order: OrderListItem) => {
  try {
    await ElMessageBox.confirm(
      `确认支付 ¥${order.totalAmount.toFixed(2)}？`,
      '确认支付',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    appStore.setLoading(true)
    await payOrder(order.id)
    ElMessage.success('支付成功')
    fetchOrders()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '支付失败')
    }
  } finally {
    appStore.setLoading(false)
  }
}

const handleCancel = async (order: OrderListItem) => {
  try {
    await ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await cancelOrder(order.id)
    ElMessage.success('订单已取消')
    fetchOrders()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '取消失败')
    }
  }
}

const handleConfirm = async (order: OrderListItem) => {
  try {
    await ElMessageBox.confirm('确认已收到服务/商品？确认后资金将释放给卖家', '确认收货', {
      confirmButtonText: '确认收货',
      cancelButtonText: '取消',
      type: 'success'
    })

    await buyerConfirm(order.id)
    ElMessage.success('订单已完成')
    fetchOrders()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '确认失败')
    }
  }
}

const handleRefund = async (order: OrderListItem) => {
  // v2.0: 根据订单状态给出不同提示
  const isPendingShip = order.orderStatus === OrderStatus.PENDING_SHIP
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

    await applyRefund(order.id, reason)
    ElMessage.success(isPendingShip ? '退款成功' : '退款申请已提交，等待卖家处理')
    fetchOrders()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '申请失败')
    }
  }
}

const handleContact = (order: OrderListItem) => {
  // 买家联系卖家
  router.push({
    name: 'ChatWithUser',
    params: { userId: order.sellerId },
    query: { relatedOrderId: order.id }
  })
}

const getStatusTagType = (status: OrderStatus): string => {
  const typeMap: Record<OrderStatus, string> = {
    [OrderStatus.UNPAID]: 'warning',
    [OrderStatus.PENDING_SHIP]: 'primary',
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
.buyer-order-list-page {
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
        }
      }

      .order-actions {
        display: flex;
        align-items: center;
        gap: 8px;
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
}
</style>
