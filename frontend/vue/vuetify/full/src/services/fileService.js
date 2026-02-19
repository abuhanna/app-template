import api from './api'

export const fileService = {
  async getFiles(params = {}) {
    const { data } = await api.get('/files', { params })
    return data
  },

  async getFile(id) {
    const { data } = await api.get(`/files/${id}`)
    return data
  },

  async uploadFile(file, metadata = {}) {
    const formData = new FormData()
    formData.append('file', file)
    if (metadata.description) formData.append('description', metadata.description)
    if (metadata.category) formData.append('category', metadata.category)
    if (metadata.isPublic !== undefined) formData.append('isPublic', metadata.isPublic)

    const { data } = await api.post('/files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async deleteFile(id) {
    await api.delete(`/files/${id}`)
  },

  getDownloadUrl(id) {
    return `${api.defaults.baseURL}/files/${id}/download`
  },
}

export default fileService
