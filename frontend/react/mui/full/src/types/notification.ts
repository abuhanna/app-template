export interface Notification {
  id: number
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  referenceId?: string
  referenceType?: string
  isRead: boolean
  createdAt: string
}
