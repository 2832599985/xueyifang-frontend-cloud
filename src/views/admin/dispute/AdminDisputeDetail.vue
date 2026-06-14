<template>
  <div class="admin-dispute-detail-redirect">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>

    <!-- Dispute Detail Content -->
    <template v-else-if="dispute">
      <div class="detail-card">
        <!-- 纠纷头部 -->
        <div class="detail-header">
          <div class="header-left">
            <h2 class="detail-title">纠纷详情</h2>
            <p class="detail-meta">
              订单号: {{ dispute.orderNumber }} |
              状态: <span :class="['status-text', getStatusClass(dispute.disputeStatus)]">
                {{ getDisputeStatusText(dispute.disputeStatus) }}
              </span>
            </p>
          </div>
          <div class="header-right">
            <span :class="['type-badge', getTypeTagClass(dispute.disputeType)]">
              类型: {{ getDisputeTypeText(dispute.disputeType) }}
            </span>
            <p class="create-time">发起时间: {{ formatDateTime(dispute.createTime) }}</p>
          </div>
        </div>

        <!-- 买家诉求 -->
        <div class="complaint-section">
          <h4 class="section-label">
            {{ dispute.disputeInitiatorId === dispute.buyerId ? '买家' : '卖家' }}诉求
            ({{ dispute.disputeInitiatorId === dispute.buyerId ? dispute.buyerName : dispute.sellerName }})
          </h4>
          <p class="complaint-text">{{ dispute.description }}</p>
        </div>

        <!-- 关联订单信息 -->
        <div class="order-section">
          <h3 class="section-title">
            <span class="title-bar"></span>
            关联订单信息
          </h3>
          <div class="order-card">
            <div class="order-info">
              <div class="service-title">{{ dispute.serviceTitle }}</div>
              <div class="party-info">
                卖家: {{ dispute.sellerName }} | 买家: {{ dispute.buyerName }}
              </div>
              <div class="amount-info">
                金额: <span class="amount">¥ {{ dispute.totalAmount.toFixed(2) }}</span> (已冻结)
              </div>
            </div>
            <el-button
              text
              type="primary"
              @click="router.push(`/admin/orders/${dispute.orderId}`)"
            >
              查看订单详情
            </el-button>
          </div>
        </div>

        <!-- 已处理结果 -->
        <div v-if="dispute.adminReply || dispute.resolution" class="result-section">
          <h3 class="section-title">
            <span class="title-bar"></span>
            处理结果
          </h3>
          <div class="result-card">
            <div v-if="dispute.adminReply" class="result-item">
              <label>管理员回复:</label>
              <p>{{ dispute.adminReply }}</p>
            </div>
            <div v-if="dispute.resolution" class="result-item">
              <label>解决方案:</label>
              <p>{{ dispute.resolution }}</p>
            </div>
          </div>
        </div>

        <!-- 处理表单（仅待处理/处理中状态显示） -->
        <div
          v-if="dispute.disputeStatus === DISPUTE_STATUS.PENDING || dispute.disputeStatus === DISPUTE_STATUS.PROCESSING"
          class="action-section"
        >
          <h3 class="section-title">处理结果</h3>
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
                勾选后将自动退款 ¥{{ dispute.totalAmount.toFixed(2) }} 给买家
              </p>
            </el-form-item>

            <div class="action-buttons">
              <el-button @click="router.push('/admin/disputes')">
                返回列表
              </el-button>
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

        <!-- 已处理状态的返回按钮 -->
        <div v-else class="action-section">
          <el-button type="primary" @click="router.push('/admin/disputes')">
            返回纠纷列表
          </el-button>
        </div>
      </div>
    </template>

    <!-- Error State -->
    <el-card v-else class="error-card" shadow="never">
      <el-empty description="纠纷信息加载失败">
        <el-button type="primary" @click="router.back()">返回</el-button>
      </el-empty>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAdminDisputeDetail, handleDispute } from '@/api/dispute'
import {
  DISPUTE_STATUS,
  DISPUTE_TYPE,
  HANDLE_ACTION,
  getDisputeTypeText,
  getDisputeStatusText,
  type DisputeDetail,
  type DisputeHandleRequest
} from '@/types/dispute'

const route = useRoute()
const router = useRouter()

// Data
const loading = ref(true)
const submitting = ref(false)
const dispute = ref<DisputeDetail | null>(null)

const handleForm = reactive<DisputeHandleRequest>({
  actionType: HANDLE_ACTION.RESOLVE,
  adminReply: '',
  resolution: '',
  needRefund: false
})

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
    dispute.value = await getAdminDisputeDetail(disputeId.value)
  } catch (error: any) {
    console.error('Failed to fetch dispute detail:', error)
    ElMessage.error(error.message || '获取纠纷详情失败')
  } finally {
    loading.value = false
  }
}

const formatDateTime = (dateStr: string): string => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

// 获取纠纷类型标签样式类
const getTypeTagClass = (type: number): string => {
  const classMap: Record<number, string> = {
    [DISPUTE_TYPE.SELLER_NOT_FULFILL]: 'type-danger',
    [DISPUTE_TYPE.MISMATCH]: 'type-warning',
    [DISPUTE_TYPE.QUALITY]: 'type-warning',
    [DISPUTE_TYPE.OTHER]: 'type-info'
  }
  return classMap[type] || 'type-info'
}

// 获取状态文字样式类
const getStatusClass = (status: number): string => {
  const classMap: Record<number, string> = {
    [DISPUTE_STATUS.PENDING]: 'status-pending',
    [DISPUTE_STATUS.PROCESSING]: 'status-processing',
    [DISPUTE_STATUS.RESOLVED]: 'status-resolved',
    [DISPUTE_STATUS.REJECTED]: 'status-rejected'
  }
  return classMap[status] || ''
}

const handleSubmit = async (actionType: number) => {
  if (!handleForm.adminReply.trim()) {
    ElMessage.warning('请输入管理员回复')
    return
  }

  if (!handleForm.resolution.trim()) {
    ElMessage.warning('请输入解决方案')
    return
  }

  const actionText = actionType === HANDLE_ACTION.RESOLVE ? '处理' : '驳回'
  const confirmMessage = handleForm.needRefund
    ? `确认${actionText}此纠纷并退款 ¥${dispute.value?.totalAmount.toFixed(2)} 给买家？`
    : `确认${actionText}此纠纷？`

  try {
    await ElMessageBox.confirm(confirmMessage, '确认处理', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })

    submitting.value = true
    handleForm.actionType = actionType
    await handleDispute(disputeId.value, handleForm)
    ElMessage.success('纠纷处理成功')
    // Refresh detail
    fetchDisputeDetail()
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
  fetchDisputeDetail()
})
</script>

<style scoped lang="scss">
.admin-dispute-detail-redirect {
  .loading-container {
    background: white;
    border-radius: 16px;
    padding: 40px;
  }
}

.detail-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  padding: 32px;
}

// 详情头部
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 24px;
  margin-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;

  .header-left {
    .detail-title {
      font-size: 24px;
      font-weight: 700;
      color: #1f2937;
      margin: 0 0 8px;
    }

    .detail-meta {
      font-size: 14px;
      color: #6b7280;
      margin: 0;

      .status-text {
        font-weight: 600;

        &.status-pending {
          color: #d97706;
        }

        &.status-processing {
          color: #4f46e5;
        }

        &.status-resolved {
          color: #059669;
        }

        &.status-rejected {
          color: #dc2626;
        }
      }
    }
  }

  .header-right {
    text-align: right;

    .type-badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 8px;

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

    .create-time {
      font-size: 12px;
      color: #9ca3af;
      margin: 0;
    }
  }
}

// 诉求区
.complaint-section {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;

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

// 区块标题
.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;

  .title-bar {
    width: 4px;
    height: 20px;
    background: #4f46e5;
    border-radius: 2px;
  }
}

// 订单区
.order-section {
  margin-bottom: 24px;

  .order-card {
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .order-info {
      .service-title {
        font-size: 15px;
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 8px;
      }

      .party-info {
        font-size: 13px;
        color: #6b7280;
        margin-bottom: 4px;
      }

      .amount-info {
        font-size: 13px;
        color: #6b7280;

        .amount {
          color: #dc2626;
          font-weight: 600;
        }
      }
    }
  }
}

// 处理结果区
.result-section {
  margin-bottom: 24px;

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

// 操作区
.action-section {
  border-top: 1px solid #e5e7eb;
  padding-top: 24px;

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

// Error card
.error-card {
  border-radius: 16px;
  border: none;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}
</style>
