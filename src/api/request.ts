import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios'
import { ElMessage } from 'element-plus'
import type { ApiResponse } from '@/types/http'

/**
 * 创建axios实例
 */
const service: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

/**
 * 请求拦截器
 */
service.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

/**
 * 响应拦截器
 * 职责：
 * 1. code===0 时返回data
 * 2. code!==0 时显示错误消息并抛出异常
 */
service.interceptors.response.use(
  (response) => {
    const res = response.data as ApiResponse

    // 成功：直接返回data
    if (res.code === 0) {
      return res.data
    }

    // 失败：显示错误消息并抛出异常
    const errorMessage = res.message || '请求失败'
    ElMessage.error(errorMessage)

    // 创建业务错误对象
    const error = new Error(errorMessage) as Error & { code: number }
    error.code = res.code

    return Promise.reject(error)
  },
  (error: AxiosError) => {
    // 网络错误或HTTP状态码错误
    console.error('响应错误:', error)

    const responseData = error.response?.data as ApiResponse | undefined
    if (responseData && typeof responseData.code === 'number') {
      const errorMessage = responseData.message || '请求失败'
      ElMessage.error(errorMessage)

      const bizError = new Error(errorMessage) as Error & { code?: number }
      bizError.code = responseData.code
      return Promise.reject(bizError)
    }

    let errorMessage = '网络错误'
    if (error.response) {
      errorMessage = `请求失败: ${error.response.status}`
    } else if (error.request) {
      errorMessage = '网络连接失败'
    }

    ElMessage.error(errorMessage)
    return Promise.reject(error)
  }
)

/**
 * 统一请求方法
 * @param config Axios请求配置
 * @returns Promise<T> 直接返回data的类型
 *
 * 使用示例：
 * ```ts
 * interface User { id: number; name: string }
 * const user = await request<User>({ url: '/user/1', method: 'get' })
 * // user类型为User，直接使用user.id, user.name
 * ```
 */
export default function request<T = any>(config: AxiosRequestConfig): Promise<T> {
  return service.request<any, T>(config)
}

// 导出类型供外部使用
export type { ApiResponse }
