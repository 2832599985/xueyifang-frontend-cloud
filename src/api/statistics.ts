/**
 * Statistics API module
 * Handles user sales statistics
 */

import request from '@/api/request'
import type { UserSalesStatistics } from '@/types/statistics'

/**
 * Get current user's sales statistics
 * @returns User sales statistics including total sales, revenue, best service, recent orders
 */
export function getUserSalesStatistics(): Promise<UserSalesStatistics> {
  return request<UserSalesStatistics>({
    url: '/statistics/sales',
    method: 'get'
  })
}
