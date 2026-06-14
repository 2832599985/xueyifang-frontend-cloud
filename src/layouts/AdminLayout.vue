<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <aside class="admin-sidebar">
      <div class="sidebar-logo">
        <span class="logo-text">学艺坊 Admin</span>
      </div>

      <nav class="sidebar-menu">
        <template v-for="item in menuItems" :key="item.title">
          <router-link
            v-if="!isMenuGroup(item)"
            :to="item.path"
            class="menu-item"
            :class="{ active: isActive(item.path) }"
          >
            <i :class="item.icon"></i>
            <span>{{ item.title }}</span>
            <span v-if="item.badge" class="menu-badge" :class="item.badgeType">
              {{ item.badge }}
            </span>
          </router-link>

          <div v-else class="menu-group" :class="{ active: isGroupActive(item.children) }">
            <div class="menu-group__title">
              <i :class="item.icon"></i>
              <span>{{ item.title }}</span>
            </div>
            <router-link
              v-for="child in item.children"
              :key="child.path"
              :to="child.path"
              class="menu-item menu-item--child"
              :class="{ active: isActive(child.path) }"
            >
              <i :class="child.icon"></i>
              <span>{{ child.title }}</span>
            </router-link>
          </div>
        </template>
      </nav>

      <div class="sidebar-footer">
        <a class="logout-link" @click="handleLogout">
          <i class="fas fa-sign-out-alt"></i>
          <span>退出登录</span>
        </a>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="admin-main">
      <!-- Header -->
      <header class="admin-header">
        <h2 class="page-title">{{ currentTitle }}</h2>
        <div class="admin-info">
          <span class="admin-name">
            管理员: <strong>{{ adminName }}</strong>
          </span>
          <img
            class="admin-avatar"
            :src="adminAvatar"
            alt="avatar"
          />
        </div>
      </header>

      <!-- Scrollable Content -->
      <main class="admin-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { buildImageUrl } from '@/api/service'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

type MenuItem = {
  path: string
  title: string
  icon: string
  badge?: string
  badgeType?: string
}

type MenuGroup = {
  title: string
  icon: string
  children: MenuItem[]
}

// Menu configuration
const menuItems: Array<MenuItem | MenuGroup> = [
  {
    path: '/admin/dashboard',
    title: '仪表板',
    icon: 'fas fa-tachometer-alt'
  },
  {
    path: '/admin/permissions',
    title: '权限审核',
    icon: 'fas fa-check-circle'
  },
  {
    path: '/admin/services',
    title: '服务审核',
    icon: 'fas fa-tasks'
  },
  {
    path: '/admin/disputes',
    title: '纠纷处理',
    icon: 'fas fa-gavel'
  },
  {
    title: '资源管理',
    icon: 'fas fa-database',
    children: [
      {
        path: '/admin/resource/professionals',
        title: '专业管理',
        icon: 'fas fa-user-graduate'
      },
      {
        path: '/admin/resource/trade-locations',
        title: '地点管理',
        icon: 'fas fa-map-marker-alt'
      }
    ]
  },
  {
    path: '/admin/settings',
    title: '系统配置',
    icon: 'fas fa-cogs'
  }
]

// Current page title from route meta
const currentTitle = computed(() => {
  return (route.meta.title as string) || '管理后台'
})

// Admin name
const adminName = computed(() => {
  return userStore.userInfo?.realName || userStore.userInfo?.nickname || 'admin'
})

// Admin avatar
const adminAvatar = computed(() => {
  const avatar = userStore.userInfo?.avatar
  return avatar ? buildImageUrl(avatar) : 'https://picsum.photos/seed/admin/100/100'
})

// Check if menu item is active
const isActive = (path: string): boolean => {
  // For disputes, also highlight when viewing detail
  if (path === '/admin/disputes') {
    return route.path.startsWith('/admin/disputes')
  }
  return route.path === path
}

const isMenuGroup = (item: MenuItem | MenuGroup): item is MenuGroup => {
  return (item as MenuGroup).children !== undefined
}

const isGroupActive = (children: MenuItem[]): boolean => {
  return children.some(child => isActive(child.path))
}

// Logout handler
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 使用统一的 logout 方法（调用后端API并清理所有状态）
    await userStore.logout()

    ElMessage.success('已退出登录')
    router.push('/admin/login')
  } catch {
    // User cancelled
  }
}
</script>

<style scoped lang="scss">
.admin-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: #f9fafb;
}

// Sidebar - 固定在左侧
.admin-sidebar {
  width: 256px;
  background: #111827;
  color: white;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
}

.sidebar-logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #374151;
  flex-shrink: 0;

  .logo-text {
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 2px;
  }
}

.sidebar-menu {
  flex: 1;
  padding: 16px;
  overflow-y: auto;

  .menu-item {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    margin-bottom: 8px;
    border-radius: 8px;
    color: #9ca3af;
    text-decoration: none;
    transition: all 0.2s;
    cursor: pointer;

    i {
      width: 24px;
      text-align: center;
      margin-right: 12px;
      font-size: 16px;
    }

    span {
      font-size: 15px;
    }

    .menu-badge {
      margin-left: auto;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;

      &.badge-red {
        background: #ef4444;
        color: white;
      }

      &.badge-yellow {
        background: #eab308;
        color: white;
      }
    }

    &:hover {
      background: #374151;
      color: white;
    }

    &.active {
      background: #4f46e5;
      color: white;
    }
  }

  .menu-group {
    margin-bottom: 8px;

    &__title {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      border-radius: 8px;
      color: #9ca3af;
      font-size: 14px;

      i {
        width: 24px;
        text-align: center;
        margin-right: 12px;
        font-size: 16px;
      }
    }

    &.active {
      .menu-group__title {
        color: #e5e7eb;
      }
    }
  }

  .menu-item--child {
    padding-left: 44px;
    font-size: 14px;
  }
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #374151;
  flex-shrink: 0;

  .logout-link {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    color: #9ca3af;
    cursor: pointer;
    transition: color 0.2s;

    i {
      margin-right: 12px;
    }

    &:hover {
      color: white;
    }
  }
}

// Main area - 留出侧边栏宽度
.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  margin-left: 256px; // 为固定侧边栏留出空间
  overflow: hidden;
}

// Header - 固定在顶部
.admin-header {
  height: 64px;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  flex-shrink: 0;
  z-index: 10;

  .page-title {
    font-size: 20px;
    font-weight: 700;
    color: #1f2937;
    margin: 0;
  }

  .admin-info {
    display: flex;
    align-items: center;
    gap: 16px;

    .admin-name {
      font-size: 14px;
      color: #6b7280;

      strong {
        color: #1f2937;
      }
    }

    .admin-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #e5e7eb;
      object-fit: cover;
    }
  }
}

// Content area - 只有这里滚动
.admin-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}
</style>
