/**
 * Public dictionary data API module
 * Centralized API for service tags, professionals, and trade locations
 */

import request from '@/api/request'
import type { ServiceTag, Professional, TradeLocation } from '@/types/dict'

// ==================== Service Tags API ====================

/**
 * Get all service tags/categories
 * @returns List of all available service tags
 */
export function listServiceTags(): Promise<ServiceTag[]> {
  return request<ServiceTag[]>({
    url: '/service/tags',
    method: 'get'
  })
}

// ==================== Professionals API ====================

/**
 * Get all professionals/majors
 * @returns List of all professionals
 */
export function listProfessionals(): Promise<Professional[]> {
  return request<Professional[]>({
    url: '/professional/list',
    method: 'get'
  })
}

/**
 * Get professional by ID
 * @param id Professional ID
 * @returns Professional information
 */
export function getProfessionalById(id: number): Promise<Professional> {
  return request<Professional>({
    url: `/professional/${id}`,
    method: 'get'
  })
}

// ==================== Trade Locations API ====================

/**
 * Get all available trade locations
 * @returns List of available trade locations (isAvailable = 1)
 */
export function listTradeLocations(): Promise<TradeLocation[]> {
  return request<TradeLocation[]>({
    url: '/trade-location/list',
    method: 'get'
  })
}

/**
 * Get all trade locations including unavailable ones
 * @returns List of all trade locations
 */
export function listAllTradeLocations(): Promise<TradeLocation[]> {
  return request<TradeLocation[]>({
    url: '/trade-location/list/all',
    method: 'get'
  })
}

/**
 * Get trade location by ID
 * @param id Location ID
 * @returns Trade location information
 */
export function getTradeLocationById(id: number): Promise<TradeLocation> {
  return request<TradeLocation>({
    url: `/trade-location/${id}`,
    method: 'get'
  })
}
