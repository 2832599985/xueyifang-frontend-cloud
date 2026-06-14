/**
 * Service review API module
 * Handles all review-related API calls
 */

import request from '@/api/request'
import type { PageResult } from '@/types/http'
import type {
  ServiceReviewCreateRequest,
  ServiceReview,
  ServiceReviewQuery
} from '@/types/review'

/**
 * Create a service review
 * Only buyer can review, only completed orders can be reviewed
 * Each order can only be reviewed once
 * @param data Review create request
 * @returns Review ID
 */
export function createReview(data: ServiceReviewCreateRequest): Promise<number> {
  return request<number>({
    url: '/review/create',
    method: 'post',
    data
  })
}

/**
 * Get service reviews with pagination (public API)
 * @param serviceId Service ID
 * @param params Query parameters
 * @returns Paginated reviews
 */
export function listServiceReviews(
  serviceId: number,
  params?: ServiceReviewQuery
): Promise<PageResult<ServiceReview>> {
  return request<PageResult<ServiceReview>>({
    url: `/review/service/${serviceId}`,
    method: 'get',
    params: {
      pageNum: params?.pageNum || 1,
      pageSize: params?.pageSize || 10
    }
  })
}

/**
 * Check if an order has been reviewed
 * @param orderId Order ID
 * @returns true if reviewed, false otherwise
 */
export function getOrderReviewStatus(orderId: number): Promise<boolean> {
  return request<boolean>({
    url: `/review/order/${orderId}/status`,
    method: 'get'
  })
}
