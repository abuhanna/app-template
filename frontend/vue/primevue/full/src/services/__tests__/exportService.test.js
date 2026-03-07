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
import exportService from '../exportService'

describe('Export Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock DOM methods used by handleDownload
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:http://localhost/fake'),
      revokeObjectURL: vi.fn(),
    })
  })

  const mockBlobResponse = {
    data: new Blob(['test'], { type: 'application/octet-stream' }),
    headers: {
      'content-disposition': 'attachment; filename="users.xlsx"',
      'content-type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    },
  }

  it('exportUsers calls api.get with format and filters', async () => {
    vi.mocked(api.get).mockResolvedValue(mockBlobResponse)

    // Mock document methods
    const mockLink = { href: '', download: '', click: vi.fn() }
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink)
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => {})
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => {})

    const result = await exportService.exportUsers('xlsx', { search: 'admin' })

    expect(api.get).toHaveBeenCalledWith(
      expect.stringContaining('/export/users'),
      { responseType: 'blob' }
    )
    expect(result.success).toBe(true)
    expect(result.fileName).toBe('users.xlsx')
  })

  it('exportDepartments calls api.get with format', async () => {
    vi.mocked(api.get).mockResolvedValue(mockBlobResponse)

    const mockLink = { href: '', download: '', click: vi.fn() }
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink)
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => {})
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => {})

    const result = await exportService.exportDepartments('csv')

    expect(api.get).toHaveBeenCalledWith(
      expect.stringContaining('/export/departments'),
      { responseType: 'blob' }
    )
    expect(result.success).toBe(true)
  })

  it('exportAuditLogs calls api.get with format', async () => {
    vi.mocked(api.get).mockResolvedValue(mockBlobResponse)

    const mockLink = { href: '', download: '', click: vi.fn() }
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink)
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => {})
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => {})

    const result = await exportService.exportAuditLogs('xlsx')

    expect(api.get).toHaveBeenCalledWith(
      expect.stringContaining('/export/audit-logs'),
      { responseType: 'blob' }
    )
    expect(result.success).toBe(true)
  })

  it('handleDownload uses fallback filename when no content-disposition', () => {
    const mockLink = { href: '', download: '', click: vi.fn() }
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink)
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => {})
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => {})

    const response = {
      data: new Blob(['data']),
      headers: {
        'content-type': 'application/octet-stream',
      },
    }

    const result = exportService.handleDownload(response)

    expect(result.success).toBe(true)
    expect(result.fileName).toBe('export')
  })
})
