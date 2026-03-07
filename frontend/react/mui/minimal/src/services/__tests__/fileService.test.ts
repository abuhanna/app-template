import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    defaults: {
      baseURL: 'http://localhost:5100/api',
    },
  },
}))

import api from '../api'
import { fileService } from '../fileService'

describe('File Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getFiles', () => {
    it('gets from /files with params', async () => {
      const mockFiles = [{ id: 1, fileName: 'test.pdf' }]
      vi.mocked(api.get).mockResolvedValue({ data: mockFiles })

      const result = await fileService.getFiles({ category: 'docs', page: 1 })

      expect(api.get).toHaveBeenCalledWith('/files', { params: { category: 'docs', page: 1 } })
      expect(result).toEqual(mockFiles)
    })
  })

  describe('getFile', () => {
    it('gets from /files/:id', async () => {
      const mockFile = { id: 1, fileName: 'test.pdf' }
      vi.mocked(api.get).mockResolvedValue({ data: mockFile })

      const result = await fileService.getFile(1)

      expect(api.get).toHaveBeenCalledWith('/files/1')
      expect(result).toEqual(mockFile)
    })
  })

  describe('uploadFile', () => {
    it('posts form data to /files', async () => {
      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' })
      const mockResponse = { id: 1, fileName: 'test.pdf' }
      vi.mocked(api.post).mockResolvedValue({ data: mockResponse })

      const result = await fileService.uploadFile(mockFile, { description: 'A doc', category: 'reports' })

      expect(api.post).toHaveBeenCalledWith('/files', expect.any(FormData), {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('deleteFile', () => {
    it('deletes /files/:id', async () => {
      vi.mocked(api.delete).mockResolvedValue({})

      await fileService.deleteFile(1)

      expect(api.delete).toHaveBeenCalledWith('/files/1')
    })
  })

  describe('getDownloadUrl', () => {
    it('returns correct download URL', () => {
      const url = fileService.getDownloadUrl(42)

      expect(url).toBe('http://localhost:5100/api/files/42/download')
    })
  })
})
