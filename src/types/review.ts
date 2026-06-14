/**
 * Service review types
 * For service rating and review functionality
 */

// ==================== Request Types ====================

/**
 * Create review request
 * Maps to backend ServiceReviewCreateRequest
 */
export interface ServiceReviewCreateRequest {
  orderId: number
  rating: number // 1-5
  content: string // 10-500 characters
  anonymous?: boolean // default false
}

/**
 * Query parameters for service reviews
 */
export interface ServiceReviewQuery {
  pageNum?: number // default 1
  pageSize?: number // default 10
}

// ==================== Response Types ====================

/**
 * Service review VO
 * Maps to backend ServiceReviewVO
 */
export interface ServiceReview {
  id: number
  orderId: number
  rating: number
  content: string
  createTime: string
  reviewerId: number | null // null when anonymous
  reviewerName: string // "匿名用户" when anonymous
  reviewerAvatar: string | null // null when anonymous
  anonymous: boolean
}

// ==================== Constants ====================

/**
 * Rating labels for display
 */
export const RATING_LABELS: Record<number, string> = {
  1: '非常差',
  2: '较差',
  3: '一般',
  4: '较好',
  5: '非常好'
}

/**
 * Default avatar for anonymous users
 */
export const DEFAULT_AVATAR = '/default-avatar.png'

// ==================== Helper Functions ====================

/**
 * Get rating label text
 */
export function getRatingLabel(rating: number): string {
  return RATING_LABELS[rating] || '未评分'
}

/**
 * Format review time
 */
export function formatReviewTime(dateStr: string): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Get display name for reviewer
 */
export function getReviewerDisplayName(review: ServiceReview): string {
  return review.anonymous ? '匿名用户' : review.reviewerName
}

/**
 * Get avatar URL for reviewer
 */
export function getReviewerAvatar(review: ServiceReview, buildImageUrl: (url?: string) => string): string {
  if (review.anonymous || !review.reviewerAvatar) {
    return DEFAULT_AVATAR
  }
  return buildImageUrl(review.reviewerAvatar)
}
