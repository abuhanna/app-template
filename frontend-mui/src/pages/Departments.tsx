import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
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
  Grid,
} from '@mui/material'
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { useDepartmentStore, useNotificationStore } from '@/stores'
import { ConfirmDialog } from '@/components'
import type { Department, CreateDepartmentRequest } from '@/types'

export default function Departments() {
  const { departments, loading, fetchDepartments, createDepartment, updateDepartment, deleteDepartment } =
    useDepartmentStore()
  const showSuccess = useNotificationStore((state) => state.showSuccess)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)
  const [formData, setFormData] = useState<CreateDepartmentRequest>({
    name: '',
    code: '',
    description: '',
  })

  useEffect(() => {
    fetchDepartments()
  }, [fetchDepartments])

  const handleOpenCreate = () => {
    setSelectedDepartment(null)
    setFormData({ name: '', code: '', description: '' })
    setDialogOpen(true)
  }

  const handleOpenEdit = (department: Department) => {
    setSelectedDepartment(department)
    setFormData({
      name: department.name,
      code: department.code,
      description: department.description || '',
    })
    setDialogOpen(true)
  }

  const handleOpenDelete = (department: Department) => {
    setSelectedDepartment(department)
    setConfirmOpen(true)
  }

  const handleSubmit = async () => {
    try {
      if (selectedDepartment) {
        await updateDepartment(selectedDepartment.id, formData)
      } else {
        await createDepartment(formData)
      }
      setDialogOpen(false)
      fetchDepartments()
    } catch {
      // Error handled by store
    }
  }

  const handleDelete = async () => {
    if (selectedDepartment) {
      await deleteDepartment(selectedDepartment.id)
      setConfirmOpen(false)
      showSuccess('Department deleted successfully')
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Department Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
          Add Department
        </Button>
      </Box>

      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {departments.map((dept) => (
                  <TableRow key={dept.id}>
                    <TableCell>{dept.name}</TableCell>
                    <TableCell>
                      <Chip label={dept.code} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>{dept.description || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={dept.isActive ? 'Active' : 'Inactive'}
                        color={dept.isActive ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleOpenEdit(dept)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleOpenDelete(dept)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedDepartment ? 'Edit Department' : 'Create Department'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {selectedDepartment ? 'Save' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete Department"
        message={`Are you sure you want to delete "${selectedDepartment?.name}"?`}
        confirmText="Delete"
        confirmColor="error"
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </Box>
  )
}
