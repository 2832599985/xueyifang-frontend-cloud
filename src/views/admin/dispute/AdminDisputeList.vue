<template>
  <div class="admin-dispute-page">
    <div class="dispute-grid">
      <!-- 左侧：纠纷列表 -->
      <div class="dispute-list-panel">
        <!-- 筛选区 -->
        <div class="filter-section">
          <div class="search-row">
            <el-input
              v-model="queryParams.orderNumber"
              placeholder="订单号..."
              clearable
              @keyup.enter="handleSearch"
              class="search-input"
            >
              <template #append>
                <el-button @click="handleSearch">
                  <el-icon><Search /></el-icon>
                </el-button>
              </template>
            </el-input>
          </div>
          <div class="status-tabs">
            <button
              :class="['status-tab', { active: activeTab === 'pending' }]"
              @click="switchTab('pending')"
            >
              待处理 ({{ pendingCount }})
            </button>
            <button
              :class="['status-tab', { active: activeTab === 'processed' }]"
              @click="switchTab('processed')"
            >
              已处理
            </button>
          </div>
        </div>

        <!-- 纠纷列表 -->
        <div class="dispute-list">
          <div v-if="loading" class="loading-container">
            <el-skeleton :rows="5" animated />
          </div>

          <el-empty
            v-else-if="disputes.length === 0"
            description="暂无纠纷记录"
          />

          <template v-else>
            <div
              v-for="item in disputes"
              :key="item.disputeId"
              :class="['dispute-card', { active: selectedId === item.disputeId }]"
              @click="selectDispute(item.disputeId)"
            >
              <div class="card-header">
                <span class="order-number">订单 #{{ formatOrderNumber(item.orderNumber) }}</span>
                <span :class="['type-tag', getTypeTagClass(item.disputeType)]">
                  {{ getDisputeTypeText(item.disputeType) }}
                </span>
              </div>
              <div class="card-body">
                <p class="status-line">
                  <el-tag
                    size="small"
                    :type="getDisputeStatusTagType(item.disputeStatus)"
                  >
                    {{ getDisputeStatusText(item.disputeStatus) }}
                  </el-tag>
                </p>
              </div>
              <div class="card-footer">
                <span class="time">{{ formatDateTime(item.createTime) }}</span>
              </div>
            </div>
          </template>
        </div>

        <!-- 分页 -->
        <div class="pagination-container" v-if="total > pageSize">
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="total"
            layout="prev, pager, next"
            small
            @current-change="handlePageChange"
          />
        </div>
      </div>

      <!-- 右侧：纠纷详情 -->
      <div class="dispute-detail-panel">
        <div v-if="detailLoading" class="loading-container">
          <el-skeleton :rows="10" animated />
        </div>

        <div v-else-if="!selectedDetail" class="empty-detail">
          <el-empty description="请选择一个纠纷查看详情" />
        </div>

        <template v-else>
          <!-- 纠纷头部 -->
          <div class="detail-header">
            <div class="header-left">
              <h2 class="detail-title">纠纷详情</h2>
              <p class="detail-meta">
                订单号: {{ selectedDetail.orderNumber }} |
                状态: <span :class="['status-text', getStatusClass(selectedDetail.disputeStatus)]">
                  {{ getDisputeStatusText(selectedDetail.disputeStatus) }}
                </span>
              </p>
            </div>
            <div class="header-right">
              <span :class="['type-badge', getTypeTagClass(selectedDetail.disputeType)]">
                类型: {{ getDisputeTypeText(selectedDetail.disputeType) }}
              </span>
              <p class="create-time">发起时间: {{ formatDateTime(selectedDetail.createTime) }}</p>
            </div>
          </div>

          <!-- 买家诉求 -->
          <div class="complaint-section">
            <h4 class="section-label">
              {{ selectedDetail.disputeInitiatorId === selectedDetail.buyerId ? '买家' : '卖家' }}诉求
              ({{ selectedDetail.disputeInitiatorId === selectedDetail.buyerId ? selectedDetail.buyerName : selectedDetail.sellerName }})
            </h4>
            <p class="complaint-text">{{ selectedDetail.description }}</p>
          </div>

          <!-- 关联订单信息 -->
          <div class="order-section">
            <h3 class="section-title">
              <span class="title-bar"></span>
              关联订单信息
            </h3>
            <div class="order-card">
              <div class="order-info">
                <div class="service-title">{{ selectedDetail.serviceTitle }}</div>
                <div class="party-info">
                  卖家: {{ selectedDetail.sellerName }} | 买家: {{ selectedDetail.buyerName }}
                </div>
                <div class="amount-info">
                  金额: <span class="amount">¥ {{ selectedDetail.totalAmount.toFixed(2) }}</span> (已冻结)
                </div>
              </div>
              <el-button
                text
                type="primary"
                @click="router.push(`/admin/orders/${selectedDetail.orderId}`)"
              >
                查看订单详情
              </el-button>
            </div>
          </div>

          <!-- 已处理结果 -->
          <div v-if="selectedDetail.adminReply || selectedDetail.resolution" class="result-section">
            <h3 class="section-title">
              <span class="title-bar"></span>
              处理结果
            </h3>
            <div class="result-card">
              <div v-if="selectedDetail.adminReply" class="result-item">
                <label>管理员回复:</label>
                <p>{{ selectedDetail.adminReply }}</p>
              </div>
              <div v-if="selectedDetail.resolution" class="result-item">
                <label>解决方案:</label>
                <p>{{ selectedDetail.resolution }}</p>
              </div>
            </div>
          </div>

          <!-- 处理表单（仅待处理/处理中状态显示） -->
          <div
            v-if="selectedDetail.disputeStatus === DISPUTE_STATUS.PENDING || selectedDetail.disputeStatus === DISPUTE_STATUS.PROCESSING"
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
                  勾选后将自动退款 ¥{{ selectedDetail.totalAmount.toFixed(2) }} 给买家
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
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { getAdminDisputeList, getAdminDisputeDetail, handleDispute } from '@/api/dispute'
import {
  DISPUTE_STATUS,
  DISPUTE_TYPE,
  HANDLE_ACTION,
  getDisputeTypeText,
  getDisputeStatusText,
  getDisputeStatusTagType,
  type DisputeListItem,
  type DisputeDetail,
  type DisputeHandleRequest,
  type AdminDisputeListQuery
} from '@/types/dispute'

const router = useRouter()
const route = useRoute()

// 列表状态
const loading = ref(true)
const disputes = ref<DisputeListItem[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const pendingCount = ref(0)
const activeTab = ref<'pending' | 'processed'>('pending')

const queryParams = reactive<AdminDisputeListQuery & { orderNumber?: string }>({
  current: 1,
  pageSize: 10,
  disputeStatus: DISPUTE_STATUS.PENDING,
  orderNumber: ''
})

// 详情状态
const selectedId = ref<number | null>(null)
const selectedDetail = ref<DisputeDetail | null>(null)
const detailLoading = ref(false)
const submitting = ref(false)

const handleForm = reactive<DisputeHandleRequest>({
  actionType: HANDLE_ACTION.RESOLVE,
  adminReply: '',
  resolution: '',
  needRefund: false
})

// 加载纠纷列表
const fetchDisputes = async () => {
  loading.value = true
  try {
    queryParams.current = currentPage.value
    queryParams.pageSize = pageSize.value
    const result = await getAdminDisputeList(queryParams)
    disputes.value = result.records
    total.value = result.total
  } catch (error: any) {
    console.error('Failed to fetch disputes:', error)
    ElMessage.error(error.message || '获取纠纷列表失败')
  } finally {
    loading.value = false
  }
}

// 加载待处理数量
const fetchPendingCount = async () => {
  try {
    const result = await getAdminDisputeList({
      current: 1,
      pageSize: 1,
      disputeStatus: DISPUTE_STATUS.PENDING
    })
    pendingCount.value = result.total
  } catch {
    // 静默处理
  }
}

// 加载纠纷详情
const fetchDetail = async (disputeId: number) => {
  detailLoading.value = true
  try {
    selectedDetail.value = await getAdminDisputeDetail(disputeId)
    // 重置表单
    handleForm.adminReply = ''
    handleForm.resolution = ''
    handleForm.needRefund = false
  } catch (error: any) {
    console.error('Failed to fetch dispute detail:', error)
    ElMessage.error(error.message || '获取纠纷详情失败')
    selectedDetail.value = null
  } finally {
    detailLoading.value = false
  }
}

// 选择纠纷
const selectDispute = (disputeId: number) => {
  selectedId.value = disputeId
  fetchDetail(disputeId)
}

// 切换标签
const switchTab = (tab: 'pending' | 'processed') => {
  activeTab.value = tab
  currentPage.value = 1
  selectedId.value = null
  selectedDetail.value = null

  if (tab === 'pending') {
    queryParams.disputeStatus = DISPUTE_STATUS.PENDING
  } else {
    // 已处理：已解决或已拒绝
    queryParams.disputeStatus = null // 获取所有，然后在前端过滤，或者后端支持多状态
  }
  fetchDisputes()
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchDisputes()
}

// 分页
const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchDisputes()
}

// 提交处理
const handleSubmit = async (actionType: number) => {
  if (!handleForm.adminReply.trim()) {
    ElMessage.warning('请输入管理员回复')
    return
  }

  if (!handleForm.resolution.trim()) {
    ElMessage.warning('请输入解决方案')
    return
  }

  if (!selectedId.value) return

  const actionText = actionType === HANDLE_ACTION.RESOLVE ? '处理' : '驳回'
  const confirmMessage = handleForm.needRefund
    ? `确认${actionText}此纠纷并退款 ¥${selectedDetail.value?.totalAmount.toFixed(2)} 给买家？`
    : `确认${actionText}此纠纷？`

  try {
    await ElMessageBox.confirm(confirmMessage, '确认处理', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })

    submitting.value = true
    handleForm.actionType = actionType
    await handleDispute(selectedId.value, handleForm)
    ElMessage.success('纠纷处理成功')

    // 刷新列表和详情
    fetchDisputes()
    fetchPendingCount()
    fetchDetail(selectedId.value)
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '处理失败')
    }
  } finally {
    submitting.value = false
  }
}

// 格式化订单号（截断显示）
const formatOrderNumber = (orderNumber: string): string => {
  if (orderNumber.length > 12) {
    return orderNumber.substring(0, 10) + '...' + orderNumber.slice(-3)
  }
  return orderNumber
}

// 格式化时间
const formatDateTime = (dateStr: string): string => {
  return new Date(dateStr).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
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

// 初始化
onMounted(() => {
  fetchDisputes()
  fetchPendingCount()

  // 如果 URL 带有 ID 参数，自动选中
  const id = route.params.id
  if (id && typeof id === 'string') {
    const disputeId = parseInt(id)
    if (!isNaN(disputeId)) {
      selectedId.value = disputeId
      fetchDetail(disputeId)
    }
  }
})
</script>

<style scoped lang="scss">
.admin-dispute-page {
  height: calc(100vh - 64px - 48px); // 减去 header 和 padding
  overflow: hidden;
}

.dispute-grid {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 24px;
  height: 100%;
}

// 左侧列表面板
.dispute-list-panel {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// 筛选区
.filter-section {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;

  .search-row {
    margin-bottom: 12px;

    .search-input {
      :deep(.el-input__wrapper) {
        border-radius: 8px;
      }

      :deep(.el-input-group__append) {
        background: #f3f4f6;
        border-left: none;

        .el-button {
          color: #6b7280;

          &:hover {
            color: #4f46e5;
          }
        }
      }
    }
  }

  .status-tabs {
    display: flex;
    gap: 8px;

    .status-tab {
      flex: 1;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      border: 1px solid #e5e7eb;
      background: white;
      color: #6b7280;
      transition: all 0.2s;

      &:hover {
        background: #f9fafb;
      }

      &.active {
        background: #eef2ff;
        border-color: #4f46e5;
        color: #4f46e5;
      }
    }
  }
}

// 纠纷列表
.dispute-list {
  flex: 1;
  overflow-y: auto;

  .loading-container {
    padding: 20px;
  }
}

// 纠纷卡片
.dispute-card {
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f9fafb;
  }

  &.active {
    background: #eef2ff;
    border-left: 4px solid #4f46e5;
    padding-left: 12px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    .order-number {
      font-size: 14px;
      font-weight: 600;
      color: #1f2937;
    }

    .type-tag {
      font-size: 11px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 4px;

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
  }

  .card-body {
    .status-line {
      margin: 0;
    }
  }

  .card-footer {
    margin-top: 8px;
    text-align: right;

    .time {
      font-size: 12px;
      color: #9ca3af;
    }
  }
}

// 分页
.pagination-container {
  padding: 12px 16px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: center;

  :deep(.el-pagination) {
    .el-pager li.is-active {
      background: #4f46e5;
      color: white;
    }
  }
}

// 右侧详情面板
.dispute-detail-panel {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  padding: 24px;
  overflow-y: auto;

  .loading-container,
  .empty-detail {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }
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

// 响应式
@media (max-width: 1024px) {
  .dispute-grid {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }

  .dispute-list-panel {
    max-height: 300px;
  }
}
</style>
