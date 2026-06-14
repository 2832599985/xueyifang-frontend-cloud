/**
 * 通知类型枚举
 * 1=权限批准, 2=服务下架, 3=订单通知, 4=纠纷通知, 5=服务审核通知
 */
export type NotificationType = 1 | 2 | 3 | 4 | 5

/**
 * 通知类型映射表
 */
export const notificationTypeMap: Record<NotificationType, string> = {
  1: '权限通知',
  2: '服务下架',
  3: '订单通知',
  4: '纠纷通知',
  5: '服务审核'
}

/**
 * 通知类型选项（用于筛选下拉框）
 */
export const notificationTypeOptions: { value: NotificationType; label: string }[] = [
  { value: 1, label: '权限通知' },
  { value: 2, label: '服务下架' },
  { value: 3, label: '订单通知' },
  { value: 4, label: '纠纷通知' },
  { value: 5, label: '服务审核' }
]

/**
 * 通知列表项
 */
export interface NotificationItem {
  id: number
  title: string
  content: string
  createTime: string
  isRead: 0 | 1
  notificationType: NotificationType
  relatedId?: number
}

/**
 * 通知查询参数
 */
export interface NotificationQuery {
  pageNum?: number
  pageSize?: number
  notificationType?: NotificationType
}

/**
 * 根据通知类型获取跳转路由
 * @param item 通知项
 * @returns 路由对象或null
 */
export function getNotificationRoute(item: NotificationItem): { path: string } | null {
  if (!item.relatedId) {
    return null
  }

  switch (item.notificationType) {
    case 1: // 权限批准 - 无跳转
      return null
    case 2: // 服务下架 - 跳转到我的服务
      return { path: '/my-services' }
    case 3: // 订单通知 - 跳转到订单详情
      return { path: `/orders/${item.relatedId}` }
    case 4: // 纠纷通知 - 暂无纠纷详情页
      return null
    case 5: // 服务审核 - 跳转到我的服务
      return { path: '/my-services' }
    default:
      return null
  }
}

/**
 * 格式化通知时间
 * @param timeStr 时间字符串
 * @returns 格式化后的时间
 */
export function formatNotificationTime(timeStr: string): string {
  if (!timeStr) return ''

  const date = new Date(timeStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  // 1分钟内
  if (diff < 60 * 1000) {
    return '刚刚'
  }

  // 1小时内
  if (diff < 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 1000))}分钟前`
  }

  // 24小时内
  if (diff < 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 60 * 1000))}小时前`
  }

  // 7天内
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`
  }

  // 超过7天显示日期
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  // 今年不显示年份
  if (year === now.getFullYear()) {
    return `${month}-${day} ${hours}:${minutes}`
  }

  return `${year}-${month}-${day} ${hours}:${minutes}`
}
