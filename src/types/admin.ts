/**
 * 管理员模块类型定义
 */

/**
 * 系统统计数据
 */
export interface AdminStatistics {
  /** 总用户数 */
  totalUsers: number
  /** 活跃用户数（近30天有订单） */
  activeUsers: number
  /** 总服务数 */
  totalServices: number
  /** 总订单数 */
  totalOrders: number
  /** 已完成订单数 */
  completedOrders: number
  /** 待处理纠纷数 */
  pendingDisputes: number
  /** 总成交金额 */
  totalTransactionAmount: number
  /** 今日新增用户 */
  todayNewUsers: number
  /** 今日新增服务 */
  todayNewServices: number
  /** 今日新增订单 */
  todayNewOrders: number
}

/**
 * 待审核用户
 */
export interface PendingUser {
  userId: number
  studentId: string
  realName: string | null
  phone: string | null
  email: string | null
  grade: string | null
  professionalName: string
  permissionReviewStatus: number
  createTime: string
}

/**
 * 权限审核请求
 */
export interface PermissionReviewRequest {
  userId: number
  approved: boolean
  reason?: string
}

/**
 * 趋势统计数据
 */
export interface AdminTrend {
  /** 日期列表（近7天，格式：MM-dd） */
  dates: string[]
  /** 每日新增订单数 */
  orderCounts: number[]
  /** 每日新增服务数 */
  serviceCounts: number[]
  /** 每日交易金额 */
  transactionAmounts: number[]
}

/**
 * 待审核服务
 */
export interface PendingService {
  serviceId: number
  serviceTitle: string
  coverImage: string | null
  description: string | null
  sellerName: string
  tagName: string
  price: number
  reviewStatus: number
  createTime: string
}

/**
 * 服务审核请求
 */
export interface AdminServiceReviewRequest {
  serviceId: number
  approved: boolean
  reason?: string
}
