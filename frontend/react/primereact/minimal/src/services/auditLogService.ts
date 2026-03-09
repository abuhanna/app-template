import api from './api'
import type { ApiResponse, SortDirection } from '@/types'

export interface AuditLog {
  id: number
  action: string
  entityType: string
  entityId?: string
  userId?: string
  userName?: string
  details?: string
  ipAddress?: string
  createdAt: string
}

export interface GetAuditLogsParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: SortDirection
  search?: string
  entityType?: string
  entityId?: string
  userId?: string
  action?: string
  fromDate?: string
  toDate?: string
}

export async function getAuditLogs(
  params: GetAuditLogsParams = {}
): Promise<ApiResponse<AuditLog[]>> {
  const { data } = await api.get<ApiResponse<AuditLog[]>>('/audit-logs', { params })
  return data
}

export const auditLogService = {
  getAuditLogs,
}
