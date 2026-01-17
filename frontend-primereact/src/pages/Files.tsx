import { useState, useEffect, useCallback, useRef } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { InputSwitch } from 'primereact/inputswitch'
import { Tag } from 'primereact/tag'
import { Card } from 'primereact/card'
import { FileUpload, FileUploadHandlerEvent } from 'primereact/fileupload'
import { ConfirmDialog } from '@/components'
import { useNotificationStore } from '@/stores/notificationStore'
import { fileService, type UploadedFile, type UploadFileMetadata } from '@/services/fileService'

export default function Files() {
  const showSuccess = useNotificationStore((state) => state.showSuccess)
  const showError = useNotificationStore((state) => state.showError)
  const fileUploadRef = useRef<FileUpload>(null)

  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [dialogVisible, setDialogVisible] = useState(false)
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileToDelete, setFileToDelete] = useState<UploadedFile | null>(null)
  const [uploadForm, setUploadForm] = useState<UploadFileMetadata>({
    description: '',
    category: '',
    isPublic: false,
  })

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

  const handleFileSelect = (e: FileUploadHandlerEvent) => {
    if (e.files && e.files.length > 0) {
      setSelectedFile(e.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    try {
      await fileService.uploadFile(selectedFile, uploadForm)
      showSuccess('File uploaded successfully')
      setDialogVisible(false)
      setSelectedFile(null)
      setUploadForm({ description: '', category: '', isPublic: false })
      fileUploadRef.current?.clear()
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
      setDeleteDialogVisible(false)
      setFileToDelete(null)
      loadFiles()
    } catch {
      showError('Failed to delete file')
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const openUploadDialog = () => {
    setSelectedFile(null)
    setUploadForm({ description: '', category: '', isPublic: false })
    setDialogVisible(true)
  }

  const openDeleteDialog = (file: UploadedFile) => {
    setFileToDelete(file)
    setDeleteDialogVisible(true)
  }

  const sizeTemplate = (file: UploadedFile) => formatFileSize(file.fileSize)

  const statusTemplate = (file: UploadedFile) => (
    <Tag
      value={file.isPublic ? 'Public' : 'Private'}
      severity={file.isPublic ? 'success' : 'secondary'}
    />
  )

  const dateTemplate = (file: UploadedFile) => formatDate(file.createdAt)

  const actionsTemplate = (file: UploadedFile) => (
    <div className="flex gap-1">
      <Button
        icon="pi pi-download"
        rounded
        text
        severity="info"
        onClick={() => window.open(fileService.getDownloadUrl(file.id), '_blank')}
        tooltip="Download"
        tooltipOptions={{ position: 'top' }}
      />
      <Button
        icon="pi pi-trash"
        rounded
        text
        severity="danger"
        onClick={() => openDeleteDialog(file)}
        tooltip="Delete"
        tooltipOptions={{ position: 'top' }}
      />
    </div>
  )

  const renderHeader = () => (
    <div className="flex flex-wrap align-items-center justify-content-between gap-2">
      <span className="text-xl font-semibold">File Management</span>
      <Button label="Upload File" icon="pi pi-upload" onClick={openUploadDialog} />
    </div>
  )

  const emptyMessage = (
    <div className="flex flex-column align-items-center p-5 text-color-secondary">
      <i className="pi pi-file text-5xl mb-3"></i>
      <span>No files found</span>
    </div>
  )

  const dialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button label="Cancel" severity="secondary" onClick={() => setDialogVisible(false)} />
      <Button
        label="Upload"
        icon="pi pi-upload"
        onClick={handleUpload}
        loading={uploading}
        disabled={!selectedFile}
      />
    </div>
  )

  return (
    <div className="p-3">
      <Card>
        <DataTable
          value={files}
          loading={loading}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25, 50]}
          dataKey="id"
          header={renderHeader()}
          emptyMessage={emptyMessage}
          stripedRows
        >
          <Column field="originalFileName" header="Name" sortable style={{ minWidth: '200px' }} />
          <Column field="contentType" header="Type" sortable style={{ minWidth: '150px' }} />
          <Column header="Size" body={sizeTemplate} sortable style={{ minWidth: '100px' }} />
          <Column
            field="category"
            header="Category"
            body={(data) => data.category || '-'}
            style={{ minWidth: '120px' }}
          />
          <Column header="Public" body={statusTemplate} style={{ minWidth: '100px' }} />
          <Column header="Created" body={dateTemplate} sortable style={{ minWidth: '120px' }} />
          <Column header="Actions" body={actionsTemplate} style={{ minWidth: '100px' }} />
        </DataTable>
      </Card>

      <Dialog
        header="Upload File"
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        footer={dialogFooter}
        style={{ width: '32rem' }}
        modal
      >
        <div className="flex flex-column gap-3">
          <div className="flex flex-column gap-2">
            <label>File</label>
            <FileUpload
              ref={fileUploadRef}
              mode="basic"
              auto={false}
              customUpload
              uploadHandler={handleFileSelect}
              chooseLabel="Choose File"
              className="w-full"
            />
            {selectedFile && (
              <small className="text-color-secondary">
                Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
              </small>
            )}
          </div>

          <div className="flex flex-column gap-2">
            <label htmlFor="description">Description</label>
            <InputText
              id="description"
              value={uploadForm.description || ''}
              onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
              placeholder="Optional description"
              className="w-full"
            />
          </div>

          <div className="flex flex-column gap-2">
            <label htmlFor="category">Category</label>
            <InputText
              id="category"
              value={uploadForm.category || ''}
              onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
              placeholder="Optional category"
              className="w-full"
            />
          </div>

          <div className="flex align-items-center gap-3">
            <InputSwitch
              checked={uploadForm.isPublic || false}
              onChange={(e) => setUploadForm({ ...uploadForm, isPublic: e.value ?? false })}
            />
            <label>Public: {uploadForm.isPublic ? 'Yes' : 'No'}</label>
          </div>
        </div>
      </Dialog>

      <ConfirmDialog
        visible={deleteDialogVisible}
        title="Delete File"
        message={`Are you sure you want to delete "${fileToDelete?.originalFileName}"?`}
        confirmLabel="Delete"
        confirmSeverity="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialogVisible(false)}
      />
    </div>
  )
}
