import { Dialog } from 'primereact/dialog'
import { Button } from 'primereact/button'

interface ConfirmDialogProps {
  visible: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  confirmSeverity?: 'secondary' | 'success' | 'info' | 'warning' | 'danger' | 'help' | 'contrast'
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  confirmSeverity,
}: ConfirmDialogProps) {
  const footer = (
    <div className="flex justify-content-end gap-2">
      <Button label={cancelLabel} text onClick={onCancel} />
      <Button label={confirmLabel} severity={confirmSeverity} onClick={onConfirm} />
    </div>
  )

  return (
    <Dialog
      visible={visible}
      onHide={onCancel}
      header={title}
      footer={footer}
      style={{ width: '400px' }}
    >
      <p>{message}</p>
    </Dialog>
  )
}
