/**
 * 管理员 API 模块
 */

import request from '@/api/request'
import type { PageResult } from '@/types/http'
import type { AdminStatistics, AdminTrend, PendingUser, PermissionReviewRequest } from '@/types/admin'

/**
 * 获取系统统计数据
 */
export function getAdminStatistics(): Promise<AdminStatistics> {
  return request<AdminStatistics>({
    url: '/admin/statistics',
    method: 'get'
  })
}

/**
 * 获取待审核用户列表
 */
export function getPendingUsers(pageNum = 1, pageSize = 10): Promise<PageResult<PendingUser>> {
  return request<PageResult<PendingUser>>({
    url: '/admin/users/pending',
    method: 'get',
    params: { pageNum, pageSize }
  })
}

/**
 * 审核用户权限申请
 */
export function reviewPermission(data: PermissionReviewRequest): Promise<void> {
  return request<void>({
    url: '/admin/permission/review',
    method: 'put',
    data
  })
}

/**
 * 获取近7天趋势统计数据
 */
export function getAdminTrend(): Promise<AdminTrend> {
  return request<AdminTrend>({
    url: '/admin/statistics/trend',
    method: 'get'
  })
}
