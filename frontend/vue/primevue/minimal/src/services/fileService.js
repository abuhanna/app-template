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

  async downloadFile(id, fileName) {
    const response = await api.get(`/files/${id}/download`, {
      responseType: 'blob',
    })
    
    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', fileName) // Set the file name
    document.body.appendChild(link)
    link.click()
    
    // Clean up
    link.parentNode.removeChild(link)
    window.URL.revokeObjectURL(url)
  },
}

export default fileService
