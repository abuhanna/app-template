import { beforeEach, describe, expect, it, vi } from 'vitest'

import api from '../api'
import { getAuditLogs } from '../auditLogService'

vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('Audit Log Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getAuditLogs calls api.get with params', async () => {
    const params = { page: 1, pageSize: 10, entityName: 'User' }
    const mockData = { items: [], pagination: {} }
    vi.mocked(api.get).mockResolvedValue({ data: mockData })

    const result = await getAuditLogs(params)

    expect(api.get).toHaveBeenCalledWith('/audit-logs', { params })
    expect(result).toEqual(mockData)
  })

  it('getAuditLogs uses empty params by default', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { items: [] } })

    await getAuditLogs()

    expect(api.get).toHaveBeenCalledWith('/audit-logs', { params: {} })
  })
})
