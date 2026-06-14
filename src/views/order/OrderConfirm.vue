<template>
  <div class="order-confirm-page">
    <div class="page-container">
      <!-- Page Header -->
      <div class="page-header">
        <h1 class="page-title">确认订单</h1>
        <p class="page-subtitle">请核对服务信息并完成支付</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="10" animated />
      </div>

      <!-- Main Content -->
      <template v-else-if="serviceDetail">
        <el-row :gutter="24">
          <!-- Left Column: Service Info -->
          <el-col :xs="24" :md="16">
            <el-card class="service-summary-card" shadow="never">
              <h3 class="card-title">服务信息</h3>

              <div class="service-info">
                <el-image
                  :src="buildImageUrl(serviceDetail.images?.[0])"
                  class="service-image"
                  fit="cover"
                />

                <div class="service-content">
                  <h4 class="service-title">{{ serviceDetail.serviceTitle }}</h4>
                  <p class="service-seller">
                    <span class="label">服务商：</span>
                    <span>{{ serviceDetail.sellerName }}</span>
                  </p>
                  <p class="service-price">
                    <span class="label">单价：</span>
                    <span class="price">¥{{ serviceDetail.price.toFixed(2) }}</span>
                  </p>
                  <div class="service-tags">
                    <el-tag size="small">{{ serviceDetail.tagName }}</el-tag>
                    <el-tag size="small" :type="serviceDetail.tradeType === 1 ? 'warning' : 'success'">
                      {{ getTradeTypeText(serviceDetail.tradeType) }}
                    </el-tag>
                  </div>
                </div>
              </div>

              <!-- Trade Location Info for Offline -->
              <div v-if="serviceDetail.tradeType === 1" class="trade-location">
                <el-alert
                  title="线下交易服务，请在订单信息中选择交易地点"
                  type="info"
                  :closable="false"
                  show-icon
                />
              </div>
            </el-card>
          </el-col>

          <!-- Right Column: Order Confirm -->
          <el-col :xs="24" :md="8">
            <el-card class="confirm-box-card" shadow="never">
              <h3 class="card-title">订单信息</h3>

              <el-form
                ref="formRef"
                :model="form"
                :rules="rules"
                label-position="top"
                class="order-form"
              >
                <!-- Trade Location (Offline only) -->
                <el-form-item
                  v-if="serviceDetail.tradeType === 1"
                  label="交易地点"
                  prop="tradeLocationId"
                >
                  <el-select
                    v-model="form.tradeLocationId"
                    placeholder="请选择线下交易地点"
                    class="w-full"
                  >
                    <el-option
                      v-for="loc in tradeLocations"
                      :key="loc.id"
                      :label="loc.locationName"
                      :value="loc.id"
                    >
                      <span>{{ loc.locationName }}</span>
                      <span style="color: #8492a6; font-size: 12px; margin-left: 8px;">{{ loc.locationAddress }}</span>
                    </el-option>
                  </el-select>
                </el-form-item>

                <!-- Quantity -->
                <el-form-item label="购买数量" prop="quantity">
                  <el-input-number
                    v-model="form.quantity"
                    :min="1"
                    :max="serviceDetail.maxPurchases === -1 ? 999 : serviceDetail.maxPurchases"
                    :step="1"
                    size="large"
                    class="w-full"
                  />
                  <div class="form-tip">
                    <span v-if="serviceDetail.maxPurchases !== -1">
                      限购 {{ serviceDetail.maxPurchases }} 次
                    </span>
                    <span v-else>不限购买次数</span>
                  </div>
                </el-form-item>

                <!-- Remark -->
                <el-form-item label="备注信息" prop="remark">
                  <el-input
                    v-model="form.remark"
                    type="textarea"
                    :rows="3"
                    maxlength="200"
                    show-word-limit
                    placeholder="请输入备注信息（选填）"
                    resize="none"
                  />
                </el-form-item>

                <!-- Total Amount -->
                <div class="order-summary">
                  <div class="summary-row">
                    <span class="label">商品金额：</span>
                    <span class="value">¥{{ (serviceDetail.price * form.quantity).toFixed(2) }}</span>
                  </div>
                  <div class="summary-row total">
                    <span class="label">应付金额：</span>
                    <span class="value">¥{{ totalAmount.toFixed(2) }}</span>
                  </div>
                </div>

                <!-- Wallet Balance -->
                <div v-if="walletInfo" class="wallet-info">
                  <el-divider />
                  <div class="balance-row">
                    <span class="label">钱包余额：</span>
                    <span
                      :class="['value', { insufficient: !isBalanceSufficient }]"
                    >
                      ¥{{ walletInfo.walletBalance.toFixed(2) }}
                    </span>
                  </div>
                  <div v-if="!isBalanceSufficient" class="balance-warning">
                    <el-alert
                      title="余额不足"
                      type="warning"
                      :closable="false"
                      show-icon
                    >
                      <template #default>
                        还需充值 ¥{{ (totalAmount - walletInfo.walletBalance).toFixed(2) }}
                      </template>
                    </el-alert>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="form-actions">
                  <el-button
                    size="large"
                    @click="handleCancel"
                    class="cancel-btn"
                  >
                    返回服务详情
                  </el-button>
                  <el-button
                    type="primary"
                    size="large"
                    @click="handleSubmit"
                    :loading="submitting"
                    :disabled="!isBalanceSufficient"
                    class="submit-btn"
                  >
                    确认下单并支付
                  </el-button>
                </div>
              </el-form>
            </el-card>
          </el-col>
        </el-row>
      </template>

      <!-- Error State -->
      <el-card v-else class="error-card" shadow="never">
        <el-empty description="服务信息加载失败">
          <el-button type="primary" @click="router.back()">返回</el-button>
        </el-empty>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getServiceDetail, buildImageUrl } from '@/api/service'
import { getTradeLocations } from '@/api/service'
import { createOrder, payOrder } from '@/api/order'
import { getWalletInfo } from '@/api/wallet'
import type { ServiceDetail, TradeLocation } from '@/types/service'
import type { CreateOrderRequest } from '@/types/order'
import { TradeType } from '@/types/order'
import type { WalletInfo } from '@/types/wallet'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()
const userStore = useUserStore()

// Get service ID from route
const serviceId = computed(() => {
  const id = route.params.serviceId
  return typeof id === 'string' ? parseInt(id) : 0
})

// Form ref
const formRef = ref<FormInstance>()

// Data
const loading = ref(true)
const submitting = ref(false)
const serviceDetail = ref<ServiceDetail>()
const walletInfo = ref<WalletInfo>()
const tradeLocations = ref<TradeLocation[]>([])

// Form data
const form = reactive({
  quantity: 1,
  remark: '',
  tradeLocationId: undefined as number | undefined
})

// Form validation rules
const rules = computed<FormRules>(() => ({
  tradeLocationId: serviceDetail.value?.tradeType === 1
    ? [{ required: true, message: '请选择交易地点', trigger: 'change' }]
    : [],
  quantity: [
    { required: true, message: '请输入购买数量', trigger: 'blur' },
    { type: 'number', min: 1, message: '数量必须大于0', trigger: 'blur' }
  ],
  remark: [
    { max: 200, message: '备注不能超过200字', trigger: 'blur' }
  ]
}))

// Computed
const totalAmount = computed(() => {
  if (!serviceDetail.value) return 0
  return serviceDetail.value.price * form.quantity
})

const isBalanceSufficient = computed(() => {
  if (!walletInfo.value) return false
  return walletInfo.value.walletBalance >= totalAmount.value
})

// Methods
const fetchServiceDetail = async () => {
  try {
    const detail = await getServiceDetail(serviceId.value)
    serviceDetail.value = detail

    // Check if service is online (status = 1)
    if (detail.status !== 1) {
      ElMessage.error('该服务当前不可购买')
      router.back()
      return
    }

    // Check if user is trying to buy their own service
    if (detail.sellerId === userStore.userInfo?.id) {
      ElMessage.error('不能购买自己的服务')
      router.back()
      return
    }

    // Pre-select trade location if service has one
    if (detail.tradeLocation?.id) {
      form.tradeLocationId = detail.tradeLocation.id
    }
  } catch (error) {
    console.error('Failed to fetch service detail:', error)
    ElMessage.error('获取服务信息失败')
  }
}

const fetchWalletInfo = async () => {
  try {
    walletInfo.value = await getWalletInfo()
  } catch (error) {
    console.error('Failed to fetch wallet info:', error)
    // Don't show error, wallet info is optional for display
  }
}

const fetchTradeLocations = async () => {
  try {
    tradeLocations.value = await getTradeLocations()
  } catch (error) {
    console.error('Failed to fetch trade locations:', error)
  }
}

const handleCancel = () => {
  router.back()
}

const handleSubmit = async () => {
  if (!formRef.value || !serviceDetail.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return
    const detail = serviceDetail.value
    if (!detail) return

    // Check balance again
    if (!isBalanceSufficient.value) {
      ElMessage.error('余额不足，请先充值')
      return
    }

    try {
      await ElMessageBox.confirm(
        `确认支付 ¥${totalAmount.value.toFixed(2)} 购买该服务？`,
        '确认支付',
        {
          confirmButtonText: '确认支付',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )

      submitting.value = true
      appStore.setLoading(true)

      // Create order request
      const orderRequest: CreateOrderRequest = {
        serviceId: serviceId.value,
        quantity: form.quantity,
        tradeType: detail.tradeType as TradeType,
        tradeLocationId: form.tradeLocationId,
        remark: form.remark
      }

      // Create order
      const orderId = await createOrder(orderRequest)

      // Pay order
      await payOrder(orderId)

      ElMessage.success('支付成功！')

      // Navigate to order detail
      setTimeout(() => {
        router.push({
          name: 'OrderDetail',
          params: { id: orderId }
        })
      }, 1000)
    } catch (error: any) {
      if (error !== 'cancel') {
        console.error('Failed to create/pay order:', error)
        ElMessage.error(error.message || '下单失败')
      }
    } finally {
      submitting.value = false
      appStore.setLoading(false)
    }
  })
}

// Helper function
const getTradeTypeText = (type: number): string => {
  return type === 1 ? '线下交易' : '线上担保'
}

// Lifecycle
onMounted(async () => {
  // Check login
  if (!userStore.isLogin) {
    ElMessage.warning('请先登录')
    router.push({
      path: '/login',
      query: { redirect: route.fullPath }
    })
    return
  }

  // Check service ID
  if (!serviceId.value) {
    ElMessage.error('服务ID无效')
    router.back()
    return
  }

  loading.value = true
  try {
    // Fetch all data in parallel
    await Promise.all([
      fetchServiceDetail(),
      fetchWalletInfo(),
      fetchTradeLocations()
    ])
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="scss">
.order-confirm-page {
  min-height: 100vh;
  background: #f9fafb;
  padding: 24px 0 60px;

  .page-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  // Page Header
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

  // Loading
  .loading-container {
    background: white;
    border-radius: 16px;
    padding: 40px;
  }

  // Cards
  .service-summary-card,
  .confirm-box-card,
  .error-card {
    border-radius: 16px;
    border: none;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    margin-bottom: 24px;

    :deep(.el-card__body) {
      padding: 32px;
    }
  }

  .card-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 24px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e5e7eb;
  }

  // Service Info
  .service-info {
    display: flex;
    gap: 20px;
    margin-bottom: 24px;

    .service-image {
      width: 120px;
      height: 90px;
      border-radius: 8px;
      flex-shrink: 0;
    }

    .service-content {
      flex: 1;

      .service-title {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
        margin: 0 0 8px;
      }

      .service-seller,
      .service-price {
        font-size: 14px;
        color: #6b7280;
        margin: 4px 0;

        .label {
          color: #9ca3af;
        }

        .price {
          color: #4f46e5;
          font-size: 16px;
          font-weight: 600;
        }
      }

      .service-tags {
        margin-top: 8px;
        display: flex;
        gap: 8px;
      }
    }
  }

  .trade-location {
    :deep(.el-alert) {
      border-radius: 8px;

      .el-alert__title {
        font-weight: 600;
      }
    }
  }

  // Order Form
  .order-form {
    :deep(.el-form-item) {
      margin-bottom: 20px;

      .el-form-item__label {
        font-size: 14px;
        font-weight: 500;
        color: #303133;
      }
    }

    :deep(.el-input-number) {
      width: 100%;

      .el-input__wrapper {
        box-shadow: 0 0 0 1px #d1d5db inset;
        border-radius: 8px;

        &:hover {
          box-shadow: 0 0 0 1px #4f46e5 inset;
        }

        &.is-focus {
          box-shadow: 0 0 0 1px #4f46e5 inset;
        }
      }
    }

    :deep(.el-textarea__inner) {
      box-shadow: 0 0 0 1px #d1d5db inset;
      border-radius: 8px;

      &:hover {
        box-shadow: 0 0 0 1px #4f46e5 inset;
      }

      &:focus {
        box-shadow: 0 0 0 1px #4f46e5 inset;
      }
    }

    .w-full {
      width: 100%;
    }

    .form-tip {
      font-size: 12px;
      color: #6b7280;
      margin-top: 4px;
    }
  }

  // Order Summary
  .order-summary {
    background: #f9fafb;
    border-radius: 8px;
    padding: 16px;
    margin: 20px 0;

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 8px 0;

      .label {
        font-size: 14px;
        color: #6b7280;
      }

      .value {
        font-size: 16px;
        color: #303133;
        font-weight: 500;
      }

      &.total {
        padding-top: 12px;
        border-top: 1px solid #e5e7eb;
        margin-top: 12px;

        .label {
          font-weight: 600;
          color: #303133;
        }

        .value {
          font-size: 20px;
          color: #4f46e5;
          font-weight: 700;
        }
      }
    }
  }

  // Wallet Info
  .wallet-info {
    .balance-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 16px 0;

      .label {
        font-size: 14px;
        color: #6b7280;
      }

      .value {
        font-size: 16px;
        color: #10b981;
        font-weight: 600;

        &.insufficient {
          color: #ef4444;
        }
      }
    }

    .balance-warning {
      margin-top: 12px;

      :deep(.el-alert) {
        border-radius: 8px;
      }
    }
  }

  // Form Actions
  .form-actions {
    display: flex;
    gap: 12px;
    margin-top: 24px;

    .cancel-btn {
      flex: 1;
    }

    .submit-btn {
      flex: 2;
      background: #4f46e5;
      border-color: #4f46e5;
      font-weight: 600;

      &:hover:not(:disabled) {
        background: #4338ca;
        border-color: #4338ca;
      }

      &:disabled {
        opacity: 0.6;
      }
    }
  }
}

// Responsive
@media (max-width: 768px) {
  .order-confirm-page {
    .page-container {
      padding: 0 16px;
    }

    .service-summary-card,
    .confirm-box-card {
      :deep(.el-card__body) {
        padding: 20px;
      }
    }

    .service-info {
      flex-direction: column;

      .service-image {
        width: 100%;
        height: 180px;
      }
    }

    .form-actions {
      flex-direction: column;

      .cancel-btn,
      .submit-btn {
        width: 100%;
      }
    }
  }
}
</style>
