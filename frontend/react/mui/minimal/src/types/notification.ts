export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  isRead: boolean
  createdAt: string
  userId: string
}

export interface NotificationListResponse {
  data: Notification[]
  total: number
  unreadCount: number
}
