import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { ElMessage } from 'element-plus'

/**
 * 路由配置
 * 包含公共路由和需要认证的路由
 */
const routes: Array<RouteRecordRaw> = [
  // ==================== 公共路由 ====================
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/home/Home.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { title: '登录', hideLayout: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/Register.vue'),
    meta: { title: '注册', hideLayout: true }
  },
  {
    path: '/services',
    name: 'ServiceList',
    component: () => import('@/views/service/ServiceList.vue'),
    meta: { title: '服务列表' }
  },
  {
    path: '/services/:id',
    name: 'ServiceDetail',
    component: () => import('@/views/service/ServiceDetail.vue'),
    meta: { title: '服务详情' }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/about/About.vue'),
    meta: { title: '关于' }
  },

  // ==================== 需要认证的路由 ====================
  {
    path: '/service/publish',
    name: 'ServicePublish',
    component: () => import('@/views/service/ServicePublish.vue'),
    meta: { title: '发布服务', requiresAuth: true, requiresPublishPermission: true }
  },
  {
    path: '/service/edit/:id',
    name: 'ServiceEdit',
    component: () => import('@/views/service/ServiceEdit.vue'),
    meta: { title: '编辑服务', requiresAuth: true }
  },
  {
    path: '/my-services',
    name: 'MyServices',
    component: () => import('@/views/service/MyServices.vue'),
    meta: { title: '我的服务', requiresAuth: true }
  },

  // ==================== 订单相关路由 ====================
  {
    path: '/order/confirm/:serviceId',
    name: 'OrderConfirm',
    component: () => import('@/views/order/OrderConfirm.vue'),
    meta: { title: '确认订单', requiresAuth: true }
  },
  {
    path: '/orders',
    name: 'BuyerOrderList',
    component: () => import('@/views/order/BuyerOrderList.vue'),
    meta: { title: '我的购买订单', requiresAuth: true }
  },
  {
    path: '/orders/sales',
    name: 'SellerOrderList',
    component: () => import('@/views/order/SellerOrderList.vue'),
    meta: { title: '我的销售订单', requiresAuth: true }
  },
  {
    path: '/orders/:id',
    name: 'OrderDetail',
    component: () => import('@/views/order/OrderDetail.vue'),
    meta: { title: '订单详情', requiresAuth: true }
  },

  // ==================== 收藏相关路由 ====================
  {
    path: '/favorites',
    name: 'MyFavorites',
    component: () => import('@/views/favorite/MyFavorites.vue'),
    meta: { title: '我的收藏', requiresAuth: true }
  },

  // ==================== 通知相关路由 ====================
  {
    path: '/notifications',
    name: 'Notifications',
    component: () => import('@/views/notification/NotificationList.vue'),
    meta: { title: '我的通知', requiresAuth: true }
  },

  // ==================== 聊天相关路由 ====================
  {
    path: '/chat',
    name: 'Chat',
    component: () => import('@/views/chat/ChatPage.vue'),
    meta: { title: '消息中心', requiresAuth: true }
  },
  {
    path: '/chat/:userId',
    name: 'ChatWithUser',
    component: () => import('@/views/chat/ChatPage.vue'),
    meta: { title: '消息中心', requiresAuth: true }
  },

  // ==================== 个人中心相关路由 ====================
  {
    path: '/user/center',
    name: 'UserCenter',
    component: () => import('@/views/user/UserCenter.vue'),
    meta: { title: '个人中心', requiresAuth: true }
  },

  // ==================== 钱包相关路由 ====================
  {
    path: '/wallet',
    name: 'WalletOverview',
    component: () => import('@/views/wallet/WalletOverview.vue'),
    meta: { title: '我的钱包', requiresAuth: true }
  },
  {
    path: '/wallet/transactions',
    name: 'WalletTransactions',
    component: () => import('@/views/wallet/WalletTransactions.vue'),
    meta: { title: '交易明细', requiresAuth: true }
  },

  // ==================== 统计相关路由 ====================
  {
    path: '/statistics/sales',
    name: 'SalesStatistics',
    component: () => import('@/views/statistics/SalesDashboard.vue'),
    meta: { title: '销售统计', requiresAuth: true }
  },

  // ==================== 纠纷相关路由 ====================
  {
    path: '/disputes',
    name: 'MyDisputes',
    component: () => import('@/views/dispute/MyDisputes.vue'),
    meta: { title: '我的纠纷', requiresAuth: true }
  },
  {
    path: '/disputes/:id',
    name: 'DisputeDetail',
    component: () => import('@/views/dispute/DisputeDetail.vue'),
    meta: { title: '纠纷详情', requiresAuth: true }
  },

  // ==================== 管理员路由 ====================
  // Admin Login (独立，不嵌套在 AdminLayout)
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('@/views/admin/login/AdminLogin.vue'),
    meta: { title: '管理员登录', hideLayout: true }
  },
  // Admin Layout 嵌套路由
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAdmin: true },
    redirect: '/admin/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/dashboard/AdminDashboard.vue'),
        meta: { title: '仪表板', requiresAdmin: true }
      },
      {
        path: 'permissions',
        name: 'AdminPermissionReview',
        component: () => import('@/views/admin/permission/AdminPermissionReview.vue'),
        meta: { title: '权限审核', requiresAdmin: true }
      },
      {
        path: 'services',
        name: 'AdminServiceReview',
        component: () => import('@/views/admin/service/AdminServiceReview.vue'),
        meta: { title: '服务审核', requiresAdmin: true }
      },
      {
        path: 'disputes',
        name: 'AdminDisputeList',
        component: () => import('@/views/admin/dispute/AdminDisputeList.vue'),
        meta: { title: '纠纷处理', requiresAdmin: true }
      },
      {
        path: 'disputes/:id',
        name: 'AdminDisputeDetail',
        component: () => import('@/views/admin/dispute/AdminDisputeDetail.vue'),
        meta: { title: '纠纷详情', requiresAdmin: true, hideInMenu: true }
      },
      {
        path: 'orders/:id',
        name: 'AdminOrderDetail',
        component: () => import('@/views/admin/order/AdminOrderDetail.vue'),
        meta: { title: '订单详情', requiresAdmin: true, hideInMenu: true }
      },
      {
        path: 'services/:id',
        name: 'AdminServiceDetail',
        component: () => import('@/views/admin/service/AdminServiceDetail.vue'),
        meta: { title: '服务详情', requiresAdmin: true, hideInMenu: true }
      },
      {
        path: 'resource/professionals',
        name: 'AdminProfessionalList',
        component: () => import('@/views/admin/resource/ProfessionalList.vue'),
        meta: { title: '专业管理', requiresAdmin: true }
      },
      {
        path: 'resource/trade-locations',
        name: 'AdminTradeLocationList',
        component: () => import('@/views/admin/resource/TradeLocationList.vue'),
        meta: { title: '地点管理', requiresAdmin: true }
      },
      {
        path: 'settings',
        name: 'AdminSettings',
        component: () => import('@/views/admin/settings/AdminSysConfig.vue'),
        meta: { title: '系统配置', requiresAdmin: true }
      }
    ]
  },

  // ==================== 404 路由（必须放在最后） ====================
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/NotFound.vue'),
    meta: { title: '页面未找到' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

/**
 * 路由守卫
 * 处理页面标题和认证检查
 */
router.beforeEach(async (to, _from, next) => {
  // 设置页面标题
  const title = to.meta.title as string || '学艺坊'
  document.title = `${title} - 学艺坊`

  // 获取token
  const token = localStorage.getItem('token')

  // 检查是否需要管理员权限
  if (to.meta.requiresAdmin) {
    if (!token) {
      // 未登录，跳转管理员登录页
      next({
        path: '/admin/login',
        query: { redirect: to.fullPath }
      })
      return
    }

    // 动态导入 store（避免循环依赖）
    const { useUserStore } = await import('@/stores/user')
    const userStore = useUserStore()

    // 如果没有用户信息，尝试获取
    if (!userStore.userInfo) {
      try {
        await userStore.fetchCurrentUser()
      } catch (error: any) {
        // 区分错误类型
        const isAuthError = error?.response?.status === 401 ||
          error?.response?.data?.code === 40103 ||
          error?.message?.includes('token')
        if (isAuthError) {
          // token 无效或过期，清除并提示
          localStorage.removeItem('token')
          ElMessage.error('登录已过期，请重新登录')
        } else {
          // 网络或其他错误，也清除 token（保守处理）
          localStorage.removeItem('token')
          ElMessage.error('获取用户信息失败，请重新登录')
        }
        next({
          path: '/admin/login',
          query: { redirect: to.fullPath }
        })
        return
      }
    }

    // 检查是否是管理员（role = 2）
    if (userStore.userInfo?.role !== 2) {
      ElMessage.error('当前账号不是管理员')
      // 清除登录状态
      const { useAppStore } = await import('@/stores/app')
      const appStore = useAppStore()
      appStore.clearToken()
      userStore.clearUserInfo()
      next('/admin/login')
      return
    }
  }

  // 检查是否需要普通认证
  if (to.meta.requiresAuth && !to.meta.requiresAdmin) {
    if (!token) {
      // 需要认证但没有token，重定向到登录页
      next({
        path: '/login',
        query: { redirect: to.fullPath } // 保存原始路径，登录后可以跳转回来
      })
      return
    }

    // 检查是否需要发布权限
    if (to.meta.requiresPublishPermission) {
      const { useUserStore } = await import('@/stores/user')
      const userStore = useUserStore()

      // 如果没有用户信息，尝试获取
      if (!userStore.userInfo) {
        try {
          await userStore.fetchCurrentUser()
        } catch (error: any) {
          localStorage.removeItem('token')
          ElMessage.error('获取用户信息失败，请重新登录')
          next({
            path: '/login',
            query: { redirect: to.fullPath }
          })
          return
        }
      }

      // 检查发布权限 (publishPermission = 1 表示有权限)
      if (userStore.userInfo?.publishPermission !== 1) {
        ElMessage.warning('您没有发布服务的权限，请先申请')
        next('/services')
        return
      }
    }
  }

  // 已登录管理员访问首页，重定向到管理后台
  if (token && to.path === '/') {
    const { useUserStore } = await import('@/stores/user')
    const userStore = useUserStore()

    // 如果没有用户信息，尝试获取
    if (!userStore.userInfo) {
      try {
        await userStore.fetchCurrentUser()
      } catch (error: any) {
        // 区分错误类型：token 无效则清除，网络错误则保留
        const isAuthError = error?.response?.status === 401 ||
          error?.response?.data?.code === 40103 ||
          error?.message?.includes('token')
        if (isAuthError) {
          // token 无效，清除后以游客身份访问首页
          localStorage.removeItem('token')
        }
        // 无论何种错误，都允许访问首页
        next()
        return
      }
    }

    // 管理员重定向到管理后台
    if (userStore.userInfo?.role === 2) {
      next('/admin/dashboard')
      return
    }
  }

  // 已登录用户访问登录或注册页，重定向到首页
  if (token && (to.path === '/login' || to.path === '/register')) {
    next('/')
    return
  }

  // 未登录用户访问注册页时，检查注册开关
  if (!token && to.path === '/register') {
    try {
      const { getRegisterStatus } = await import('@/api/sysConfig')
      const res = await getRegisterStatus()
      if (!res.registerEnabled) {
        ElMessage.warning('注册功能已关闭，请联系管理员')
        next('/login')
        return
      }
    } catch (error) {
      console.error('Failed to check register status in router:', error)
      // 失败时默认允许（fail open）
    }
  }

  next()
})

export default router
