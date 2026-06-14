/**
 * Public dictionary data store
 * Caches service tags, professionals, and trade locations
 * Prevents redundant API calls across pages
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { listServiceTags, listProfessionals, listTradeLocations } from '@/api/dict'
import type { ServiceTag, Professional, TradeLocation } from '@/types/dict'

export const useDictStore = defineStore('dict', () => {
  // ==================== State ====================

  const serviceTags = ref<ServiceTag[] | null>(null)
  const professionals = ref<Professional[] | null>(null)
  const tradeLocations = ref<TradeLocation[] | null>(null)

  // Loading states
  const loadingTags = ref(false)
  const loadingProfessionals = ref(false)
  const loadingLocations = ref(false)

  // ==================== Getters ====================

  /**
   * Get available trade locations (isAvailable = 1)
   */
  const availableLocations = computed(() => {
    if (!tradeLocations.value) return []
    return tradeLocations.value.filter(loc => loc.isAvailable === 1)
  })

  /**
   * Check if service tags are loaded
   */
  const hasServiceTags = computed(() => serviceTags.value !== null)

  /**
   * Check if professionals are loaded
   */
  const hasProfessionals = computed(() => professionals.value !== null)

  /**
   * Check if trade locations are loaded
   */
  const hasTradeLocations = computed(() => tradeLocations.value !== null)

  // ==================== Actions ====================

  /**
   * Fetch service tags (cached)
   * Will not fetch if already loaded
   */
  const fetchServiceTags = async (force = false): Promise<ServiceTag[]> => {
    // Return cached data if available and not forcing refresh
    if (serviceTags.value && !force) {
      return serviceTags.value
    }

    // Prevent concurrent requests
    if (loadingTags.value) {
      // Wait for existing request to complete
      return new Promise((resolve) => {
        const check = setInterval(() => {
          if (!loadingTags.value && serviceTags.value) {
            clearInterval(check)
            resolve(serviceTags.value)
          }
        }, 50)
      })
    }

    loadingTags.value = true
    try {
      serviceTags.value = await listServiceTags()
      return serviceTags.value
    } finally {
      loadingTags.value = false
    }
  }

  /**
   * Fetch professionals (cached)
   * Will not fetch if already loaded
   */
  const fetchProfessionals = async (force = false): Promise<Professional[]> => {
    // Return cached data if available and not forcing refresh
    if (professionals.value && !force) {
      return professionals.value
    }

    // Prevent concurrent requests
    if (loadingProfessionals.value) {
      return new Promise((resolve) => {
        const check = setInterval(() => {
          if (!loadingProfessionals.value && professionals.value) {
            clearInterval(check)
            resolve(professionals.value)
          }
        }, 50)
      })
    }

    loadingProfessionals.value = true
    try {
      professionals.value = await listProfessionals()
      return professionals.value
    } finally {
      loadingProfessionals.value = false
    }
  }

  /**
   * Fetch trade locations (cached)
   * Will not fetch if already loaded
   */
  const fetchTradeLocations = async (force = false): Promise<TradeLocation[]> => {
    // Return cached data if available and not forcing refresh
    if (tradeLocations.value && !force) {
      return tradeLocations.value
    }

    // Prevent concurrent requests
    if (loadingLocations.value) {
      return new Promise((resolve) => {
        const check = setInterval(() => {
          if (!loadingLocations.value && tradeLocations.value) {
            clearInterval(check)
            resolve(tradeLocations.value)
          }
        }, 50)
      })
    }

    loadingLocations.value = true
    try {
      tradeLocations.value = await listTradeLocations()
      return tradeLocations.value
    } finally {
      loadingLocations.value = false
    }
  }

  /**
   * Fetch all dictionary data
   * Useful for preloading on app startup
   */
  const fetchAll = async (force = false): Promise<void> => {
    await Promise.all([
      fetchServiceTags(force),
      fetchProfessionals(force),
      fetchTradeLocations(force)
    ])
  }

  /**
   * Get tag name by ID
   */
  const getTagName = (tagId: number): string => {
    if (!serviceTags.value) return '未知分类'
    const tag = serviceTags.value.find(t => t.tagId === tagId)
    return tag?.tagName || '未知分类'
  }

  /**
   * Get professional name by ID
   */
  const getProfessionalName = (id: number): string => {
    if (!professionals.value) return '未知专业'
    const pro = professionals.value.find(p => p.id === id)
    return pro?.professionalName || '未知专业'
  }

  /**
   * Get location name by ID
   */
  const getLocationName = (id: number): string => {
    if (!tradeLocations.value) return '未知地点'
    const loc = tradeLocations.value.find(l => l.id === id)
    return loc?.locationName || '未知地点'
  }

  /**
   * Clear all cached data
   * Useful when logging out or refreshing
   */
  const clearCache = () => {
    serviceTags.value = null
    professionals.value = null
    tradeLocations.value = null
  }

  return {
    // State
    serviceTags,
    professionals,
    tradeLocations,
    loadingTags,
    loadingProfessionals,
    loadingLocations,

    // Getters
    availableLocations,
    hasServiceTags,
    hasProfessionals,
    hasTradeLocations,

    // Actions
    fetchServiceTags,
    fetchProfessionals,
    fetchTradeLocations,
    fetchAll,
    getTagName,
    getProfessionalName,
    getLocationName,
    clearCache
  }
})
