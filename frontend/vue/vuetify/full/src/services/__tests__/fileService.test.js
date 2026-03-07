import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    defaults: { baseURL: 'http://localhost:5100/api' },
  },
}))

import api from '../api'
import { fileService } from '../fileService'

describe('File Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getFiles calls api.get with params', async () => {
    const params = { page: 1 }
    const mockData = { items: [] }
    vi.mocked(api.get).mockResolvedValue({ data: mockData })

    const result = await fileService.getFiles(params)

    expect(api.get).toHaveBeenCalledWith('/files', { params })
    expect(result).toEqual(mockData)
  })

  it('getFile calls api.get with file id', async () => {
    const mockFile = { id: 1, name: 'doc.pdf' }
    vi.mocked(api.get).mockResolvedValue({ data: mockFile })

    const result = await fileService.getFile(1)

    expect(api.get).toHaveBeenCalledWith('/files/1')
    expect(result).toEqual(mockFile)
  })

  it('uploadFile sends FormData with file and metadata', async () => {
    const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' })
    const metadata = { description: 'Test file', category: 'docs', isPublic: true }
    vi.mocked(api.post).mockResolvedValue({ data: { id: 1, name: 'test.txt' } })

    const result = await fileService.uploadFile(mockFile, metadata)

    expect(api.post).toHaveBeenCalledWith('/files', expect.any(FormData), {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    expect(result).toEqual({ id: 1, name: 'test.txt' })
  })

  it('deleteFile calls api.delete with id', async () => {
    vi.mocked(api.delete).mockResolvedValue(undefined)

    await fileService.deleteFile(1)

    expect(api.delete).toHaveBeenCalledWith('/files/1')
  })

  it('getDownloadUrl returns correct URL', () => {
    const url = fileService.getDownloadUrl(42)

    expect(url).toBe('http://localhost:5100/api/files/42/download')
  })
})
