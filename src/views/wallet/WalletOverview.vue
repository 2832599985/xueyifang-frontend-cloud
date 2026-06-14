<template>
  <div class="wallet-overview-page">
    <div class="page-container">
      <!-- 主卡片 -->
      <el-card class="wallet-overview-card">
        <!-- 标题区域 -->
        <div class="card-header">
          <div class="header-left">
            <h1 class="page-title">我的钱包</h1>
            <p class="page-description">查看余额、冻结金额以及近期资金情况</p>
          </div>
          <div class="header-right">
            <el-button link class="view-detail-btn" @click="goToTransactions">
              查看交易明细
              <el-icon class="el-icon--right"><ArrowRight /></el-icon>
            </el-button>
          </div>
        </div>

        <!-- 余额概览区 -->
        <div class="balance-overview" v-loading="loading">
          <el-row :gutter="24">
            <!-- 可用余额卡 (Indigo渐变) -->
            <el-col :xs="24" :sm="24" :md="8">
              <div class="wallet-balance-card">
                <div class="card-content">
                  <div class="balance-label">可用余额</div>
                  <div class="balance-amount">{{ formatCurrency(balanceInfo?.walletBalance || 0) }}</div>
                </div>
                <el-icon class="wallet-icon"><Wallet /></el-icon>
              </div>
            </el-col>

            <!-- 冻结金额卡 -->
            <el-col :xs="24" :sm="12" :md="8">
              <div class="wallet-card">
                <div class="card-label">冻结金额 (交易中)</div>
                <div class="card-amount">{{ formatCurrency(balanceInfo?.frozenAmount || 0) }}</div>
              </div>
            </el-col>

            <!-- 总资产卡 -->
            <el-col :xs="24" :sm="12" :md="8">
              <div class="wallet-card">
                <div class="card-label">总资产</div>
                <div class="card-amount total">{{ formatCurrency(balanceInfo?.totalAmount || 0) }}</div>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 操作按钮区 -->
        <div class="wallet-actions">
          <el-button class="primary-btn" size="large" @click="rechargeDialogVisible = true">
            <el-icon><Plus /></el-icon>
            充值
          </el-button>
          <el-button class="secondary-btn" size="large" @click="withdrawDialogVisible = true">
            <el-icon><Minus /></el-icon>
            提现
          </el-button>
        </div>
      </el-card>
    </div>

    <!-- 充值对话框 -->
    <el-dialog
      v-model="rechargeDialogVisible"
      title="钱包充值"
      width="420px"
      :close-on-click-modal="false"
      class="wallet-dialog"
    >
      <el-form
        ref="rechargeFormRef"
        :model="rechargeForm"
        :rules="rechargeRules"
        label-position="top"
      >
        <el-form-item label="充值金额" prop="amount">
          <el-input-number
            v-model="rechargeForm.amount"
            :min="1"
            :max="100000"
            :precision="2"
            :step="10"
            placeholder="请输入充值金额"
            class="amount-input"
          />
        </el-form-item>
        <div class="form-tip">
          <el-icon><InfoFilled /></el-icon>
          本功能为模拟充值，用于体验订单支付流程
        </div>
      </el-form>
      <template #footer>
        <el-button @click="rechargeDialogVisible = false">取消</el-button>
        <el-button class="primary-btn" :loading="submitting" @click="handleRecharge">
          确认充值
        </el-button>
      </template>
    </el-dialog>

    <!-- 提现对话框 -->
    <el-dialog
      v-model="withdrawDialogVisible"
      title="钱包提现"
      width="420px"
      :close-on-click-modal="false"
      class="wallet-dialog"
    >
      <el-form
        ref="withdrawFormRef"
        :model="withdrawForm"
        :rules="withdrawRules"
        label-position="top"
      >
        <el-form-item label="提现金额" prop="amount">
          <el-input-number
            v-model="withdrawForm.amount"
            :min="1"
            :max="balanceInfo?.walletBalance ?? undefined"
            :precision="2"
            :step="10"
            placeholder="请输入提现金额"
            class="amount-input"
          />
        </el-form-item>
        <div class="available-balance">
          可提现余额：<span class="amount">{{ formatCurrency(balanceInfo?.walletBalance || 0) }}</span>
        </div>
        <div class="form-tip">
          <el-icon><InfoFilled /></el-icon>
          提现金额将从可用余额中扣除
        </div>
      </el-form>
      <template #footer>
        <el-button @click="withdrawDialogVisible = false">取消</el-button>
        <el-button class="primary-btn" :loading="submitting" @click="handleWithdraw">
          确认提现
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Wallet, ArrowRight, Plus, Minus, InfoFilled } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { getWalletInfo, rechargeWallet, withdrawWallet } from '@/api/wallet'
import type { WalletInfo } from '@/types/wallet'

const router = useRouter()

// 数据状态
const loading = ref(false)
const submitting = ref(false)
const balanceInfo = ref<WalletInfo | null>(null)

// 对话框状态
const rechargeDialogVisible = ref(false)
const withdrawDialogVisible = ref(false)

// 表单引用
const rechargeFormRef = ref<FormInstance>()
const withdrawFormRef = ref<FormInstance>()

// 表单数据
const rechargeForm = reactive({
  amount: null as number | null
})

const withdrawForm = reactive({
  amount: null as number | null
})

// 充值校验规则
const rechargeRules: FormRules = {
  amount: [
    { required: true, message: '请输入充值金额', trigger: 'blur' },
    { type: 'number', min: 1, message: '充值金额不能小于1元', trigger: 'blur' }
  ]
}

// 提现校验规则
const withdrawRules: FormRules = {
  amount: [
    { required: true, message: '请输入提现金额', trigger: 'blur' },
    { type: 'number', min: 1, message: '提现金额不能小于1元', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        if (value && balanceInfo.value && value > balanceInfo.value.walletBalance) {
          callback(new Error('提现金额不能大于可用余额'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 格式化货币
function formatCurrency(value: number): string {
  return `¥ ${value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// 加载钱包信息
async function loadBalance() {
  loading.value = true
  try {
    balanceInfo.value = await getWalletInfo()
  } catch (error) {
    console.error('获取钱包信息失败:', error)
    ElMessage.error('获取钱包信息失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 充值
async function handleRecharge() {
  if (!rechargeFormRef.value) return

  await rechargeFormRef.value.validate(async (valid) => {
    if (!valid || !rechargeForm.amount) return

    submitting.value = true
    try {
      balanceInfo.value = await rechargeWallet({ amount: rechargeForm.amount })
      ElMessage.success(`充值成功！已充值 ¥${rechargeForm.amount.toFixed(2)}`)
      rechargeDialogVisible.value = false
      rechargeForm.amount = null
      rechargeFormRef.value?.resetFields()
    } catch (error) {
      console.error('充值失败:', error)
      ElMessage.error('充值失败，请稍后重试')
    } finally {
      submitting.value = false
    }
  })
}

// 提现
async function handleWithdraw() {
  if (!withdrawFormRef.value) return

  await withdrawFormRef.value.validate(async (valid) => {
    if (!valid || !withdrawForm.amount) return

    submitting.value = true
    try {
      balanceInfo.value = await withdrawWallet({ amount: withdrawForm.amount })
      ElMessage.success(`提现成功！已提现 ¥${withdrawForm.amount.toFixed(2)}`)
      withdrawDialogVisible.value = false
      withdrawForm.amount = null
      withdrawFormRef.value?.resetFields()
    } catch (error) {
      console.error('提现失败:', error)
      ElMessage.error('提现失败，请稍后重试')
    } finally {
      submitting.value = false
    }
  })
}

// 跳转到交易明细
function goToTransactions() {
  router.push('/wallet/transactions')
}

onMounted(() => {
  loadBalance()
})
</script>

<style scoped lang="scss">
.wallet-overview-page {
  min-height: calc(100vh - 64px);
  background-color: #f9fafb;
  padding: 32px 0;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

.wallet-overview-card {
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: none;

  :deep(.el-card__body) {
    padding: 32px;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;

  .header-left {
    .page-title {
      font-size: 24px;
      font-weight: 700;
      color: #1f2937;
      margin: 0 0 8px 0;
    }

    .page-description {
      font-size: 14px;
      color: #6b7280;
      margin: 0;
    }
  }

  .view-detail-btn {
    color: #4f46e5;
    font-weight: 500;

    &:hover {
      color: #4338ca;
    }
  }
}

.balance-overview {
  margin-bottom: 32px;
}

// 可用余额卡 - Indigo渐变
.wallet-balance-card {
  background: linear-gradient(135deg, #4f46e5, #4338ca);
  border-radius: 16px;
  padding: 24px;
  color: #fff;
  position: relative;
  overflow: hidden;
  min-height: 120px;
  margin-bottom: 24px;
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 25px -5px rgba(79, 70, 229, 0.3);
  }

  .card-content {
    position: relative;
    z-index: 1;
  }

  .balance-label {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 8px;
  }

  .balance-amount {
    font-size: 32px;
    font-weight: 700;
  }

  .wallet-icon {
    position: absolute;
    bottom: -20px;
    right: -10px;
    font-size: 100px;
    color: rgba(255, 255, 255, 0.15);
  }
}

// 白底卡片
.wallet-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 24px;
  min-height: 120px;
  margin-bottom: 24px;
  transition: box-shadow 0.3s;

  &:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }

  .card-label {
    font-size: 14px;
    color: #6b7280;
    margin-bottom: 8px;
  }

  .card-amount {
    font-size: 28px;
    font-weight: 700;
    color: #1f2937;

    &.total {
      color: #4f46e5;
    }
  }
}

// 操作按钮区
.wallet-actions {
  display: flex;
  gap: 16px;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
}

.primary-btn {
  background: #4f46e5;
  border-color: #4f46e5;
  color: #fff;
  font-weight: 500;
  padding: 12px 32px;

  &:hover,
  &:focus {
    background: #4338ca;
    border-color: #4338ca;
  }
}

.secondary-btn {
  background: #fff;
  border-color: #d1d5db;
  color: #374151;
  font-weight: 500;
  padding: 12px 32px;

  &:hover,
  &:focus {
    background: #f9fafb;
    border-color: #9ca3af;
    color: #1f2937;
  }
}

// 对话框样式
.wallet-dialog {
  :deep(.el-dialog) {
    border-radius: 16px;
  }

  :deep(.el-dialog__header) {
    padding: 20px 24px 16px;
    border-bottom: 1px solid #f3f4f6;

    .el-dialog__title {
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
    }
  }

  :deep(.el-dialog__body) {
    padding: 24px;
  }

  :deep(.el-dialog__footer) {
    padding: 16px 24px 20px;
    border-top: 1px solid #f3f4f6;
  }
}

.amount-input {
  width: 100%;

  :deep(.el-input-number__decrease),
  :deep(.el-input-number__increase) {
    background: #f9fafb;
    border-color: #e5e7eb;

    &:hover {
      color: #4f46e5;
    }
  }

  :deep(.el-input__wrapper) {
    box-shadow: 0 0 0 1px #d1d5db inset;

    &:focus-within {
      box-shadow: 0 0 0 1px #4f46e5 inset;
    }
  }
}

.form-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6b7280;
  margin-top: 12px;

  .el-icon {
    color: #9ca3af;
  }
}

.available-balance {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 8px;

  .amount {
    color: #4f46e5;
    font-weight: 600;
  }
}

// 响应式适配
@media (max-width: 768px) {
  .wallet-overview-page {
    padding: 16px 0;
  }

  .wallet-overview-card {
    :deep(.el-card__body) {
      padding: 20px;
    }
  }

  .card-header {
    flex-direction: column;
    gap: 16px;

    .page-title {
      font-size: 20px;
    }
  }

  .wallet-balance-card {
    .balance-amount {
      font-size: 28px;
    }
  }

  .wallet-card {
    .card-amount {
      font-size: 24px;
    }
  }

  .wallet-actions {
    flex-direction: column;

    .el-button {
      width: 100%;
    }
  }
}
</style>
