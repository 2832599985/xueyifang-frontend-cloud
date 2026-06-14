<template>
  <div class="my-services-page">
    <div class="page-container">
      <!-- Page Header -->
      <div class="page-header">
        <h1 class="page-title">我的服务</h1>
        <p class="page-subtitle">管理你发布的所有服务</p>
        <el-button
          type="primary"
          :icon="Plus"
          @click="router.push('/service/publish')"
          class="publish-btn"
        >
          发布新服务
        </el-button>
      </div>

      <!-- Stats Cards -->
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-label">全部服务</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.online }}</div>
          <div class="stat-label">已上架</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.offline }}</div>
          <div class="stat-label">已下架</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.pending }}</div>
          <div class="stat-label">审核中</div>
        </div>
      </div>

      <!-- Filter Tabs -->
      <el-card class="filter-card" shadow="never">
        <el-tabs v-model="activeTab" @tab-change="handleTabChange">
          <el-tab-pane label="全部" name="all">
            <template #label>
              <span>全部 <span class="tab-count">({{ stats.total }})</span></span>
            </template>
          </el-tab-pane>
          <el-tab-pane label="已上架" name="online">
            <template #label>
              <span>已上架 <span class="tab-count">({{ stats.online }})</span></span>
            </template>
          </el-tab-pane>
          <el-tab-pane label="已下架" name="offline">
            <template #label>
              <span>已下架 <span class="tab-count">({{ stats.offline }})</span></span>
            </template>
          </el-tab-pane>
          <el-tab-pane label="审核中" name="pending">
            <template #label>
              <span>审核中 <span class="tab-count">({{ stats.pending }})</span></span>
            </template>
          </el-tab-pane>
          <el-tab-pane label="已驳回" name="rejected">
            <template #label>
              <span>已驳回 <span class="tab-count">({{ stats.rejected }})</span></span>
            </template>
          </el-tab-pane>
        </el-tabs>

        <!-- Service List -->
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="5" animated />
        </div>

        <div v-else-if="services.length === 0" class="empty-container">
          <el-empty description="暂无服务">
            <el-button type="primary" @click="router.push('/service/publish')">
              发布第一个服务
            </el-button>
          </el-empty>
        </div>

        <div v-else class="service-list">
          <div v-for="service in services" :key="service.id" class="service-item">
            <div class="service-image" @click="router.push(`/services/${service.id}`)">
              <LazyImage
                :src="buildImageUrl(service.coverImage)"
                :alt="service.serviceTitle"
                :width="120"
                :height="90"
                :radius="8"
                fit="cover"
              />
            </div>

            <div class="service-info">
              <div class="service-header">
                <h3 @click="router.push(`/services/${service.id}`)">
                  {{ service.serviceTitle }}
                </h3>
                <div class="service-status">
                  <el-tag :type="getServiceStatusType(service.status)" size="small">
                    {{ getServiceStatusText(service.status) }}
                  </el-tag>
                  <el-tag
                    v-if="service.reviewStatus === ReviewStatus.REJECTED"
                    type="danger"
                    size="small"
                  >
                    审核未通过
                  </el-tag>
                </div>
              </div>

              <div class="service-meta">
                <span class="meta-item">
                  <el-icon><Coin /></el-icon>
                  ¥{{ service.price }}
                </span>
                <span class="meta-item">
                  <el-icon><View /></el-icon>
                  {{ service.viewCount }} 浏览
                </span>
                <span v-if="service.salesCount" class="meta-item">
                  <el-icon><ShoppingCart /></el-icon>
                  {{ service.salesCount }} 销量
                </span>
                <span v-if="service.currentPurchaseCount !== undefined" class="meta-item">
                  <el-icon><Ticket /></el-icon>
                  已售 {{ service.currentPurchaseCount }} / {{ service.maxPurchases === -1 ? '不限' : service.maxPurchases }}
                </span>
              </div>

              <div v-if="service.reviewReason" class="review-reason">
                <el-alert
                  :title="`驳回原因：${service.reviewReason}`"
                  type="error"
                  :closable="false"
                  show-icon
                />
              </div>

              <div class="service-time">
                <span>创建时间：{{ service.createTime }}</span>
                <span v-if="service.updateTime">更新时间：{{ service.updateTime }}</span>
              </div>
            </div>

            <div class="service-actions">
              <el-button
                v-if="service.canEdit"
                type="primary"
                text
                :icon="Edit"
                @click="handleEdit(service.id)"
              >
                编辑
              </el-button>

              <el-button
                v-if="service.canOnline"
                type="success"
                text
                :icon="Upload"
                @click="handleOnline(service.id)"
              >
                上架
              </el-button>

              <el-button
                v-if="service.canOffline"
                type="warning"
                text
                :icon="Download"
                @click="handleOffline(service.id)"
              >
                下架
              </el-button>

              <el-button
                type="danger"
                text
                :icon="Delete"
                @click="handleDelete(service.id)"
              >
                删除
              </el-button>

              <el-dropdown trigger="click" @command="(cmd: string | number | object) => handleCommand(String(cmd), service)">
                <el-button text :icon="MoreFilled" />
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="view">
                      <el-icon><View /></el-icon>
                      查看详情
                    </el-dropdown-item>
                    <el-dropdown-item command="copy">
                      <el-icon><CopyDocument /></el-icon>
                      复制链接
                    </el-dropdown-item>
                    <el-dropdown-item command="stats">
                      <el-icon><DataAnalysis /></el-icon>
                      查看统计
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="services.length > 0" class="pagination-container">
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
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Edit,
  Delete,
  Upload,
  Download,
  View,
  Coin,
  ShoppingCart,
  Ticket,
  MoreFilled,
  CopyDocument,
  DataAnalysis
} from '@element-plus/icons-vue'
import {
  getMyServicesEnhanced,
  onlineService,
  offlineService,
  deleteService,
  buildImageUrl
} from '@/api/service'
import type { MyServiceItem } from '@/types/service'
import {
  ServiceStatus,
  ReviewStatus,
  getServiceStatusText,
  getServiceStatusType
} from '@/types/service'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import LazyImage from '@/components/common/LazyImage.vue'

const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()

// Data
const loading = ref(false)
const services = ref<MyServiceItem[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const activeTab = ref('all')

// Stats
const stats = reactive({
  total: 0,
  online: 0,
  offline: 0,
  pending: 0,
  rejected: 0
})

// Tab to status mapping
const tabStatusMap: Record<string, number | undefined> = {
  all: undefined,
  online: ServiceStatus.ONLINE,
  offline: ServiceStatus.OFFLINE,
  pending: ServiceStatus.PENDING_REVIEW,
  rejected: ServiceStatus.REJECTED
}

// Methods
const fetchServices = async () => {
  loading.value = true
  try {
    const status = tabStatusMap[activeTab.value]
    const result = await getMyServicesEnhanced(status, {
      pageNum: currentPage.value,
      pageSize: pageSize.value
    })

    services.value = result.records
    total.value = result.total
  } catch (error) {
    console.error('Failed to fetch services:', error)
    ElMessage.error('获取服务列表失败')
  } finally {
    loading.value = false
  }
}

const fetchStats = async () => {
  try {
    // Fetch all services to calculate stats
    const result = await getMyServicesEnhanced(undefined, {
      pageNum: 1,
      pageSize: 100 // Get enough to calculate stats
    })

    stats.total = result.total
    stats.online = result.records.filter(s => s.status === ServiceStatus.ONLINE).length
    stats.offline = result.records.filter(s => s.status === ServiceStatus.OFFLINE).length
    stats.pending = result.records.filter(s => s.status === ServiceStatus.PENDING_REVIEW).length
    stats.rejected = result.records.filter(s => s.status === ServiceStatus.REJECTED).length
  } catch (error) {
    console.error('Failed to fetch stats:', error)
  }
}

const handleTabChange = (tab: string) => {
  activeTab.value = tab
  currentPage.value = 1
  fetchServices()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchServices()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchServices()
}

const handleEdit = (id: number) => {
  router.push(`/service/edit/${id}`)
}

const handleOnline = async (id: number) => {
  try {
    await ElMessageBox.confirm(
      '确定要上架此服务吗？上架后用户可以看到并购买。',
      '提示',
      {
        confirmButtonText: '确定上架',
        cancelButtonText: '取消',
        type: 'info'
      }
    )

    appStore.setLoading(true)
    await onlineService(id)
    ElMessage.success('服务已上架')

    // Refresh list
    fetchServices()
    fetchStats()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Failed to online service:', error)
      ElMessage.error(error.message || '上架失败')
    }
  } finally {
    appStore.setLoading(false)
  }
}

const handleOffline = async (id: number) => {
  try {
    await ElMessageBox.confirm(
      '确定要下架此服务吗？下架后用户将无法看到此服务。',
      '提示',
      {
        confirmButtonText: '确定下架',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    appStore.setLoading(true)
    await offlineService(id)
    ElMessage.success('服务已下架')

    // Refresh list
    fetchServices()
    fetchStats()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Failed to offline service:', error)
      ElMessage.error(error.message || '下架失败')
    }
  } finally {
    appStore.setLoading(false)
  }
}

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除此服务吗？删除后数据无法恢复。',
      '删除服务',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    appStore.setLoading(true)
    await deleteService(id)
    ElMessage.success('服务已删除')

    // Refresh list
    fetchServices()
    fetchStats()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Failed to delete service:', error)
      ElMessage.error(error.message || '删除失败')
    }
  } finally {
    appStore.setLoading(false)
  }
}

const handleCommand = (command: string, service: MyServiceItem) => {
  switch (command) {
    case 'view':
      router.push(`/services/${service.id}`)
      break
    case 'copy':
      const url = `${window.location.origin}/services/${service.id}`
      navigator.clipboard.writeText(url).then(() => {
        ElMessage.success('链接已复制')
      })
      break
    case 'stats':
      ElMessage.info('统计功能开发中...')
      break
  }
}

// Lifecycle
onMounted(() => {
  // Check login
  if (!userStore.isLogin) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  // Fetch initial data
  fetchServices()
  fetchStats()
})
</script>

<style scoped lang="scss">
.my-services-page {
  min-height: 100vh;
  background: #f9fafb;
  padding: 24px 0 60px;

  .page-container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 20px;
  }

  // Page Header
  .page-header {
    display: flex;
    align-items: center;
    margin-bottom: 24px;

    .page-title {
      font-size: 32px;
      font-weight: 700;
      color: #303133;
      margin: 0;
    }

    .page-subtitle {
      font-size: 16px;
      color: #4b5563;
      margin: 0 0 0 16px;
      flex: 1;
    }

    .publish-btn {
      background: #4f46e5;
      border-color: #4f46e5;
      font-weight: 600;

      &:hover {
        background: #4338ca;
        border-color: #4338ca;
      }
    }
  }

  // Stats Cards
  .stats-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 24px;

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      text-align: center;

      .stat-value {
        font-size: 32px;
        font-weight: 700;
        color: #4f46e5;
        margin-bottom: 8px;
      }

      .stat-label {
        font-size: 14px;
        color: #6b7280;
      }
    }
  }

  // Filter Card
  .filter-card {
    border-radius: 16px;
    border: none;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

    :deep(.el-tabs) {
      .el-tabs__header {
        margin-bottom: 24px;
      }

      .el-tabs__nav-wrap::after {
        height: 1px;
      }

      .el-tabs__active-bar {
        background-color: #4f46e5;
        height: 3px;
      }

      .el-tabs__item {
        font-size: 15px;
        color: #6b7280;
        font-weight: 500;

        &:hover {
          color: #4f46e5;
        }

        &.is-active {
          color: #4f46e5;
        }

        .tab-count {
          color: #9ca3af;
          font-weight: 400;
          font-size: 14px;
        }
      }
    }
  }

  // Loading & Empty
  .loading-container {
    padding: 40px;
  }

  .empty-container {
    padding: 60px 0;
  }

  // Service List
  .service-list {
    .service-item {
      display: flex;
      gap: 20px;
      padding: 20px;
      border-bottom: 1px solid #e5e7eb;
      transition: background 0.3s;

      &:hover {
        background: #f9fafb;
      }

      &:last-child {
        border-bottom: none;
      }

      .service-image {
        flex-shrink: 0;

        img {
          width: 120px;
          height: 90px;
          object-fit: cover;
          border-radius: 8px;
          cursor: pointer;
          transition: transform 0.3s;

          &:hover {
            transform: scale(1.05);
          }
        }
      }

      .service-info {
        flex: 1;

        .service-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 12px;

          h3 {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            color: #303133;
            cursor: pointer;
            transition: color 0.3s;

            &:hover {
              color: #4f46e5;
            }
          }

          .service-status {
            display: flex;
            gap: 8px;
          }
        }

        .service-meta {
          display: flex;
          gap: 20px;
          margin-bottom: 12px;
          font-size: 14px;
          color: #6b7280;

          .meta-item {
            display: flex;
            align-items: center;
            gap: 4px;

            .el-icon {
              font-size: 16px;
            }
          }
        }

        .review-reason {
          margin: 12px 0;

          :deep(.el-alert) {
            padding: 8px 12px;
            border-radius: 4px;

            .el-alert__title {
              font-size: 13px;
            }
          }
        }

        .service-time {
          font-size: 13px;
          color: #9ca3af;
          display: flex;
          gap: 20px;
        }
      }

      .service-actions {
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
        justify-content: center;

        :deep(.el-button) {
          margin-left: 0;
        }
      }
    }
  }

  // Pagination
  .pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid #e5e7eb;

    :deep(.el-pagination) {
      .el-pager li.active {
        background: #4f46e5;
      }

      .el-pager li:hover {
        color: #4f46e5;
      }
    }
  }
}

// Responsive
@media (max-width: 768px) {
  .my-services-page {
    .page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;

      .page-subtitle {
        margin-left: 0;
      }

      .publish-btn {
        width: 100%;
      }
    }

    .stats-cards {
      grid-template-columns: repeat(2, 1fr);
    }

    .service-list {
      .service-item {
        flex-direction: column;

        .service-image img {
          width: 100%;
          height: 180px;
        }

        .service-actions {
          flex-direction: row;
          flex-wrap: wrap;
        }
      }
    }
  }
}
</style>
