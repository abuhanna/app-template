import api from './api'

const exportService = {
  async exportUsers(format = 'xlsx', filters = {}) {
    const params = new URLSearchParams({ format, ...filters })
    const response = await api.get(`/export/users?${params}`, {
      responseType: 'blob',
    })
    return this.handleDownload(response)
  },

  async exportDepartments(format = 'xlsx', filters = {}) {
    const params = new URLSearchParams({ format, ...filters })
    const response = await api.get(`/export/departments?${params}`, {
      responseType: 'blob',
    })
    return this.handleDownload(response)
  },

  async exportAuditLogs(format = 'xlsx', filters = {}) {
    const params = new URLSearchParams({ format, ...filters })
    const response = await api.get(`/export/audit-logs?${params}`, {
      responseType: 'blob',
    })
    return this.handleDownload(response)
  },

  handleDownload(response) {
    const contentDisposition = response.headers['content-disposition']
    let fileName = 'export'

    if (contentDisposition) {
      const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      if (match && match[1]) {
        fileName = match[1].replace(/['"]/g, '')
      }
    }

    const blob = new Blob([response.data], { type: response.headers['content-type'] })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    return { success: true, fileName }
  },
}

export default exportService
