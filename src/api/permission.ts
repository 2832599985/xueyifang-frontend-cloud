/**
 * Permission API module
 * Handles permission application and status queries
 */

import request from '@/api/request'
import type {
  PermissionStatus,
  PermissionApplyRequest,
  PermissionApplyResponse
} from '@/types/permission'

/**
 * Get current user's permission status
 * @returns Permission status information
 */
export function getPermissionStatus(): Promise<PermissionStatus> {
  return request<PermissionStatus>({
    url: '/permission/status',
    method: 'get'
  })
}

/**
 * Apply for publish permission
 * @param data Application request with optional reason
 * @returns Application result
 */
export function applyPermission(data?: PermissionApplyRequest): Promise<PermissionApplyResponse> {
  return request<PermissionApplyResponse>({
    url: '/permission/apply',
    method: 'post',
    data: data || {}
  })
}
