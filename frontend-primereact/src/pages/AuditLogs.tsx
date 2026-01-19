import { useState, useEffect, useCallback } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { Dropdown } from 'primereact/dropdown'
import { Tag } from 'primereact/tag'
import { Card } from 'primereact/card'
import { Divider } from 'primereact/divider'
import { useNotificationStore } from '@/stores/notificationStore'
import { getAuditLogs, type AuditLog } from '@/services/auditLogService'

export default function AuditLogs() {
  const showError = useNotificationStore((state) => state.showError)

  const [loading, setLoading] = useState(false)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])

  // Filters
  const [entityFilter, setEntityFilter] = useState<string | null>(null)
  const [actionFilter, setActionFilter] = useState<string | null>(null)

  // Details dialog
  const [detailsVisible, setDetailsVisible] = useState(false)
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)

  const entityOptions = ['User', 'Department', 'UploadedFile']
  const actionOptions = ['Created', 'Updated', 'Deleted']

  const loadAuditLogs = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = {}
      if (entityFilter) params.entityName = entityFilter
      if (actionFilter) params.action = actionFilter
      const result = await getAuditLogs(params)
      setAuditLogs(result.items || [])
    } catch {
      showError('Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }, [entityFilter, actionFilter, showError])

  useEffect(() => {
    loadAuditLogs()
  }, [loadAuditLogs])

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getActionSeverity = (action: string): 'success' | 'info' | 'danger' | 'secondary' => {
    switch (action?.toLowerCase()) {
      case 'created':
        return 'success'
      case 'updated':
        return 'info'
      case 'deleted':
        return 'danger'
      default:
        return 'secondary'
    }
  }

  const formatJson = (jsonString: string | null): string | null => {
    if (!jsonString) return null
    try {
      return JSON.stringify(JSON.parse(jsonString), null, 2)
    } catch {
      return jsonString
    }
  }

  const showDetails = (log: AuditLog) => {
    setSelectedLog(log)
    setDetailsVisible(true)
  }

  const actionTemplate = (log: AuditLog) => (
    <Tag value={log.action} severity={getActionSeverity(log.action)} />
  )

  const timestampTemplate = (log: AuditLog) => formatDate(log.timestamp)

  const userIdTemplate = (log: AuditLog) => log.userId || '-'

  const actionsTemplate = (log: AuditLog) => (
    <Button
      icon="pi pi-eye"
      rounded
      text
      severity="info"
      onClick={() => showDetails(log)}
      tooltip="View Details"
      tooltipOptions={{ position: 'top' }}
    />
  )

  const renderHeader = () => (
    <div className="flex flex-wrap align-items-center justify-content-between gap-2">
      <div className="flex align-items-center gap-2">
        <i className="pi pi-history text-xl"></i>
        <span className="text-xl font-semibold">Audit Logs</span>
      </div>
      <Button
        icon="pi pi-refresh"
        rounded
        text
        onClick={loadAuditLogs}
        loading={loading}
      />
    </div>
  )

  const emptyMessage = (
    <div className="flex flex-column align-items-center p-5 text-color-secondary">
      <i className="pi pi-history text-5xl mb-3"></i>
      <span>No audit logs found</span>
    </div>
  )

  const dialogFooter = (
    <Button label="Close" onClick={() => setDetailsVisible(false)} />
  )

  return (
    <div className="p-3">
      <Card>
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <Dropdown
            value={entityFilter}
            options={entityOptions}
            onChange={(e) => setEntityFilter(e.value)}
            placeholder="Filter by Entity"
            showClear
            className="w-12rem"
          />
          <Dropdown
            value={actionFilter}
            options={actionOptions}
            onChange={(e) => setActionFilter(e.value)}
            placeholder="Filter by Action"
            showClear
            className="w-12rem"
          />
          <Button label="Apply" icon="pi pi-filter" onClick={loadAuditLogs} />
        </div>

        <DataTable
          value={auditLogs}
          loading={loading}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25, 50]}
          dataKey="id"
          header={renderHeader()}
          emptyMessage={emptyMessage}
          stripedRows
        >
          <Column field="entityName" header="Entity" sortable style={{ minWidth: '120px' }} />
          <Column field="entityId" header="Entity ID" sortable style={{ minWidth: '100px' }} />
          <Column header="Action" body={actionTemplate} sortable style={{ minWidth: '100px' }} />
          <Column header="User ID" body={userIdTemplate} sortable style={{ minWidth: '100px' }} />
          <Column header="Timestamp" body={timestampTemplate} sortable style={{ minWidth: '180px' }} />
          <Column header="Details" body={actionsTemplate} style={{ minWidth: '80px' }} />
        </DataTable>
      </Card>

      {/* Details Dialog */}
      <Dialog
        header="Audit Log Details"
        visible={detailsVisible}
        onHide={() => setDetailsVisible(false)}
        footer={dialogFooter}
        style={{ width: '50rem' }}
        modal
      >
        {selectedLog && (
          <div className="flex flex-column gap-3">
            <div className="grid">
              <div className="col-6">
                <strong>Entity:</strong> {selectedLog.entityName}
              </div>
              <div className="col-6">
                <strong>Entity ID:</strong> {selectedLog.entityId}
              </div>
              <div className="col-6">
                <strong>Action:</strong>{' '}
                <Tag value={selectedLog.action} severity={getActionSeverity(selectedLog.action)} />
              </div>
              <div className="col-6">
                <strong>User ID:</strong> {selectedLog.userId || '-'}
              </div>
              <div className="col-12">
                <strong>Timestamp:</strong> {formatDate(selectedLog.timestamp)}
              </div>
            </div>

            <Divider />

            {selectedLog.oldValues && (
              <div>
                <strong>Old Values:</strong>
                <div className="surface-100 p-3 border-round mt-2" style={{ overflow: 'auto' }}>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                    {formatJson(selectedLog.oldValues)}
                  </pre>
                </div>
              </div>
            )}

            {selectedLog.newValues && (
              <div>
                <strong>New Values:</strong>
                <div className="surface-100 p-3 border-round mt-2" style={{ overflow: 'auto' }}>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                    {formatJson(selectedLog.newValues)}
                  </pre>
                </div>
              </div>
            )}

            {selectedLog.affectedColumns && (
              <div>
                <strong>Affected Columns:</strong>
                <div className="surface-100 p-3 border-round mt-2">
                  <pre style={{ margin: 0 }}>{formatJson(selectedLog.affectedColumns)}</pre>
                </div>
              </div>
            )}
          </div>
        )}
      </Dialog>
    </div>
  )
}
