/**
 * Dispute API module
 * Handles user disputes and admin dispute management
 */

import request from '@/api/request'
import type { PageResult } from '@/types/http'
import type {
  DisputeListItem,
  DisputeDetail,
  DisputeCreateRequest,
  DisputeHandleRequest,
  AdminDisputeListQuery
} from '@/types/dispute'

// ===================== User Dispute APIs =====================

/**
 * Create a new dispute
 * @param data Dispute creation data
 * @returns Dispute ID
 */
export function createDispute(data: DisputeCreateRequest): Promise<number> {
  return request<number>({
    url: '/dispute/create',
    method: 'post',
    data
  })
}

/**
 * Get current user's dispute list
 * @param current Page number (default 1)
 * @param pageSize Items per page (default 10)
 * @returns Paginated dispute list
 */
export function getMyDisputes(current = 1, pageSize = 10): Promise<PageResult<DisputeListItem>> {
  return request<PageResult<DisputeListItem>>({
    url: '/dispute/my',
    method: 'get',
    params: { current, pageSize }
  })
}

/**
 * Get dispute detail by ID
 * @param disputeId Dispute ID
 * @returns Dispute detail
 */
export function getDisputeDetail(disputeId: number): Promise<DisputeDetail> {
  return request<DisputeDetail>({
    url: `/dispute/${disputeId}`,
    method: 'get'
  })
}

// ===================== Admin Dispute APIs =====================

/**
 * Get all disputes list (admin only)
 * @param query Query parameters with optional status filter
 * @returns Paginated dispute list
 */
export function getAdminDisputeList(query: AdminDisputeListQuery): Promise<PageResult<DisputeListItem>> {
  return request<PageResult<DisputeListItem>>({
    url: '/admin/dispute/list',
    method: 'get',
    params: query
  })
}

/**
 * Get dispute detail for admin
 * @param disputeId Dispute ID
 * @returns Dispute detail
 */
export function getAdminDisputeDetail(disputeId: number): Promise<DisputeDetail> {
  return request<DisputeDetail>({
    url: `/admin/dispute/${disputeId}`,
    method: 'get'
  })
}

/**
 * Get dispute detail by order ID (admin only)
 * @param orderId Order ID
 * @returns Dispute detail or null if no dispute exists
 */
export function getDisputeByOrderId(orderId: number): Promise<DisputeDetail | null> {
  return request<DisputeDetail | null>({
    url: `/admin/dispute/by-order/${orderId}`,
    method: 'get'
  })
}

/**
 * Handle dispute (admin only)
 * @param disputeId Dispute ID
 * @param data Handle request data
 * @returns Success status
 */
export function handleDispute(disputeId: number, data: DisputeHandleRequest): Promise<boolean> {
  return request<boolean>({
    url: `/admin/dispute/${disputeId}/handle`,
    method: 'post',
    data
  })
}
