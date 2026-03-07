import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

import api from '../api'
import { getAuditLogs } from '../auditLogService'

describe('Audit Log Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAuditLogs', () => {
    it('gets from /audit-logs with params', async () => {
      const mockData = {
        items: [{ id: 1, entityName: 'User', action: 'Create', timestamp: '2024-01-01' }],
        pagination: { page: 1, pageSize: 10, totalItems: 1, totalPages: 1 },
      }
      vi.mocked(api.get).mockResolvedValue({ data: mockData })

      const params = { page: 1, pageSize: 10, entityName: 'User' }
      const result = await getAuditLogs(params)

      expect(api.get).toHaveBeenCalledWith('/audit-logs', { params })
      expect(result).toEqual(mockData)
    })

    it('gets from /audit-logs with default empty params', async () => {
      const mockData = { items: [], pagination: {} }
      vi.mocked(api.get).mockResolvedValue({ data: mockData })

      const result = await getAuditLogs()

      expect(api.get).toHaveBeenCalledWith('/audit-logs', { params: {} })
      expect(result).toEqual(mockData)
    })
  })
})
