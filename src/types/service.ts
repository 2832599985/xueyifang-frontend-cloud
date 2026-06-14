/**
 * Service-related type definitions
 * Aligned with backend VOs and DTOs
 */

import type { TradeLocation as DictTradeLocation } from '@/types/dict'

// Re-export public dictionary types for backwards compatibility
export type { ServiceTag, Professional, TradeLocation } from '@/types/dict'

// ==================== Service Core Types ====================

/**
 * Service list item (for grid/list views)
 * Maps to backend ServiceListItemVO
 */
export interface ServiceListItem {
  id: number
  serviceTitle: string
  price: number
  tagId: number
  tagName?: string // May be joined from service_tag table
  tradeType: number // 1=offline, 2=online escrow
  coverImage: string // First image from service_image table
  viewCount: number
  collectionCount?: number
  salesCount?: number // From order count
  averageRating?: number // If ratings are implemented
  sellerName?: string // May be joined from user table
  sellerAvatar?: string
  sellerId?: number
  createTime: string
}

/**
 * Complete service details
 * Maps to backend ServiceDetailVO
 */
export interface ServiceDetail {
  id: number
  serviceTitle: string
  serviceDescription: string
  sellerId: number
  sellerName?: string // Joined from user table
  sellerAvatar?: string
  sellerRating?: number
  sellerProfessional?: string
  tagId: number
  tagName?: string
  tradeType: number // 1=offline, 2=online escrow
  tradeTypeText?: string // "线下交易" or "线上担保"
  price: number
  maxPurchases: number // -1 means unlimited
  currentPurchaseCount: number
  isPhysical: number // 1=physical goods, 0=virtual/service
  status: number // 1=online, 2=offline, 3=pending review, 4=rejected
  reviewStatus: number // 1=approved, 2=pending, 3=rejected
  reviewReason?: string // If rejected
  viewCount: number
  coverImage?: string
  collectionCount: number
  salesCount?: number
  averageRating?: number
  reviewCount?: number
  createTime: string
  updateTime?: string
  images: string[] // Array of image URLs from service_image table
  isCollected?: boolean // null if not logged in, true/false if logged in
  // Additional fields for display
  deliveryTime?: string // Expected delivery time
  requirements?: string // Service requirements or notes
  tradeLocation?: DictTradeLocation // If offline trade
}

/**
 * Service query/filter parameters
 * For searching and filtering service list
 */
export interface ServiceQueryParams {
  keyword?: string // Search in title/description
  tagId?: number // Filter by service tag/category
  tradeType?: number // 1=offline, 2=online, all if not specified
  minPrice?: number
  maxPrice?: number
  sortBy?: 'latest' | 'price_asc' | 'price_desc' | 'views' | 'sales' | 'rating'
  sellerId?: number // For "seller's other services"
  status?: number // For admin or seller's own services
  pageNum?: number // Default: 1
  pageSize?: number // Default: 10
}

// ==================== Service Form Types ====================

/**
 * Service form data for create/edit
 * Maps to backend ServicePublishRequest/ServiceUpdateRequest
 */
export interface ServiceFormData {
  serviceTitle: string
  serviceDescription: string
  tagId: number
  price: number
  tradeType: number
  tradeLocationId?: number // Optional, only for offline trade
  maxPurchases: number // -1 means unlimited
  isPhysical: number // 1=physical, 0=virtual
  images: string[] // Array of image URLs
}

/**
 * Service publish request
 * Maps to backend ServicePublishRequest
 */
export interface ServicePublishRequest {
  serviceTitle: string
  serviceDescription: string
  tagId: number
  price: number
  tradeType: number
  tradeLocationId?: number // Optional, only for offline trade
  maxPurchases: number
  isPhysical: number
  images: string[]
}

/**
 * Service update request
 * Maps to backend ServiceUpdateRequest
 */
export interface ServiceUpdateRequest {
  serviceTitle: string
  serviceDescription: string
  tagId: number
  price: number
  tradeType: number
  tradeLocationId?: number // Optional, only for offline trade
  maxPurchases: number
  isPhysical: number // 1=physical goods, 0=virtual/service
  images: string[]
}

/**
 * My service item for seller's service list
 * Extended from ServiceListItem with additional status fields
 */
export interface MyServiceItem extends ServiceListItem {
  status: number // Service status
  reviewStatus: number // Review status
  reviewReason?: string // Rejection reason if any
  updateTime?: string // Last update time
  maxPurchases?: number // Max purchase limit (-1 = unlimited)
  currentPurchaseCount?: number // Current purchase count
  canEdit?: boolean // Whether the service can be edited (computed)
  canOnline?: boolean // Whether the service can go online (computed)
  canOffline?: boolean // Whether the service can go offline (computed)
}

// ==================== Favorite/Collection Types ====================

/**
 * User's favorite service item
 * Maps to backend FavoriteListItemVO
 */
export interface FavoriteListItem {
  favoriteId: number
  service: ServiceListItem // The favorited service
  sellerName: string
  createTime: string // When it was favorited
}

/**
 * Favorite operation request
 */
export interface FavoriteRequest {
  serviceId: number
}

// ==================== Enum Definitions ====================

/**
 * Service status enum
 */
export enum ServiceStatus {
  ONLINE = 1,
  OFFLINE = 2,
  PENDING_REVIEW = 3,
  REJECTED = 4
}

/**
 * Review status enum
 */
export enum ReviewStatus {
  APPROVED = 1,
  PENDING = 2,
  REJECTED = 3
}

/**
 * Trade type enum
 */
export enum TradeType {
  OFFLINE = 1, // Face-to-face transaction
  ONLINE_ESCROW = 2 // Online with escrow
}

/**
 * Physical type enum
 */
export enum PhysicalType {
  VIRTUAL = 0, // Service or digital goods
  PHYSICAL = 1 // Physical goods
}

// ==================== Helper Functions ====================

/**
 * Get display text for trade type
 */
export function getTradeTypeText(tradeType: number): string {
  switch (tradeType) {
    case TradeType.OFFLINE:
      return '线下交易'
    case TradeType.ONLINE_ESCROW:
      return '线上担保'
    default:
      return '未知'
  }
}

/**
 * Get display text for service status
 */
export function getServiceStatusText(status: number): string {
  switch (status) {
    case ServiceStatus.ONLINE:
      return '已上架'
    case ServiceStatus.OFFLINE:
      return '已下架'
    case ServiceStatus.PENDING_REVIEW:
      return '审核中'
    case ServiceStatus.REJECTED:
      return '已驳回'
    default:
      return '未知'
  }
}

/**
 * Get status color for Element Plus tag
 */
export function getServiceStatusType(status: number): string {
  switch (status) {
    case ServiceStatus.ONLINE:
      return 'success'
    case ServiceStatus.OFFLINE:
      return 'info'
    case ServiceStatus.PENDING_REVIEW:
      return 'warning'
    case ServiceStatus.REJECTED:
      return 'danger'
    default:
      return 'info'
  }
}

/**
 * Format price display
 */
export function formatPrice(price: number): string {
  return `¥${price.toFixed(2)}`
}

/**
 * Get display text for review status
 */
export function getReviewStatusText(reviewStatus: number): string {
  switch (reviewStatus) {
    case ReviewStatus.APPROVED:
      return '已通过'
    case ReviewStatus.PENDING:
      return '审核中'
    case ReviewStatus.REJECTED:
      return '已拒绝'
    default:
      return '未知'
  }
}

/**
 * Get status color type for Element Plus tag (review status)
 */
export function getReviewStatusType(reviewStatus: number): string {
  switch (reviewStatus) {
    case ReviewStatus.APPROVED:
      return 'success'
    case ReviewStatus.PENDING:
      return 'warning'
    case ReviewStatus.REJECTED:
      return 'danger'
    default:
      return 'info'
  }
}

/**
 * Check if service can be edited
 * Service can only be edited when it's offline or rejected
 */
export function canEditService(status: number): boolean {
  return status === ServiceStatus.OFFLINE || status === ServiceStatus.REJECTED
}

/**
 * Check if service can go online
 * Service can go online when it's offline or rejected
 */
export function canOnlineService(status: number, reviewStatus: number): boolean {
  return status === ServiceStatus.OFFLINE || status === ServiceStatus.REJECTED
}

/**
 * Check if service can go offline
 * Service can go offline when it's online
 */
export function canOfflineService(status: number): boolean {
  return status === ServiceStatus.ONLINE
}

/**
 * Format sales count display
 */
export function formatSalesCount(count?: number): string {
  if (!count) return '暂无销量'
  if (count < 1000) return `${count}人购买`
  if (count < 10000) return `${(count / 1000).toFixed(1)}k人购买`
  return `${(count / 10000).toFixed(1)}w人购买`
}
