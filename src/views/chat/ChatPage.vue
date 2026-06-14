<template>
  <div class="chat-page">
    <div class="chat-container">
      <!-- 左侧会话列表 -->
      <div class="conversation-sidebar">
        <!-- 头部 -->
        <div class="sidebar-header">
          <h2 class="sidebar-title">消息</h2>
          <el-button text class="refresh-btn" @click="loadConversations" :loading="conversationsLoading">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </div>

        <!-- 搜索框 -->
        <div class="search-box">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索聊天..."
            :prefix-icon="Search"
            class="search-input"
            clearable
          />
        </div>

        <!-- 会话列表 -->
        <div class="conversation-list" v-loading="conversationsLoading">
          <template v-if="filteredConversations.length > 0">
            <div
              v-for="conv in filteredConversations"
              :key="conv.userId"
              class="conversation-item"
              :class="{ active: activeUserId === conv.userId }"
              @click="selectConversation(conv)"
            >
              <div class="avatar-wrapper">
                <el-avatar :size="48" :src="buildImageUrl(conv.avatar)">
                  {{ conv.realName?.charAt(0) }}
                </el-avatar>
              </div>
              <div class="conv-info">
                <div class="conv-header">
                  <span class="conv-name">{{ conv.realName }}</span>
                  <span class="conv-time">{{ formatChatTime(conv.lastMessageTime) }}</span>
                </div>
                <div class="conv-preview">
                  <span class="preview-text" :class="{ 'has-unread': conv.unreadCount > 0 }">
                    {{ conv.lastMessage }}
                  </span>
                  <el-badge
                    v-if="conv.unreadCount > 0"
                    :value="conv.unreadCount"
                    :max="99"
                    class="unread-badge"
                  />
                </div>
              </div>
            </div>
          </template>
          <div v-else-if="!conversationsLoading" class="empty-conversations">
            <el-icon class="empty-icon"><ChatDotRound /></el-icon>
            <p>暂无聊天会话</p>
          </div>
        </div>
      </div>

      <!-- 右侧聊天窗口 -->
      <div class="chat-window">
        <template v-if="activeUserId">
          <!-- 聊天窗口头部 -->
          <div class="chat-header">
            <div class="chat-user-info">
              <el-avatar :size="36" :src="buildImageUrl(activeConversation?.avatar)">
                {{ activeConversation?.realName?.charAt(0) }}
              </el-avatar>
              <span class="chat-user-name">{{ activeConversation?.realName }}</span>
            </div>
            <div class="chat-actions">
              <el-button text class="action-btn" @click="loadMessages" :loading="messagesLoading">
                <el-icon><Refresh /></el-icon>
              </el-button>
            </div>
          </div>

          <!-- 消息列表 -->
          <div class="message-list" ref="messageListRef" v-loading="messagesLoading">
            <template v-if="messages.length > 0">
              <template v-for="(message, index) in messages" :key="message.messageId">
                <!-- 日期分隔符 -->
                <div
                  v-if="shouldShowDateSeparator(message, index)"
                  class="date-separator"
                >
                  <span>{{ formatDateSeparator(message.createTime) }}</span>
                </div>

                <!-- 消息气泡 -->
                <div
                  class="message-item"
                  :class="{ 'is-mine': message.sender.userId === currentUserId }"
                >
                  <!-- 对方消息 -->
                  <template v-if="message.sender.userId !== currentUserId">
                    <el-avatar :size="32" :src="buildImageUrl(message.sender.avatar)" class="message-avatar">
                      {{ message.sender.realName?.charAt(0) }}
                    </el-avatar>
                    <div class="message-content">
                      <div class="message-bubble other">
                        {{ message.content }}
                      </div>
                      <span class="message-time">{{ formatMessageTime(message.createTime) }}</span>
                    </div>
                  </template>

                  <!-- 我的消息 -->
                  <template v-else>
                    <div class="message-content">
                      <div class="message-bubble mine">
                        {{ message.content }}
                      </div>
                      <span class="message-time">{{ formatMessageTime(message.createTime) }}</span>
                    </div>
                    <el-avatar :size="32" :src="buildImageUrl(userStore.userInfo?.avatar)" class="message-avatar">
                      {{ userStore.userInfo?.realName?.charAt(0) }}
                    </el-avatar>
                  </template>
                </div>
              </template>
            </template>
            <div v-else-if="!messagesLoading" class="empty-messages">
              <p>暂无消息，发送第一条消息开始聊天吧</p>
            </div>
          </div>

          <!-- 输入区域 -->
          <div class="input-area">
            <div class="input-tools">
              <el-button text class="tool-btn" disabled title="表情（开发中）">
                <el-icon :size="20"><Sunny /></el-icon>
              </el-button>
              <el-button text class="tool-btn" disabled title="图片（开发中）">
                <el-icon :size="20"><Picture /></el-icon>
              </el-button>
              <el-button text class="tool-btn" disabled title="文件（开发中）">
                <el-icon :size="20"><Paperclip /></el-icon>
              </el-button>
            </div>
            <div class="input-box">
              <el-input
                v-model="inputMessage"
                type="textarea"
                :rows="3"
                placeholder="输入消息... (Enter 发送，Shift+Enter 换行)"
                class="message-input"
                @keydown="handleKeydown"
                :disabled="sending"
              />
              <el-button
                type="primary"
                class="send-btn"
                :loading="sending"
                :disabled="!inputMessage.trim()"
                @click="handleSend"
              >
                发送
              </el-button>
            </div>
          </div>
        </template>

        <!-- 未选择会话时的占位 -->
        <div v-else class="no-chat-selected">
          <el-icon class="no-chat-icon"><ChatDotRound /></el-icon>
          <p>选择一个会话开始聊天</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Search,
  Refresh,
  ChatDotRound,
  Sunny,
  Picture,
  Paperclip
} from '@element-plus/icons-vue'
import { listConversations, listMessages, sendChatMessage } from '@/api/chat'
import { buildImageUrl } from '@/api/service'
import { useUserStore } from '@/stores/user'
import { useChatStore } from '@/stores/chat'
import { onWebSocketMessage, MESSAGE_TYPES } from '@/composables/useWebSocket'
import {
  formatChatTime,
  formatMessageTime,
  formatDateSeparator
} from '@/types/chat'
import type { ChatConversation, ChatMessage } from '@/types/chat'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const chatStore = useChatStore()

// 当前用户ID
const currentUserId = computed(() => userStore.userInfo?.id)

// 会话列表
const conversations = ref<ChatConversation[]>([])
const conversationsLoading = ref(false)
const searchKeyword = ref('')

// 筛选后的会话列表
const filteredConversations = computed(() => {
  if (!searchKeyword.value.trim()) {
    return conversations.value
  }
  const keyword = searchKeyword.value.toLowerCase()
  return conversations.value.filter(conv =>
    conv.realName?.toLowerCase().includes(keyword) ||
    conv.lastMessage?.toLowerCase().includes(keyword)
  )
})

// 当前选中的会话
const activeUserId = ref<number | null>(null)
const activeConversation = computed(() =>
  conversations.value.find(c => c.userId === activeUserId.value)
)

// 消息列表
const messages = ref<ChatMessage[]>([])
const messagesLoading = ref(false)
const messageListRef = ref<HTMLElement>()

// 输入框
const inputMessage = ref('')
const sending = ref(false)

// 路由参数
const relatedServiceId = computed(() => route.query.relatedServiceId ? Number(route.query.relatedServiceId) : undefined)
const relatedOrderId = computed(() => route.query.relatedOrderId ? Number(route.query.relatedOrderId) : undefined)

// 加载会话列表
async function loadConversations() {
  conversationsLoading.value = true
  try {
    const result = await listConversations()
    conversations.value = result
    // 同步更新全局 chatStore
    chatStore.conversations = result
  } catch (error) {
    console.error('获取会话列表失败:', error)
  } finally {
    conversationsLoading.value = false
  }
}

// 加载消息列表
async function loadMessages() {
  if (!activeUserId.value) return

  messagesLoading.value = true
  try {
    const result = await listMessages(activeUserId.value, { pageNum: 1, pageSize: 50 })
    // 按时间升序排列
    messages.value = (result.records || []).sort((a, b) =>
      new Date(a.createTime).getTime() - new Date(b.createTime).getTime()
    )
    // 滚动到底部
    await nextTick()
    scrollToBottom()
    // 刷新会话列表以更新未读数
    await loadConversations()
  } catch (error) {
    console.error('获取消息失败:', error)
  } finally {
    messagesLoading.value = false
  }
}

// 选择会话
async function selectConversation(conv: ChatConversation) {
  activeUserId.value = conv.userId
  // 立即清除本地未读数（提升 UX）
  conv.unreadCount = 0
  chatStore.clearConversationUnread(conv.userId)
  // 更新URL
  router.replace({ name: 'ChatWithUser', params: { userId: conv.userId }, query: route.query })
  // 加载消息
  await loadMessages()
}

// 发送消息
async function handleSend() {
  if (!activeUserId.value) {
    ElMessage.warning('请先选择一个会话')
    return
  }

  const content = inputMessage.value.trim()
  if (!content) {
    ElMessage.warning('请输入消息内容')
    return
  }

  sending.value = true
  try {
    await sendChatMessage({
      receiverId: activeUserId.value,
      content,
      messageType: 1,
      relatedServiceId: relatedServiceId.value,
      relatedOrderId: relatedOrderId.value
    })

    // 清空输入框
    inputMessage.value = ''

    // 重新加载消息
    await loadMessages()
  } catch (error: any) {
    console.error('发送消息失败:', error)
    ElMessage.error(error?.message || '发送失败')
  } finally {
    sending.value = false
  }
}

// 键盘事件处理
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSend()
  }
}

// 滚动到底部
function scrollToBottom() {
  if (messageListRef.value) {
    messageListRef.value.scrollTop = messageListRef.value.scrollHeight
  }
}

// 是否显示日期分隔符
function shouldShowDateSeparator(message: ChatMessage, index: number): boolean {
  if (index === 0) return true

  const prevMessage = messages.value[index - 1]
  const prevDate = new Date(prevMessage.createTime).toDateString()
  const currDate = new Date(message.createTime).toDateString()

  return prevDate !== currDate
}

// WebSocket 消息处理
let unsubscribeWs: (() => void) | null = null

function setupWebSocketHandler() {
  unsubscribeWs = onWebSocketMessage((wsMessage) => {
    if (wsMessage.type === MESSAGE_TYPES.NEW_CHAT) {
      handleNewChatMessage(wsMessage.data as ChatMessage)
    }
  })
}

// 处理收到的新聊天消息
async function handleNewChatMessage(newMessage: ChatMessage) {
  // 判断消息是否来自当前会话对方
  const senderId = newMessage.sender?.userId

  if (activeUserId.value && senderId === activeUserId.value) {
    // 当前正在与此人聊天，直接追加消息到列表
    // 检查是否已存在该消息（避免重复）
    const exists = messages.value.some(m => m.messageId === newMessage.messageId)
    if (!exists) {
      messages.value.push(newMessage)
      await nextTick()
      scrollToBottom()
    }
  }

  // 刷新会话列表以更新最后一条消息和时间
  const newConversations = await listConversations()
  conversations.value = newConversations
  chatStore.conversations = newConversations

  // 修复：如果用户正在查看某会话，保持该会话的 unreadCount 为 0
  if (activeUserId.value) {
    const activeConv = conversations.value.find(c => c.userId === activeUserId.value)
    if (activeConv) {
      activeConv.unreadCount = 0
      chatStore.clearConversationUnread(activeUserId.value)
    }
  }
}

onUnmounted(() => {
  // 取消 WebSocket 消息监听
  if (unsubscribeWs) {
    unsubscribeWs()
    unsubscribeWs = null
  }
})

// 初始化
onMounted(async () => {
  // 设置 WebSocket 消息监听
  setupWebSocketHandler()

  // 加载会话列表
  await loadConversations()

  // 如果路由中有 userId，则选中对应会话
  const userId = route.params.userId
  if (userId) {
    const targetUserId = Number(userId)
    activeUserId.value = targetUserId

    // 检查是否已有该会话
    const existingConv = conversations.value.find(c => c.userId === targetUserId)
    if (existingConv) {
      // 加载消息
      await loadMessages()
    } else {
      // 没有历史会话，但仍允许发送消息
      // 可以从其他地方获取用户信息，这里简单处理
      await loadMessages()
    }
  }
})

// 监听路由参数变化
watch(() => route.params.userId, async (newUserId) => {
  if (newUserId && Number(newUserId) !== activeUserId.value) {
    activeUserId.value = Number(newUserId)
    await loadMessages()
  }
})
</script>

<style scoped lang="scss">
.chat-page {
  height: calc(100vh - 64px);
  background-color: #f3f4f6;
  padding: 24px;

  @media (max-width: 768px) {
    padding: 12px;
  }
}

.chat-container {
  max-width: 1200px;
  height: 100%;
  margin: 0 auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  display: flex;
  overflow: hidden;
}

// 左侧会话列表
.conversation-sidebar {
  width: 320px;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  background: #fff;

  @media (max-width: 768px) {
    width: 100%;
    display: none;

    &.show-mobile {
      display: flex;
    }
  }
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .sidebar-title {
    font-size: 20px;
    font-weight: 700;
    color: #1f2937;
    margin: 0;
  }

  .refresh-btn {
    color: #6b7280;

    &:hover {
      color: #4f46e5;
    }
  }
}

.search-box {
  padding: 16px 20px 8px;

  .search-input {
    :deep(.el-input__wrapper) {
      border-radius: 10px;
      background: #f3f4f6;
      box-shadow: none;

      &:hover,
      &.is-focus {
        box-shadow: 0 0 0 1px #4f46e5 inset;
      }
    }
  }
}

.conversation-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.conversation-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f9fafb;
  }

  &.active {
    background: #eef2ff;

    .conv-name {
      color: #4f46e5;
    }
  }

  .avatar-wrapper {
    flex-shrink: 0;

    :deep(.el-avatar) {
      background: #4f46e5;
      color: #fff;
    }
  }

  .conv-info {
    flex: 1;
    min-width: 0;
    margin-left: 12px;
  }

  .conv-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 4px;
  }

  .conv-name {
    font-size: 15px;
    font-weight: 600;
    color: #1f2937;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .conv-time {
    font-size: 12px;
    color: #9ca3af;
    flex-shrink: 0;
    margin-left: 8px;
  }

  .conv-preview {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .preview-text {
    font-size: 13px;
    color: #6b7280;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;

    &.has-unread {
      color: #374151;
      font-weight: 500;
    }
  }

  .unread-badge {
    flex-shrink: 0;
    margin-left: 8px;

    :deep(.el-badge__content) {
      background: #ef4444;
      border: none;
    }
  }
}

.empty-conversations {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #9ca3af;

  .empty-icon {
    font-size: 48px;
    margin-bottom: 12px;
  }

  p {
    font-size: 14px;
    margin: 0;
  }
}

// 右侧聊天窗口
.chat-window {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f9fafb;
  min-width: 0;
}

.chat-header {
  height: 64px;
  padding: 0 24px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .chat-user-info {
    display: flex;
    align-items: center;
    gap: 12px;

    :deep(.el-avatar) {
      background: #4f46e5;
      color: #fff;
    }
  }

  .chat-user-name {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
  }

  .action-btn {
    color: #6b7280;

    &:hover {
      color: #4f46e5;
    }
  }
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.date-separator {
  display: flex;
  justify-content: center;
  margin: 20px 0;

  span {
    font-size: 12px;
    color: #9ca3af;
    background: #e5e7eb;
    padding: 4px 12px;
    border-radius: 12px;
  }
}

.message-item {
  display: flex;
  align-items: flex-end;
  margin-bottom: 16px;

  &.is-mine {
    flex-direction: row-reverse;

    .message-content {
      align-items: flex-end;
    }

    .message-time {
      text-align: right;
    }
  }

  .message-avatar {
    flex-shrink: 0;
    background: #4f46e5;
    color: #fff;
  }

  .message-content {
    display: flex;
    flex-direction: column;
    max-width: 70%;
    margin: 0 12px;
  }

  .message-bubble {
    padding: 12px 16px;
    border-radius: 16px;
    font-size: 14px;
    line-height: 1.5;
    word-break: break-word;

    &.other {
      background: #fff;
      color: #374151;
      border-bottom-left-radius: 4px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    &.mine {
      background: #4f46e5;
      color: #fff;
      border-bottom-right-radius: 4px;
    }
  }

  .message-time {
    font-size: 11px;
    color: #9ca3af;
    margin-top: 4px;
  }
}

.empty-messages {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #9ca3af;
  font-size: 14px;
}

// 输入区域
.input-area {
  background: #fff;
  border-top: 1px solid #e5e7eb;
  padding: 16px 24px;
}

.input-tools {
  display: flex;
  gap: 4px;
  margin-bottom: 12px;

  .tool-btn {
    color: #9ca3af;
    padding: 4px 8px;

    &:hover:not(:disabled) {
      color: #4f46e5;
    }

    &:disabled {
      cursor: not-allowed;
    }
  }
}

.input-box {
  display: flex;
  gap: 16px;

  .message-input {
    flex: 1;

    :deep(.el-textarea__inner) {
      background: #f3f4f6;
      border: none;
      border-radius: 12px;
      padding: 12px 16px;
      resize: none;

      &:focus {
        box-shadow: 0 0 0 2px #4f46e5;
      }
    }
  }

  .send-btn {
    align-self: flex-end;
    background: #4f46e5;
    border-color: #4f46e5;
    padding: 12px 24px;
    border-radius: 10px;
    font-weight: 500;

    &:hover:not(:disabled) {
      background: #4338ca;
      border-color: #4338ca;
    }

    &:disabled {
      background: #c7d2fe;
      border-color: #c7d2fe;
    }
  }
}

// 未选择会话
.no-chat-selected {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9ca3af;

  .no-chat-icon {
    font-size: 64px;
    margin-bottom: 16px;
  }

  p {
    font-size: 16px;
    margin: 0;
  }
}

// 响应式
@media (max-width: 768px) {
  .chat-page {
    height: calc(100vh - 56px);
    padding: 0;
  }

  .chat-container {
    border-radius: 0;
    box-shadow: none;
  }

  .conversation-sidebar {
    width: 100%;
  }

  .chat-header {
    padding: 0 16px;
  }

  .message-list {
    padding: 16px;
  }

  .input-area {
    padding: 12px 16px;
  }

  .input-box {
    gap: 12px;

    .send-btn {
      padding: 10px 16px;
    }
  }
}
</style>
