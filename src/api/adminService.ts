/**
 * 管理员服务审核 API 模块
 */

import request from '@/api/request'
import type { PageResult } from '@/types/http'
import type { PendingService, AdminServiceReviewRequest } from '@/types/admin'

/**
 * 获取待审核服务列表
 */
export function getPendingServices(pageNum = 1, pageSize = 10): Promise<PageResult<PendingService>> {
  return request<PageResult<PendingService>>({
    url: '/admin/services/pending',
    method: 'get',
    params: { pageNum, pageSize }
  })
}

/**
 * 审核服务
 */
export function reviewService(data: AdminServiceReviewRequest): Promise<void> {
  return request<void>({
    url: '/admin/services/service/review',
    method: 'put',
    data
  })
}
