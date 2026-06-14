/**
 * HTTP 请求响应类型定义
 */

/**
 * 后端统一响应格式（对应 BaseResponse.java）
 */
export interface ApiResponse<T = any> {
  /** 响应码：0=成功，其他=失败 */
  code: number
  /** 响应消息 */
  message: string
  /** 响应数据 */
  data: T
}

/**
 * 分页请求参数
 */
export interface PageParams {
  pageNum?: number
  pageSize?: number
}

/**
 * 分页响应数据
 */
export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

/**
 * 常见错误码（参考 ErrorCode.java）
 */
export enum ErrorCode {
  /** 成功 */
  SUCCESS = 0,
  /** 请求参数错误 */
  PARAMS_ERROR = 40001,
  /** 无权限访问 */
  NO_AUTH_ERROR = 40003,
  /** 用户未登录 */
  USER_NOT_LOGIN = 40103,
  /** 系统内部异常 */
  SYSTEM_ERROR = 50000,
  /** 操作失败 */
  OPERATION_ERROR = 50001
}
