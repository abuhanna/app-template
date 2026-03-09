import api from './api'

export default {
  async getMyNotifications (params = {}) {
    const response = await api.get('/notifications', { params })
    return response.data
  },

  async getUnreadCount () {
    const response = await api.get('/notifications/unread-count')
    return response.data
  },

  async markAsRead (id) {
    await api.put(`/notifications/${id}/read`)
  },

  async markAllAsRead () {
    await api.put('/notifications/read-all')
  },

  async deleteNotification (id) {
    await api.delete(`/notifications/${id}`)
  },
}
