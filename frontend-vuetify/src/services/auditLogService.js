import api from './api'

export async function getAuditLogs(params = {}) {
  const { data } = await api.get('/audit-logs', { params })
  return data
}

export default {
  getAuditLogs,
}
