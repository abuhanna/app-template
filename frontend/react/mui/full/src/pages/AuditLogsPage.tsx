import { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  CircularProgress,
  Divider,
} from '@mui/material'
import {
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  History as HistoryIcon,
} from '@mui/icons-material'
import { useNotificationStore } from '@/stores/notificationStore'
import { getAuditLogs, type AuditLog, type GetAuditLogsParams } from '@/services/auditLogService'

export default function AuditLogsPage() {
  const showError = useNotificationStore((state) => state.showError)

  const [loading, setLoading] = useState(false)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [totalItems, setTotalItems] = useState(0)

  // Filters
  const [entityFilter, setEntityFilter] = useState('')
  const [actionFilter, setActionFilter] = useState('')

  // Details dialog
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)

  const entityOptions = ['User', 'Department', 'UploadedFile']
  const actionOptions = ['create', 'update', 'delete']

  const loadAuditLogs = useCallback(async () => {
    setLoading(true)
    try {
      const params: GetAuditLogsParams = {
        page: page + 1,
        pageSize: rowsPerPage,
        ...(entityFilter && { entityType: entityFilter }),
        ...(actionFilter && { action: actionFilter }),
      }
      const result = await getAuditLogs(params)
      setAuditLogs(result.data || [])
      setTotalItems(result.pagination?.totalItems ?? 0)
    } catch {
      showError('Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }, [entityFilter, actionFilter, page, rowsPerPage, showError])

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

  const getActionColor = (action: string): 'success' | 'info' | 'error' | 'default' => {
    switch (action?.toLowerCase()) {
      case 'create':
        return 'success'
      case 'update':
        return 'info'
      case 'delete':
        return 'error'
      default:
        return 'default'
    }
  }

  const handleShowDetails = (log: AuditLog) => {
    setSelectedLog(log)
    setDetailsOpen(true)
  }

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <HistoryIcon />
              <Typography variant="h5">Audit Logs</Typography>
            </Box>
            <IconButton onClick={loadAuditLogs} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Box>

          {/* Filters */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Entity Type</InputLabel>
              <Select
                value={entityFilter}
                label="Entity Type"
                onChange={(e) => { setEntityFilter(e.target.value); setPage(0) }}
              >
                <MenuItem value="">All</MenuItem>
                {entityOptions.map((opt) => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Action</InputLabel>
              <Select
                value={actionFilter}
                label="Action"
                onChange={(e) => { setActionFilter(e.target.value); setPage(0) }}
              >
                <MenuItem value="">All</MenuItem>
                {actionOptions.map((opt) => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button variant="contained" onClick={loadAuditLogs}>
              Apply
            </Button>
          </Box>

          {/* Table */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Entity Type</TableCell>
                      <TableCell>Entity ID</TableCell>
                      <TableCell>Action</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Details</TableCell>
                      <TableCell>Created At</TableCell>
                      <TableCell align="center">View</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {auditLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                          <HistoryIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                          <Typography color="text.secondary">No audit logs found</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      auditLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>{log.entityType}</TableCell>
                          <TableCell>{log.entityId || '-'}</TableCell>
                          <TableCell>
                            <Chip label={log.action} color={getActionColor(log.action)} size="small" />
                          </TableCell>
                          <TableCell>{log.userName || log.userId || '-'}</TableCell>
                          <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {log.details || '-'}
                          </TableCell>
                          <TableCell>{formatDate(log.createdAt)}</TableCell>
                          <TableCell align="center">
                            <IconButton size="small" onClick={() => handleShowDetails(log)}>
                              <VisibilityIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={totalItems}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Audit Log Details</DialogTitle>
        <DialogContent dividers>
          {selectedLog && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Typography><strong>Entity Type:</strong> {selectedLog.entityType}</Typography>
                <Typography><strong>Entity ID:</strong> {selectedLog.entityId || '-'}</Typography>
                <Typography>
                  <strong>Action:</strong>{' '}
                  <Chip label={selectedLog.action} color={getActionColor(selectedLog.action)} size="small" />
                </Typography>
                <Typography><strong>User:</strong> {selectedLog.userName || selectedLog.userId || '-'}</Typography>
                <Typography sx={{ gridColumn: '1 / -1' }}>
                  <strong>Created At:</strong> {formatDate(selectedLog.createdAt)}
                </Typography>
              </Box>

              <Divider />

              {selectedLog.details && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Details:</Typography>
                  <Paper sx={{ p: 2, bgcolor: 'grey.100', overflow: 'auto' }}>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                      {selectedLog.details}
                    </pre>
                  </Paper>
                </Box>
              )}

              {selectedLog.ipAddress && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>IP Address:</Typography>
                  <Typography>{selectedLog.ipAddress}</Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
