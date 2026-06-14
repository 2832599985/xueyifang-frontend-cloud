<template>
  <div class="wallet-transactions-page">
    <div class="page-container">
      <el-card class="wallet-transactions-card">
        <!-- 标题栏 -->
        <div class="card-header">
          <div class="header-left">
            <h1 class="page-title">交易明细</h1>
          </div>
          <div class="header-right">
            <el-button link class="back-btn" @click="goBack">
              <el-icon><ArrowLeft /></el-icon>
              返回钱包概览
            </el-button>
          </div>
        </div>

        <!-- 过滤区 -->
        <div class="filter-section">
          <el-form :inline="true" :model="query" class="filter-form">
            <el-form-item label="交易类型">
              <el-select
                v-model="query.transactionType"
                clearable
                placeholder="全部类型"
                class="type-select"
              >
                <el-option
                  v-for="item in transactionTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="时间范围">
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
                class="date-picker"
              />
            </el-form-item>
            <el-form-item>
              <el-button class="primary-btn" @click="handleSearch">查询</el-button>
              <el-button @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 交易记录表格 -->
        <el-table
          :data="records"
          v-loading="loading"
          class="transactions-table"
          stripe
        >
          <el-table-column label="交易时间" prop="createTime" width="180">
            <template #default="{ row }">
              {{ formatDateTime(row.createTime) }}
            </template>
          </el-table-column>

          <el-table-column label="交易类型" prop="typeName" width="100">
            <template #default="{ row }">
              <el-tag :type="getTagType(row.transactionType)" size="small">
                {{ row.typeName }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="交易金额" prop="amount" width="140">
            <template #default="{ row }">
              <span :class="getAmountClass(row.transactionType)">
                {{ formatAmountDisplay(row.amount, row.transactionType) }}
              </span>
            </template>
          </el-table-column>

          <el-table-column label="余额变化" width="200">
            <template #default="{ row }">
              <span class="balance-change">
                ¥{{ row.balanceBefore?.toFixed(2) || '0.00' }}
                <el-icon class="arrow-icon"><ArrowRight /></el-icon>
                ¥{{ row.balanceAfter?.toFixed(2) || '0.00' }}
              </span>
            </template>
          </el-table-column>

          <el-table-column label="关联订单" prop="relatedOrderNumber" width="180">
            <template #default="{ row }">
              <template v-if="row.relatedOrderId">
                <el-button
                  link
                  class="order-link"
                  @click="goToOrder(row.relatedOrderId)"
                >
                  {{ row.relatedOrderNumber || `订单#${row.relatedOrderId}` }}
                </el-button>
              </template>
              <span v-else class="no-order">-</span>
            </template>
          </el-table-column>

          <el-table-column label="备注" prop="remark" min-width="150" show-overflow-tooltip>
            <template #default="{ row }">
              <span class="remark-text">{{ row.remark || '-' }}</span>
            </template>
          </el-table-column>

          <!-- 空状态 -->
          <template #empty>
            <div class="empty-state">
              <el-icon class="empty-icon"><Wallet /></el-icon>
              <p>暂无交易记录</p>
            </div>
          </template>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-wrapper" v-if="total > 0">
          <el-pagination
            v-model:current-page="query.pageNum"
            v-model:page-size="query.pageSize"
            :total="total"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            background
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, ArrowRight, Wallet } from '@element-plus/icons-vue'
import { getTransactionHistory } from '@/api/wallet'
import { TransactionType, type WalletTransaction, type WalletTransactionQuery } from '@/types/wallet'

const router = useRouter()

// 查询条件
const query = reactive<WalletTransactionQuery>({
  pageNum: 1,
  pageSize: 10,
  transactionType: undefined,
  startTime: undefined,
  endTime: undefined
})

// 日期范围
const dateRange = ref<[string, string] | null>(null)

// 数据状态
const records = ref<WalletTransaction[]>([])
const total = ref(0)
const loading = ref(false)

// 交易类型选项
const transactionTypeOptions = [
  { label: '充值', value: TransactionType.RECHARGE },
  { label: '提现', value: TransactionType.WITHDRAW },
  { label: '支付', value: TransactionType.PAYMENT },
  { label: '收入', value: TransactionType.INCOME },
  { label: '退款', value: TransactionType.REFUND },
  { label: '冻结', value: TransactionType.FREEZE },
  { label: '解冻', value: TransactionType.UNFREEZE }
]

// 格式化日期时间
function formatDateTime(dateStr: string): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取标签类型
function getTagType(type: TransactionType): string {
  switch (type) {
    case TransactionType.RECHARGE:
    case TransactionType.INCOME:
    case TransactionType.REFUND:
    case TransactionType.UNFREEZE:
      return 'success'
    case TransactionType.WITHDRAW:
    case TransactionType.PAYMENT:
    case TransactionType.FREEZE:
      return 'danger'
    default:
      return 'info'
  }
}

// 获取金额样式类
function getAmountClass(type: TransactionType): string {
  const incomeTypes = [
    TransactionType.RECHARGE,
    TransactionType.INCOME,
    TransactionType.REFUND,
    TransactionType.UNFREEZE
  ]
  return incomeTypes.includes(type) ? 'amount-income' : 'amount-expense'
}

// 格式化金额显示
function formatAmountDisplay(amount: number, type: TransactionType): string {
  const incomeTypes = [
    TransactionType.RECHARGE,
    TransactionType.INCOME,
    TransactionType.REFUND,
    TransactionType.UNFREEZE
  ]
  const sign = incomeTypes.includes(type) ? '+' : '-'
  return `${sign}¥${Math.abs(amount).toFixed(2)}`
}

// 加载交易记录
async function loadTransactions() {
  loading.value = true
  try {
    const res = await getTransactionHistory(query)
    records.value = res.records || []
    total.value = res.total || 0
  } catch (error) {
    console.error('获取交易记录失败:', error)
    ElMessage.error('获取交易记录失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 搜索
function handleSearch() {
  // 同步日期范围到查询条件
  if (dateRange.value && dateRange.value.length === 2) {
    query.startTime = dateRange.value[0] + ' 00:00:00'
    query.endTime = dateRange.value[1] + ' 23:59:59'
  } else {
    query.startTime = undefined
    query.endTime = undefined
  }
  query.pageNum = 1
  loadTransactions()
}

// 重置
function handleReset() {
  query.transactionType = undefined
  query.startTime = undefined
  query.endTime = undefined
  query.pageNum = 1
  dateRange.value = null
  loadTransactions()
}

// 分页大小改变
function handleSizeChange(size: number) {
  query.pageSize = size
  query.pageNum = 1
  loadTransactions()
}

// 页码改变
function handleCurrentChange(page: number) {
  query.pageNum = page
  loadTransactions()
}

// 跳转到订单详情
function goToOrder(orderId: number) {
  router.push({ name: 'OrderDetail', params: { id: orderId } })
}

// 返回钱包概览
function goBack() {
  router.push('/wallet')
}

onMounted(() => {
  loadTransactions()
})
</script>

<style scoped lang="scss">
.wallet-transactions-page {
  min-height: calc(100vh - 64px);
  background-color: #f9fafb;
  padding: 32px 0;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

.wallet-transactions-card {
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
  align-items: center;
  margin-bottom: 24px;

  .page-title {
    font-size: 24px;
    font-weight: 700;
    color: #1f2937;
    margin: 0;
  }

  .back-btn {
    color: #4f46e5;
    font-weight: 500;

    &:hover {
      color: #4338ca;
    }
  }
}

.filter-section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f3f4f6;
}

.filter-form {
  :deep(.el-form-item) {
    margin-bottom: 0;
    margin-right: 16px;
  }

  :deep(.el-form-item__label) {
    color: #374151;
    font-weight: 500;
  }
}

.type-select {
  width: 140px;

  :deep(.el-input__wrapper) {
    box-shadow: 0 0 0 1px #d1d5db inset;

    &:hover {
      box-shadow: 0 0 0 1px #9ca3af inset;
    }

    &.is-focus {
      box-shadow: 0 0 0 1px #4f46e5 inset;
    }
  }
}

.date-picker {
  :deep(.el-input__wrapper) {
    box-shadow: 0 0 0 1px #d1d5db inset;

    &:hover {
      box-shadow: 0 0 0 1px #9ca3af inset;
    }

    &.is-focus {
      box-shadow: 0 0 0 1px #4f46e5 inset;
    }
  }
}

.primary-btn {
  background: #4f46e5;
  border-color: #4f46e5;
  color: #fff;
  font-weight: 500;

  &:hover,
  &:focus {
    background: #4338ca;
    border-color: #4338ca;
  }
}

.transactions-table {
  :deep(.el-table__header th) {
    background-color: #f9fafb;
    color: #374151;
    font-weight: 600;
  }

  :deep(.el-table__row) {
    &:hover > td {
      background-color: #f3f4f6 !important;
    }
  }
}

.amount-income {
  color: #10b981;
  font-weight: 600;
}

.amount-expense {
  color: #ef4444;
  font-weight: 600;
}

.balance-change {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #6b7280;
  font-size: 13px;

  .arrow-icon {
    color: #9ca3af;
    font-size: 12px;
  }
}

.order-link {
  color: #4f46e5;
  font-weight: 500;
  padding: 0;

  &:hover {
    color: #4338ca;
  }
}

.no-order {
  color: #9ca3af;
}

.remark-text {
  color: #6b7280;
}

.empty-state {
  padding: 48px 0;
  text-align: center;
  color: #9ca3af;

  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  p {
    margin: 0;
    font-size: 14px;
  }
}

.pagination-wrapper {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;

  :deep(.el-pagination) {
    .el-pagination__total {
      color: #6b7280;
    }

    .btn-prev,
    .btn-next,
    .el-pager li {
      background-color: #fff;
      border: 1px solid #e5e7eb;

      &:hover {
        color: #4f46e5;
      }

      &.is-active {
        background-color: #4f46e5;
        border-color: #4f46e5;
        color: #fff;
      }
    }
  }
}

// 响应式适配
@media (max-width: 768px) {
  .wallet-transactions-page {
    padding: 16px 0;
  }

  .wallet-transactions-card {
    :deep(.el-card__body) {
      padding: 20px;
    }
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;

    .page-title {
      font-size: 20px;
    }
  }

  .filter-form {
    :deep(.el-form-item) {
      margin-bottom: 12px;
      width: 100%;
    }

    .type-select,
    .date-picker {
      width: 100%;
    }
  }
}
</style>
