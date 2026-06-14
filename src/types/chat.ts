/**
 * 聊天会话列表项
 */
export interface ChatConversation {
  userId: number           // 对方用户ID
  realName: string         // 对方真实姓名
  avatar: string           // 对方头像URL
  lastMessage: string      // 最后一条消息内容
  lastMessageTime: string  // 最后消息时间
  unreadCount: number      // 未读消息数量
}

/**
 * 用户简略信息（嵌套在消息中）
 */
export interface ChatUserSummary {
  userId: number
  realName: string
  avatar: string
}

/**
 * 消息类型
 * 1=文本, 2=图片, 3=文件
 */
export type ChatMessageType = 1 | 2 | 3

/**
 * 聊天消息
 */
export interface ChatMessage {
  messageId: number
  content: string
  messageType: ChatMessageType
  isRead: 0 | 1
  createTime: string
  sender: ChatUserSummary
  receiver: ChatUserSummary
}

/**
 * 消息查询参数
 */
export interface ChatMessageQuery {
  pageNum?: number
  pageSize?: number
}

/**
 * 发送消息请求
 */
export interface ChatSendRequest {
  receiverId: number
  content: string
  messageType?: ChatMessageType  // 默认 1 文本
  relatedOrderId?: number
  relatedServiceId?: number
}

/**
 * 格式化聊天时间
 * @param timeStr 时间字符串
 * @returns 格式化后的时间
 */
export function formatChatTime(timeStr: string): string {
  if (!timeStr) return ''

  const date = new Date(timeStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  // 今天
  const isToday = date.toDateString() === now.toDateString()
  if (isToday) {
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  }

  // 昨天
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return '昨天'
  }

  // 7天内显示星期
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return weekDays[date.getDay()]
  }

  // 超过7天显示日期
  const month = date.getMonth() + 1
  const day = date.getDate()

  // 今年不显示年份
  if (date.getFullYear() === now.getFullYear()) {
    return `${month}月${day}日`
  }

  return `${date.getFullYear()}/${month}/${day}`
}

/**
 * 格式化消息时间（完整格式）
 * @param timeStr 时间字符串
 * @returns 格式化后的时间
 */
export function formatMessageTime(timeStr: string): string {
  if (!timeStr) return ''

  const date = new Date(timeStr)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${hours}:${minutes}`
}

/**
 * 格式化日期分隔符
 * @param timeStr 时间字符串
 * @returns 格式化后的日期
 */
export function formatDateSeparator(timeStr: string): string {
  if (!timeStr) return ''

  const date = new Date(timeStr)
  const now = new Date()

  const isToday = date.toDateString() === now.toDateString()
  if (isToday) {
    return '今天'
  }

  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return '昨天'
  }

  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  if (year === now.getFullYear()) {
    return `${month}月${day}日`
  }

  return `${year}年${month}月${day}日`
}
