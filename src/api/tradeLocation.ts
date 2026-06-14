/**
 * 管理员-交易地点管理 API 模块
 */

import request from '@/api/request'
import type { PageResult } from '@/types/http'
import type { TradeLocation } from '@/types/dict'

const BASE_URL = '/admin/trade-location'

export interface TradeLocationQueryParams {
  pageNum?: number
  pageSize?: number
  nameLike?: string
  isAvailable?: number | null
}

export interface TradeLocationForm {
  id?: number
  locationName: string
  locationDescription?: string
  locationAddress?: string
  isAvailable?: number
}

/**
 * 分页查询交易地点列表
 */
export function listTradeLocations(params: TradeLocationQueryParams): Promise<PageResult<TradeLocation>> {
  return request<PageResult<TradeLocation>>({
    url: `${BASE_URL}/list`,
    method: 'get',
    params: {
      pageNum: params.pageNum || 1,
      pageSize: params.pageSize || 10,
      nameLike: params.nameLike || undefined,
      isAvailable: params.isAvailable ?? undefined
    }
  })
}

/**
 * 添加交易地点
 */
export function addTradeLocation(data: TradeLocationForm): Promise<boolean> {
  return request<boolean>({
    url: `${BASE_URL}/add`,
    method: 'post',
    data
  })
}

/**
 * 更新交易地点
 */
export function updateTradeLocation(data: TradeLocationForm): Promise<boolean> {
  return request<boolean>({
    url: `${BASE_URL}/update`,
    method: 'put',
    data
  })
}

/**
 * 删除交易地点
 */
export function deleteTradeLocation(id: number): Promise<boolean> {
  return request<boolean>({
    url: `${BASE_URL}/${id}`,
    method: 'delete'
  })
}
