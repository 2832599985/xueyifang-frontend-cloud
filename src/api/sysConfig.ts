/**
 * System configuration API module
 * Admin-only endpoints for managing system configurations
 */

import request from '@/api/request'
import type { PageResult } from '@/types/http'
import type { SysConfig, SysConfigQueryRequest, SysConfigUpdateRequest } from '@/types/sysConfig'

const BASE_URL = '/admin/sys-config'

/**
 * Get paginated list of system configurations
 * Supports filtering by configKey (keyLike)
 * @param params Query parameters
 * @returns Paginated result of configs
 */
export function listSysConfigs(params: SysConfigQueryRequest): Promise<PageResult<SysConfig>> {
  return request<PageResult<SysConfig>>({
    url: `${BASE_URL}/list`,
    method: 'get',
    params: {
      pageNum: params.pageNum || 1,
      pageSize: params.pageSize || 10,
      keyLike: params.keyLike || undefined
    }
  })
}

/**
 * Get single configuration detail by ID
 * @param id Config ID
 * @returns Config detail
 */
export function getSysConfigDetail(id: number): Promise<SysConfig> {
  return request<SysConfig>({
    url: `${BASE_URL}/${id}`,
    method: 'get'
  })
}

/**
 * Update system configuration
 * Can update: configValue, description, isEnabled
 * Cannot update: configKey
 * @param data Update request data
 * @returns Success status
 */
export function updateSysConfig(data: SysConfigUpdateRequest): Promise<boolean> {
  return request<boolean>({
    url: `${BASE_URL}/update`,
    method: 'put',
    data
  })
}

/**
 * Batch get configuration values by keys
 * Only returns enabled configs (isEnabled = 1)
 * @param keys Array of config keys
 * @returns Map of key -> value
 */
export function getSysConfigKeyValues(keys: string[]): Promise<Record<string, string>> {
  return request<Record<string, string>>({
    url: `${BASE_URL}/key-values`,
    method: 'get',
    params: {
      keys: keys.join(',')
    }
  })
}

// ==================== Public APIs ====================

/**
 * Get register switch status (public, no auth required)
 * @returns { registerEnabled: boolean }
 */
export function getRegisterStatus(): Promise<{ registerEnabled: boolean }> {
  return request<{ registerEnabled: boolean }>({
    url: '/sys-config/register-status',
    method: 'get'
  })
}

// ==================== User Import APIs ====================

import type { UserImportResultVO } from '@/types/userImport'

const IMPORT_BASE_URL = '/admin/user-import'

/**
 * Upload file to import users in bulk
 * @param file Excel(.xlsx) or CSV(UTF-8) file
 * @returns Import result
 */
export function importUsers(file: File): Promise<UserImportResultVO> {
  const formData = new FormData()
  formData.append('file', file)

  return request<UserImportResultVO>({
    url: `${IMPORT_BASE_URL}/upload`,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * Get template download URL
 */
export function getImportTemplateUrl(): string {
  // 直接返回 URL，前端用 a 标签下载
  return `${IMPORT_BASE_URL}/template`
}

