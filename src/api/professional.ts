/**
 * 管理员-专业管理 API 模块
 */

import request from '@/api/request'
import type { PageResult } from '@/types/http'
import type { Professional } from '@/types/dict'

const BASE_URL = '/admin/professional'

export interface ProfessionalQueryParams {
  pageNum?: number
  pageSize?: number
  nameLike?: string
}

export interface ProfessionalForm {
  id?: number
  professionalName: string
  description?: string
}

/**
 * 分页查询专业列表
 */
export function listProfessionals(params: ProfessionalQueryParams): Promise<PageResult<Professional>> {
  return request<PageResult<Professional>>({
    url: `${BASE_URL}/list`,
    method: 'get',
    params: {
      pageNum: params.pageNum || 1,
      pageSize: params.pageSize || 10,
      nameLike: params.nameLike || undefined
    }
  })
}

/**
 * 添加专业
 */
export function addProfessional(data: ProfessionalForm): Promise<boolean> {
  return request<boolean>({
    url: `${BASE_URL}/add`,
    method: 'post',
    data
  })
}

/**
 * 更新专业
 */
export function updateProfessional(data: ProfessionalForm): Promise<boolean> {
  return request<boolean>({
    url: `${BASE_URL}/update`,
    method: 'put',
    data
  })
}

/**
 * 删除专业
 */
export function deleteProfessional(id: number): Promise<boolean> {
  return request<boolean>({
    url: `${BASE_URL}/${id}`,
    method: 'delete'
  })
}
