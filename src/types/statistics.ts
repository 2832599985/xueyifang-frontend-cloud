/**
 * Statistics types
 * Based on backend UserSalesStatisticsVO, SalesServiceVO, RecentOrderVO
 */

/**
 * Best selling service info
 */
export interface SalesServiceVO {
  serviceId: number
  serviceTitle: string
  sales: number      // 销量（完成订单数）
  revenue: number    // 销售额
}

/**
 * Recent order info
 */
export interface RecentOrderVO {
  orderId: number
  orderNumber: string
  totalAmount: number
  createTime: string
}

/**
 * User sales statistics
 */
export interface UserSalesStatistics {
  totalSales: number           // 总销量（完成订单数）
  totalRevenue: number         // 总收入
  averagePrice: number         // 平均价格
  bestService?: SalesServiceVO | null  // 最畅销服务
  recentOrders: RecentOrderVO[]        // 最近5条订单
}
