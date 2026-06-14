<template>
  <div class="admin-dashboard-page" v-loading="loading">
    <!-- 顶部欢迎区 -->
    <section class="dashboard-header">
      <div class="title-block">
        <h2>仪表板</h2>
        <p class="subtitle">查看平台整体运行情况和关键指标</p>
      </div>
    </section>

    <!-- 无数据提示 -->
    <div v-if="!loading && !stats" class="no-data">
      <el-empty description="暂无统计数据" />
    </div>

    <template v-if="stats">
      <!-- 总览统计卡片 -->
      <section class="dashboard-stats">
        <el-row :gutter="20">
          <el-col :xs="12" :sm="6">
            <div class="stat-card">
              <div class="icon-wrapper users">
                <i class="fas fa-users"></i>
              </div>
              <div class="stat-content">
                <div class="label">总用户数</div>
                <div class="value">{{ formatNumber(stats.totalUsers) }}</div>
              </div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="6">
            <div class="stat-card">
              <div class="icon-wrapper services">
                <i class="fas fa-box"></i>
              </div>
              <div class="stat-content">
                <div class="label">总服务数</div>
                <div class="value">{{ formatNumber(stats.totalServices) }}</div>
              </div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="6">
            <div class="stat-card">
              <div class="icon-wrapper orders">
                <i class="fas fa-shopping-cart"></i>
              </div>
              <div class="stat-content">
                <div class="label">总订单数</div>
                <div class="value">{{ formatNumber(stats.totalOrders) }}</div>
              </div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="6">
            <div class="stat-card">
              <div class="icon-wrapper amount">
                <i class="fas fa-coins"></i>
              </div>
              <div class="stat-content">
                <div class="label">总成交额</div>
                <div class="value">{{ formatAmount(stats.totalTransactionAmount) }}</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </section>

      <!-- 今日统计卡片 -->
      <section class="dashboard-today">
        <h3 class="section-title">今日数据</h3>
        <el-row :gutter="20">
          <el-col :xs="12" :sm="8">
            <div class="stat-small-card today-users">
              <div class="small-icon">
                <i class="fas fa-user-plus"></i>
              </div>
              <div class="small-content">
                <div class="small-value">{{ stats.todayNewUsers }}</div>
                <div class="small-label">今日新增用户</div>
              </div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="8">
            <div class="stat-small-card today-services">
              <div class="small-icon">
                <i class="fas fa-plus-square"></i>
              </div>
              <div class="small-content">
                <div class="small-value">{{ stats.todayNewServices }}</div>
                <div class="small-label">今日新增服务</div>
              </div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="8">
            <div class="stat-small-card today-orders">
              <div class="small-icon">
                <i class="fas fa-receipt"></i>
              </div>
              <div class="small-content">
                <div class="small-value">{{ stats.todayNewOrders }}</div>
                <div class="small-label">今日新增订单</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </section>

      <!-- 运营指标卡片 -->
      <section class="dashboard-metrics">
        <h3 class="section-title">运营指标</h3>
        <el-row :gutter="20">
          <el-col :xs="12" :sm="8">
            <div class="stat-small-card metric-active">
              <div class="small-icon">
                <i class="fas fa-chart-line"></i>
              </div>
              <div class="small-content">
                <div class="small-value">{{ stats.activeUsers }}</div>
                <div class="small-label">活跃用户（近30天）</div>
              </div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="8">
            <div class="stat-small-card metric-completed">
              <div class="small-icon">
                <i class="fas fa-check-circle"></i>
              </div>
              <div class="small-content">
                <div class="small-value">{{ stats.completedOrders }}</div>
                <div class="small-label">已完成订单</div>
              </div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="8">
            <div class="stat-small-card metric-disputes" @click="goToDisputes">
              <div class="small-icon">
                <i class="fas fa-exclamation-triangle"></i>
              </div>
              <div class="small-content">
                <div class="small-value">{{ stats.pendingDisputes }}</div>
                <div class="small-label">待处理纠纷</div>
              </div>
              <div v-if="stats.pendingDisputes > 0" class="badge-alert">
                需处理
              </div>
            </div>
          </el-col>
        </el-row>
      </section>

      <!-- 趋势图表区 -->
      <section class="dashboard-charts">
        <el-row :gutter="20">
          <!-- 订单与服务趋势 -->
          <el-col :xs="24" :lg="12">
            <el-card class="chart-card" shadow="never">
              <template #header>
                <div class="chart-header">
                  <h3>近7日订单与服务趋势</h3>
                </div>
              </template>
              <div v-if="trendLoading" class="chart-loading">
                <el-skeleton :rows="5" animated />
              </div>
              <div v-else-if="!trend" class="chart-empty">
                <el-empty description="暂无趋势数据" :image-size="60" />
              </div>
              <div v-else ref="orderChartRef" class="chart-container"></div>
            </el-card>
          </el-col>

          <!-- 交易金额趋势 -->
          <el-col :xs="24" :lg="12">
            <el-card class="chart-card" shadow="never">
              <template #header>
                <div class="chart-header">
                  <h3>近7日交易金额趋势</h3>
                </div>
              </template>
              <div v-if="trendLoading" class="chart-loading">
                <el-skeleton :rows="5" animated />
              </div>
              <div v-else-if="!trend" class="chart-empty">
                <el-empty description="暂无趋势数据" :image-size="60" />
              </div>
              <div v-else ref="amountChartRef" class="chart-container"></div>
            </el-card>
          </el-col>
        </el-row>
      </section>

      <!-- 快捷操作 -->
      <section class="dashboard-shortcuts">
        <h3 class="section-title">快捷入口</h3>
        <el-row :gutter="20">
          <el-col :xs="12" :sm="6">
            <div class="shortcut-card" @click="router.push('/admin/permissions')">
              <div class="shortcut-icon permissions">
                <i class="fas fa-user-check"></i>
              </div>
              <span>权限审核</span>
            </div>
          </el-col>
          <el-col :xs="12" :sm="6">
            <div class="shortcut-card" @click="router.push('/admin/services')">
              <div class="shortcut-icon services">
                <i class="fas fa-tasks"></i>
              </div>
              <span>服务审核</span>
            </div>
          </el-col>
          <el-col :xs="12" :sm="6">
            <div class="shortcut-card" @click="router.push('/admin/disputes')">
              <div class="shortcut-icon disputes">
                <i class="fas fa-gavel"></i>
              </div>
              <span>纠纷处理</span>
            </div>
          </el-col>
          <el-col :xs="12" :sm="6">
            <div class="shortcut-card" @click="router.push('/admin/settings')">
              <div class="shortcut-icon settings">
                <i class="fas fa-cogs"></i>
              </div>
              <span>系统配置</span>
            </div>
          </el-col>
        </el-row>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { getAdminStatistics, getAdminTrend } from '@/api/admin'
import type { AdminStatistics, AdminTrend } from '@/types/admin'

const router = useRouter()

const stats = ref<AdminStatistics | null>(null)
const trend = ref<AdminTrend | null>(null)
const loading = ref(false)
const trendLoading = ref(false)

// 图表 DOM 引用
const orderChartRef = ref<HTMLDivElement>()
const amountChartRef = ref<HTMLDivElement>()

// 图表实例
let orderChart: echarts.ECharts | null = null
let amountChart: echarts.ECharts | null = null

/**
 * 加载统计数据
 */
const loadStats = async () => {
  try {
    loading.value = true
    stats.value = await getAdminStatistics()
  } catch (error: any) {
    console.error('Failed to load statistics:', error)
    ElMessage.error(error.message || '获取统计数据失败')
  } finally {
    loading.value = false
  }
}

/**
 * 加载趋势数据
 */
const loadTrend = async () => {
  try {
    trendLoading.value = true
    trend.value = await getAdminTrend()
  } catch (error: any) {
    console.error('Failed to load trend:', error)
  } finally {
    trendLoading.value = false
  }
}

/**
 * 监听数据变化，当 stats 和 trend 都有值时初始化图表
 */
watch([stats, trend, () => trendLoading.value], async () => {
  // 必须 stats 有值（DOM 才会渲染），trend 有值，且不在加载中
  if (stats.value && trend.value && !trendLoading.value) {
    await nextTick()
    initCharts()
  }
}, { immediate: true })

/**
 * 初始化图表
 */
const initCharts = () => {
  if (!trend.value) return

  initOrderChart()
  initAmountChart()
}

/**
 * 初始化订单与服务趋势图表
 */
const initOrderChart = () => {
  if (!orderChartRef.value || !trend.value) return

  // 销毁旧实例
  if (orderChart) {
    orderChart.dispose()
  }

  orderChart = echarts.init(orderChartRef.value)

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: '#374151'
      }
    },
    legend: {
      data: ['新增订单', '新增服务'],
      bottom: 0,
      textStyle: {
        color: '#6b7280'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: trend.value.dates,
      axisLine: {
        lineStyle: {
          color: '#e5e7eb'
        }
      },
      axisLabel: {
        color: '#6b7280'
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      splitLine: {
        lineStyle: {
          color: '#f3f4f6'
        }
      },
      axisLabel: {
        color: '#6b7280'
      }
    },
    series: [
      {
        name: '新增订单',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          color: '#4f46e5',
          width: 3
        },
        itemStyle: {
          color: '#4f46e5'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(79, 70, 229, 0.3)' },
            { offset: 1, color: 'rgba(79, 70, 229, 0.05)' }
          ])
        },
        data: trend.value.orderCounts
      },
      {
        name: '新增服务',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          color: '#10b981',
          width: 3
        },
        itemStyle: {
          color: '#10b981'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
            { offset: 1, color: 'rgba(16, 185, 129, 0.05)' }
          ])
        },
        data: trend.value.serviceCounts
      }
    ]
  }

  orderChart.setOption(option)
}

/**
 * 初始化交易金额趋势图表
 */
const initAmountChart = () => {
  if (!amountChartRef.value || !trend.value) return

  // 销毁旧实例
  if (amountChart) {
    amountChart.dispose()
  }

  amountChart = echarts.init(amountChartRef.value)

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: '#374151'
      },
      formatter: (params: any) => {
        const data = params[0]
        return `${data.name}<br/>${data.seriesName}: ¥${data.value.toFixed(2)}`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: trend.value.dates,
      axisLine: {
        lineStyle: {
          color: '#e5e7eb'
        }
      },
      axisLabel: {
        color: '#6b7280'
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      splitLine: {
        lineStyle: {
          color: '#f3f4f6'
        }
      },
      axisLabel: {
        color: '#6b7280',
        formatter: (value: number) => `¥${value}`
      }
    },
    series: [
      {
        name: '交易金额',
        type: 'bar',
        barWidth: '50%',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#f59e0b' },
            { offset: 1, color: '#fbbf24' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        data: trend.value.transactionAmounts
      }
    ]
  }

  amountChart.setOption(option)
}

/**
 * 窗口大小变化时调整图表
 */
const handleResize = () => {
  orderChart?.resize()
  amountChart?.resize()
}

/**
 * 格式化数字（添加千分位）
 */
const formatNumber = (num: number): string => {
  return num.toLocaleString('zh-CN')
}

/**
 * 格式化金额
 */
const formatAmount = (amount: number): string => {
  return `¥ ${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * 跳转到纠纷列表
 */
const goToDisputes = () => {
  router.push('/admin/disputes')
}

onMounted(() => {
  loadStats()
  loadTrend()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  orderChart?.dispose()
  amountChart?.dispose()
})
</script>

<style scoped lang="scss">
.admin-dashboard-page {
  // Header
  .dashboard-header {
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

  // No data
  .no-data {
    background: white;
    border-radius: 16px;
    padding: 60px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  }

  // Section title
  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #374151;
    margin: 0 0 16px;
  }

  // Stats section
  .dashboard-stats {
    margin-bottom: 24px;
  }

  // Stat card (large)
  .stat-card {
    background: white;
    border-radius: 16px;
    padding: 24px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    transition: all 0.3s;
    margin-bottom: 20px;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 25px 30px -5px rgba(0, 0, 0, 0.15);
    }

    .icon-wrapper {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      flex-shrink: 0;

      &.users {
        background: #eef2ff;
        color: #4f46e5;
      }

      &.services {
        background: #ecfdf5;
        color: #059669;
      }

      &.orders {
        background: #faf5ff;
        color: #7c3aed;
      }

      &.amount {
        background: #fef3c7;
        color: #d97706;
      }
    }

    .stat-content {
      flex: 1;
      min-width: 0;

      .label {
        font-size: 13px;
        color: #6b7280;
        margin-bottom: 4px;
      }

      .value {
        font-size: 24px;
        font-weight: 700;
        color: #1f2937;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }

  // Today & Metrics sections
  .dashboard-today,
  .dashboard-metrics {
    margin-bottom: 24px;
  }

  // Stat small card
  .stat-small-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    transition: all 0.3s;
    margin-bottom: 20px;
    position: relative;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 20px -3px rgba(0, 0, 0, 0.12);
    }

    .small-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      flex-shrink: 0;
    }

    .small-content {
      flex: 1;

      .small-value {
        font-size: 22px;
        font-weight: 700;
        color: #1f2937;
      }

      .small-label {
        font-size: 12px;
        color: #6b7280;
        margin-top: 2px;
      }
    }

    .badge-alert {
      position: absolute;
      top: 12px;
      right: 12px;
      background: #ef4444;
      color: white;
      font-size: 10px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 10px;
    }

    // Today cards colors
    &.today-users .small-icon {
      background: #dbeafe;
      color: #2563eb;
    }

    &.today-services .small-icon {
      background: #d1fae5;
      color: #059669;
    }

    &.today-orders .small-icon {
      background: #fce7f3;
      color: #db2777;
    }

    // Metrics cards colors
    &.metric-active .small-icon {
      background: #e0e7ff;
      color: #4f46e5;
    }

    &.metric-completed .small-icon {
      background: #d1fae5;
      color: #10b981;
    }

    &.metric-disputes {
      cursor: pointer;

      .small-icon {
        background: #fef3c7;
        color: #f59e0b;
      }
    }
  }

  // Chart section
  .dashboard-charts {
    margin-bottom: 24px;

    .chart-card {
      border: none;
      border-radius: 16px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      margin-bottom: 20px;

      :deep(.el-card__header) {
        border-bottom: 1px solid #e5e7eb;
        padding: 16px 24px;
      }

      :deep(.el-card__body) {
        padding: 24px;
      }

      .chart-header {
        display: flex;
        align-items: center;
        justify-content: space-between;

        h3 {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }
      }

      .chart-container {
        height: 280px;
        width: 100%;
      }

      .chart-loading,
      .chart-empty {
        height: 280px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }

  // Shortcuts
  .dashboard-shortcuts {
    margin-bottom: 24px;

    .shortcut-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      transition: all 0.3s;
      margin-bottom: 20px;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 15px 20px -3px rgba(0, 0, 0, 0.15);

        .shortcut-icon {
          transform: scale(1.1);
        }
      }

      .shortcut-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        transition: transform 0.3s;

        &.permissions {
          background: #dbeafe;
          color: #2563eb;
        }

        &.services {
          background: #d1fae5;
          color: #059669;
        }

        &.disputes {
          background: #fef3c7;
          color: #f59e0b;
        }

        &.settings {
          background: #e5e7eb;
          color: #4b5563;
        }
      }

      span {
        font-size: 14px;
        font-weight: 500;
        color: #374151;
      }
    }
  }
}

// Responsive
@media (max-width: 768px) {
  .admin-dashboard-page {
    .stat-card {
      padding: 16px;

      .icon-wrapper {
        width: 48px;
        height: 48px;
        font-size: 20px;
      }

      .stat-content {
        .value {
          font-size: 20px;
        }
      }
    }

    .stat-small-card {
      padding: 16px;

      .small-icon {
        width: 40px;
        height: 40px;
        font-size: 16px;
      }

      .small-content {
        .small-value {
          font-size: 18px;
        }
      }
    }

    .dashboard-charts {
      .chart-card {
        .chart-container {
          height: 220px;
        }

        .chart-loading,
        .chart-empty {
          height: 220px;
        }
      }
    }
  }
}
</style>
