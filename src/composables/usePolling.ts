import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import { useChatStore } from '@/stores/chat'
import { useUserStore } from '@/stores/user'

// 轮询间隔配置
const GLOBAL_POLL_INTERVAL = 30000  // 全局轮询：30秒
const CHAT_PAGE_POLL_INTERVAL = 5000 // 聊天页面内：5秒

// 全局轮询定时器（单例）
let globalPollTimer: ReturnType<typeof setInterval> | null = null
let isGlobalPollingActive = false

/**
 * 全局轮询 hook - 用于 App.vue
 * 负责定时刷新通知和聊天未读数
 */
export function useGlobalPolling() {
  const notificationStore = useNotificationStore()
  const chatStore = useChatStore()
  const userStore = useUserStore()

  // 执行一次轮询
  const poll = async () => {
    if (!userStore.isLogin) return

    // 并行请求通知和聊天未读数
    await Promise.all([
      notificationStore.fetchUnreadCount(),
      chatStore.fetchConversations()
    ])
  }

  // 启动全局轮询
  const startPolling = () => {
    if (isGlobalPollingActive) return

    isGlobalPollingActive = true

    // 立即执行一次
    poll()

    // 设置定时轮询
    globalPollTimer = setInterval(poll, GLOBAL_POLL_INTERVAL)

    // 监听页面可见性变化
    document.addEventListener('visibilitychange', handleVisibilityChange)
  }

  // 停止全局轮询
  const stopPolling = () => {
    isGlobalPollingActive = false

    if (globalPollTimer) {
      clearInterval(globalPollTimer)
      globalPollTimer = null
    }

    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }

  // 页面可见性变化处理
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible' && userStore.isLogin) {
      // 页面变为可见时立即刷新
      poll()
    }
  }

  // 监听登录状态
  watch(() => userStore.isLogin, (isLogin) => {
    if (isLogin) {
      startPolling()
    } else {
      stopPolling()
      // 清空数据
      notificationStore.clearUnread()
      chatStore.reset()
    }
  })

  onMounted(() => {
    if (userStore.isLogin) {
      startPolling()
    }
  })

  onUnmounted(() => {
    // 注意：App.vue 不会卸载，这里主要是防御性代码
  })

  return {
    poll,
    startPolling,
    stopPolling
  }
}

/**
 * 聊天页面轮询 hook - 用于 ChatPage.vue
 * 更频繁地刷新消息和会话列表
 */
export function useChatPolling(
  onPoll: () => Promise<void>,
  enabled = ref(true)
) {
  let timer: ReturnType<typeof setInterval> | null = null

  const startPolling = () => {
    if (timer) return

    timer = setInterval(async () => {
      if (enabled.value) {
        await onPoll()
      }
    }, CHAT_PAGE_POLL_INTERVAL)
  }

  const stopPolling = () => {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  // 页面可见性变化处理
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible' && enabled.value) {
      onPoll()
    }
  }

  onMounted(() => {
    startPolling()
    document.addEventListener('visibilitychange', handleVisibilityChange)
  })

  onUnmounted(() => {
    stopPolling()
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  })

  return {
    startPolling,
    stopPolling
  }
}
