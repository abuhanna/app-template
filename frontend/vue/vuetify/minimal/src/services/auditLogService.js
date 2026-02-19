// src/services/auditLogService.js
import api from './api'

/**
 * @typedef {import('@/types').PagedResult} PagedResult
 * @typedef {import('@/types').SortDirection} SortDirection
 */

/**
 * Parameters for fetching audit logs with pagination
 * @typedef {Object} GetAuditLogsParams
 * @property {number} [page] - Page number (1-indexed)
 * @property {number} [pageSize] - Number of items per page
 * @property {string} [sortBy] - Field to sort by
 * @property {SortDirection} [sortDir] - Sort direction ('asc' or 'desc')
 * @property {string} [search] - Search term
 * @property {string} [entityName] - Filter by entity name
 * @property {string} [action] - Filter by action type
 * @property {string} [fromDate] - Filter from date (ISO string)
 * @property {string} [toDate] - Filter to date (ISO string)
 */

/**
 * Get audit logs with pagination support
 * @param {GetAuditLogsParams} params - Query parameters
 * @returns {Promise<PagedResult>} Promise with paginated audit logs result
 */
export async function getAuditLogs(params = {}) {
  const { data } = await api.get('/audit-logs', { params })
  return data
}

export default {
  getAuditLogs,
}
