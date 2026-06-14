/**
 * Dispute types and constants
 * Based on backend DisputeConstant.java and VOs
 */

/**
 * Dispute type constants
 */
export const DISPUTE_TYPE = {
  SELLER_NOT_FULFILL: 1, // 卖家未履约
  MISMATCH: 2,           // 货不对板
  QUALITY: 3,            // 质量问题
  OTHER: 4               // 其他
} as const

/**
 * Dispute status constants
 */
export const DISPUTE_STATUS = {
  PENDING: 1,            // 待审核
  PROCESSING: 2,         // 处理中
  RESOLVED: 3,           // 已解决
  REJECTED: 4            // 已拒绝
} as const

/**
 * Admin handle action types
 */
export const HANDLE_ACTION = {
  RESOLVE: 1,            // 解决(支持用户)
  REJECT: 2              // 拒绝(驳回)
} as const

/**
 * Get dispute type text
 */
export function getDisputeTypeText(type: number): string {
  const typeMap: Record<number, string> = {
    [DISPUTE_TYPE.SELLER_NOT_FULFILL]: '卖家未履约',
    [DISPUTE_TYPE.MISMATCH]: '货不对板',
    [DISPUTE_TYPE.QUALITY]: '质量问题',
    [DISPUTE_TYPE.OTHER]: '其他'
  }
  return typeMap[type] || '未知类型'
}

/**
 * Get dispute status text
 */
export function getDisputeStatusText(status: number): string {
  const statusMap: Record<number, string> = {
    [DISPUTE_STATUS.PENDING]: '待审核',
    [DISPUTE_STATUS.PROCESSING]: '处理中',
    [DISPUTE_STATUS.RESOLVED]: '已解决',
    [DISPUTE_STATUS.REJECTED]: '已拒绝'
  }
  return statusMap[status] || '未知状态'
}

/**
 * Get dispute status tag type for Element Plus
 */
export function getDisputeStatusTagType(status: number): 'warning' | 'primary' | 'success' | 'danger' | 'info' {
  const tagTypeMap: Record<number, 'warning' | 'primary' | 'success' | 'danger' | 'info'> = {
    [DISPUTE_STATUS.PENDING]: 'warning',
    [DISPUTE_STATUS.PROCESSING]: 'primary',
    [DISPUTE_STATUS.RESOLVED]: 'success',
    [DISPUTE_STATUS.REJECTED]: 'danger'
  }
  return tagTypeMap[status] || 'info'
}

/**
 * Dispute list item (from DisputeListItemVO)
 */
export interface DisputeListItem {
  disputeId: number
  orderId: number
  orderNumber: string
  disputeType: number
  disputeStatus: number
  createTime: string
}

/**
 * Dispute detail (from DisputeDetailVO)
 */
export interface DisputeDetail {
  disputeId: number
  orderId: number
  orderNumber: string
  serviceTitle: string
  totalAmount: number
  buyerId: number
  buyerName: string
  buyerAvatar?: string
  sellerId: number
  sellerName: string
  sellerAvatar?: string
  disputeInitiatorId: number
  disputeType: number
  description: string
  disputeStatus: number
  adminReply?: string | null
  resolution?: string | null
  createTime: string
}

/**
 * Create dispute request (from DisputeCreateRequest)
 */
export interface DisputeCreateRequest {
  orderId: number
  disputeType: number
  description: string
}

/**
 * Admin handle dispute request (from DisputeHandleRequest)
 */
export interface DisputeHandleRequest {
  actionType: number
  adminReply: string
  resolution: string
  needRefund?: boolean
}

/**
 * Admin dispute list query (from DisputeQueryRequest)
 */
export interface AdminDisputeListQuery {
  current?: number
  pageSize?: number
  disputeStatus?: number | null
}

/**
 * Dispute type options for select
 */
export const disputeTypeOptions = [
  { value: DISPUTE_TYPE.SELLER_NOT_FULFILL, label: '卖家未履约' },
  { value: DISPUTE_TYPE.MISMATCH, label: '货不对板' },
  { value: DISPUTE_TYPE.QUALITY, label: '质量问题' },
  { value: DISPUTE_TYPE.OTHER, label: '其他' }
]

/**
 * Dispute status options for admin filter
 */
export const disputeStatusOptions = [
  { value: DISPUTE_STATUS.PENDING, label: '待审核' },
  { value: DISPUTE_STATUS.PROCESSING, label: '处理中' },
  { value: DISPUTE_STATUS.RESOLVED, label: '已解决' },
  { value: DISPUTE_STATUS.REJECTED, label: '已拒绝' }
]
