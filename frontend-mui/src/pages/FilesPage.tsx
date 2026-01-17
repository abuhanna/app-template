import { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  CircularProgress,
} from '@mui/material'
import { Upload as UploadIcon, Download as DownloadIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { useToastStore } from '@/stores'
import { ConfirmDialog } from '@/components'
import fileService, { UploadedFile, UploadFileMetadata } from '@/services/fileService'

export function FilesPage() {
  const showSuccess = useToastStore((state) => state.showSuccess)
  const showError = useToastStore((state) => state.showError)

  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadForm, setUploadForm] = useState<UploadFileMetadata>({ description: '', category: '', isPublic: false })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [fileToDelete, setFileToDelete] = useState<UploadedFile | null>(null)

  const loadFiles = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fileService.getFiles()
      setFiles(data || [])
    } catch {
      showError('Failed to load files')
    } finally {
      setLoading(false)
    }
  }, [showError])

  useEffect(() => {
    loadFiles()
  }, [loadFiles])

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    try {
      await fileService.uploadFile(selectedFile, uploadForm)
      showSuccess('File uploaded successfully')
      setShowUploadDialog(false)
      setSelectedFile(null)
      setUploadForm({ description: '', category: '', isPublic: false })
      loadFiles()
    } catch {
      showError('Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!fileToDelete) return

    try {
      await fileService.deleteFile(fileToDelete.id)
      showSuccess('File deleted successfully')
      setDeleteDialogOpen(false)
      setFileToDelete(null)
      loadFiles()
    } catch {
      showError('Failed to delete file')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">File Management</Typography>
          <Button variant="contained" startIcon={<UploadIcon />} onClick={() => setShowUploadDialog(true)}>
            Upload File
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Public</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(files || []).map((file) => (
                  <TableRow key={file.id}>
                    <TableCell>{file.originalFileName}</TableCell>
                    <TableCell>{file.contentType}</TableCell>
                    <TableCell>{formatFileSize(file.fileSize)}</TableCell>
                    <TableCell>{file.category || '-'}</TableCell>
                    <TableCell>
                      <Chip label={file.isPublic ? 'Public' : 'Private'} color={file.isPublic ? 'success' : 'default'} size="small" />
                    </TableCell>
                    <TableCell>{new Date(file.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => window.open(fileService.getDownloadUrl(file.id), '_blank')}>
                        <DownloadIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => { setFileToDelete(file); setDeleteDialogOpen(true) }}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onClose={() => setShowUploadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload File</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <input type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
          </Box>
          <TextField
            fullWidth
            margin="normal"
            label="Description"
            value={uploadForm.description}
            onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Category"
            value={uploadForm.category}
            onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
          />
          <FormControlLabel
            control={<Switch checked={uploadForm.isPublic} onChange={(e) => setUploadForm({ ...uploadForm, isPublic: e.target.checked })} />}
            label="Public"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUploadDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpload} disabled={!selectedFile || uploading}>
            {uploading ? <CircularProgress size={24} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete File"
        message={`Are you sure you want to delete "${fileToDelete?.originalFileName}"?`}
        confirmText="Delete"
        confirmColor="error"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </Box>
  )
}

export default FilesPage
