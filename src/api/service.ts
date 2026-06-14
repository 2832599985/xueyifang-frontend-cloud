/**
 * Service API module
 * Handles all service-related API calls
 */

import request from './request'
import type { PageResult } from '@/types/http'
import type {
  ServiceListItem,
  ServiceDetail,
  ServiceQueryParams,
  ServiceTag,
  TradeLocation,
  Professional,
  ServicePublishRequest,
  ServiceUpdateRequest,
  MyServiceItem
} from '@/types/service'

// ==================== Service APIs ====================

/**
 * Get paginated service list with filtering
 * @param params Query parameters for filtering and pagination
 * @returns Paginated list of services
 */
export function getServiceList(params?: ServiceQueryParams): Promise<PageResult<ServiceListItem>> {
  return request<PageResult<ServiceListItem>>({
    url: '/service/list',
    method: 'get',
    params: {
      pageNum: params?.pageNum || 1,
      pageSize: params?.pageSize || 10,
      ...params
    }
  })
}

/**
 * Get service details by ID
 * @param id Service ID
 * @returns Complete service details including isCollected status
 */
export function getServiceDetail(id: number | string): Promise<ServiceDetail> {
  return request<ServiceDetail>({
    url: `/service/${id}`,
    method: 'get'
  })
}

/**
 * Search services by keyword
 * Quick search function that wraps getServiceList
 * @param keyword Search keyword
 * @param pageNum Page number
 * @param pageSize Page size
 */
export function searchServices(
  keyword: string,
  pageNum = 1,
  pageSize = 10
): Promise<PageResult<ServiceListItem>> {
  return getServiceList({
    keyword,
    pageNum,
    pageSize
  })
}

/**
 * Get services by seller ID
 * For viewing a seller's other services
 * @param sellerId Seller's user ID
 * @param params Additional query parameters
 */
export function getSellerServices(
  sellerId: number,
  params?: Omit<ServiceQueryParams, 'sellerId'>
): Promise<PageResult<ServiceListItem>> {
  return getServiceList({
    sellerId,
    ...params
  })
}

/**
 * Get user's published services
 * For "My Services" page
 * @param status Filter by service status
 * @param params Additional query parameters
 */
export function getMyServices(
  status?: number,
  params?: ServiceQueryParams
): Promise<PageResult<ServiceListItem>> {
  return request<PageResult<ServiceListItem>>({
    url: '/service/myServices',
    method: 'get',
    params: {
      status,
      pageNum: params?.pageNum || 1,
      pageSize: params?.pageSize || 10,
      ...params
    }
  })
}

// ==================== Service Tags APIs ====================

// Re-export from dict.ts for backwards compatibility
export { listServiceTags as getServiceTags } from '@/api/dict'
export { listTradeLocations as getTradeLocations } from '@/api/dict'
export { listProfessionals as getProfessionals } from '@/api/dict'

/**
 * Get services by tag ID
 * Convenience function that wraps getServiceList
 * @param tagId Tag ID
 * @param params Additional query parameters
 */
export function getServicesByTag(
  tagId: number,
  params?: Omit<ServiceQueryParams, 'tagId'>
): Promise<PageResult<ServiceListItem>> {
  return getServiceList({
    tagId,
    ...params
  })
}

// ==================== Recommendation APIs ====================

/**
 * Get recommended services
 * For homepage or discovery features
 * @param limit Number of services to return
 */
export function getRecommendedServices(limit = 6): Promise<ServiceListItem[]> {
  return getServiceList({
    sortBy: 'views', // Sort by popularity
    pageSize: limit,
    pageNum: 1
  }).then(result => result.records)
}

/**
 * Get latest services
 * For homepage "New Arrivals" section
 * @param limit Number of services to return
 */
export function getLatestServices(limit = 6): Promise<ServiceListItem[]> {
  return getServiceList({
    sortBy: 'latest',
    pageSize: limit,
    pageNum: 1
  }).then(result => result.records)
}

/**
 * Get top-rated services
 * For homepage "Top Rated" section
 * @param limit Number of services to return
 */
export function getTopRatedServices(limit = 6): Promise<ServiceListItem[]> {
  return getServiceList({
    sortBy: 'rating',
    pageSize: limit,
    pageNum: 1
  }).then(result => result.records)
}

// ==================== Service Management APIs ====================

/**
 * Publish a new service
 * @param data Service form data
 * @returns The created service ID
 */
export function publishService(data: ServicePublishRequest): Promise<number> {
  return request<number>({
    url: '/service/publish',
    method: 'post',
    data
  })
}

/**
 * Update an existing service
 * @param id Service ID
 * @param data Service update data
 * @returns Success status
 */
export function updateService(id: number | string, data: ServiceUpdateRequest): Promise<void> {
  return request<void>({
    url: `/service/${id}`,
    method: 'put',
    data
  })
}

/**
 * Put service online
 * @param id Service ID
 * @returns Success status
 */
export function onlineService(id: number | string): Promise<void> {
  return request<void>({
    url: `/service/${id}/online`,
    method: 'put'
  })
}

/**
 * Take service offline
 * @param id Service ID
 * @returns Success status
 */
export function offlineService(id: number | string): Promise<void> {
  return request<void>({
    url: `/service/${id}/offline`,
    method: 'put'
  })
}

/**
 * Delete service (logical deletion)
 * @param id Service ID
 * @returns Success status
 */
export function deleteService(id: number | string): Promise<void> {
  return request<void>({
    url: `/service/${id}`,
    method: 'delete'
  })
}

/**
 * Get my services with enhanced data
 * Wraps getMyServices and adds computed fields
 * @param status Filter by service status
 * @param params Additional query parameters
 */
export function getMyServicesEnhanced(
  status?: number,
  params?: ServiceQueryParams
): Promise<PageResult<MyServiceItem>> {
  return getMyServices(status, params).then(result => {
    // Cast to MyServiceItem and add computed fields
    const enhancedRecords = result.records.map(item => {
      const myItem = item as MyServiceItem
      // These fields should come from backend but we can compute them as fallback
      myItem.canEdit = myItem.status === 2 || myItem.status === 4 // OFFLINE or REJECTED
      myItem.canOnline = myItem.status === 2 || myItem.status === 4 // OFFLINE or REJECTED
      myItem.canOffline = myItem.status === 1 // ONLINE
      return myItem
    })
    return {
      ...result,
      records: enhancedRecords
    }
  })
}

// ==================== Helper Functions ====================

/**
 * Build full image URL if relative path
 * Backend stores relative paths like "service_image/2/202511/xxx.png"
 * which need to be accessed via /api/file/view/ endpoint
 * @param imageUrl Image URL from backend
 * @returns Full URL for image display
 */
export function buildImageUrl(imageUrl?: string): string {
  if (!imageUrl) return '/placeholder-service.jpg' // Default placeholder

  // If already a full URL, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl
  }

  // If already has /api/file/view prefix, return as is
  if (imageUrl.startsWith('/api/file/view/')) {
    return imageUrl
  }

  // Build the file view URL (proxy handles /api -> backend)
  return `/api/file/view/${imageUrl}`
}

/**
 * Validate service query parameters
 * Ensures params are within valid ranges
 * @param params Query parameters to validate
 */
export function validateQueryParams(params: ServiceQueryParams): ServiceQueryParams {
  const validated = { ...params }

  // Ensure page numbers are positive
  if (validated.pageNum && validated.pageNum < 1) {
    validated.pageNum = 1
  }

  // Ensure page size is reasonable
  if (validated.pageSize) {
    if (validated.pageSize < 1) validated.pageSize = 1
    if (validated.pageSize > 100) validated.pageSize = 100
  }

  // Ensure price range is valid
  if (validated.minPrice && validated.maxPrice) {
    if (validated.minPrice > validated.maxPrice) {
      const temp = validated.minPrice
      validated.minPrice = validated.maxPrice
      validated.maxPrice = temp
    }
  }

  return validated
}