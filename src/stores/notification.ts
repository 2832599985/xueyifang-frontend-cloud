import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getUnreadCount, listMyNotifications } from '@/api/notification'
import type { NotificationItem } from '@/types/notification'

export const useNotificationStore = defineStore('notification', () => {
  // 未读通知数量
  const unreadCount = ref<number>(0)

  // 最近通知列表（用于铃铛下拉预览）
  const recentNotifications = ref<NotificationItem[]>([])

  /**
   * 获取未读通知数量
   */
  const fetchUnreadCount = async () => {
    try {
      const count = await getUnreadCount()
      unreadCount.value = count
    } catch {
      // 失败静默处理，不影响主流程
    }
  }

  /**
   * 获取最近通知（用于铃铛下拉）
   */
  const fetchRecentNotifications = async () => {
    try {
      const result = await listMyNotifications({ pageNum: 1, pageSize: 5 })
      recentNotifications.value = result.records || []
    } catch {
      recentNotifications.value = []
    }
  }

  /**
   * 减少未读数
   */
  const decreaseUnread = (delta = 1) => {
    unreadCount.value = Math.max(0, unreadCount.value - delta)
  }

  /**
   * 清空未读数
   */
  const clearUnread = () => {
    unreadCount.value = 0
  }

  /**
   * 标记某条通知为已读（更新本地状态）
   */
  const markLocalRead = (id: number) => {
    const item = recentNotifications.value.find(n => n.id === id)
    if (item && item.isRead === 0) {
      item.isRead = 1
      decreaseUnread(1)
    }
  }

  /**
   * 标记全部为已读（更新本地状态）
   */
  const markAllLocalRead = () => {
    recentNotifications.value.forEach(item => {
      item.isRead = 1
    })
    clearUnread()
  }

  /**
   * 重置状态（退出登录时调用）
   */
  const reset = () => {
    unreadCount.value = 0
    recentNotifications.value = []
  }

  return {
    unreadCount,
    recentNotifications,
    fetchUnreadCount,
    fetchRecentNotifications,
    decreaseUnread,
    clearUnread,
    markLocalRead,
    markAllLocalRead,
    reset
  }
})
