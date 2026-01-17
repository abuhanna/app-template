import api from './api'

export interface AuditLog {
  id: number
  entityName: string
  entityId: string
  action: string
  oldValues: string | null
  newValues: string | null
  affectedColumns: string | null
  userId: number | null
  timestamp: string
}

export interface GetAuditLogsParams {
  entityName?: string
  entityId?: string
  userId?: number
  action?: string
  fromDate?: string
  toDate?: string
  page?: number
  pageSize?: number
}

export async function getAuditLogs(params: GetAuditLogsParams = {}): Promise<AuditLog[]> {
  const { data } = await api.get('/audit-logs', { params })
  return data
}

export const auditLogService = {
  getAuditLogs,
}
