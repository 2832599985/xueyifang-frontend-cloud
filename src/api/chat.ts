import request from './request'
import type { PageResult } from '@/types/http'
import type {
  ChatConversation,
  ChatMessage,
  ChatMessageQuery,
  ChatSendRequest
} from '@/types/chat'

/**
 * 获取我的聊天会话列表
 */
export function listConversations(): Promise<ChatConversation[]> {
  return request<ChatConversation[]>({
    url: '/chat/conversations',
    method: 'get'
  })
}

/**
 * 获取与指定用户的聊天记录
 * 注意：调用此接口后，后端会自动将该会话的未读消息标记为已读
 */
export function listMessages(
  userId: number,
  params?: ChatMessageQuery
): Promise<PageResult<ChatMessage>> {
  return request<PageResult<ChatMessage>>({
    url: `/chat/messages/${userId}`,
    method: 'get',
    params: {
      pageNum: params?.pageNum || 1,
      pageSize: params?.pageSize || 50
    }
  })
}

/**
 * 发送消息
 */
export function sendChatMessage(data: ChatSendRequest): Promise<void> {
  return request<void>({
    url: '/chat/send',
    method: 'post',
    data
  })
}
