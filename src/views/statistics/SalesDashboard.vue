<template>
  <div class="sales-dashboard-page">
    <div class="page-container">
      <!-- Page Header -->
      <div class="page-header">
        <h1 class="page-title">销售统计</h1>
        <p class="page-desc">查看您的销售数据概览</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="8" animated />
      </div>

      <template v-else-if="stats">
        <!-- Stats Overview Cards -->
        <el-row :gutter="20" class="stats-row">
          <el-col :xs="24" :sm="8">
            <div class="stat-card">
              <div class="stat-icon sales-icon">
                <el-icon :size="24"><ShoppingCart /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ stats.totalSales }}</div>
                <div class="stat-label">总销量</div>
                <div class="stat-desc">完成订单数</div>
              </div>
            </div>
          </el-col>
          <el-col :xs="24" :sm="8">
            <div class="stat-card">
              <div class="stat-icon revenue-icon">
                <el-icon :size="24"><Wallet /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">¥{{ formatMoney(stats.totalRevenue) }}</div>
                <div class="stat-label">总收入</div>
                <div class="stat-desc">累计销售额</div>
              </div>
            </div>
          </el-col>
          <el-col :xs="24" :sm="8">
            <div class="stat-card">
              <div class="stat-icon avg-icon">
                <el-icon :size="24"><TrendCharts /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">¥{{ formatMoney(stats.averagePrice) }}</div>
                <div class="stat-label">平均客单价</div>
                <div class="stat-desc">总收入 / 总销量</div>
              </div>
            </div>
          </el-col>
        </el-row>

        <!-- Best Service Card -->
        <el-card class="section-card best-service-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="header-title">
                <el-icon><Medal /></el-icon>
                最畅销服务
              </span>
              <span class="header-tip">按完成订单数统计</span>
            </div>
          </template>

          <div v-if="stats.bestService" class="best-service-content">
            <div class="service-info">
              <h3 class="service-title" @click="goToService(stats.bestService.serviceId)">
                {{ stats.bestService.serviceTitle }}
              </h3>
              <div class="service-stats">
                <div class="service-stat">
                  <span class="stat-num">{{ stats.bestService.sales }}</span>
                  <span class="stat-text">销量</span>
                </div>
                <div class="service-stat">
                  <span class="stat-num">¥{{ formatMoney(stats.bestService.revenue) }}</span>
                  <span class="stat-text">销售额</span>
                </div>
              </div>
            </div>
            <el-button type="primary" @click="goToService(stats.bestService.serviceId)">
              查看服务详情
            </el-button>
          </div>

          <el-empty v-else description="暂无销售数据" :image-size="80" />
        </el-card>

        <!-- Recent Orders Card -->
        <el-card class="section-card recent-orders-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="header-title">
                <el-icon><List /></el-icon>
                最近订单
              </span>
              <span class="header-tip">仅显示最近 5 条已完成订单</span>
            </div>
          </template>

          <div v-if="stats.recentOrders && stats.recentOrders.length > 0">
            <el-table :data="stats.recentOrders" style="width: 100%">
              <el-table-column prop="orderNumber" label="订单编号" min-width="180">
                <template #default="{ row }">
                  <span class="order-number">{{ row.orderNumber }}</span>
                </template>
              </el-table-column>
              <el-table-column label="订单金额" min-width="120">
                <template #default="{ row }">
                  <span class="order-amount">¥{{ formatMoney(row.totalAmount) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="创建时间" min-width="180">
                <template #default="{ row }">
                  {{ formatDateTime(row.createTime) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120" fixed="right">
                <template #default="{ row }">
                  <el-button type="primary" link @click="goToOrder(row.orderId)">
                    查看详情
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <el-empty v-else description="暂无订单数据" :image-size="80" />
        </el-card>
      </template>

      <!-- Error/Empty State -->
      <el-card v-else class="error-card" shadow="never">
        <el-empty description="暂无销售数据">
          <el-button type="primary" @click="router.push('/my-services')">
            发布服务
          </el-button>
        </el-empty>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ShoppingCart,
  Wallet,
  TrendCharts,
  Medal,
  List
} from '@element-plus/icons-vue'
import { getUserSalesStatistics } from '@/api/statistics'
import type { UserSalesStatistics } from '@/types/statistics'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

// Data
const loading = ref(true)
const stats = ref<UserSalesStatistics | null>(null)

// Methods
const fetchStatistics = async () => {
  loading.value = true
  try {
    stats.value = await getUserSalesStatistics()
  } catch (error: any) {
    console.error('Failed to fetch sales statistics:', error)
    ElMessage.error(error.message || '获取销售统计失败')
  } finally {
    loading.value = false
  }
}

const formatMoney = (amount: number): string => {
  if (amount === null || amount === undefined) return '0.00'
  return amount.toFixed(2)
}

const formatDateTime = (dateStr: string): string => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

const goToService = (serviceId: number) => {
  router.push(`/services/${serviceId}`)
}

const goToOrder = (orderId: number) => {
  router.push(`/orders/${orderId}`)
}

// Lifecycle
onMounted(() => {
  if (!userStore.isLogin) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  fetchStatistics()
})
</script>

<style scoped lang="scss">
.sales-dashboard-page {
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

  // Loading
  .loading-container {
    background: white;
    border-radius: 16px;
    padding: 40px;
  }

  // Stats Row
  .stats-row {
    margin-bottom: 24px;

    .el-col {
      margin-bottom: 16px;

      @media (min-width: 768px) {
        margin-bottom: 0;
      }
    }
  }

  // Stat Card
  .stat-card {
    background: white;
    border-radius: 16px;
    padding: 24px;
    display: flex;
    align-items: center;
    gap: 20px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s, box-shadow 0.3s;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 25px 30px -5px rgba(0, 0, 0, 0.15);
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      &.sales-icon {
        background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
        color: white;
      }

      &.revenue-icon {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
      }

      &.avg-icon {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        color: white;
      }
    }

    .stat-content {
      flex: 1;

      .stat-value {
        font-size: 28px;
        font-weight: 700;
        color: #303133;
        line-height: 1.2;
      }

      .stat-label {
        font-size: 15px;
        font-weight: 600;
        color: #303133;
        margin-top: 4px;
      }

      .stat-desc {
        font-size: 13px;
        color: #6b7280;
        margin-top: 2px;
      }
    }
  }

  // Section Cards
  .section-card {
    border-radius: 16px;
    border: none;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    margin-bottom: 24px;

    :deep(.el-card__header) {
      border-bottom: 1px solid #e5e7eb;
      padding: 20px 24px;
    }

    :deep(.el-card__body) {
      padding: 24px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-title {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
        display: flex;
        align-items: center;
        gap: 8px;

        .el-icon {
          color: #4f46e5;
        }
      }

      .header-tip {
        font-size: 13px;
        color: #6b7280;
      }
    }
  }

  // Best Service Card
  .best-service-card {
    .best-service-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 24px;

      .service-info {
        flex: 1;

        .service-title {
          font-size: 20px;
          font-weight: 600;
          color: #303133;
          margin: 0 0 16px;
          cursor: pointer;
          transition: color 0.3s;

          &:hover {
            color: #4f46e5;
          }
        }

        .service-stats {
          display: flex;
          gap: 32px;

          .service-stat {
            display: flex;
            flex-direction: column;

            .stat-num {
              font-size: 24px;
              font-weight: 700;
              color: #4f46e5;
            }

            .stat-text {
              font-size: 14px;
              color: #6b7280;
              margin-top: 4px;
            }
          }
        }
      }

      .el-button--primary {
        background: #4f46e5;
        border-color: #4f46e5;

        &:hover:not(:disabled) {
          background: #4338ca;
          border-color: #4338ca;
        }
      }
    }
  }

  // Recent Orders Card
  .recent-orders-card {
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

    .order-amount {
      font-weight: 600;
      color: #10b981;
    }
  }

  // Error Card
  .error-card {
    border-radius: 16px;
    border: none;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

    :deep(.el-card__body) {
      padding: 60px 24px;
    }

    .el-button--primary {
      background: #4f46e5;
      border-color: #4f46e5;

      &:hover:not(:disabled) {
        background: #4338ca;
        border-color: #4338ca;
      }
    }
  }
}

// Responsive
@media (max-width: 768px) {
  .sales-dashboard-page {
    .best-service-card {
      .best-service-content {
        flex-direction: column;
        align-items: flex-start;

        .el-button {
          width: 100%;
        }
      }
    }
  }
}
</style>
