import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * 全局应用状态
 * 极简版：仅管理loading和token
 */
export const useAppStore = defineStore('app', () => {
  // 全局loading状态
  const loading = ref(false)

  // 用户token（从localStorage恢复）
  const token = ref<string>(localStorage.getItem('token') || '')

  /**
   * 设置loading状态
   */
  const setLoading = (value: boolean) => {
    loading.value = value
  }

  /**
   * 设置token
   */
  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  /**
   * 清除token
   */
  const clearToken = () => {
    token.value = ''
    localStorage.removeItem('token')
  }

  /**
   * 是否已登录
   */
  const isLogin = () => {
    return !!token.value
  }

  return {
    loading,
    token,
    setLoading,
    setToken,
    clearToken,
    isLogin
  }
})
