/**
 * Public dictionary data types
 * Used for service tags, professionals, and trade locations
 * Aligned with backend VOs
 */

// ==================== Service Tag ====================

/**
 * Service tag/category
 * Maps to backend ServiceTagVO
 */
export interface ServiceTag {
  tagId: number
  tagName: string
  description: string
  icon: string
}

// ==================== Professional ====================

/**
 * Professional/Major information
 * Maps to backend ProfessionalVO
 */
export interface Professional {
  id: number
  professionalName: string
  description: string
}

// ==================== Trade Location ====================

/**
 * Trade location for offline services
 * Maps to backend TradeLocationVO
 */
export interface TradeLocation {
  id: number
  locationName: string
  locationDescription: string
  locationAddress: string
  isAvailable: number // 1=available, 0=unavailable
}

// ==================== Helper Functions ====================

/**
 * Get tag name by ID
 */
export function getTagNameById(tags: ServiceTag[], tagId: number): string {
  const tag = tags.find(t => t.tagId === tagId)
  return tag?.tagName || '未知分类'
}

/**
 * Get professional name by ID
 */
export function getProfessionalNameById(professionals: Professional[], id: number): string {
  const pro = professionals.find(p => p.id === id)
  return pro?.professionalName || '未知专业'
}

/**
 * Get location name by ID
 */
export function getLocationNameById(locations: TradeLocation[], id: number): string {
  const loc = locations.find(l => l.id === id)
  return loc?.locationName || '未知地点'
}

/**
 * Filter available trade locations
 */
export function filterAvailableLocations(locations: TradeLocation[]): TradeLocation[] {
  return locations.filter(loc => loc.isAvailable === 1)
}
