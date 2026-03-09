import api from './api'
import type { Notification, ApiResponse } from '@/types'

export async function getMyNotifications(params?: {
  page?: number
  pageSize?: number
  unreadOnly?: boolean
}): Promise<ApiResponse<Notification[]>> {
  const response = await api.get<ApiResponse<Notification[]>>('/notifications', { params })
  return response.data
}

export async function getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
  const response = await api.get<ApiResponse<{ count: number }>>('/notifications/unread-count')
  return response.data
}

export async function markAsRead(id: number): Promise<void> {
  await api.put(`/notifications/${id}/read`)
}

export async function markAllAsRead(): Promise<void> {
  await api.put('/notifications/read-all')
}

export async function deleteNotification(id: number): Promise<void> {
  await api.delete(`/notifications/${id}`)
}
