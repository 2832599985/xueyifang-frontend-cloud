<template>
  <div class="my-disputes-page">
    <div class="page-container">
      <!-- Page Header -->
      <div class="page-header">
        <h1 class="page-title">我的纠纷</h1>
        <p class="page-desc">查看和管理您发起的所有纠纷记录</p>
      </div>

      <!-- Disputes List -->
      <el-card class="disputes-card" shadow="never">
        <!-- Loading State -->
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="5" animated />
        </div>

        <!-- Empty State -->
        <el-empty
          v-else-if="disputes.length === 0"
          description="暂无纠纷记录"
        >
          <el-button type="primary" @click="router.push('/orders')">
            查看我的订单
          </el-button>
        </el-empty>

        <!-- Disputes Table -->
        <template v-else>
          <el-table :data="disputes" style="width: 100%">
            <el-table-column prop="orderNumber" label="订单编号" min-width="180">
              <template #default="{ row }">
                <span class="order-number">{{ row.orderNumber }}</span>
              </template>
            </el-table-column>

            <el-table-column label="纠纷类型" min-width="120">
              <template #default="{ row }">
                <el-tag size="small">{{ getDisputeTypeText(row.disputeType) }}</el-tag>
              </template>
            </el-table-column>

            <el-table-column label="状态" min-width="100">
              <template #default="{ row }">
                <el-tag
                  size="small"
                  :type="getDisputeStatusTagType(row.disputeStatus)"
                >
                  {{ getDisputeStatusText(row.disputeStatus) }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column prop="createTime" label="提交时间" min-width="180">
              <template #default="{ row }">
                {{ formatDateTime(row.createTime) }}
              </template>
            </el-table-column>

            <el-table-column label="操作" width="100" fixed="right">
              <template #default="{ row }">
                <el-button
                  type="primary"
                  link
                  @click="router.push(`/disputes/${row.disputeId}`)"
                >
                  查看详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- Pagination -->
          <div class="pagination-container" v-if="total > pageSize">
            <el-pagination
              v-model:current-page="currentPage"
              :page-size="pageSize"
              :total="total"
              layout="prev, pager, next"
              @current-change="handlePageChange"
            />
          </div>
        </template>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getMyDisputes } from '@/api/dispute'
import {
  getDisputeTypeText,
  getDisputeStatusText,
  getDisputeStatusTagType,
  type DisputeListItem
} from '@/types/dispute'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

// Data
const loading = ref(true)
const disputes = ref<DisputeListItem[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// Methods
const fetchDisputes = async () => {
  loading.value = true
  try {
    const result = await getMyDisputes(currentPage.value, pageSize.value)
    disputes.value = result.records
    total.value = result.total
  } catch (error: any) {
    console.error('Failed to fetch disputes:', error)
    ElMessage.error(error.message || '获取纠纷列表失败')
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchDisputes()
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
  fetchDisputes()
})
</script>

<style scoped lang="scss">
.my-disputes-page {
  min-height: 100vh;
  background: #f9fafb;
  padding: 24px 0 60px;

  .page-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 20px;
  }

  // Page Header
  .page-header {
    margin-bottom: 24px;

    .page-title {
      font-size: 28px;
      font-weight: 700;
      color: #303133;
      margin: 0 0 8px;
    }

    .page-desc {
      font-size: 15px;
      color: #6b7280;
      margin: 0;
    }
  }

  // Card
  .disputes-card {
    border-radius: 16px;
    border: none;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

    :deep(.el-card__body) {
      padding: 24px;
    }
  }

  // Loading
  .loading-container {
    padding: 20px 0;
  }

  // Table
  :deep(.el-table) {
    .el-table__header th {
      background: #f9fafb;
      color: #6b7280;
      font-weight: 600;
    }

    .el-table__row {
      &:hover > td {
        background: #f9fafb;
      }
    }
  }

  .order-number {
    font-family: monospace;
    color: #4f46e5;
  }

  // Pagination
  .pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 24px;

    :deep(.el-pagination) {
      .el-pager li.is-active {
        background: #4f46e5;
        color: white;
      }

      .el-pager li:hover:not(.is-active) {
        color: #4f46e5;
      }
    }
  }
}
</style>
