/**
 * System configuration types
 * For admin settings management
 */

/**
 * System configuration entity
 * Maps to backend SysConfig
 */
export interface SysConfig {
  id: number
  configKey: string
  configValue: string
  description: string
  isEnabled: number // 1=启用, 0=禁用
  createTime: string
  updateTime: string
}

/**
 * Query request for paginated config list
 */
export interface SysConfigQueryRequest {
  pageNum?: number // 默认 1
  pageSize?: number // 默认 10
  keyLike?: string // configKey 模糊搜索
}

/**
 * Update request for config
 * Only configValue, description, isEnabled can be modified
 * configKey cannot be changed
 */
export interface SysConfigUpdateRequest {
  id: number // 必填
  configValue?: string
  description?: string
  isEnabled?: number // 1=启用, 0=禁用
}

// ==================== Constants ====================

/**
 * Important config keys for summary display
 */
export const IMPORTANT_CONFIG_KEYS = [
  'REVIEW_MODE',
  'ORDER_UNPAID_TIMEOUT_HOURS',
  'SELLER_REFUND_TIMEOUT_DAYS',
  'AUTO_CONFIRM_RECEIPT_DAYS',
  'REGISTER_ENABLED'
] as const

/**
 * Config key display labels (Chinese)
 */
export const CONFIG_KEY_LABELS: Record<string, string> = {
  REVIEW_MODE: '审核模式',
  ORDER_UNPAID_TIMEOUT_HOURS: '订单未支付超时时间 (小时)',
  SELLER_REFUND_TIMEOUT_DAYS: '卖家处理退款超时 (天)',
  AUTO_CONFIRM_RECEIPT_DAYS: '自动确认收货时间 (天)',
  DEFAULT_WALLET_BALANCE: '默认钱包余额'
}

// ==================== Helper Functions ====================

/**
 * Format REVIEW_MODE value to readable text
 */
export function formatReviewMode(value: string | undefined): string {
  if (!value) return '-'
  switch (value) {
    case '1':
      return '1（全部审核）'
    case '2':
      return '2（免审核）'
    default:
      return value
  }
}

/**
 * Get enable status text
 */
export function getEnabledText(isEnabled: number): string {
  return isEnabled === 1 ? '启用' : '禁用'
}

/**
 * Get enable status tag type
 */
export function getEnabledTagType(isEnabled: number): 'success' | 'info' {
  return isEnabled === 1 ? 'success' : 'info'
}
