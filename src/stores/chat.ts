import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { listConversations } from '@/api/chat'
import type { ChatConversation } from '@/types/chat'

export const useChatStore = defineStore('chat', () => {
  // 会话列表
  const conversations = ref<ChatConversation[]>([])

  // 总未读数（从会话列表累加）
  const totalUnreadCount = computed(() => {
    return conversations.value.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0)
  })

  /**
   * 获取会话列表并更新未读数
   */
  const fetchConversations = async () => {
    try {
      conversations.value = await listConversations()
    } catch {
      // 静默处理，不影响主流程
    }
  }

  /**
   * 清空某个会话的未读数（进入会话后调用）
   */
  const clearConversationUnread = (userId: number) => {
    const conv = conversations.value.find(c => c.userId === userId)
    if (conv) {
      conv.unreadCount = 0
    }
  }

  /**
   * 重置状态（退出登录时调用）
   */
  const reset = () => {
    conversations.value = []
  }

  return {
    conversations,
    totalUnreadCount,
    fetchConversations,
    clearConversationUnread,
    reset
  }
})
