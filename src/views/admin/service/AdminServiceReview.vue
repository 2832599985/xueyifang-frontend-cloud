<template>
  <div class="admin-service-review-page" v-loading="loading">
    <!-- 标题区域 -->
    <section class="page-header">
      <div class="title-block">
        <h2>服务审核</h2>
        <p class="subtitle">审核待上架的服务，保障服务质量与合规性</p>
      </div>
    </section>

    <!-- 主内容卡片 -->
    <el-card class="service-review-card" shadow="never">
      <!-- 无数据提示 -->
      <el-empty
        v-if="!loading && list.length === 0"
        description="暂无待审核的服务"
      />

      <!-- 服务列表 -->
      <template v-else>
        <div class="service-list">
          <div
            v-for="item in list"
            :key="item.serviceId"
            class="service-item"
          >
            <div class="service-content">
              <img
                class="service-cover"
                :src="getCoverUrl(item.coverImage)"
                alt="服务封面"
              />
              <div class="service-info">
                <h3 class="service-title">{{ item.serviceTitle }}</h3>
                <div class="service-meta">
                  <el-tag size="small" effect="plain">{{ item.tagName }}</el-tag>
                  <span class="service-price">¥ {{ item.price.toFixed(2) }}</span>
                </div>
                <p class="service-desc">{{ item.description || '暂无描述' }}</p>
                <div class="service-footer">
                  <span>卖家：{{ item.sellerName }}</span>
                  <span class="divider">|</span>
                  <span>提交时间：{{ formatTime(item.createTime) }}</span>
                </div>
              </div>
            </div>
            <div class="service-actions">
              <el-button type="success" @click="approve(item)">
                <i class="fas fa-check"></i> 通过
              </el-button>
              <el-button type="danger" @click="reject(item)">
                <i class="fas fa-times"></i> 拒绝
              </el-button>
              <el-button @click="viewDetail(item)">
                详情
              </el-button>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
            background
            layout="prev, pager, next, jumper, ->, total"
            :current-page="query.pageNum"
            :page-size="query.pageSize"
            :total="total"
            @current-change="handlePageChange"
          />
        </div>
      </template>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getPendingServices, reviewService } from '@/api/adminService'
import { buildImageUrl } from '@/api/service'
import type { PendingService } from '@/types/admin'

const router = useRouter()

const loading = ref(false)
const list = ref<PendingService[]>([])
const total = ref(0)

const query = reactive({
  pageNum: 1,
  pageSize: 10
})

/**
 * 加载待审核服务列表
 */
const loadServices = async () => {
  try {
    loading.value = true
    const res = await getPendingServices(query.pageNum, query.pageSize)
    list.value = res.records
    total.value = res.total
  } catch (error: any) {
    console.error('Failed to load pending services:', error)
    ElMessage.error(error.message || '加载数据失败')
  } finally {
    loading.value = false
  }
}

/**
 * 获取封面图URL
 */
const getCoverUrl = (coverImage: string | null): string => {
  if (coverImage) {
    return buildImageUrl(coverImage)
  }
  return 'https://picsum.photos/seed/service/200/200'
}

/**
 * 格式化时间
 */
const formatTime = (timeStr: string): string => {
  if (!timeStr) return '-'
  const date = new Date(timeStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * 分页变化
 */
const handlePageChange = (page: number) => {
  query.pageNum = page
  loadServices()
}

/**
 * 查看详情
 */
const viewDetail = (row: PendingService) => {
  router.push(`/admin/services/${row.serviceId}`)
}

/**
 * 通过审核
 */
const approve = (row: PendingService) => {
  ElMessageBox.confirm(
    `确认通过服务「${row.serviceTitle}」的发布申请吗？通过后服务将自动上架。`,
    '审核通过',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await reviewService({
        serviceId: row.serviceId,
        approved: true
      })
      ElMessage.success('已通过服务审核')
      loadServices()
    } catch (error: any) {
      ElMessage.error(error.message || '操作失败')
    }
  }).catch(() => {
    // 用户取消
  })
}

/**
 * 拒绝审核
 */
const reject = (row: PendingService) => {
  ElMessageBox.prompt(
    `请填写拒绝服务「${row.serviceTitle}」的原因`,
    '拒绝服务发布',
    {
      confirmButtonText: '确认拒绝',
      cancelButtonText: '取消',
      inputType: 'textarea',
      inputPlaceholder: '例如：服务描述不清、价格异常、内容不合规等（至少5个字）',
      inputValidator: (value: string) => {
        if (!value || value.trim().length < 5) {
          return '拒绝原因至少5个字'
        }
        return true
      }
    }
  ).then(async ({ value }) => {
    try {
      await reviewService({
        serviceId: row.serviceId,
        approved: false,
        reason: value.trim()
      })
      ElMessage.success('已拒绝服务发布')
      loadServices()
    } catch (error: any) {
      ElMessage.error(error.message || '操作失败')
    }
  }).catch(() => {
    // 用户取消
  })
}

onMounted(loadServices)
</script>

<style scoped lang="scss">
.admin-service-review-page {
  // Header
  .page-header {
    margin-bottom: 24px;

    .title-block {
      h2 {
        font-size: 24px;
        font-weight: 700;
        color: #1f2937;
        margin: 0 0 8px;
      }

      .subtitle {
        font-size: 14px;
        color: #6b7280;
        margin: 0;
      }
    }
  }

  // Main card
  .service-review-card {
    border: none;
    border-radius: 16px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

    :deep(.el-card__body) {
      padding: 0;
    }

    // Empty state
    :deep(.el-empty) {
      padding: 60px 0;
    }
  }

  // Service list
  .service-list {
    .service-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 24px;
      border-bottom: 1px solid #e5e7eb;
      transition: background-color 0.2s;

      &:last-child {
        border-bottom: none;
      }

      &:hover {
        background-color: #f9fafb;
      }
    }

    .service-content {
      display: flex;
      gap: 16px;
      flex: 1;
      min-width: 0;
    }

    .service-cover {
      width: 96px;
      height: 96px;
      border-radius: 8px;
      object-fit: cover;
      border: 1px solid #e5e7eb;
      flex-shrink: 0;
    }

    .service-info {
      flex: 1;
      min-width: 0;

      .service-title {
        font-size: 16px;
        font-weight: 600;
        color: #1f2937;
        margin: 0 0 8px;
        line-height: 1.4;
      }

      .service-meta {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;

        .service-price {
          font-size: 16px;
          font-weight: 600;
          color: #4f46e5;
        }
      }

      .service-desc {
        font-size: 14px;
        color: #6b7280;
        margin: 0 0 8px;
        line-height: 1.5;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        max-width: 600px;
      }

      .service-footer {
        font-size: 12px;
        color: #9ca3af;

        .divider {
          margin: 0 8px;
        }
      }
    }

    .service-actions {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-left: 24px;
      flex-shrink: 0;

      .el-button {
        width: 100px;
        margin-left: 0;

        i {
          margin-right: 4px;
        }
      }
    }
  }

  // Pagination
  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    padding: 16px 24px;
    border-top: 1px solid #e5e7eb;

    :deep(.el-pagination) {
      .el-pager li.is-active {
        background-color: #4f46e5;
      }

      .el-pager li:hover {
        color: #4f46e5;
      }

      .btn-prev:hover,
      .btn-next:hover {
        color: #4f46e5;
      }
    }
  }
}

// Override Element Plus button colors
:deep(.el-button--success) {
  background-color: #10b981;
  border-color: #10b981;

  &:hover {
    background-color: #059669;
    border-color: #059669;
  }
}

:deep(.el-button--danger) {
  background-color: #ef4444;
  border-color: #ef4444;

  &:hover {
    background-color: #dc2626;
    border-color: #dc2626;
  }
}

:deep(.el-tag--plain) {
  background-color: #f3f4f6;
  border-color: #e5e7eb;
  color: #4b5563;
}

// Responsive
@media (max-width: 768px) {
  .admin-service-review-page {
    .service-list {
      .service-item {
        flex-direction: column;
        padding: 16px;
      }

      .service-content {
        width: 100%;
      }

      .service-cover {
        width: 80px;
        height: 80px;
      }

      .service-actions {
        flex-direction: row;
        margin-left: 0;
        margin-top: 16px;
        width: 100%;

        .el-button {
          flex: 1;
          width: auto;
        }
      }
    }

    .pagination-wrapper {
      justify-content: center;
      padding: 16px;
    }
  }
}
</style>
