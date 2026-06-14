/**
 * Favorite/Collection API module
 * Handles service collection/favorite operations
 */

import request from './request'
import type { PageResult } from '@/types/http'
import type { FavoriteListItem, FavoriteRequest } from '@/types/service'

/**
 * Add service to favorites/collection
 * @param serviceId Service ID to collect
 * @returns Promise resolving when collection is successful
 */
export function collectService(serviceId: number): Promise<void> {
  const data: FavoriteRequest = { serviceId }
  return request<void>({
    url: '/favorite/collect',
    method: 'post',
    data
  })
}

/**
 * Remove service from favorites/collection
 * @param serviceId Service ID to uncollect
 * @returns Promise resolving when uncollection is successful
 */
export function uncollectService(serviceId: number): Promise<void> {
  return request<void>({
    url: `/favorite/collect/${serviceId}`,
    method: 'delete'
  })
}

/**
 * Get user's favorite/collected services with pagination
 * @param pageNum Page number (default: 1)
 * @param pageSize Items per page (default: 10)
 * @returns Paginated list of favorite services
 */
export function getMyCollections(
  pageNum = 1,
  pageSize = 10
): Promise<PageResult<FavoriteListItem>> {
  return request<PageResult<FavoriteListItem>>({
    url: '/favorite/myCollections',
    method: 'get',
    params: {
      pageNum,
      pageSize
    }
  })
}

/**
 * Toggle service collection status
 * Convenience function that collects if not collected, uncollects if collected
 * @param serviceId Service ID
 * @param isCurrentlyCollected Current collection status
 * @returns Promise resolving when operation is complete
 */
export async function toggleCollection(
  serviceId: number,
  isCurrentlyCollected: boolean
): Promise<void> {
  if (isCurrentlyCollected) {
    return uncollectService(serviceId)
  } else {
    return collectService(serviceId)
  }
}

/**
 * Get recently collected services
 * For quick access or "recently viewed/collected" section
 * @param limit Number of items to return (default: 5)
 * @returns List of recently collected services
 */
export function getRecentCollections(limit = 5): Promise<FavoriteListItem[]> {
  return getMyCollections(1, limit).then(result => result.records)
}