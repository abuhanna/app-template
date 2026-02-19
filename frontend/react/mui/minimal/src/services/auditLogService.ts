import api from './api'
import type { PagedResult, SortDirection } from '@/types'

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
  page?: number
  pageSize?: number
  sortBy?: string
  sortDir?: SortDirection
  search?: string
  entityName?: string
  entityId?: string
  userId?: number
  action?: string
  fromDate?: string
  toDate?: string
}

export async function getAuditLogs(
  params: GetAuditLogsParams = {}
): Promise<PagedResult<AuditLog>> {
  const { data } = await api.get<PagedResult<AuditLog>>('/audit-logs', { params })
  return data
}

export const auditLogService = {
  getAuditLogs,
}
