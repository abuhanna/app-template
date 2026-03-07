import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

// Mock DOM APIs used by handleDownload
const mockCreateObjectURL = vi.fn(() => 'blob:http://localhost/fake')
const mockRevokeObjectURL = vi.fn()
const mockAppendChild = vi.fn()
const mockRemoveChild = vi.fn()
const mockClick = vi.fn()

vi.stubGlobal('URL', { createObjectURL: mockCreateObjectURL, revokeObjectURL: mockRevokeObjectURL })

vi.spyOn(document.body, 'appendChild').mockImplementation(mockAppendChild)
vi.spyOn(document.body, 'removeChild').mockImplementation(mockRemoveChild)
vi.spyOn(document, 'createElement').mockReturnValue({
  href: '',
  download: '',
  click: mockClick,
  style: {},
} as any)

import api from '../api'
import exportService from '../exportService'

describe('Export Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('exportUsers', () => {
    it('gets from /export/users with format and triggers download', async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: new Blob(['data']),
        headers: {
          'content-disposition': 'attachment; filename="users.xlsx"',
          'content-type': 'application/vnd.openxmlformats',
        },
      })

      const result = await exportService.exportUsers('xlsx')

      expect(api.get).toHaveBeenCalledWith(expect.stringContaining('/export/users'), { responseType: 'blob' })
      expect(result.success).toBe(true)
      expect(result.fileName).toBe('users.xlsx')
    })
  })

  describe('exportDepartments', () => {
    it('gets from /export/departments and triggers download', async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: new Blob(['data']),
        headers: {
          'content-disposition': 'attachment; filename="departments.csv"',
          'content-type': 'text/csv',
        },
      })

      const result = await exportService.exportDepartments('csv')

      expect(api.get).toHaveBeenCalledWith(expect.stringContaining('/export/departments'), { responseType: 'blob' })
      expect(result.success).toBe(true)
      expect(result.fileName).toBe('departments.csv')
    })
  })

  describe('exportAuditLogs', () => {
    it('gets from /export/audit-logs and triggers download', async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: new Blob(['data']),
        headers: {
          'content-disposition': 'attachment; filename="audit-logs.xlsx"',
          'content-type': 'application/vnd.openxmlformats',
        },
      })

      const result = await exportService.exportAuditLogs()

      expect(api.get).toHaveBeenCalledWith(expect.stringContaining('/export/audit-logs'), { responseType: 'blob' })
      expect(result.success).toBe(true)
    })
  })

  describe('handleDownload', () => {
    it('uses fallback filename when content-disposition is missing', () => {
      const result = exportService.handleDownload({
        data: new Blob(['data']),
        headers: {
          'content-type': 'application/octet-stream',
        },
      })

      expect(result.success).toBe(true)
      expect(result.fileName).toBe('export')
    })
  })
})
