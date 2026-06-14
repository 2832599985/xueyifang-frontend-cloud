<template>
  <div id="app">
    <!-- 全局Loading -->
    <el-loading
      v-if="appStore.loading"
      fullscreen
      lock
      text="加载中..."
    />

    <!-- 顶部导航栏 -->
    <header class="app-header" v-if="!route.meta.hideLayout && !route.path.startsWith('/admin')">
      <div class="container">
        <div class="header-content">
          <!-- Logo Section -->
          <div class="header-left">
            <div class="logo" @click="goHome">
              <el-icon :size="32" color="#4f46e5"><School /></el-icon>
              <span class="logo-text">学艺坊</span>
            </div>

            <!-- Navigation Menu -->
            <nav class="nav-links">
              <router-link
                to="/"
                :class="['nav-link', { active: route.path === '/' }]"
              >
                首页
              </router-link>
              <router-link
                to="/services"
                :class="['nav-link', { active: route.path.startsWith('/services') }]"
              >
                服务大厅
              </router-link>
              <router-link
                to="/about"
                :class="['nav-link', { active: route.path === '/about' }]"
              >
                关于我们
              </router-link>
            </nav>
          </div>

          <!-- Right Section -->
          <div class="header-right">
            <!-- Search Bar -->
            <div class="search-bar">
              <el-input
                v-model="searchKeyword"
                placeholder="搜索服务、技能..."
                :prefix-icon="Search"
                @keyup.enter="handleSearch"
                class="search-input"
              />
            </div>

            <!-- Publish Button -->
            <el-button
              type="primary"
              @click="goPublish"
              class="publish-btn"
            >
              <el-icon><Plus /></el-icon>
              发布服务
            </el-button>

            <!-- User Actions -->
            <div class="user-actions">
              <template v-if="userStore.userInfo">
                <!-- Favorites -->
                <el-badge :value="0" :hidden="true" class="action-icon">
                  <el-icon :size="20" @click="goFavorites">
                    <StarFilled />
                  </el-icon>
                </el-badge>

                <!-- Notifications -->
                <el-popover
                  v-model:visible="notifyPopoverVisible"
                  placement="bottom-end"
                  :width="340"
                  trigger="click"
                  popper-class="notify-popover"
                  @show="handleNotifyPopoverShow"
                >
                  <template #reference>
                    <el-badge
                      :value="notificationStore.unreadCount"
                      :hidden="notificationStore.unreadCount === 0"
                      :max="99"
                      class="action-icon notify-badge"
                    >
                      <el-icon :size="20">
                        <Bell />
                      </el-icon>
                    </el-badge>
                  </template>

                  <div class="notify-popover-content">
                    <div class="notify-popover-header">
                      <span class="notify-title">通知</span>
                      <el-button
                        v-if="notificationStore.unreadCount > 0"
                        text
                        size="small"
                        class="mark-all-btn"
                        @click="handleMarkAllNotificationsRead"
                      >
                        全部已读
                      </el-button>
                    </div>

                    <div class="notify-popover-list">
                      <template v-if="notificationStore.recentNotifications.length > 0">
                        <div
                          v-for="item in notificationStore.recentNotifications"
                          :key="item.id"
                          class="notify-item"
                          :class="{ 'is-unread': item.isRead === 0 }"
                          @click="handleClickNotificationItem(item)"
                        >
                          <div class="notify-item-header">
                            <span class="notify-type-tag" :class="`type-${item.notificationType}`">
                              {{ notificationTypeMap[item.notificationType] || '通知' }}
                            </span>
                            <span class="notify-time">{{ formatNotificationTime(item.createTime) }}</span>
                          </div>
                          <div class="notify-item-title">{{ item.title }}</div>
                        </div>
                      </template>
                      <div v-else class="notify-empty">
                        暂无通知
                      </div>
                    </div>

                    <div class="notify-popover-footer">
                      <el-button text class="view-all-btn" @click="goNotifications">
                        查看全部通知
                        <el-icon><ArrowRight /></el-icon>
                      </el-button>
                    </div>
                  </div>
                </el-popover>

                <!-- Messages -->
                <el-badge
                  :value="chatStore.totalUnreadCount"
                  :hidden="chatStore.totalUnreadCount === 0"
                  :max="99"
                  class="action-icon"
                >
                  <el-icon :size="20" @click="goChat">
                    <ChatDotRound />
                  </el-icon>
                </el-badge>

                <!-- User Dropdown -->
                <el-dropdown @command="handleCommand" class="user-dropdown">
                  <div class="user-avatar-wrapper">
                    <el-avatar
                      :size="32"
                      :src="buildImageUrl(userStore.userInfo.avatar)"
                      class="user-avatar"
                    >
                      {{ userStore.userInfo.nickname?.charAt(0) || userStore.userInfo.realName?.charAt(0) }}
                    </el-avatar>
                  </div>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="profile">
                        <el-icon><User /></el-icon>
                        个人中心
                      </el-dropdown-item>
                      <el-dropdown-item command="my-services">
                        <el-icon><ShoppingBag /></el-icon>
                        我的服务
                      </el-dropdown-item>
                      <el-dropdown-item command="my-buy-orders">
                        <el-icon><List /></el-icon>
                        我的购买
                      </el-dropdown-item>
                      <el-dropdown-item command="my-sell-orders">
                        <el-icon><Ticket /></el-icon>
                        我的销售
                      </el-dropdown-item>
                      <el-dropdown-item divided command="logout">
                        <el-icon><SwitchButton /></el-icon>
                        退出登录
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </template>

              <template v-else>
                <el-button text @click="router.push('/login')" class="auth-btn">
                  登录
                </el-button>
                <el-button v-if="registerConfigStore.registerEnabled" type="primary" @click="router.push('/register')" class="auth-btn register-btn">
                  注册
                </el-button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="app-main">
      <router-view />
    </main>

    <!-- 底部版权 -->
    <footer class="app-footer" v-if="!route.meta.hideLayout && !route.path.startsWith('/admin')">
      <div class="container">
        <p>&copy; 2025 学艺坊 | 校园技能服务平台</p>
        <p>基于 Vue 3 + Spring Boot 开发</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  School,
  Search,
  Plus,
  StarFilled,
  Bell,
  ChatDotRound,
  User,
  ShoppingBag,
  List,
  Ticket,
  SwitchButton,
  Check,
  ArrowRight
} from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { useNotificationStore } from '@/stores/notification'
import { useChatStore } from '@/stores/chat'
import { useWebSocket } from '@/composables/useWebSocket'
import { buildImageUrl } from '@/api/service'
import { markAllRead, markNotificationRead } from '@/api/notification'
import { notificationTypeMap, formatNotificationTime, getNotificationRoute } from '@/types/notification'
import type { NotificationItem } from '@/types/notification'
import { useRegisterConfigStore } from '@/stores/registerConfig'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()
const userStore = useUserStore()
const notificationStore = useNotificationStore()
const chatStore = useChatStore()
const registerConfigStore = useRegisterConfigStore()

// 启动 WebSocket 连接（实时推送）
const { isConnected } = useWebSocket()

// Search
const searchKeyword = ref('')

// Notification popover visible
const notifyPopoverVisible = ref(false)

const goHome = () => {
  router.push('/')
}

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({
      path: '/services',
      query: { keyword: searchKeyword.value.trim() }
    })
  }
}

const goPublish = () => {
  if (!userStore.isLogin) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  router.push('/service/publish')
}

const goFavorites = () => {
  if (!userStore.isLogin) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  router.push('/favorites')
}

const goChat = () => {
  if (!userStore.isLogin) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  router.push('/chat')
}

// 打开通知弹窗时加载最近通知
const handleNotifyPopoverShow = () => {
  notificationStore.fetchRecentNotifications()
}

// 跳转到通知列表
const goNotifications = () => {
  notifyPopoverVisible.value = false
  router.push('/notifications')
}

// 标记全部通知为已读
const handleMarkAllNotificationsRead = async () => {
  if (notificationStore.unreadCount === 0) return
  try {
    await markAllRead()
    notificationStore.markAllLocalRead()
    ElMessage.success('已标记全部通知为已读')
  } catch {
    ElMessage.error('操作失败')
  }
}

// 点击通知项
const handleClickNotificationItem = async (item: NotificationItem) => {
  // 如果未读，先标记为已读
  if (item.isRead === 0) {
    try {
      await markNotificationRead(item.id)
      notificationStore.markLocalRead(item.id)
    } catch {
      // 静默处理
    }
  }

  // 关闭弹窗
  notifyPopoverVisible.value = false

  // 跳转
  const routeConfig = getNotificationRoute(item)
  if (routeConfig) {
    router.push(routeConfig.path)
  }
}

const handleCommand = async (command: string) => {
  switch (command) {
    case 'logout':
      await userStore.logout()
      ElMessage.success('已退出登录')
      router.push('/')
      break
    case 'profile':
      router.push('/user/center')
      break
    case 'my-services':
      router.push('/my-services')
      break
    case 'my-buy-orders':
      router.push('/orders')
      break
    case 'my-sell-orders':
      router.push('/orders/sales')
      break
  }
}

// 初始化：获取用户信息和初始数据
onMounted(async () => {
  // 获取注册开关状态（无需登录）
  registerConfigStore.fetchRegisterStatus()

  if (appStore.token) {
    await userStore.fetchCurrentUser()
    // 获取初始未读数
    if (userStore.isLogin) {
      notificationStore.fetchUnreadCount()
      chatStore.fetchConversations()
    }
  }
})
</script>

<style lang="scss">
#app {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f9fafb; // Gray-50 as base background
}

.app-header {
  background: white;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 1000;

  .container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
  }

  // Left Section
  .header-left {
    display: flex;
    align-items: center;
    gap: 32px;

    .logo {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      transition: opacity 0.3s;

      &:hover {
        opacity: 0.8;
      }

      .logo-text {
        font-size: 20px;
        font-weight: 700;
        color: #303133;
      }
    }

    .nav-links {
      display: none;

      @media (min-width: 768px) {
        display: flex;
        gap: 8px;
      }

      .nav-link {
        position: relative;
        padding: 0 12px;
        height: 64px;
        line-height: 64px;
        font-size: 14px;
        font-weight: 500;
        color: #4b5563;
        text-decoration: none;
        transition: all 0.3s;
        border-bottom: 2px solid transparent;

        &:hover {
          color: #4f46e5;
        }

        &.active {
          color: #303133;
          border-bottom-color: #4f46e5;
        }
      }
    }
  }

  // Right Section
  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;

    .search-bar {
      display: none;

      @media (min-width: 1024px) {
        display: block;
      }

      .search-input {
        width: 260px;

        :deep(.el-input__wrapper) {
          border-radius: 20px;
          box-shadow: 0 0 0 1px #e5e7eb inset;
          padding: 4px 12px;

          &:hover {
            box-shadow: 0 0 0 1px #d1d5db inset;
          }

          .el-input__inner {
            font-size: 14px;

            &::placeholder {
              color: #9ca3af;
            }
          }
        }

        :deep(.el-input__wrapper.is-focus) {
          box-shadow: 0 0 0 1px #4f46e5 inset;
        }
      }
    }

    .publish-btn {
      background: #4f46e5;
      border-color: #4f46e5;
      color: white;
      font-size: 14px;
      font-weight: 500;
      padding: 0 20px;
      height: 36px;
      border-radius: 8px;

      &:hover {
        background: #4338ca;
        border-color: #4338ca;
      }

      .el-icon {
        margin-right: 4px;
      }
    }

    .user-actions {
      display: flex;
      align-items: center;
      gap: 20px;

      .action-icon {
        cursor: pointer;
        color: #6b7280;
        transition: color 0.3s;
        position: relative;

        &:hover {
          color: #4f46e5;
        }

        :deep(.el-badge__content) {
          background: #ef4444;
          border: none;
          font-size: 10px;
          height: 16px;
          line-height: 16px;
          padding: 0 5px;
          border-radius: 8px;
        }
      }

      .user-dropdown {
        .user-avatar-wrapper {
          cursor: pointer;
          display: flex;
          align-items: center;

          .user-avatar {
            background: #4f46e5;
            color: white;
            font-size: 14px;
            font-weight: 600;
            border: 2px solid #e5e7eb;
            transition: all 0.3s;

            &:hover {
              border-color: #4f46e5;
              transform: scale(1.05);
            }
          }
        }

        :deep(.el-dropdown-menu) {
          margin-top: 8px;
          border-radius: 8px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);

          .el-dropdown-menu__item {
            font-size: 14px;
            padding: 10px 20px;

            .el-icon {
              margin-right: 8px;
            }

            &:hover {
              background: #f9fafb;
              color: #4f46e5;
            }
          }
        }
      }

      .auth-btn {
        font-size: 14px;
        font-weight: 500;
        height: 36px;
        padding: 0 16px;

        &:hover {
          color: #4f46e5;
        }

        &.register-btn {
          background: #4f46e5;
          border-color: #4f46e5;
          color: white;
          border-radius: 8px;

          &:hover {
            background: #4338ca;
            border-color: #4338ca;
          }
        }
      }
    }
  }
}

.app-main {
  flex: 1;
  background: #f9fafb;
}

.app-footer {
  background: white;
  border-top: 1px solid #e5e7eb;
  padding: 40px 20px;
  margin-top: 60px;

  .container {
    max-width: 1280px;
    margin: 0 auto;
    text-align: center;
  }

  p {
    margin: 8px 0;
    font-size: 14px;
    color: #6b7280;

    &:first-child {
      color: #4b5563;
      font-weight: 500;
    }
  }
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .app-header {
    .header-content {
      height: 56px;
    }

    .header-left {
      .logo {
        .logo-text {
          font-size: 18px;
        }

        .el-icon {
          font-size: 28px !important;
        }
      }
    }

    .header-right {
      gap: 12px;

      .publish-btn {
        padding: 0 12px;
        height: 32px;
        font-size: 13px;

        .el-icon {
          display: none;
        }
      }

      .user-actions {
        gap: 16px;

        .action-icon {
          :deep(.el-icon) {
            font-size: 18px;
          }
        }
      }
    }
  }
}

/* Mobile Menu (if needed in future) */
@media screen and (max-width: 640px) {
  .app-header {
    .header-right {
      .publish-btn {
        display: none;
      }
    }
  }
}

/* Notification Badge Style */
.notify-badge {
  cursor: pointer;
}

/* Notification Popover - 全局样式（不在 scoped 内） */
.notify-popover {
  padding: 0 !important;
  border-radius: 12px !important;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;

  .notify-popover-content {
    .notify-popover-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid #e5e7eb;

      .notify-title {
        font-size: 16px;
        font-weight: 600;
        color: #1f2937;
      }

      .mark-all-btn {
        color: #4f46e5;
        font-size: 13px;
        padding: 4px 8px;

        &:hover {
          background: #f5f3ff;
        }
      }
    }

    .notify-popover-list {
      max-height: 320px;
      overflow-y: auto;

      .notify-item {
        padding: 14px 20px;
        cursor: pointer;
        transition: background 0.2s;
        border-bottom: 1px solid #f3f4f6;

        &:last-child {
          border-bottom: none;
        }

        &:hover {
          background: #f9fafb;
        }

        &.is-unread {
          background: linear-gradient(to right, #f5f3ff, #fff 16px);

          .notify-item-title {
            font-weight: 600;
          }
        }

        .notify-item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }

        .notify-type-tag {
          font-size: 11px;
          font-weight: 500;
          padding: 2px 8px;
          border-radius: 4px;
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

        .notify-time {
          font-size: 12px;
          color: #9ca3af;
        }

        .notify-item-title {
          font-size: 14px;
          color: #374151;
          line-height: 1.5;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }

      .notify-empty {
        padding: 40px 20px;
        text-align: center;
        color: #9ca3af;
        font-size: 14px;
      }
    }

    .notify-popover-footer {
      padding: 12px 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;

      .view-all-btn {
        color: #4f46e5;
        font-size: 14px;
        width: 100%;
        justify-content: center;

        .el-icon {
          margin-left: 4px;
        }

        &:hover {
          background: #f5f3ff;
        }
      }
    }
  }
}
</style>
