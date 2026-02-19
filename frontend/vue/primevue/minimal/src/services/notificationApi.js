import api from './api'

export default {
  getMyNotifications (params = {}) {
    return api.get('/notifications', { params })
  },

  markAsRead (id) {
    return api.put(`/notifications/${id}/read`)
  },
  markAllAsRead () {
    return api.put('/notifications/read-all')
  },
}
