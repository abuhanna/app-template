import api from './api'
import type { NotificationListResponse } from '@/types'

export async function getMyNotifications(params?: {
  limit?: number
}): Promise<NotificationListResponse> {
  const response = await api.get<NotificationListResponse>('/notifications', { params })
  return response.data
}

export async function markAsRead(id: string): Promise<void> {
  await api.patch(`/notifications/${id}/read`)
}

export async function markAllAsRead(): Promise<void> {
  await api.patch('/notifications/read-all')
}
