import request from './request'
import type { PageResult } from '@/types/http'
import type { NotificationItem, NotificationQuery } from '@/types/notification'

/**
 * 获取我的通知列表
 */
export function listMyNotifications(
  params?: NotificationQuery
): Promise<PageResult<NotificationItem>> {
  return request<PageResult<NotificationItem>>({
    url: '/notification/my-notifications',
    method: 'get',
    params: {
      pageNum: params?.pageNum || 1,
      pageSize: params?.pageSize || 10,
      notificationType: params?.notificationType
    }
  })
}

/**
 * 获取未读通知数量
 */
export function getUnreadCount(): Promise<number> {
  return request<number>({
    url: '/notification/unreadCount',
    method: 'get'
  })
}

/**
 * 标记单条通知为已读
 */
export function markNotificationRead(id: number): Promise<void> {
  return request<void>({
    url: `/notification/${id}/read`,
    method: 'post'
  })
}

/**
 * 标记全部通知为已读
 */
export function markAllRead(): Promise<void> {
  return request<void>({
    url: '/notification/readAll',
    method: 'post'
  })
}
