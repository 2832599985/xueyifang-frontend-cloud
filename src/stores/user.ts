import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo } from '@/types/auth'
import { authApi } from '@/api/auth'
import { useAppStore } from './app'
import { useChatStore } from './chat'
import { useNotificationStore } from './notification'

export const useUserStore = defineStore('user', () => {
    const userInfo = ref<UserInfo | null>(null)
    const appStore = useAppStore()

    /**
     * 设置用户信息
     */
    const setUserInfo = (user: UserInfo) => {
        userInfo.value = user
    }

    /**
     * 清除用户信息
     */
    const clearUserInfo = () => {
        userInfo.value = null
    }

    /**
     * 获取当前用户信息
     */
    const fetchCurrentUser = async () => {
        try {
            // 如果没有token，直接返回
            if (!appStore.token) {
                clearUserInfo()
                return
            }

            const user = await authApi.getCurrentUser()
            setUserInfo(user)
            return user
        } catch (error) {
            console.error('获取用户信息失败:', error)
            // 获取失败（可能是token失效），清除用户信息
            clearUserInfo()
            // 可选：如果确认是token失效，也可以在这里清除token
            // appStore.clearToken()
            throw error
        }
    }

    /**
     * 退出登录
     */
    const logout = async () => {
        try {
            await authApi.logout()
        } catch (error) {
            console.error('退出登录失败:', error)
        } finally {
            // 无论后端是否成功，前端都要清除状态
            appStore.clearToken()
            clearUserInfo()
            // 清理其他模块的状态，避免用户切换后数据污染
            useChatStore().reset()
            useNotificationStore().reset()
        }
    }

    /**
     * 计算属性：是否已登录
     */
    const isLogin = computed(() => !!appStore.token && !!userInfo.value)

    return {
        userInfo,
        isLogin,
        setUserInfo,
        clearUserInfo,
        fetchCurrentUser,
        logout
    }
})
