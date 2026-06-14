import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { useNotificationStore } from '@/stores/notification'
import { useChatStore } from '@/stores/chat'
import type { ChatMessage } from '@/types/chat'
import type { NotificationItem } from '@/types/notification'

// WebSocket 消息类型
interface WebSocketMessage {
  type: string
  data: any
}

// 消息类型常量（与后端保持一致）
const MESSAGE_TYPES = {
  NEW_CHAT: 'NEW_CHAT',
  NEW_NOTIFICATION: 'NEW_NOTIFICATION',
  UNREAD_UPDATE: 'UNREAD_UPDATE',
  PONG: 'PONG',
  CONNECTED: 'CONNECTED'
}

// WebSocket 配置：开发和生产都走同源 /api/ws，由 Vite 或 Nginx 代理到新 Gateway。
const WS_BASE_URL = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/ws`

// 重连配置
const RECONNECT_INTERVAL = 3000 // 重连间隔 3 秒
const MAX_RECONNECT_ATTEMPTS = 10 // 最大重连次数
const HEARTBEAT_INTERVAL = 30000 // 心跳间隔 30 秒

// 全局状态
let wsInstance: WebSocket | null = null
let reconnectAttempts = 0
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let heartbeatTimer: ReturnType<typeof setInterval> | null = null
let manualClose = false  // 手动关闭标志，防止重连竞态

// 消息处理回调
type MessageHandler = (message: WebSocketMessage) => void
const messageHandlers: Set<MessageHandler> = new Set()

/**
 * WebSocket 连接 composable
 * 用于 App.vue 管理全局 WebSocket 连接
 */
export function useWebSocket() {
  const userStore = useUserStore()
  const notificationStore = useNotificationStore()
  const chatStore = useChatStore()

  const isConnected = ref(false)
  const connectionError = ref<string | null>(null)

  // 获取 WebSocket URL（带 token）
  const getWsUrl = () => {
    const token = localStorage.getItem('token')
    if (!token) return null
    return `${WS_BASE_URL}?token=${encodeURIComponent(token)}`
  }

  // 发送心跳
  const sendHeartbeat = () => {
    if (wsInstance && wsInstance.readyState === WebSocket.OPEN) {
      wsInstance.send(JSON.stringify({ type: 'PING' }))
    }
  }

  // 启动心跳
  const startHeartbeat = () => {
    stopHeartbeat()
    heartbeatTimer = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL)
  }

  // 停止心跳
  const stopHeartbeat = () => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }
  }

  // 处理收到的消息
  const handleMessage = (event: MessageEvent) => {
    try {
      const message: WebSocketMessage = JSON.parse(event.data)

      switch (message.type) {
        case MESSAGE_TYPES.CONNECTED:
          console.log('[WebSocket] 连接成功, userId:', message.data)
          break

        case MESSAGE_TYPES.NEW_CHAT:
          // 收到新聊天消息
          handleNewChat(message.data)
          break

        case MESSAGE_TYPES.NEW_NOTIFICATION:
          // 收到新通知
          handleNewNotification(message.data)
          break

        case MESSAGE_TYPES.PONG:
          // 心跳响应，忽略
          break

        default:
          console.log('[WebSocket] 未知消息类型:', message.type)
      }

      // 调用所有注册的处理器
      messageHandlers.forEach(handler => handler(message))

    } catch (error) {
      console.error('[WebSocket] 消息解析失败:', error)
    }
  }

  // 处理新聊天消息
  const handleNewChat = (chatMessage: ChatMessage) => {
    // 刷新会话列表以更新未读数
    chatStore.fetchConversations()
  }

  // 处理新通知
  const handleNewNotification = (notification: NotificationItem) => {
    // 增加未读数
    notificationStore.unreadCount++
    // 添加到最近通知列表
    notificationStore.recentNotifications.unshift(notification)
    // 保持最近通知列表不超过 5 条
    if (notificationStore.recentNotifications.length > 5) {
      notificationStore.recentNotifications.pop()
    }
  }

  // 连接 WebSocket
  const connect = () => {
    if (wsInstance && wsInstance.readyState === WebSocket.OPEN) {
      return
    }

    const url = getWsUrl()
    if (!url) {
      console.log('[WebSocket] 未登录，跳过连接')
      return
    }

    try {
      wsInstance = new WebSocket(url)

      wsInstance.onopen = () => {
        console.log('[WebSocket] 连接已建立')
        isConnected.value = true
        connectionError.value = null
        reconnectAttempts = 0
        startHeartbeat()
      }

      wsInstance.onmessage = handleMessage

      wsInstance.onclose = (event) => {
        console.log('[WebSocket] 连接已关闭:', event.code, event.reason)
        isConnected.value = false
        stopHeartbeat()

        // 只在非手动关闭且用户仍然登录时，尝试重连
        if (!manualClose && userStore.isLogin && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          scheduleReconnect()
        }
        manualClose = false  // 重置标志，允许下次自动重连
      }

      wsInstance.onerror = (error) => {
        console.error('[WebSocket] 连接错误:', error)
        connectionError.value = '连接失败'
        isConnected.value = false
      }

    } catch (error) {
      console.error('[WebSocket] 创建连接失败:', error)
      connectionError.value = '创建连接失败'
    }
  }

  // 计划重连
  const scheduleReconnect = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
    }

    reconnectAttempts++
    console.log(`[WebSocket] ${RECONNECT_INTERVAL / 1000}秒后尝试重连 (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`)

    reconnectTimer = setTimeout(() => {
      connect()
    }, RECONNECT_INTERVAL)
  }

  // 断开连接
  const disconnect = () => {
    manualClose = true  // 标记为手动关闭，阻止自动重连
    stopHeartbeat()

    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }

    if (wsInstance) {
      wsInstance.close()
      wsInstance = null
    }

    isConnected.value = false
    reconnectAttempts = 0
  }

  // 监听登录状态
  watch(() => userStore.isLogin, (isLogin) => {
    if (isLogin) {
      connect()
    } else {
      disconnect()
    }
  })

  onMounted(() => {
    if (userStore.isLogin) {
      connect()
    }
  })

  onUnmounted(() => {
    // App.vue 不会卸载，这里主要是防御性代码
  })

  return {
    isConnected,
    connectionError,
    connect,
    disconnect
  }
}

/**
 * 注册消息处理器
 * 用于组件监听特定类型的 WebSocket 消息
 */
export function onWebSocketMessage(handler: MessageHandler) {
  messageHandlers.add(handler)

  // 返回取消注册函数
  return () => {
    messageHandlers.delete(handler)
  }
}

/**
 * 获取 WebSocket 连接状态
 */
export function isWebSocketConnected(): boolean {
  return wsInstance !== null && wsInstance.readyState === WebSocket.OPEN
}

/**
 * 获取消息类型常量
 */
export { MESSAGE_TYPES }
