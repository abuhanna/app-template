import { useState, useEffect, useCallback } from 'react'
import { DataTable, DataTablePageEvent, DataTableSortEvent } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { Dropdown } from 'primereact/dropdown'
import { Tag } from 'primereact/tag'
import { Card } from 'primereact/card'
import { Divider } from 'primereact/divider'
import { useNotificationStore } from '@/stores/notificationStore'
import { getAuditLogs, type AuditLog, type GetAuditLogsParams } from '@/services/auditLogService'

export default function AuditLogs() {
  const showError = useNotificationStore((state) => state.showError)

  const [loading, setLoading] = useState(false)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [totalItems, setTotalItems] = useState(0)

  // Pagination
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

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
      const params: GetAuditLogsParams = {
        page,
        pageSize,
        sortBy,
        sortOrder,
      }
      if (entityFilter) params.entityType = entityFilter
      if (actionFilter) params.action = actionFilter
      const result = await getAuditLogs(params)
      setAuditLogs(result.data || [])
      setTotalItems(result.pagination?.totalItems || 0)
    } catch {
      showError('Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, sortBy, sortOrder, entityFilter, actionFilter, showError])

  useEffect(() => {
    loadAuditLogs()
  }, [loadAuditLogs])

  const onPageChange = (event: DataTablePageEvent) => {
    setPage((event.page ?? 0) + 1)
    setPageSize(event.rows)
  }

  const onSort = (event: DataTableSortEvent) => {
    if (event.sortField) {
      setSortBy(event.sortField as string)
      setSortOrder(event.sortOrder === 1 ? 'asc' : 'desc')
      setPage(1)
    }
  }

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

  const showDetails = (log: AuditLog) => {
    setSelectedLog(log)
    setDetailsVisible(true)
  }

  const actionTemplate = (log: AuditLog) => (
    <Tag value={log.action} severity={getActionSeverity(log.action)} />
  )

  const createdAtTemplate = (log: AuditLog) => formatDate(log.createdAt)

  const userNameTemplate = (log: AuditLog) => log.userName || log.userId || '-'

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
            onChange={(e) => { setEntityFilter(e.value); setPage(1) }}
            placeholder="Filter by Entity"
            showClear
            className="w-12rem"
          />
          <Dropdown
            value={actionFilter}
            options={actionOptions}
            onChange={(e) => { setActionFilter(e.value); setPage(1) }}
            placeholder="Filter by Action"
            showClear
            className="w-12rem"
          />
        </div>

        <DataTable
          value={auditLogs}
          loading={loading}
          lazy
          paginator
          rows={pageSize}
          totalRecords={totalItems}
          first={(page - 1) * pageSize}
          onPage={onPageChange}
          onSort={onSort}
          sortField={sortBy}
          sortOrder={sortOrder === 'asc' ? 1 : -1}
          rowsPerPageOptions={[5, 10, 25, 50]}
          dataKey="id"
          header={renderHeader()}
          emptyMessage={emptyMessage}
          stripedRows
        >
          <Column field="entityType" header="Entity" sortable style={{ minWidth: '120px' }} />
          <Column field="entityId" header="Entity ID" sortable style={{ minWidth: '100px' }} />
          <Column field="action" header="Action" body={actionTemplate} sortable style={{ minWidth: '100px' }} />
          <Column header="User" body={userNameTemplate} sortable field="userName" style={{ minWidth: '120px' }} />
          <Column header="Timestamp" body={createdAtTemplate} sortable field="createdAt" style={{ minWidth: '180px' }} />
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
                <strong>Entity:</strong> {selectedLog.entityType}
              </div>
              <div className="col-6">
                <strong>Entity ID:</strong> {selectedLog.entityId}
              </div>
              <div className="col-6">
                <strong>Action:</strong>{' '}
                <Tag value={selectedLog.action} severity={getActionSeverity(selectedLog.action)} />
              </div>
              <div className="col-6">
                <strong>User:</strong> {selectedLog.userName || selectedLog.userId || '-'}
              </div>
              <div className="col-6">
                <strong>Timestamp:</strong> {formatDate(selectedLog.createdAt)}
              </div>
              {selectedLog.ipAddress && (
                <div className="col-6">
                  <strong>IP Address:</strong> {selectedLog.ipAddress}
                </div>
              )}
            </div>

            {selectedLog.details && (
              <>
                <Divider />
                <div>
                  <strong>Details:</strong>
                  <div className="surface-100 p-3 border-round mt-2" style={{ overflow: 'auto' }}>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                      {selectedLog.details}
                    </pre>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </Dialog>
    </div>
  )
}
