import api from './api'

export interface UploadedFile {
  id: number
  fileName: string
  originalFileName: string
  contentType: string
  fileSize: number
  description: string | null
  category: string | null
  isPublic: boolean
  createdAt: string
  updatedAt: string | null
  createdBy: string | null
  downloadUrl: string
}

export interface UploadFileMetadata {
  description?: string
  category?: string
  isPublic?: boolean
}

export const fileService = {
  async getFiles(params?: { category?: string; isPublic?: boolean; page?: number; pageSize?: number }): Promise<UploadedFile[]> {
    const { data } = await api.get('/files', { params })
    return data
  },

  async getFile(id: number): Promise<UploadedFile> {
    const { data } = await api.get(`/files/${id}`)
    return data
  },

  async uploadFile(file: File, metadata: UploadFileMetadata = {}): Promise<UploadedFile> {
    const formData = new FormData()
    formData.append('file', file)
    if (metadata.description) formData.append('description', metadata.description)
    if (metadata.category) formData.append('category', metadata.category)
    if (metadata.isPublic !== undefined) formData.append('isPublic', String(metadata.isPublic))

    const { data } = await api.post('/files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async deleteFile(id: number): Promise<void> {
    await api.delete(`/files/${id}`)
  },

  getDownloadUrl(id: number): string {
    return `${api.defaults.baseURL}/files/${id}/download`
  },
}

export default fileService
