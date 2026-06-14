<template>
  <div class="notification-page">
    <div class="page-container">
      <el-card class="notification-card">
        <!-- 标题区域 -->
        <div class="card-header">
          <div class="header-left">
            <h1 class="page-title">我的通知</h1>
            <span class="unread-count" v-if="notificationStore.unreadCount > 0">
              未读 {{ notificationStore.unreadCount }} 条
            </span>
          </div>
          <div class="header-right">
            <el-button
              class="mark-all-btn"
              :disabled="notificationStore.unreadCount === 0"
              @click="handleMarkAllRead"
            >
              <el-icon><Check /></el-icon>
              全部已读
            </el-button>
          </div>
        </div>

        <!-- 筛选区域 -->
        <div class="filter-area">
          <el-form :inline="true" :model="query" class="filter-form">
            <el-form-item label="通知类型">
              <el-select
                v-model="query.notificationType"
                clearable
                placeholder="全部类型"
                class="type-select"
              >
                <el-option
                  v-for="option in notificationTypeOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" class="primary-btn" @click="handleSearch">
                查询
              </el-button>
              <el-button @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 通知列表 -->
        <div class="notification-content" v-loading="loading">
          <!-- 有数据时显示列表 -->
          <div v-if="notifications.length > 0" class="notification-list">
            <div
              v-for="item in notifications"
              :key="item.id"
              class="notification-item"
              :class="{ 'is-unread': item.isRead === 0 }"
              @click="handleClickNotification(item)"
            >
              <!-- 未读指示条 -->
              <div v-if="item.isRead === 0" class="unread-indicator"></div>

              <div class="notification-main">
                <div class="notification-header">
                  <span class="notification-type-tag" :class="`type-${item.notificationType}`">
                    {{ notificationTypeMap[item.notificationType] || '通知' }}
                  </span>
                  <span class="notification-time">{{ formatNotificationTime(item.createTime) }}</span>
                </div>

                <div class="notification-title">{{ item.title }}</div>

                <div class="notification-body">{{ item.content }}</div>

                <div class="notification-footer">
                  <el-button
                    v-if="item.isRead === 0"
                    text
                    class="action-btn"
                    @click.stop="handleMarkRead(item)"
                  >
                    <el-icon><Check /></el-icon>
                    标记已读
                  </el-button>
                  <el-button
                    v-if="getNotificationRoute(item)"
                    text
                    class="action-btn detail-btn"
                    @click.stop="handleGoDetail(item)"
                  >
                    <el-icon><ArrowRight /></el-icon>
                    查看详情
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-else-if="!loading" class="empty-state">
            <el-icon class="empty-icon"><Bell /></el-icon>
            <p class="empty-text">暂无通知消息</p>
          </div>
        </div>

        <!-- 分页 -->
        <div class="pagination-wrapper" v-if="total > query.pageSize!">
          <el-pagination
            v-model:current-page="query.pageNum"
            :page-size="query.pageSize"
            :total="total"
            layout="prev, pager, next"
            background
            @current-change="handlePageChange"
          />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Check, Bell, ArrowRight } from '@element-plus/icons-vue'
import { listMyNotifications, markNotificationRead, markAllRead } from '@/api/notification'
import { useNotificationStore } from '@/stores/notification'
import {
  notificationTypeMap,
  notificationTypeOptions,
  getNotificationRoute,
  formatNotificationTime
} from '@/types/notification'
import type { NotificationItem, NotificationQuery, NotificationType } from '@/types/notification'

const router = useRouter()
const notificationStore = useNotificationStore()

// 查询参数
const query = reactive<NotificationQuery>({
  pageNum: 1,
  pageSize: 10,
  notificationType: undefined
})

// 数据状态
const notifications = ref<NotificationItem[]>([])
const loading = ref(false)
const total = ref(0)

// 加载通知列表
async function loadNotifications() {
  loading.value = true
  try {
    const result = await listMyNotifications(query)
    notifications.value = result.records || []
    total.value = result.total || 0
  } catch (error) {
    console.error('获取通知列表失败:', error)
    ElMessage.error('获取通知列表失败')
  } finally {
    loading.value = false
  }
}

// 查询
function handleSearch() {
  query.pageNum = 1
  loadNotifications()
}

// 重置
function handleReset() {
  query.pageNum = 1
  query.notificationType = undefined
  loadNotifications()
}

// 分页变化
function handlePageChange(page: number) {
  query.pageNum = page
  loadNotifications()
}

// 标记单条为已读
async function handleMarkRead(item: NotificationItem) {
  if (item.isRead === 1) return

  try {
    await markNotificationRead(item.id)
    item.isRead = 1
    notificationStore.decreaseUnread(1)
  } catch (error) {
    console.error('标记已读失败:', error)
    ElMessage.error('标记已读失败')
  }
}

// 标记全部为已读
async function handleMarkAllRead() {
  if (notificationStore.unreadCount === 0) return

  try {
    await markAllRead()
    // 更新本地状态
    notifications.value.forEach(item => {
      item.isRead = 1
    })
    notificationStore.clearUnread()
    ElMessage.success('已标记全部通知为已读')
  } catch (error) {
    console.error('标记全部已读失败:', error)
    ElMessage.error('标记全部已读失败')
  }
}

// 点击通知
async function handleClickNotification(item: NotificationItem) {
  // 如果未读，先标记为已读
  if (item.isRead === 0) {
    await handleMarkRead(item)
  }

  // 获取跳转路由
  const route = getNotificationRoute(item)
  if (route) {
    router.push(route.path)
  }
}

// 查看详情
function handleGoDetail(item: NotificationItem) {
  const route = getNotificationRoute(item)
  if (route) {
    router.push(route.path)
  } else {
    // 没有详情页的类型
    const typeMessages: Record<number, string> = {
      1: '权限已批准，您现在可以发布服务了',
      4: '纠纷详情页开发中'
    }
    ElMessage.info(typeMessages[item.notificationType] || '暂无详情页')
  }
}

onMounted(() => {
  loadNotifications()
  // 同步刷新未读数
  notificationStore.fetchUnreadCount()
})
</script>

<style scoped lang="scss">
.notification-page {
  min-height: calc(100vh - 64px);
  background-color: #f9fafb;
  padding: 32px 0;
}

.page-container {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 16px;
}

.notification-card {
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: none;
  min-height: 600px;

  :deep(.el-card__body) {
    padding: 32px;
  }
}

// 标题区域
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .page-title {
    font-size: 24px;
    font-weight: 700;
    color: #1f2937;
    margin: 0;
  }

  .unread-count {
    font-size: 14px;
    color: #fff;
    background: #4f46e5;
    padding: 4px 12px;
    border-radius: 12px;
  }
}

.mark-all-btn {
  background: #fff;
  border: 1px solid #e5e7eb;
  color: #4b5563;
  font-weight: 500;

  &:hover:not(:disabled) {
    background: #f9fafb;
    border-color: #4f46e5;
    color: #4f46e5;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

// 筛选区域
.filter-area {
  background: #f9fafb;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 24px;

  .filter-form {
    margin-bottom: 0;

    :deep(.el-form-item) {
      margin-bottom: 0;
      margin-right: 16px;

      &:last-child {
        margin-right: 0;
      }
    }

    :deep(.el-form-item__label) {
      color: #4b5563;
    }
  }

  .type-select {
    width: 160px;
  }
}

.primary-btn {
  background: #4f46e5;
  border-color: #4f46e5;
  color: #fff;

  &:hover,
  &:focus {
    background: #4338ca;
    border-color: #4338ca;
  }
}

// 通知内容区域
.notification-content {
  min-height: 400px;
}

// 通知列表
.notification-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

// 通知项
.notification-item {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 20px 24px;
  cursor: pointer;
  position: relative;
  transition: all 0.3s;
  display: flex;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-color: #d1d5db;

    .notification-title {
      color: #4f46e5;
    }
  }

  &.is-unread {
    background: linear-gradient(to right, #f5f3ff, #fff 24px);

    .notification-title {
      font-weight: 700;
    }
  }

  .unread-indicator {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: #4f46e5;
    border-radius: 16px 0 0 16px;
  }
}

.notification-main {
  flex: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.notification-type-tag {
  font-size: 12px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 6px;
  background: #f3f4f6;
  color: #4b5563;

  &.type-1 {
    background: #dbeafe;
    color: #1d4ed8;
  }

  &.type-2 {
    background: #fee2e2;
    color: #dc2626;
  }

  &.type-3 {
    background: #d1fae5;
    color: #059669;
  }

  &.type-4 {
    background: #fef3c7;
    color: #d97706;
  }

  &.type-5 {
    background: #e0e7ff;
    color: #4f46e5;
  }
}

.notification-time {
  font-size: 13px;
  color: #9ca3af;
}

.notification-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
  transition: color 0.3s;
}

.notification-body {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 12px;
}

.notification-footer {
  display: flex;
  gap: 8px;
}

.action-btn {
  color: #6b7280;
  font-size: 13px;
  padding: 4px 8px;

  &:hover {
    color: #4f46e5;
    background: #f5f3ff;
  }

  .el-icon {
    margin-right: 4px;
  }
}

.detail-btn {
  color: #4f46e5;

  &:hover {
    background: #eef2ff;
  }
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;

  .empty-icon {
    font-size: 64px;
    color: #d1d5db;
    margin-bottom: 16px;
  }

  .empty-text {
    font-size: 16px;
    color: #6b7280;
    margin: 0;
  }
}

// 分页
.pagination-wrapper {
  margin-top: 32px;
  display: flex;
  justify-content: center;

  :deep(.el-pagination) {
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

// 响应式
@media (max-width: 768px) {
  .notification-page {
    padding: 16px 0;
  }

  .notification-card {
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

  .filter-area {
    padding: 12px 16px;

    .filter-form {
      :deep(.el-form-item) {
        margin-right: 8px;
        margin-bottom: 8px;
      }
    }

    .type-select {
      width: 140px;
    }
  }

  .notification-item {
    padding: 16px;
  }

  .notification-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .notification-title {
    font-size: 15px;
  }

  .notification-body {
    font-size: 13px;
  }
}
</style>
