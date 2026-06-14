/**
 * Permission status response from GET /permission/status
 */
export interface PermissionStatus {
  /** User ID */
  userId: number
  /** Student ID */
  studentId?: string
  /** Whether user has publish permission */
  hasPermission: boolean
  /** Publish permission (0=no, 1=yes) */
  publishPermission: number
  /** Permission review status (0=pending, 1=approved, 2=rejected) */
  permissionReviewStatus: number
  /** Status enum: pending/approved/rejected/null(not applied) */
  status: string | null
  /** Status text: 审核中/已批准/已拒绝/未申请 */
  statusText: string
  /** Last review result: approved/rejected/null */
  lastReviewResult?: string | null
  /** Last review reason (from notification content) */
  lastReviewReason?: string | null
  /** Last review time */
  reviewedAt?: string | null
}

/**
 * Permission apply request for POST /permission/apply
 */
export interface PermissionApplyRequest {
  /** Application reason (optional) */
  reason?: string
}

/**
 * Permission apply response
 */
export interface PermissionApplyResponse {
  /** Status: pending/approved */
  status: string
  /** Message (if already has permission) */
  message?: string
}

/**
 * Permission review status constants
 */
export const PERMISSION_REVIEW_STATUS = {
  PENDING: 0,
  APPROVED: 1,
  REJECTED: 2
} as const

/**
 * Publish permission constants
 */
export const PUBLISH_PERMISSION = {
  NO: 0,
  YES: 1
} as const
